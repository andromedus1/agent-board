import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import {
  ACTIVITIES,
  AGENT_MODES,
  ATTENTIONS,
  CONFIDENCE_LEVELS,
  HEALTH_STATES,
  TERMINAL_PRESENCES,
} from "../../src/domain/registries.js";
import {
  AgentObservationSchema,
  ObservationSchema,
  SCHEMA_VERSION,
  SessionRecordSchema,
  parseProjectLabel,
  parseSessionRecord,
} from "../../src/domain/session.js";
import type {
  AgentObservationSource,
  Clock,
  IdGenerator,
  SessionStore,
  TerminalPort,
} from "../../src/domain/ports.js";
import type { SessionRecord } from "../../src/domain/session.js";

const timestamp = "2026-08-14T18:00:00Z";

function validRecord(): SessionRecord {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    sessionId: "session-1",
    identity: {
      projectLabel: "agent-board",
      repoPath: "/Users/andrewclark/dev/agent-board",
      gitBranch: "main",
      createdAt: timestamp,
    },
    terminal: {
      adapter: "ghostty",
      windowId: "window-1",
      tabId: "tab-1",
      terminalId: "terminal-1",
      presence: "visible",
      observedAt: timestamp,
    },
    agent: {
      adapter: "codex",
      mode: "managed",
      nativeThreadId: "thread-1",
      launcherPid: 1234,
      activity: "idle",
      attention: "none",
      health: "live",
      observedAt: timestamp,
      evidenceKind: "turn.completed",
      confidence: "authoritative",
    },
  };
}

test("parses the canonical session record and preserves independent dimensions", () => {
  const record = validRecord();
  record.terminal.presence = "hidden";
  record.agent.activity = "working";
  record.agent.attention = "input_required";
  record.agent.health = "stale";

  assert.deepEqual(parseSessionRecord(record), record);
});

test("accepts every registered enum value at its boundary", () => {
  for (const mode of AGENT_MODES) {
    assert.equal(AgentObservationSchema.safeParse({ ...validRecord().agent, mode }).success, true);
  }
  for (const activity of ACTIVITIES) {
    assert.equal(AgentObservationSchema.safeParse({ ...validRecord().agent, activity }).success, true);
  }
  for (const attention of ATTENTIONS) {
    assert.equal(AgentObservationSchema.safeParse({
      ...validRecord().agent,
      attention,
      ...(attention === "completion_unread" ? { completionObservedAt: timestamp } : {}),
    }).success, true);
  }
  for (const health of HEALTH_STATES) {
    assert.equal(AgentObservationSchema.safeParse({ ...validRecord().agent, health }).success, true);
  }
  for (const presence of TERMINAL_PRESENCES) {
    assert.equal(SessionRecordSchema.safeParse({
      ...validRecord(),
      terminal: { ...validRecord().terminal, presence },
    }).success, true);
  }
  for (const confidence of CONFIDENCE_LEVELS) {
    assert.equal(ObservationSchema.safeParse({
      observedAt: timestamp,
      evidenceKind: "test",
      confidence,
    }).success, true);
  }
});

test("clean process exit is evidence, not an agent health value", () => {
  const record = validRecord();
  record.agent.evidenceKind = "process-exit";
  record.agent.detail = "managed TUI exited cleanly";
  record.agent.activity = "idle";

  assert.equal(parseSessionRecord(record).agent.evidenceKind, "process-exit");
  assert.equal(AgentObservationSchema.safeParse({ ...record.agent, health: "exited" }).success, false);
});

test("keeps provider-native bindings distinct", () => {
  const agent = validRecord().agent;
  assert.equal(AgentObservationSchema.safeParse({
    ...agent,
    adapter: "claude",
    nativeThreadId: undefined,
    nativeSessionId: "claude-session",
  }).success, true);
  assert.equal(AgentObservationSchema.safeParse({
    ...agent,
    adapter: "claude",
    nativeThreadId: "codex-thread",
  }).success, false);
  assert.equal(AgentObservationSchema.safeParse({
    ...agent,
    nativeSessionId: "claude-session",
  }).success, false);
});

