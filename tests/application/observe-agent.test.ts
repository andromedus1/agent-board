import assert from "node:assert/strict";
import { test } from "node:test";

import type { SessionStore } from "../../src/domain/ports.js";
import { SCHEMA_VERSION, type SessionRecord } from "../../src/domain/session.js";
import { observeAgent } from "../../src/application/observe-agent.js";

const at = "2026-08-14T18:00:00Z";
function record(): SessionRecord {
  return {
    schemaVersion: SCHEMA_VERSION, revision: 2, sessionId: "session-1",
    identity: { projectLabel: "board", createdAt: at },
    terminal: { adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term", presence: "visible", observedAt: at },
    agent: { adapter: "codex", mode: "managed", activity: "idle", attention: "none", health: "live", observedAt: at, evidenceKind: "initial", confidence: "authoritative" },
  };
}

test("observe-agent validates before one atomic latest-record mutation", async () => {
  let current = record();
  let reads = 0;
  let mutations = 0;
  const store: SessionStore = {
    async get() { reads += 1; return current; },
    async list() { return [current]; },
    async create(value) { current = value; return current; },
    async mutate(_id, mutation) { mutations += 1; current = mutation(current); return current; },
    async remove() {},
  };
  const result = await observeAgent(store, {
    sessionId: "session-1",
    transition: { type: "working", observedAt: "2026-08-14T18:01:00Z", evidenceKind: "native", confidence: "authoritative" },
  });
  assert.equal(result.agent.activity, "working");
  assert.equal(mutations, 1);
  assert.equal(reads, 0);
});

test("observe-agent rejects malformed transitions without touching the store", async () => {
  let mutations = 0;
  const store: SessionStore = {
    async get() { return record(); }, async list() { return []; }, async create(value) { return value; },
    async mutate() { mutations += 1; return record(); }, async remove() {},
  };
  await assert.rejects(
    observeAgent(store, { sessionId: "session-1", transition: { type: "working", observedAt: "bad", evidenceKind: "native", confidence: "authoritative" } as never }),
    (error: unknown) => (error as { code?: string }).code === "INVALID_RECORD",
  );
  assert.equal(mutations, 0);
});
