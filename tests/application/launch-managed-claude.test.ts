import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";

import { launchManagedClaude } from "../../src/application/launch-managed-claude.js";
import type { SessionRecord } from "../../src/domain/session.js";
import type { ClaudeChild, ClaudeProcessExit } from "../../src/integrations/claude/process.js";

const at = "2026-08-20T20:00:00.000Z";
function record(): SessionRecord {
  return {
    schemaVersion: 1, revision: 0, sessionId: "board",
    identity: { projectLabel: "mixed", createdAt: at },
    terminal: { adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term", presence: "visible", observedAt: at },
    agent: { adapter: "claude", mode: "ordinary", activity: "idle", attention: "none", health: "live", observedAt: at, evidenceKind: "registration", confidence: "inferred" },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function fixture(exited: Promise<ClaudeProcessExit>) {
  let current = record();
  const starts: Array<{ plugin: string; args: readonly string[]; sessionId: string }> = [];
  let stops = 0;
  const processValue = Object.assign(new EventEmitter(), { exitCode: null, signalCode: null, kill() { return true; } });
  const child = { pid: 321, exited, process: processValue } as unknown as ClaudeChild;
  const store = {
    async get() { return structuredClone(current); }, async list() { return [structuredClone(current)]; },
    async create(value: SessionRecord) { current = structuredClone(value); return current; },
    async mutate(_id: string, mutation: (value: Readonly<SessionRecord>) => SessionRecord) { current = { ...mutation(structuredClone(current)), revision: current.revision + 1 }; return structuredClone(current); },
    async remove() {},
  };
  return {
    current: () => current, starts, stopped: () => stops,
    dependencies: {
      register: async () => ({ record: structuredClone(current), created: true }),
      processes: {
        start(plugin: string, args: readonly string[], sessionId: string) { starts.push({ plugin, args, sessionId }); return child; },
        async stop() { stops += 1; },
      },
      pluginRoot: "/package/assets/claude-plugin",
      store,
      terminal: {
        async focused() { return null; },
        async snapshot() { return { visible: [{ adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term" }], enumerableTerminalIds: ["term"] }; },
        async setTitle() {}, async clearTitle() {},
      },
      launcher: { isAlive: async () => true },
      clock: { now: () => new Date(at) }, workingFreshForMs: 60_000, focusPollIntervalMs: 1,
      hookReadyTimeoutMs: 10,
    },
  };
}

test("managed Claude forwards argv, owns lifecycle, and records clean exit", async () => {
  const exit = deferred<ClaudeProcessExit>();
  const value = fixture(exit.promise);
  const launched = launchManagedClaude(value.dependencies, ["--resume", "native"], new AbortController().signal);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(value.current().agent.mode, "managed");
  assert.equal(value.current().agent.launcherPid, 321);
  exit.resolve({ exitCode: 0, signal: null });
  assert.deepEqual(await launched, { sessionId: "board", outcome: "clean", exitCode: 0 });
  assert.deepEqual(value.starts, [{ plugin: "/package/assets/claude-plugin", args: ["--resume", "native"], sessionId: "board" }]);
  assert.equal(value.current().agent.launcherPid, undefined);
  assert.equal(value.current().agent.evidenceKind, "claude.process-exit");
});

test("managed Claude termination stops the owned child and records interruption", async () => {
  const exit = deferred<ClaudeProcessExit>();
  const value = fixture(exit.promise);
  const controller = new AbortController();
  const launched = launchManagedClaude(value.dependencies, [], controller.signal);
  await new Promise((resolve) => setImmediate(resolve));
  controller.abort();
  assert.equal((await launched).outcome, "terminated");
  assert.equal(value.stopped(), 1);
  assert.equal(value.current().agent.evidenceKind, "claude.launcher.interrupted");
  assert.equal(value.current().agent.confidence, "corroborated");
});

test("hookless managed Claude degrades to diagnostic evidence", async () => {
  const exit = deferred<ClaudeProcessExit>();
  const value = fixture(exit.promise);
  const launched = launchManagedClaude(value.dependencies, [], new AbortController().signal);
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(value.current().agent.health, "stale");
  assert.equal(value.current().agent.activity, "unknown");
  assert.equal(value.current().agent.evidenceKind, "claude.hook.unavailable");
  exit.resolve({ exitCode: 0, signal: null });
  await launched;
});
