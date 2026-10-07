import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgentBoard } from "../../src/cli/agent-board.js";
import type { DoctorReport } from "../../src/application/doctor.js";
import { AgentBoardError } from "../../src/domain/errors.js";
import type { AcknowledgeSessionResult } from "../../src/application/acknowledge-session.js";
import type { SessionRecord } from "../../src/domain/session.js";

function streams() {
  const output = { stdout: "", stderr: "" };
  return {
    output,
    stdout: { write(value: string) { output.stdout += value; return true; } },
    stderr: { write(value: string) { output.stderr += value; return true; } },
  };
}

const record = { sessionId: "session-1" } as SessionRecord;
const acknowledged: AcknowledgeSessionResult = { record, titleRendered: true };
const doctorReport: DoctorReport = {
  schemaVersion: 1,
  checkedAt: "2026-08-15T00:00:00.000Z",
  ready: true,
  checks: [],
};

function deps(stream: ReturnType<typeof streams>, overrides: Partial<Parameters<typeof runAgentBoard>[1]> = {}) {
  return {
    ack: async () => acknowledged,
    unregister: async () => record,
    doctor: async () => doctorReport,
    ...stream,
    ...overrides,
  };
}

test("router passes focused and explicit forms to the registered operation", async () => {
  const focused = streams();
  const focusedTargets: Array<string | undefined> = [];
  assert.equal(await runAgentBoard(["ack"], deps(focused, { ack: async (target) => { focusedTargets.push(target); return acknowledged; } })), 0);
  assert.equal(focused.output.stdout, "Acknowledged session-1.\n");

  const explicit = streams();
  assert.equal(await runAgentBoard(["unregister", "session-1"], deps(explicit, { unregister: async (target) => { focusedTargets.push(target); return record; } })), 0);
  assert.deepEqual(focusedTargets, [undefined, "session-1"]);
  assert.equal(explicit.output.stdout, "Unregistered session-1.\n");
});

test("router truthfully reports deferred title repair", async () => {
  const io = streams();
  const result = await runAgentBoard(["ack", "session-1"], deps(io, { ack: async () => ({ ...acknowledged, titleRendered: false }) }));
  assert.equal(result, 0);
  assert.equal(io.output.stdout, "Acknowledged session-1. Title sync deferred.\n");
});

test("router rejects unknown, prototype, abbreviated, flagged, empty, and extra operands before execution", async () => {
  for (const argv of [[], ["a"], ["toString"], ["constructor"], ["acknowledge"], ["ack", ""], ["ack", "--json"], ["ack", "one", "two"]]) {
    const io = streams();
    let calls = 0;
    const result = await runAgentBoard(argv, deps(io, { ack: async () => { calls += 1; return acknowledged; } }));
    assert.equal(result, 2, JSON.stringify(argv));
    assert.equal(calls, 0, JSON.stringify(argv));
    assert.equal(io.output.stderr, "Usage: agent-board <ack|unregister|doctor> [session-id|--json]\n");
  }
});

test("router runs doctor in human and JSON modes with truthful readiness exit", async () => {
  const human = streams();
  assert.equal(await runAgentBoard(["doctor"], deps(human)), 0);
  assert.match(human.output.stdout, /^AGENT BOARD DOCTOR/m);

  const json = streams();
  assert.equal(await runAgentBoard(["doctor", "--json"], deps(json)), 0);
  assert.deepEqual(JSON.parse(json.output.stdout), doctorReport);

  const notReady = streams();
  assert.equal(await runAgentBoard(["doctor"], deps(notReady, { doctor: async () => ({ ...doctorReport, ready: false }) })), 1);
  assert.match(notReady.output.stdout, /Not ready\./u);
});

test("router rejects invalid doctor operands before diagnosis", async () => {
  for (const argv of [["doctor", "--nope"], ["doctor", "--json", "extra"], ["doctor", "session-1"]]) {
    const io = streams();
    let calls = 0;
    const result = await runAgentBoard(argv, deps(io, { doctor: async () => { calls += 1; return doctorReport; } }));
    assert.equal(result, 2, JSON.stringify(argv));
    assert.equal(calls, 0, JSON.stringify(argv));
    assert.equal(io.output.stderr, "Usage: agent-board <ack|unregister|doctor> [session-id|--json]\n");
  }
});

test("router formats typed execution failures and returns exit one", async () => {
  const io = streams();
  const result = await runAgentBoard(["unregister"], deps(io, { unregister: async () => { throw new AgentBoardError("CONFLICT", "ambiguous focus"); } }));
  assert.equal(result, 1);
  assert.equal(io.output.stderr, "CONFLICT: ambiguous focus\n");
});
