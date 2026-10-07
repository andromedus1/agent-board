import assert from "node:assert/strict";
import { test } from "node:test";

import { watchCompletionFocus } from "../../src/application/watch-completion-focus.js";
import type { SessionRecord } from "../../src/domain/session.js";

const identity = { adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term" };
function record(attention: SessionRecord["agent"]["attention"]): SessionRecord {
  return {
    schemaVersion: 1, revision: 0, sessionId: "s",
    identity: { projectLabel: "project", createdAt: "2026-01-01T00:00:00Z" },
    terminal: { ...identity, presence: "visible", observedAt: "2026-01-01T00:00:00Z" },
    agent: {
      adapter: "codex", mode: "managed", activity: "idle", attention,
      ...(attention === "completion_unread" ? { completionObservedAt: "2026-01-01T00:00:00Z" } : {}),
      health: "live", observedAt: "2026-01-01T00:00:00Z", evidenceKind: "test", confidence: "authoritative",
    },
  };
}

test("completion focus acknowledges an exact frontmost identity only", async () => {
  let current = record("completion_unread");
  let focusedCalls = 0;
  const controller = new AbortController();
  const store = {
    async get() { return current; },
    async list() { return [current]; },
    async create() { return current; },
    async remove() {},
    async mutate(_id: string, mutation: (value: SessionRecord) => SessionRecord) { current = { ...mutation(current), revision: current.revision + 1 }; return current; },
  };
  const records: SessionRecord[] = [];
  const watcher = watchCompletionFocus({
    store,
    terminal: { async focused() { focusedCalls += 1; return identity; } },
    clock: { now: () => new Date("2026-01-01T00:00:01Z") },
    pollIntervalMs: 1,
    sleep: async (_ms, signal) => { controller.abort(); if (signal.aborted) return; },
    onRecord: (value) => { records.push(value); },
  }, "s", controller.signal);
  await watcher;
  assert.equal(focusedCalls, 1);
  assert.equal(current.agent.attention, "none");
  assert.equal(records.length, 1);
});

test("focus watcher does not call Ghostty for ordinary attention", async () => {
  const current = record("input_required");
  const controller = new AbortController();
  let focusedCalls = 0;
  await watchCompletionFocus({
    store: { async get() { return current; }, async list() { return [current]; }, async create() { return current; }, async mutate() { return current; }, async remove() {} },
    terminal: { async focused() { focusedCalls += 1; return identity; } },
    clock: { now: () => new Date() }, pollIntervalMs: 1,
    sleep: async () => controller.abort(),
  }, "s", controller.signal);
  assert.equal(focusedCalls, 0);
});
