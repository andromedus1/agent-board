import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentBoardError } from "../../../src/domain/errors.js";
import { bindCodexThread, type ThreadBindingClient } from "../../../src/integrations/codex/thread-binding.js";
import type { CodexNotification, ThreadLoadedListResult } from "../../../src/integrations/codex/protocol.js";

const idle = { type: "idle" as const };
function loaded(threads: ThreadLoadedListResult["data"]): ThreadLoadedListResult { return { data: threads }; }

class Queue implements AsyncIterable<CodexNotification>, AsyncIterator<CodexNotification> {
  private readonly values: CodexNotification[];
  private waiter: ((result: IteratorResult<CodexNotification>) => void) | undefined;
  returned = false;
  constructor(values: CodexNotification[] = []) { this.values = values; }
  [Symbol.asyncIterator](): AsyncIterator<CodexNotification> { return this; }
  next(): Promise<IteratorResult<CodexNotification>> {
    const value = this.values.shift();
    if (value !== undefined) return Promise.resolve({ done: false, value });
    return new Promise((resolve) => { this.waiter = resolve; });
  }
  push(value: CodexNotification): void {
    if (this.waiter !== undefined) {
      this.waiter({ done: false, value });
      this.waiter = undefined;
    } else this.values.push(value);
  }
  async return(): Promise<IteratorResult<CodexNotification>> { this.returned = true; this.waiter?.({ done: true, value: undefined }); return { done: true, value: undefined }; }
}

function client(queue: Queue, result: ThreadLoadedListResult): ThreadBindingClient {
  return { notifications: () => queue, loadedThreads: async () => result };
}

test("subscribes before discovery and retains a root started during discovery", async () => {
  const queue = new Queue();
  let subscribed = false;
  const result: ThreadLoadedListResult = loaded([]);
  const fake: ThreadBindingClient = {
    notifications: () => { subscribed = true; return queue; },
    loadedThreads: async () => {
      assert.equal(subscribed, true);
      queue.push({ method: "thread/started", params: { thread: { id: "root", status: idle, cwd: "/repo", parentThreadId: null } } });
      queue.push({ method: "thread/status/changed", params: { threadId: "root", status: idle } });
      return result;
    },
  };
  const bound = await bindCodexThread(fake, { timeoutMs: 100, expectedWorkingDirectory: "/repo" });
  assert.equal(bound.threadId, "root");
  assert.equal(bound.confidence, "authoritative");
  assert.deepEqual(await bound.notifications.next(), { done: false, value: { method: "thread/status/changed", params: { threadId: "root", status: idle } } });
});

test("rejects children, cwd mismatches, and ambiguous roots", async () => {
  const queue = new Queue();
  const fake = client(queue, loaded([
    { id: "child", parentThreadId: "parent", status: idle, cwd: "/repo" },
    { id: "foreign", status: idle, cwd: "/other" },
    { id: "root", status: idle, cwd: "/repo" },
  ]));
  const bound = await bindCodexThread(fake, { timeoutMs: 100, expectedWorkingDirectory: "/repo" });
  assert.equal(bound.threadId, "root");

  const ambiguous = client(new Queue(), loaded([
    { id: "one", status: idle, cwd: "/repo" },
    { id: "two", status: idle, cwd: "/repo" },
  ]));
  await assert.rejects(bindCodexThread(ambiguous, { timeoutMs: 100, expectedWorkingDirectory: "/repo" }), (error: unknown) => error instanceof AgentBoardError && error.code === "ADAPTER_FAILURE");
});

test("allows one metadata-incomplete root only at corroborated confidence", async () => {
  const bound = await bindCodexThread(client(new Queue(), loaded([{ id: "root", status: idle }])), { timeoutMs: 100, expectedWorkingDirectory: "/repo" });
  assert.equal(bound.threadId, "root");
  assert.equal(bound.confidence, "corroborated");
});

test("cwd presence without an expected match is never authoritative", async () => {
  const noExpectation = await bindCodexThread(client(new Queue(), loaded([
    { id: "root", status: idle, cwd: "/repo", parentThreadId: null },
  ])), { timeoutMs: 100 });
  assert.equal(noExpectation.confidence, "corroborated");

  const missingParent = await bindCodexThread(client(new Queue(), loaded([
    { id: "root", status: idle, cwd: "/repo" },
  ])), { timeoutMs: 100, expectedWorkingDirectory: "/repo" });
  assert.equal(missingParent.confidence, "corroborated");
});

test("timeout releases the notification iterator", async () => {
  const queue = new Queue();
  await assert.rejects(bindCodexThread(client(queue, loaded([])), { timeoutMs: 10 }), (error: unknown) => error instanceof AgentBoardError && error.code === "ADAPTER_FAILURE");
  assert.equal(queue.returned, true);
});
