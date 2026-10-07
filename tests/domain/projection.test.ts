import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import { SCHEMA_VERSION, type SessionRecord } from "../../src/domain/session.js";
import { projectSession } from "../../src/domain/projection.js";

const observedAt = "2026-08-14T18:00:00Z";
const now = new Date("2026-08-14T18:01:00Z");

function record(overrides: Partial<SessionRecord["agent"]> = {}, terminal: Partial<SessionRecord["terminal"]> = {}): SessionRecord {
  const completionObservedAt = overrides.attention === "completion_unread"
    ? overrides.completionObservedAt ?? observedAt
    : undefined;
  return {
    schemaVersion: SCHEMA_VERSION, revision: 0, sessionId: "session-1",
    identity: { projectLabel: "agent-board", createdAt: observedAt },
    terminal: { adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term", presence: "visible", observedAt, ...terminal },
    agent: { adapter: "codex", mode: "managed", activity: "idle", attention: "none", health: "live", observedAt, evidenceKind: "native", confidence: "authoritative", ...overrides, ...(completionObservedAt === undefined ? {} : { completionObservedAt }) },
  };
}

test("projection follows the five canonical precedence examples", () => {
  const cases = [
    [{ health: "error" as const }, "×", "error"],
    [{ attention: "input_required" as const }, "!", "needs-input"],
    [{ attention: "completion_unread" as const }, "✓", "finished"],
    [{ activity: "working" as const }, "●", "working"],
    [{ activity: "idle" as const }, "○", "idle"],
  ] as const;
  for (const [overrides, glyph, status] of cases) {
    const projection = projectSession(record(overrides), { now, workingFreshForMs: 60_000 });
    assert.equal(projection.glyph, glyph);
    assert.equal(projection.status, status);
    assert.equal(projection.title, `${glyph} agent-board`);
  }
});

test("stale, future, hidden, and ambiguous records use diagnostic glyph", () => {
  const cases = [
    record({ activity: "working" }, {}),
    record({ activity: "working", observedAt: "2026-08-14T18:02:00Z" }),
    record({ activity: "unknown" }),
    record({ activity: "idle", health: "stale" }),
    record({ activity: "idle" }, { presence: "hidden" }),
  ];
  for (const value of cases) {
    const projection = projectSession(value, { now, workingFreshForMs: 1 });
    assert.equal(projection.glyph, "?");
    assert.equal(projection.status, "diagnostic");
    assert.equal(projection.title, "? agent-board");
  }
  const boundary = projectSession(record({ activity: "working" }), { now, workingFreshForMs: 60_000 });
  assert.equal(boundary.glyph, "●");
  assert.equal(boundary.diagnostics.length, 0);
});

test("healthy managed launcher authorizes hours-old working evidence", () => {
  const value = record({ activity: "working", launcherPid: 1234, observedAt: observedAt });
  const projection = projectSession(value, {
    now: new Date("2026-08-15T18:00:00Z"),
    workingFreshForMs: 60_000,
    verifiedLauncherPid: 1234,
  });

  assert.equal(projection.glyph, "●");
  assert.equal(projection.status, "working");
  assert.deepEqual(projection.diagnostics, []);

  const unverified = projectSession(value, {
    now: new Date("2026-08-15T18:00:00Z"),
    workingFreshForMs: 60_000,
  });
  assert.equal(unverified.glyph, "?");
  assert.deepEqual(unverified.diagnostics, ["working evidence is stale"]);
});

test("Claude launcher liveness cannot keep hook-derived working evidence fresh", () => {
  const value = record({ adapter: "claude", activity: "working", launcherPid: 1234, observedAt });
  const projection = projectSession(value, {
    now: new Date("2026-08-15T18:00:00Z"),
    workingFreshForMs: 60_000,
    verifiedLauncherPid: 1234,
  });
  assert.equal(projection.glyph, "?");
  assert.deepEqual(projection.diagnostics, ["working evidence is stale"]);
});

test("ordinary registrations remain visibly unobserved instead of claiming idle", () => {
  const projection = projectSession(record({
    mode: "ordinary",
    activity: "idle",
    evidenceKind: "registration",
    confidence: "inferred",
  }), { now, workingFreshForMs: 60_000 });

  assert.equal(projection.glyph, "?");
  assert.equal(projection.status, "diagnostic");
  assert.equal(projection.title, "? agent-board");
  assert.deepEqual(projection.diagnostics, ["session is not managed", "evidence is inferred"]);
});

test("managed sessions require non-inferred provider evidence before a primary glyph", () => {
  const projection = projectSession(record({ mode: "managed", activity: "idle", confidence: "inferred", evidenceKind: "registration" }), { now, workingFreshForMs: 60_000 });
  assert.equal(projection.glyph, "?");
  assert.deepEqual(projection.diagnostics, ["evidence is inferred"]);
});

test("disconnected terminal diagnostics outrank attention glyphs", () => {
  const projection = projectSession(record({ attention: "completion_unread", health: "stale", confidence: "inferred", detail: "native detail" }, { presence: "missing" }), { now, workingFreshForMs: 60_000 });
  assert.equal(projection.glyph, "?");
  assert.equal(projection.status, "diagnostic");
  assert.deepEqual(projection.diagnostics, ["agent health is stale", "terminal is missing", "evidence is inferred", "native detail"]);
});

test("projection validates options and is immutable", () => {
  assert.throws(() => projectSession(record(), { now: new Date("invalid"), workingFreshForMs: 1 }), (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_RECORD");
  assert.throws(() => projectSession(record(), { now, workingFreshForMs: -1 }), (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_RECORD");
  assert.throws(() => projectSession(record(), { now, workingFreshForMs: 1, verifiedLauncherPid: 0 }), (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_RECORD");
  const projection = projectSession(record(), { now, workingFreshForMs: 1 });
  assert.throws(() => { (projection as { glyph: string }).glyph = "×"; }, TypeError);
  assert.throws(() => { (projection.diagnostics as string[]).push("bad"); }, TypeError);
});
