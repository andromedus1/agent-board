import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import { runAgentCodex, runAgentCodexWithSignals } from "../../src/cli/agent-codex.js";

test("agent-codex forwards argv and returns managed outcome code", async () => {
  const calls: readonly string[][] = [];
  const output = { stdout: { write() { return true; } }, stderr: { write() { return true; } } };
  const controller = new AbortController();
  const result = await runAgentCodex(["--full-auto", "-c", "model=x"], {
    launch: async (args) => { (calls as string[][]).push([...args]); return { outcome: "clean", exitCode: 0 }; },
    ...output,
  }, controller.signal);
  assert.equal(result, 0);
  assert.deepEqual(calls, [["--full-auto", "-c", "model=x"]]);
});

test("agent-codex reports typed launch failures without a stack", async () => {
  let stderr = "";
  const result = await runAgentCodex([], {
    launch: async () => { throw new AgentBoardError("ADAPTER_FAILURE", "unsupported Codex"); },
    stdout: { write() { return true; } }, stderr: { write(value: string) { stderr += value; return true; } },
  }, new AbortController().signal);
  assert.equal(result, 1);
  assert.equal(stderr, "ADAPTER_FAILURE: unsupported Codex\n");
});

test("agent-codex signal bridge preserves SIGINT, aborts on termination, and removes listeners", async () => {
  const signals = new EventEmitter();
  const output = { stdout: { write() { return true; } }, stderr: { write() { return true; } } };
  let launchSignal: AbortSignal | undefined;
  const running = runAgentCodexWithSignals([], {
    launch: async (_args, signal) => {
      launchSignal = signal;
      await new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve(), { once: true }));
      return { outcome: "terminated", exitCode: 143 };
    },
    ...output,
  }, signals);
  signals.emit("SIGINT", "SIGINT");
  assert.equal(launchSignal?.aborted, false);
  signals.emit("SIGTERM", "SIGTERM");

  assert.equal(await running, 143);
  assert.equal(launchSignal?.aborted, true);
  assert.equal(signals.listenerCount("SIGINT"), 0);
  assert.equal(signals.listenerCount("SIGHUP"), 0);
  assert.equal(signals.listenerCount("SIGTERM"), 0);
});

test("agent-codex restores the exact pre-launch terminal mode after failure", async () => {
  const signals = new EventEmitter();
  const restored: string[] = [];
  let stderr = "";
  const output = { stdout: { write() { return true; } }, stderr: { write(value: string) { stderr += value; return true; } } };

  const result = await runAgentCodexWithSignals([], {
    launch: async () => { throw new AgentBoardError("ADAPTER_FAILURE", "observer failed"); },
    ...output,
  }, signals, {
    capture: () => "gfmt1:iflag=2b02:lflag=5cb",
    restore: (snapshot) => { restored.push(snapshot); return true; },
  });

  assert.equal(result, 1);
  assert.equal(stderr, "ADAPTER_FAILURE: observer failed\n");
  assert.deepEqual(restored, ["gfmt1:iflag=2b02:lflag=5cb"]);
});

test("agent-codex restores terminal mode after a returned managed outcome", async () => {
  const restored: string[] = [];
  const result = await runAgentCodexWithSignals([], {
    launch: async () => ({ outcome: "terminated", exitCode: 143 }),
    stdout: { write() { return true; } },
    stderr: { write() { return true; } },
  }, new EventEmitter(), {
    capture: () => "saved-mode",
    restore: (snapshot) => { restored.push(snapshot); },
  });
  assert.equal(result, 143);
  assert.deepEqual(restored, ["saved-mode"]);
});

test("agent-codex refuses launch when terminal capture fails", async () => {
  let launches = 0;
  let stderr = "";
  const result = await runAgentCodexWithSignals([], {
    launch: async () => { launches += 1; return { outcome: "clean", exitCode: 0 }; },
    stdout: { write() { return true; } },
    stderr: { write(value: string) { stderr += value; return true; } },
  }, new EventEmitter(), {
    capture: () => { throw new AgentBoardError("ADAPTER_FAILURE", "capture failed"); },
    restore: () => undefined,
  });
  assert.equal(result, 1);
  assert.equal(launches, 0);
  assert.equal(stderr, "ADAPTER_FAILURE: capture failed\n");
});

test("agent-codex preserves outcome when terminal restoration fails", async () => {
  let stderr = "";
  const result = await runAgentCodexWithSignals([], {
    launch: async () => ({ outcome: "failed", exitCode: 7 }),
    stdout: { write() { return true; } },
    stderr: { write(value: string) { stderr += value; return true; } },
  }, new EventEmitter(), {
    capture: () => "saved-mode",
    restore: () => { throw new AgentBoardError("ADAPTER_FAILURE", "restore failed"); },
  });
  assert.equal(result, 7);
  assert.equal(stderr, "ADAPTER_FAILURE: restore failed; run reset to recover this shell\n");
});
