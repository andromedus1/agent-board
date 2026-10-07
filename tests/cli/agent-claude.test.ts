import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";

import { runAgentClaude, runAgentClaudeWithSignals } from "../../src/cli/agent-claude.js";

test("agent-claude forwards interactive argv and result", async () => {
  const calls: readonly string[][] = [];
  const code = await runAgentClaude(["--continue"], {
    launch: async (args) => { (calls as string[][]).push([...args]); return { outcome: "clean", exitCode: 0 }; },
    stderr: { write() { return true; } },
  }, new AbortController().signal);
  assert.equal(code, 0);
  assert.deepEqual(calls, [["--continue"]]);
});

test("agent-claude preserves SIGINT for the TUI and aborts on termination", async () => {
  const signals = new EventEmitter();
  let observed: AbortSignal | undefined;
  const running = runAgentClaudeWithSignals([], {
    launch: async (_args, signal) => {
      observed = signal;
      await new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve(), { once: true }));
      return { outcome: "terminated", exitCode: 143 };
    },
    stderr: { write() { return true; } },
  }, signals, { capture: () => "mode", restore() {} });
  signals.emit("SIGINT", "SIGINT");
  assert.equal(observed?.aborted, false);
  signals.emit("SIGTERM", "SIGTERM");
  assert.equal(await running, 143);
  assert.equal(observed?.aborted, true);
  assert.equal(signals.listenerCount("SIGTERM"), 0);
});
