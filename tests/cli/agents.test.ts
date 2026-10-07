import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import { runAgents } from "../../src/cli/agents.js";
import type { BoardRow } from "../../src/application/list-sessions.js";

function streams() {
  const output = { stdout: "", stderr: "" };
  return {
    output,
    stdout: { write(value: string) { output.stdout += value; return true; } },
    stderr: { write(value: string) { output.stderr += value; return true; } },
  };
}

const rows: readonly BoardRow[] = [{
  sessionId: "s1",
  label: "one",
  displayLabel: "one",
  glyph: "○",
  status: "idle",
  diagnostics: [],
  confidence: "authoritative",
  agentMode: "managed",
  adapter: "codex",
  evidenceKind: "codex.thread.status",
  adapterCapabilities: { workingWhileLauncherAlive: true, observation: "native-stream", semanticControl: "none" },
  observedAt: "2026-08-14T23:00:00.000Z",
  titleRendered: true,
}];

test("runAgents uses one list query for human and JSON modes", async () => {
  let calls = 0;
  const human = streams();
  assert.equal(await runAgents([], { list: async () => { calls += 1; return rows; }, ...human }), 0);
  assert.match(human.output.stdout, /^AGENT BOARD\n/);
  const json = streams();
  assert.equal(await runAgents(["--json"], { list: async () => { calls += 1; return rows; }, ...json }), 0);
  assert.equal(JSON.parse(json.output.stdout).schemaVersion, 1);
  assert.equal(calls, 2);
});

test("runAgents rejects grammar before querying and separates typed failures", async () => {
  let calls = 0;
  const invalid = streams();
  assert.equal(await runAgents(["--json", "extra"], { list: async () => { calls += 1; return rows; }, ...invalid }), 2);
  assert.equal(invalid.output.stderr, "Usage: agents [--json]\n");
  assert.equal(calls, 0);

  const failed = streams();
  assert.equal(await runAgents([], { list: async () => { calls += 1; throw new AgentBoardError("ADAPTER_FAILURE", "Ghostty unavailable"); }, ...failed }), 1);
  assert.equal(failed.output.stdout, "");
  assert.equal(failed.output.stderr, "ADAPTER_FAILURE: Ghostty unavailable\n");
  assert.equal(calls, 1);

  const unknown = streams();
  assert.equal(await runAgents([], { list: async () => { throw 42; }, ...unknown }), 1);
  assert.equal(unknown.output.stderr, "Unexpected failure\n");
});
