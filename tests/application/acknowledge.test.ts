import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import type { SessionStore } from "../../src/domain/ports.js";
import { SCHEMA_VERSION, type SessionRecord } from "../../src/domain/session.js";
import { acknowledgeCompletion } from "../../src/application/acknowledge.js";

const at = "2026-08-14T18:00:00Z";
function record(attention: SessionRecord["agent"]["attention"] = "completion_unread"): SessionRecord {
  return {
    schemaVersion: SCHEMA_VERSION, revision: 2, sessionId: "session-1",
    identity: { projectLabel: "board", createdAt: at },
    terminal: { adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term", presence: "visible", observedAt: at },
    agent: { adapter: "codex", mode: "managed", activity: "idle", attention, ...(attention === "completion_unread" ? { completionObservedAt: at } : {}), health: "live", observedAt: at, evidenceKind: "turn.completed", confidence: "authoritative" },
  };
}
function fakeStore(initial: SessionRecord, onMutate?: (latest: SessionRecord) => SessionRecord): SessionStore & { mutations: number } {
  let current = initial;
  const store = {
    mutations: 0,
    async get() { return current; },
    async list() { return [current]; },
    async create(value: SessionRecord) { current = value; return current; },
    async mutate(_id: string, mutation: (latest: Readonly<SessionRecord>) => SessionRecord) {
      store.mutations += 1;
      current = onMutate?.(current) ?? current;
      current = mutation(current);
      return current;
    },
    async remove() {},
  };
  return store;
}

test("explicit and Ghostty-focus acknowledgements clear only completion attention", async () => {
  for (const source of ["explicit", "ghostty-focus"] as const) {
    const store = fakeStore(record());
    const result = await acknowledgeCompletion(store, "session-1", source, "2026-08-14T18:01:00Z");
    assert.equal(result.agent.attention, "none");
    assert.equal(result.agent.evidenceKind, "board.acknowledgement");
    assert.equal(result.agent.detail, `${source} acknowledgement`);
    assert.equal(store.mutations, 1);
  }
});

test("acknowledgement never clears input-required and skips no-ops", async () => {
  const store = fakeStore(record("input_required"));
  const result = await acknowledgeCompletion(store, "session-1", "explicit", "2026-08-14T18:01:00Z");
  assert.equal(result.agent.attention, "input_required");
  assert.equal(store.mutations, 0);
});

test("an older acknowledgement cannot clear a newer completion", async () => {
  const store = fakeStore(record(), (latest) => ({
    ...latest,
    agent: { ...latest.agent, observedAt: "2026-08-14T18:02:00Z", completionObservedAt: "2026-08-14T18:02:00Z", evidenceKind: "turn.completed" },
  }));
  const result = await acknowledgeCompletion(store, "session-1", "ghostty-focus", "2026-08-14T18:01:00Z");
  assert.equal(result.agent.attention, "completion_unread");
  assert.equal(store.mutations, 1);
});

test("an acknowledgement after completion survives a later attention-preserving observation", async () => {
  const store = fakeStore({
    ...record(),
    agent: { ...record().agent, observedAt: "2026-08-14T18:00:30Z", evidenceKind: "idle-heartbeat" },
  });
  const result = await acknowledgeCompletion(store, "session-1", "ghostty-focus", "2026-08-14T18:00:20Z");
  assert.equal(result.agent.attention, "none");
  assert.equal(result.agent.completionObservedAt, undefined);
});

test("an acknowledgement at the exact completion boundary clears unread attention", async () => {
  const store = fakeStore(record());
  const result = await acknowledgeCompletion(store, "session-1", "explicit", at);
  assert.equal(result.agent.attention, "none");
});

test("acknowledgement reports stable errors for missing sessions and malformed timestamps", async () => {
  const missing: SessionStore = {
    async get() { return null; }, async list() { return []; }, async create(value) { return value; },
    async mutate() { throw new Error("must not mutate"); }, async remove() {},
  };
  await assert.rejects(acknowledgeCompletion(missing, "missing", "explicit", at), (error: unknown) => error instanceof AgentBoardError && error.code === "NOT_FOUND");
  const store = fakeStore(record());
  await assert.rejects(acknowledgeCompletion(store, "session-1", "explicit", "bad"), (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_RECORD");
  await assert.rejects(acknowledgeCompletion(store, "session-1", "manual" as never, at), (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_RECORD");
});
