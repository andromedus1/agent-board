import assert from "node:assert/strict";
import { test } from "node:test";

import { observeClaudeHook } from "../../src/application/observe-claude-hook.js";
import type { SessionRecord } from "../../src/domain/session.js";

const at = "2026-08-20T20:00:00.000Z";

function initial(): SessionRecord {
  return {
    schemaVersion: 1, revision: 0, sessionId: "board-session",
    identity: { projectLabel: "mixed", createdAt: at },
    terminal: { adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term", presence: "visible", observedAt: at },
    agent: { adapter: "claude", mode: "managed", launcherPid: process.pid, activity: "idle", attention: "none", health: "live", observedAt: at, evidenceKind: "registration", confidence: "inferred" },
  };
}

function fixture() {
  let current = initial();
  const titles: string[] = [];
  const store = {
    async get() { return structuredClone(current); },
    async list() { return [structuredClone(current)]; },
    async create(value: SessionRecord) { current = structuredClone(value); return current; },
    async mutate(_id: string, mutation: (value: Readonly<SessionRecord>) => SessionRecord) {
      current = { ...mutation(structuredClone(current)), revision: current.revision + 1 };
      return structuredClone(current);
    },
    async remove() {},
  };
  const dependencies = {
    store,
    terminal: {
      async snapshot() { return { visible: [{ adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term" }], enumerableTerminalIds: ["term"] }; },
      async setTitle(_identity: unknown, title: string) { titles.push(title); },
      async clearTitle() {},
    },
    launcher: { isAlive: async () => true },
    clock: { now: () => new Date(at) },
    workingFreshForMs: 60_000,
  };
  return { dependencies, current: () => current, titles };
}

test("hook observation binds native identity and projects shared glyphs", async () => {
  const value = fixture();
  await observeClaudeHook(value.dependencies, "board-session", { session_id: "native", hook_event_name: "UserPromptSubmit", prompt: "not retained" });
  assert.equal(value.current().agent.nativeSessionId, "native");
  assert.equal(value.current().agent.activity, "working");
  assert.equal(value.current().agent.confidence, "corroborated");
  assert.equal(value.titles.at(-1), "● mixed");

  await observeClaudeHook(value.dependencies, "board-session", { session_id: "native", hook_event_name: "PermissionRequest", tool_input: { secret: true } });
  assert.equal(value.current().agent.attention, "input_required");
  assert.equal(value.titles.at(-1), "! mixed");

  await observeClaudeHook(value.dependencies, "board-session", { session_id: "native", hook_event_name: "Stop" });
  assert.equal(value.current().agent.attention, "completion_unread");
  assert.equal(value.titles.at(-1), "✓ mixed");
});

test("hook observation rejects provider and native-session mismatches inside mutation", async () => {
  const value = fixture();
  await observeClaudeHook(value.dependencies, "board-session", { session_id: "one", hook_event_name: "SessionStart" });
  await assert.rejects(observeClaudeHook(value.dependencies, "board-session", { session_id: "two", hook_event_name: "Stop" }), /another Claude session/);
  await value.dependencies.store.mutate("board-session", (current) => ({ ...current, agent: { ...current.agent, adapter: "codex", nativeSessionId: undefined } }));
  await assert.rejects(observeClaudeHook(value.dependencies, "board-session", { session_id: "one", hook_event_name: "Stop" }), /not a managed Claude session/);
});

test("SessionStart can authoritatively rebind a cleared or forked native session", async () => {
  const value = fixture();
  await observeClaudeHook(value.dependencies, "board-session", { session_id: "one", hook_event_name: "SessionStart", source: "startup" });
  await observeClaudeHook(value.dependencies, "board-session", { session_id: "two", hook_event_name: "SessionStart", source: "clear" });
  assert.equal(value.current().agent.nativeSessionId, "two");
  await observeClaudeHook(value.dependencies, "board-session", { session_id: "two", hook_event_name: "UserPromptSubmit" });
  await observeClaudeHook(value.dependencies, "board-session", { session_id: "two", hook_event_name: "SessionStart", source: "compact" });
  assert.equal(value.current().agent.activity, "working");
});
