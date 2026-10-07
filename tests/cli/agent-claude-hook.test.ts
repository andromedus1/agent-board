import assert from "node:assert/strict";
import { test } from "node:test";

import { runClaudeHook } from "../../src/cli/agent-claude-hook.js";

test("Claude hook is observation-only and fails open", async () => {
  let stderr = "";
  const code = await runClaudeHook({ hook_event_name: "Stop" }, "session", async () => {
    throw new Error("state unavailable");
  }, { write(value: string) { stderr += value; return true; } });
  assert.equal(code, 0);
  assert.match(stderr, /observation skipped: state unavailable/);
});

test("Claude hook passes exact Board session identity", async () => {
  const calls: Array<{ id: string; input: unknown }> = [];
  const input = { session_id: "native", hook_event_name: "SessionStart" };
  const code = await runClaudeHook(input, "board", async (id, value) => { calls.push({ id, input: value }); }, { write() { return true; } });
  assert.equal(code, 0);
  assert.deepEqual(calls, [{ id: "board", input }]);
});