test("rejects unknown fields at every canonical record boundary", () => {
  const record = validRecord();
  assert.equal(SessionRecordSchema.safeParse({ ...record, extra: true }).success, false);
  assert.equal(SessionRecordSchema.safeParse({
    ...record,
    identity: { ...record.identity, extra: true },
  }).success, false);
  assert.equal(SessionRecordSchema.safeParse({
    ...record,
    terminal: { ...record.terminal, extra: true },
  }).success, false);
  assert.equal(SessionRecordSchema.safeParse({
    ...record,
    agent: { ...record.agent, extra: true },
  }).success, false);
});

test("rejects malformed timestamps and unsafe revisions", () => {
  const invalidTimestamp = { ...validRecord(), identity: { ...validRecord().identity, createdAt: "tomorrow" } };
  assert.equal(SessionRecordSchema.safeParse(invalidTimestamp).success, false);

  const invalidRevision = { ...validRecord(), revision: Number.MAX_SAFE_INTEGER + 1 };
  assert.equal(SessionRecordSchema.safeParse(invalidRevision).success, false);

  const invalidObservedAt = { ...validRecord(), terminal: { ...validRecord().terminal, observedAt: "2026-02-30T18:00:00Z" } };
  assert.equal(SessionRecordSchema.safeParse(invalidObservedAt).success, false);
});

test("accepts normal Unicode labels but rejects blank and terminal-unsafe labels", () => {
  assert.equal(parseProjectLabel("プロジェクト 🚀"), "プロジェクト 🚀");
  for (const label of ["", "   ", "\t\n", "unsafe\u0000", "unsafe\u001b[31m", "unsafe\u0085", "unsafe\u2028"]) {
    assert.throws(
      () => parseProjectLabel(label),
      (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_LABEL",
    );
  }
});

test("rejects terminal-unsafe observation details before CLI rendering", () => {
  for (const detail of ["line one\nline two", "unsafe\u001b[31m", "unsafe\u0085", "unsafe\u2028"]) {
    assert.equal(ObservationSchema.safeParse({
      observedAt: timestamp,
      evidenceKind: "test",
      confidence: "authoritative",
      detail,
    }).success, false);
    assert.equal(AgentObservationSchema.safeParse({ ...validRecord().agent, detail }).success, false);
  }
  assert.equal(AgentObservationSchema.safeParse({
    ...validRecord().agent,
    detail: "managed TUI exited cleanly",
  }).success, true);
});

test("parse helpers expose stable domain error codes", () => {
  assert.throws(
    () => parseSessionRecord({ ...validRecord(), schemaVersion: 2 }),
    (error: unknown) => error instanceof AgentBoardError && error.code === "UNSUPPORTED_SCHEMA",
  );
  assert.throws(
    () => parseSessionRecord({ ...validRecord(), revision: -1 }),
    (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_RECORD",
  );
});

test("port contracts are usable without concrete runtime adapters", async () => {
  const clock: Clock = { now: () => new Date(timestamp) };
  const ids: IdGenerator = { sessionId: () => "session-2" };
  const source: AgentObservationSource = {
    async *observations(signal) {
      if (!signal.aborted) yield { kind: "test" };
    },
  };
  const store: SessionStore = {
    async get() { return null; },
    async list() { return []; },
    async create(record) { return record; },
    async mutate(_sessionId, mutation) { return mutation(validRecord()); },
    async remove() {},
  };
  const terminal: TerminalPort = {
    async current() { return validRecord().terminal; },
    async inspect(identity) { return { ...identity, presence: "visible", observedAt: timestamp }; },
    async setTitle() {},
    async clearTitle() {},
  };

  assert.equal(clock.now().toISOString(), "2026-08-14T18:00:00.000Z");
  assert.equal(ids.sessionId(), "session-2");
  const observations = [];
  for await (const observation of source.observations(new AbortController().signal)) {
    observations.push(observation);
  }
  assert.deepEqual(observations, [{ kind: "test" }]);
  assert.equal(await store.get("missing"), null);
  assert.deepEqual(await terminal.current(), validRecord().terminal);
  assert.equal((await terminal.inspect(validRecord().terminal)).terminalId, "terminal-1");
});
