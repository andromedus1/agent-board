import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";

import { ClaudeProcessHost } from "../../../src/integrations/claude/process.js";
import { checkClaudeCompatibility } from "../../../src/integrations/claude/compatibility.js";

test("Claude process host uses shell-free inherited TTY and exact plugin argv", () => {
  const calls: Array<{ command: string; args: readonly string[]; options: Record<string, unknown> }> = [];
  const child = Object.assign(new EventEmitter(), { pid: 222, exitCode: null, signalCode: null, kill() { return true; } });
  const host = new ClaudeProcessHost({
    command: "/usr/local/bin/claude",
    spawnProcess: ((command: string, args: readonly string[], options: Record<string, unknown>) => {
      calls.push({ command, args, options });
      return child;
    }) as never,
  });
  host.start("/package/assets/claude-plugin", ["--continue"], "board");
  assert.equal(calls[0]?.command, "/usr/local/bin/claude");
  assert.deepEqual(calls[0]?.args, ["--plugin-dir", "/package/assets/claude-plugin", "--continue"]);
  assert.equal(calls[0]?.options.shell, false);
  assert.equal(calls[0]?.options.stdio, "inherit");
  assert.equal((calls[0]?.options.env as NodeJS.ProcessEnv).AGENT_BOARD_SESSION_ID, "board");
});

test("Claude process host rejects modes that disable or replace interactive observation", () => {
  const host = new ClaudeProcessHost();
  for (const flag of ["-p", "--print", "--bare", "--background"]) {
    assert.throws(() => host.start("/plugin", [flag], "board"), /incompatible with managed interactive/);
  }
});

test("Claude compatibility enforces the floor and warns through metadata above the tested family", () => {
  assert.deepEqual(checkClaudeCompatibility("2.1.226 (Claude Code)"), { compatible: true, version: "2.1.226", tested: true });
  assert.deepEqual(checkClaudeCompatibility("2.2.0 (Claude Code)"), { compatible: true, version: "2.2.0", tested: false });
  assert.equal(checkClaudeCompatibility("2.1.225 (Claude Code)").compatible, false);
  assert.equal(checkClaudeCompatibility("development").compatible, false);
});
