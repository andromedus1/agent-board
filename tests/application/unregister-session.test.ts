import assert from "node:assert/strict";
import { test } from "node:test";

import { unregisterSession } from "../../src/application/unregister-session.js";
import { AgentBoardError } from "../../src/domain/errors.js";
import type { ReconciliationTerminalPort, SessionStore, TerminalSnapshot } from "../../src/domain/ports.js";
import { SCHEMA_VERSION, type SessionRecord, type TerminalIdentity } from "../../src/domain/session.js";

const at = "2026-08-14T23:00:00.000Z";
const identity = { adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term" };
function record(): SessionRecord { return { schemaVersion: SCHEMA_VERSION, revision: 0, sessionId: "s", identity: { projectLabel: "s", createdAt: at }, terminal: { ...identity, presence: "visible", observedAt: at }, agent: { adapter: "codex", mode: "ordinary", activity: "idle", attention: "none", health: "live", observedAt: at, evidenceKind: "test", confidence: "authoritative" } }; }
class Store implements SessionStore {
  value: SessionRecord | null = record();
  async get() { return this.value && structuredClone(this.value); }
  async list() { return this.value ? [structuredClone(this.value)] : []; }
  async create(value: SessionRecord) { this.value = structuredClone(value); return value; }
  async mutate(id: string, mutation: (current: Readonly<SessionRecord>) => SessionRecord) { if (id !== "s" || !this.value) throw new AgentBoardError("NOT_FOUND", id); this.value = mutation(this.value); return this.value; }
  async remove(id: string) { if (id === "s") this.value = null; }
}
class Terminal implements ReconciliationTerminalPort {
  readonly events: string[] = [];
  constructor(private readonly value: TerminalSnapshot, private readonly error?: Error) {}
  async snapshot() { this.events.push("snapshot"); return this.value; }
  async setTitle() {}
  async clearTitle(value: TerminalIdentity) { if (this.error) throw this.error; this.events.push(`clear:${value.terminalId}`); }
}
const deps = (store: Store, terminal: Terminal) => ({ store, terminal, clock: { now: () => new Date(at) } });

test("unregister clears a visible target before removing its record", async () => {
  const store = new Store();
  const terminal = new Terminal({ visible: [identity], enumerableTerminalIds: [identity.terminalId] });
  await unregisterSession(deps(store, terminal), "s");
  assert.deepEqual(terminal.events, ["snapshot", "clear:term"]);
  assert.equal(store.value, null);
});

test("unregister clears an enumerable undo-hidden target before removal", async () => {
  const store = new Store();
  const terminal = new Terminal({ visible: [], enumerableTerminalIds: [identity.terminalId] });
  await unregisterSession(deps(store, terminal), "s");
  assert.deepEqual(terminal.events, ["snapshot", "clear:term"]);
  assert.equal(store.value, null);
});

test("unregister removes a missing tombstone without a title action", async () => {
  const store = new Store();
  const terminal = new Terminal({ visible: [], enumerableTerminalIds: [] });
  await unregisterSession(deps(store, terminal), "s");
  assert.deepEqual(terminal.events, ["snapshot"]);
  assert.equal(store.value, null);
});

test("clear failure preserves the record for retry", async () => {
  const store = new Store();
  const terminal = new Terminal({ visible: [identity], enumerableTerminalIds: [identity.terminalId] }, new AgentBoardError("ADAPTER_FAILURE", "clear failed"));
  await assert.rejects(unregisterSession(deps(store, terminal), "s"), /clear failed/);
  assert.notEqual(store.value, null);
});

test("snapshot failure preserves the record", async () => {
  const store = new Store();
  const terminal = new Terminal({ visible: [], enumerableTerminalIds: [] }, new AgentBoardError("ADAPTER_FAILURE", "ignored"));
  terminal.snapshot = async () => { throw new AgentBoardError("ADAPTER_FAILURE", "snapshot failed"); };
  await assert.rejects(unregisterSession(deps(store, terminal), "s"), /snapshot failed/);
  assert.notEqual(store.value, null);
});
