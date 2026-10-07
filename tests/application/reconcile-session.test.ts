import assert from "node:assert/strict";
import { test } from "node:test";

import { reconcileSession, reconcileSessions, classifyTerminalPresence } from "../../src/application/reconcile-session.js";
import { AgentBoardError } from "../../src/domain/errors.js";
import type { LauncherLivenessPort, ReconciliationTerminalPort, SessionStore, TerminalSnapshot } from "../../src/domain/ports.js";
import { SCHEMA_VERSION, type SessionRecord, type TerminalIdentity } from "../../src/domain/session.js";

const at = "2026-08-14T23:00:00.000Z";
const later = "2026-08-14T23:01:00.000Z";
const identity = { adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term" };

function record(sessionId: string, terminal: Partial<SessionRecord["terminal"]> = {}, agent: Partial<SessionRecord["agent"]> = {}): SessionRecord {
  const completionObservedAt = agent.attention === "completion_unread" ? at : undefined;
  return {
    schemaVersion: SCHEMA_VERSION, revision: 0, sessionId,
    identity: { projectLabel: sessionId, createdAt: at },
    terminal: { ...identity, presence: "visible", observedAt: at, ...terminal },
    agent: { adapter: "codex", mode: "managed", activity: "idle", attention: "none", health: "live", observedAt: at, evidenceKind: "test", confidence: "authoritative", ...agent, ...(completionObservedAt === undefined ? {} : { completionObservedAt }) },
  };
}

class MemoryStore implements SessionStore {
  readonly records = new Map<string, SessionRecord>();
  constructor(
    values: readonly SessionRecord[],
    private readonly removeFailures = new Set<string>(),
    private readonly postRemoveFailures = new Set<string>(),
  ) { for (const value of values) this.records.set(value.sessionId, structuredClone(value)); }
  async get(id: string) { return structuredClone(this.records.get(id) ?? null); }
  async list() { return [...this.records.values()].sort((a, b) => a.sessionId.localeCompare(b.sessionId)).map((value) => structuredClone(value)); }
  async create(value: SessionRecord) { this.records.set(value.sessionId, structuredClone(value)); return structuredClone(value); }
  async mutate(id: string, mutation: (current: Readonly<SessionRecord>) => SessionRecord) {
    const current = this.records.get(id);
    if (!current) throw new AgentBoardError("NOT_FOUND", id);
    const next = mutation(structuredClone(current));
    const saved = { ...structuredClone(next), revision: current.revision + 1 };
    this.records.set(id, saved);
    return structuredClone(saved);
  }
  async remove(id: string) {
    if (this.removeFailures.has(id)) throw new Error(`remove failed: ${id}`);
    this.records.delete(id);
    if (this.postRemoveFailures.has(id)) throw new Error(`post-remove failed: ${id}`);
  }
}

class FakeTerminal implements ReconciliationTerminalPort {
  snapshotCalls = 0;
  readonly titles: Array<{ identity: TerminalIdentity; title: string }> = [];
  readonly clears: TerminalIdentity[] = [];
  constructor(private readonly value: TerminalSnapshot, private readonly titleError?: unknown) {}
  async snapshot() { this.snapshotCalls += 1; return this.value; }
  async setTitle(value: TerminalIdentity, title: string) {
    if (this.titleError !== undefined) throw this.titleError;
    this.titles.push({ identity: value, title });
  }
  async clearTitle(value: TerminalIdentity) { this.clears.push(value); }
}

class FakeLauncher implements LauncherLivenessPort {
  readonly pids: number[] = [];
  constructor(private readonly alive: boolean) {}
  async isAlive(pid: number) {
    this.pids.push(pid);
    return this.alive;
  }
}

const dependencies = (store: SessionStore, terminal: ReconciliationTerminalPort, launcher: LauncherLivenessPort = new FakeLauncher(true)) => ({
  store, terminal, launcher, clock: { now: () => new Date(later) }, workingFreshForMs: 60_000,
});

function snapshot(...entries: readonly TerminalIdentity[]): TerminalSnapshot {
  return { visible: entries, enumerableTerminalIds: entries.map((entry) => entry.terminalId) };
}

test("presence classification refreshes moved ancestry and distinguishes hidden from missing", () => {
  const moved = { ...identity, windowId: "w2", tabId: "t9" };
  assert.deepEqual(classifyTerminalPresence(identity, snapshot(moved), later), { ...moved, presence: "visible", observedAt: later });
  assert.equal(classifyTerminalPresence(identity, { visible: [], enumerableTerminalIds: [identity.terminalId] }, later).presence, "hidden");
  assert.equal(classifyTerminalPresence(identity, { visible: [], enumerableTerminalIds: [] }, later).presence, "missing");
  assert.throws(() => classifyTerminalPresence(identity, { visible: [moved, moved], enumerableTerminalIds: [identity.terminalId] }, later), /Duplicate visible/);
});

test("all-session reconciliation takes one snapshot and renders only verified visible records", async () => {
  const store = new MemoryStore([
    record("a", {}, { activity: "working" }),
    record("b", {}, { attention: "completion_unread" }),
  ]);
  const terminal = new FakeTerminal(snapshot(identity));
  const results = await reconcileSessions(dependencies(store, terminal));
  assert.equal(terminal.snapshotCalls, 1);
  assert.deepEqual(results.map((result) => result.record.sessionId), ["a", "b"]);
  assert.deepEqual(terminal.titles.map((entry) => entry.title), ["● a", "✓ b"]);
  assert.equal((await store.get("a"))?.agent.activity, "working");
});

test("healthy managed launcher preserves old working evidence without rewriting native observation", async () => {
  const before = record("long-running", {}, {
    activity: "working",
    launcherPid: 1234,
    observedAt: at,
    evidenceKind: "codex.turn.started",
  });
  const store = new MemoryStore([before]);
  const launcher = new FakeLauncher(true);
  const terminal = new FakeTerminal(snapshot(identity));
  const result = await reconcileSession(dependencies(store, terminal, launcher), before.sessionId);

  assert.deepEqual(result.record.agent, (await store.get(before.sessionId))?.agent);
  assert.equal(result.record.agent.evidenceKind, "codex.turn.started");
  assert.equal(result.verifiedLauncherPid, 1234);
  assert.deepEqual(launcher.pids, [1234]);
  assert.equal(terminal.titles.at(-1)?.title, "● long-running");
});

test("missing managed launcher becomes stale diagnostic evidence before title projection", async () => {
  const before = record("abandoned", {}, { activity: "working", launcherPid: 4321, observedAt: at });
  const store = new MemoryStore([before]);
  const result = await reconcileSession(dependencies(store, new FakeTerminal(snapshot(identity)), new FakeLauncher(false)), before.sessionId);

  assert.equal(result.record.agent.health, "stale");
  assert.equal(result.record.agent.activity, "working");
  assert.equal(result.record.agent.launcherPid, 4321);
  assert.equal(result.record.agent.confidence, "corroborated");
  assert.match(result.record.agent.detail ?? "", /launcher/i);
  assert.equal(result.verifiedLauncherPid, undefined);
  assert.equal(result.titleRendered, true);
});

test("hidden and missing records are diagnostic and receive no title write", async () => {
  const store = new MemoryStore([
    record("hidden", {}, { attention: "input_required" }),
    record("missing", {}, { activity: "working" }),
  ]);
  const terminal = new FakeTerminal({ visible: [], enumerableTerminalIds: [identity.terminalId] });
  const hidden = await reconcileSession(dependencies(store, terminal), "hidden");
  assert.equal(hidden.titleRendered, false);
  assert.equal(hidden.record.terminal.presence, "hidden");
  assert.equal(terminal.titles.length, 0);
  const missingTerminal = new FakeTerminal({ visible: [], enumerableTerminalIds: [] });
  const missing = await reconcileSession(dependencies(store, missingTerminal), "missing");
  assert.equal(missing.record.terminal.presence, "missing");
  assert.equal(missing.titleRendered, false);
});

test("all-session reconciliation retains visible and hidden sessions while pruning missing sessions", async () => {
  const visibleIdentity = { ...identity, terminalId: "visible-term" };
  const hiddenIdentity = { ...identity, terminalId: "hidden-term" };
  const missingIdentity = { ...identity, terminalId: "missing-term" };
  const store = new MemoryStore([
    record("visible", visibleIdentity),
    record("hidden", hiddenIdentity),
    record("missing", missingIdentity),
  ]);
  const terminal = new FakeTerminal({
    visible: [visibleIdentity],
    enumerableTerminalIds: [visibleIdentity.terminalId, hiddenIdentity.terminalId],
  });

  const results = await reconcileSessions(dependencies(store, terminal));

  assert.deepEqual(results.map((result) => result.record.sessionId), ["hidden", "visible"]);
  assert.equal(results[0]?.record.terminal.presence, "hidden");
  assert.equal(results[1]?.record.terminal.presence, "visible");
  assert.equal(await store.get("missing"), null);
  assert.notEqual(await store.get("hidden"), null);
});

test("failed missing-session removal keeps its diagnostic and does not block other records", async () => {
  const missingIdentity = { ...identity, terminalId: "missing-term" };
  const visibleIdentity = { ...identity, terminalId: "visible-term" };
  const store = new MemoryStore([
    record("missing", missingIdentity),
    record("visible", visibleIdentity),
  ], new Set(["missing"]));

  const results = await reconcileSessions(dependencies(store, new FakeTerminal(snapshot(visibleIdentity))));

  assert.deepEqual(results.map((result) => result.record.sessionId), ["missing", "visible"]);
  assert.equal(results[0]?.record.terminal.presence, "missing");
  assert.notEqual(await store.get("missing"), null);
  assert.equal(results[1]?.titleRendered, true);
});

test("a post-delete removal failure omits the retired session and continues reconciliation", async () => {
  const removedIdentity = { ...identity, terminalId: "removed-term" };
  const visibleIdentity = { ...identity, terminalId: "visible-term" };
  const store = new MemoryStore([
    record("removed", removedIdentity),
    record("visible", visibleIdentity),
  ], new Set(), new Set(["removed"]));

  const results = await reconcileSessions(dependencies(store, new FakeTerminal(snapshot(visibleIdentity))));

  assert.deepEqual(results.map((result) => result.record.sessionId), ["visible"]);
  assert.equal(await store.get("removed"), null);
  assert.equal(results[0]?.titleRendered, true);
});

test("all-session snapshot failure retains every session as unknown", async () => {
  const store = new MemoryStore([record("a"), record("b")]);
  const terminal: ReconciliationTerminalPort = {
    async snapshot() { throw new AgentBoardError("ADAPTER_FAILURE", "disconnected"); },
    async setTitle() {}, async clearTitle() {},
  };

  const results = await reconcileSessions(dependencies(store, terminal));

  assert.deepEqual(results.map((result) => result.record.terminal.presence), ["unknown", "unknown"]);
  assert.equal((await store.list()).length, 2);
});

test("snapshot failure records unknown for a single session and rethrows", async () => {
  const store = new MemoryStore([record("a")]);
  const terminal: ReconciliationTerminalPort = {
    async snapshot() { throw new AgentBoardError("ADAPTER_FAILURE", "disconnected"); },
    async setTitle() {}, async clearTitle() {},
  };
  await assert.rejects(reconcileSession(dependencies(store, terminal), "a"), /disconnected/);
  assert.equal((await store.get("a"))?.terminal.presence, "unknown");
});

test("target disappearing during title write is demoted to unknown", async () => {
  const store = new MemoryStore([record("a")]);
  const terminal = new FakeTerminal(snapshot(identity), { ghosttyCode: "GHOSTTY_TARGET_NOT_FOUND" });
  await assert.rejects(reconcileSession(dependencies(store, terminal), "a"));
  assert.equal((await store.get("a"))?.terminal.presence, "unknown");
});
