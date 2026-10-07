import assert from "node:assert/strict";
import { test } from "node:test";

import { buildBoardRows, listSessions } from "../../src/application/list-sessions.js";
import type { ReconcileResult } from "../../src/application/reconcile-session.js";
import type { ReconciliationTerminalPort, SessionStore, TerminalSnapshot } from "../../src/domain/ports.js";
import { SCHEMA_VERSION, type SessionRecord } from "../../src/domain/session.js";
import type { ProjectionOptions } from "../../src/domain/projection.js";

const at = "2026-08-14T23:00:00.000Z";
const later = "2026-08-14T23:01:00.000Z";
const identity = { adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term" };

function record(
  sessionId: string,
  label: string,
  createdAt = at,
  terminal: Partial<SessionRecord["terminal"]> = {},
  agent: Partial<SessionRecord["agent"]> = {},
): SessionRecord {
  const completionObservedAt = agent.attention === "completion_unread" ? at : undefined;
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    sessionId,
    identity: { projectLabel: label, createdAt },
    terminal: { ...identity, presence: "visible", observedAt: at, ...terminal },
    agent: {
      adapter: "codex",
      mode: "managed",
      activity: "idle",
      attention: "none",
      health: "live",
      observedAt: at,
      evidenceKind: "test",
      confidence: "authoritative",
      ...agent,
      ...(completionObservedAt === undefined ? {} : { completionObservedAt }),
    },
  };
}

function result(value: SessionRecord, titleRendered = true): ReconcileResult {
  return { record: value, titleRendered };
}

const options: ProjectionOptions = { now: new Date(later), workingFreshForMs: 60_000 };

class MemoryStore implements SessionStore {
  readonly records = new Map<string, SessionRecord>();
  constructor(values: readonly SessionRecord[]) {
    for (const value of values) this.records.set(value.sessionId, structuredClone(value));
  }
  async get(id: string) { return structuredClone(this.records.get(id) ?? null); }
  async list() { return [...this.records.values()].map((value) => structuredClone(value)); }
  async create(value: SessionRecord) { this.records.set(value.sessionId, structuredClone(value)); return structuredClone(value); }
  async mutate(id: string, mutation: (current: Readonly<SessionRecord>) => SessionRecord) {
    const current = this.records.get(id);
    if (current === undefined) throw new Error(`missing ${id}`);
    const next = { ...mutation(structuredClone(current)), revision: current.revision + 1 };
    this.records.set(id, next);
    return structuredClone(next);
  }
  async remove(id: string) { this.records.delete(id); }
}

class FakeTerminal implements ReconciliationTerminalPort {
  snapshotCalls = 0;
  titleCalls = 0;
  constructor(private readonly value: TerminalSnapshot) {}
  async snapshot() { this.snapshotCalls += 1; return this.value; }
  async setTitle() { this.titleCalls += 1; }
  async clearTitle() {}
}

test("buildBoardRows shares projection precedence, exposes board diagnostics, and freezes output", () => {
  const rows = buildBoardRows([
    result(record("abcdef12-two", "same", "2026-08-14T23:02:00.000Z", {}, { confidence: "corroborated", activity: "working" }), false),
    result(record("abcdef12-one", "same", at, {}, { mode: "ordinary", confidence: "inferred", attention: "input_required" })),
    result(record("idle", "idle")),
  ], options);

  assert.deepEqual(rows.map((row) => row.sessionId), ["idle", "abcdef12-one", "abcdef12-two"]);
  assert.equal(rows[1]?.displayLabel, "[abcdef12-o] same");
  assert.equal(rows[2]?.displayLabel, "[abcdef12-t] same");
  assert.equal(rows[1]?.glyph, "?");
  assert.equal(rows[1]?.status, "diagnostic");
  assert.deepEqual(rows[1]?.diagnostics, ["session is not managed", "evidence is inferred"]);
  assert.deepEqual(rows[2]?.diagnostics, ["title is not synchronized", "evidence is corroborated"]);
  assert.equal(Object.isFrozen(rows), true);
  assert.equal(Object.isFrozen(rows[1]), true);
  assert.equal(Object.isFrozen(rows[1]?.diagnostics), true);
});

test("listSessions takes one shared snapshot and the empty store takes none", async () => {
  const records = [record("one", "one"), record("two", "two")];
  const store = new MemoryStore(records);
  const terminal = new FakeTerminal({
    visible: [identity],
    enumerableTerminalIds: [identity.terminalId],
  });
  const rows = await listSessions({
    store,
    terminal,
    launcher: { isAlive: async () => true },
    clock: { now: () => new Date(later) },
    workingFreshForMs: 60_000,
  });
  assert.equal(rows.length, 2);
  assert.equal(terminal.snapshotCalls, 1);
  assert.equal(terminal.titleCalls, 2);

  const emptyTerminal = new FakeTerminal({ visible: [], enumerableTerminalIds: [] });
  const emptyRows = await listSessions({
    store: new MemoryStore([]),
    terminal: emptyTerminal,
    launcher: { isAlive: async () => true },
    clock: { now: () => new Date(later) },
    workingFreshForMs: 60_000,
  });
  assert.deepEqual(emptyRows, []);
  assert.equal(emptyTerminal.snapshotCalls, 0);
});

test("listSessions omits and removes terminals missing from a valid snapshot", async () => {
  const visibleIdentity = { ...identity, terminalId: "visible-term" };
  const missingIdentity = { ...identity, terminalId: "missing-term" };
  const store = new MemoryStore([
    record("visible", "visible", at, visibleIdentity),
    record("missing", "missing", at, missingIdentity),
  ]);

  const rows = await listSessions({
    store,
    terminal: new FakeTerminal({
      visible: [visibleIdentity],
      enumerableTerminalIds: [visibleIdentity.terminalId],
    }),
    launcher: { isAlive: async () => true },
    clock: { now: () => new Date(later) },
    workingFreshForMs: 60_000,
  });

  assert.deepEqual(rows.map((row) => row.sessionId), ["visible"]);
  assert.equal(await store.get("missing"), null);
});

test("listSessions carries verified launcher liveness into board projection", async () => {
  const store = new MemoryStore([
    record("long-running", "long-running", at, {}, {
      activity: "working",
      launcherPid: 1234,
    }),
  ]);

  const rows = await listSessions({
    store,
    terminal: new FakeTerminal({
      visible: [identity],
      enumerableTerminalIds: [identity.terminalId],
    }),
    launcher: { isAlive: async () => true },
    clock: { now: () => new Date(later) },
    workingFreshForMs: 1,
  });

  assert.equal(rows[0]?.glyph, "●");
  assert.equal(rows[0]?.status, "working");
});
