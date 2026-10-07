import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import type { SessionStore } from "../../src/domain/ports.js";
import { SCHEMA_VERSION, type SessionRecord } from "../../src/domain/session.js";
import { observeManagedCodex } from "../../src/application/observe-managed-codex.js";
import type { CodexNotification, ThreadLoadedListResult } from "../../src/integrations/codex/protocol.js";
import type { ThreadBindingClient } from "../../src/integrations/codex/thread-binding.js";

const at = "2026-08-14T18:00:00Z";
function record(): SessionRecord {
  return {
    schemaVersion: SCHEMA_VERSION, revision: 1, sessionId: "session-1",
    identity: { projectLabel: "board", repoPath: "/repo", createdAt: at },
    terminal: { adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term", presence: "visible", observedAt: at },
    agent: { adapter: "codex", mode: "ordinary", activity: "idle", attention: "none", health: "live", observedAt: at, evidenceKind: "registration", confidence: "inferred" },
  };
}

class Stream implements AsyncIterable<CodexNotification>, AsyncIterator<CodexNotification> {
  private values: CodexNotification[];
  private waiter: ((result: IteratorResult<CodexNotification>) => void) | undefined;
  returned = false;
  constructor(values: CodexNotification[]) { this.values = values; }
  [Symbol.asyncIterator](): AsyncIterator<CodexNotification> { return this; }
  next(): Promise<IteratorResult<CodexNotification>> {
    const value = this.values.shift();
    if (value) return Promise.resolve({ done: false, value });
    return new Promise((resolve) => { this.waiter = resolve; });
  }
  async return(): Promise<IteratorResult<CodexNotification>> { this.returned = true; this.waiter?.({ done: true, value: undefined }); return { done: true, value: undefined }; }
}

function fakeClient(stream: Stream, initial: ThreadLoadedListResult): ThreadBindingClient {
  return { notifications: () => stream, loadedThreads: async () => initial };
}

function storeFor(current: SessionRecord): SessionStore {
  return {
    async get() { return current; },
    async list() { return [current]; },
    async create(value) { current = value; return current; },
    async mutate(_id, mutation) { current = { ...mutation(current), revision: current.revision + 1 }; return current; },
    async remove() {},
  };
}

test("persists managed binding before ordered lifecycle observations and callbacks committed records", async () => {
  const stream = new Stream([{ method: "thread/status/changed", params: { threadId: "root", status: { type: "active", activeFlags: [] } } }]);
  let current = record();
  const store = storeFor(current);
  const callbacks: SessionRecord[] = [];
  const abort = new AbortController();
  const originalMutate = store.mutate;
  store.mutate = async (id, mutation) => {
    const output = await originalMutate.call(store, id, mutation);
    current = output;
    if (output.agent.activity === "working") abort.abort();
    return output;
  };
  await observeManagedCodex({
    client: fakeClient(stream, { data: [{ id: "root", cwd: "/repo", status: { type: "idle" } }] }),
    store, clock: { now: () => new Date("2026-08-14T18:01:00Z") }, bindTimeoutMs: 100,
    onRecord: (committed) => { callbacks.push(committed); },
  }, { sessionId: "session-1", expectedWorkingDirectory: "/repo" }, abort.signal);
  assert.equal(current.agent.nativeThreadId, "root");
  assert.equal(current.agent.mode, "managed");
  assert.equal(current.agent.activity, "working");
  assert.equal(callbacks[0]?.agent.nativeThreadId, "root");
  assert.equal(callbacks.at(-1)?.agent.activity, "working");
  assert.equal(stream.returned, true);
});

test("records and rethrows binding failure, while deliberate abort remains clean", async () => {
  let current = record();
  const store = storeFor(current);
  const queue = new Stream([]);
  await assert.rejects(observeManagedCodex({
    client: fakeClient(queue, { data: [
      { id: "one", cwd: "/repo", status: { type: "idle" } },
      { id: "two", cwd: "/repo", status: { type: "idle" } },
    ] }),
    store, clock: { now: () => new Date("2026-08-14T18:01:00Z") }, bindTimeoutMs: 100,
  }, { sessionId: "session-1", expectedWorkingDirectory: "/repo" }, new AbortController().signal), (error: unknown) => (error as { code?: string }).code === "ADAPTER_FAILURE");
  current = (await store.get("session-1"))!;
  assert.equal(current.agent.health, "error");
  assert.equal(current.agent.evidenceKind, "codex.adapter.failure");

  const abort = new AbortController();
  abort.abort();
  current = record();
  const cleanStore = storeFor(current);
  await observeManagedCodex({
    client: fakeClient(new Stream([]), { data: [] }), store: cleanStore, clock: { now: () => new Date("2026-08-14T18:01:00Z") }, bindTimeoutMs: 100,
  }, { sessionId: "session-1" }, abort.signal);
  assert.equal((await cleanStore.get("session-1"))!.agent.health, "live");
});

test("caller abort stops a bound production-shaped subscription without iterator return", async () => {
  const abort = new AbortController();
  const productionShaped: ThreadBindingClient = {
    loadedThreads: async () => ({ data: [{ id: "root", cwd: "/repo", parentThreadId: null, status: { type: "idle" } }] }),
    notifications: (signal) => ({
      [Symbol.asyncIterator]() {
        return {
          next: () => new Promise<IteratorResult<CodexNotification>>((_resolve, reject) => {
            if (signal?.aborted) {
              reject(new AgentBoardError("ADAPTER_FAILURE", "aborted"));
              return;
            }
            signal?.addEventListener("abort", () => reject(new AgentBoardError("ADAPTER_FAILURE", "aborted")), { once: true });
          }),
        };
      },
    }),
  };
  const store = storeFor(record());
  const observing = observeManagedCodex({
    client: productionShaped,
    store,
    clock: { now: () => new Date("2026-08-14T18:01:00Z") },
    bindTimeoutMs: 100,
  }, { sessionId: "session-1", expectedWorkingDirectory: "/repo" }, abort.signal);
  await new Promise((resolve) => setImmediate(resolve));
  abort.abort();
  await observing;
  assert.equal((await store.get("session-1"))!.agent.health, "live");
});
