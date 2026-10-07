import assert from "node:assert/strict";
import type { spawnSync } from "node:child_process";
import { test } from "node:test";

import { SttyTerminalMode } from "../../src/integrations/terminal-mode.js";

test("stty terminal mode captures and restores one exact shell-free snapshot", () => {
  const calls: Array<{ command: string; args: readonly string[]; options: unknown }> = [];
  let terminalOutput = "";
  const spawn = ((command: string, args: readonly string[], options: unknown) => {
    calls.push({ command, args, options });
    return { pid: 1, output: [], stdout: args[0] === "-g" ? "gfmt1:iflag=2b02:lflag=5cb\n" : null, stderr: "", status: 0, signal: null };
  }) as unknown as typeof spawnSync;
  const mode = new SttyTerminalMode({
    command: "/test/stty",
    inputFd: 7,
    isTerminal: () => true,
    spawn,
    write: (value) => { terminalOutput += value; return true; },
  });

  const snapshot = mode.capture();
  assert.equal(snapshot, "gfmt1:iflag=2b02:lflag=5cb");
  mode.restore(snapshot!);

  assert.deepEqual(calls.map(({ command, args }) => [command, args]), [
    ["/test/stty", ["-g"]],
    ["/test/stty", ["gfmt1:iflag=2b02:lflag=5cb"]],
  ]);
  assert.deepEqual((calls[0]!.options as { stdio: unknown }).stdio, [7, "pipe", "pipe"]);
  assert.deepEqual((calls[1]!.options as { stdio: unknown }).stdio, [7, "ignore", "pipe"]);
  assert.equal(terminalOutput, "\x1b[<u\x1b[<u\x1b[>4;0m");
});

test("stty terminal mode skips non-terminal stdin", () => {
  let calls = 0;
  const mode = new SttyTerminalMode({
    isTerminal: () => false,
    spawn: (() => { calls += 1; throw new Error("must not run"); }) as typeof spawnSync,
  });
  assert.equal(mode.capture(), undefined);
  assert.equal(calls, 0);
});

test("stty terminal mode rejects failed and malformed captures on a terminal", () => {
  const failed = new SttyTerminalMode({
    isTerminal: () => true,
    spawn: (() => ({ pid: 1, output: [], stdout: "", stderr: "no tty state", status: 1, signal: null })) as unknown as typeof spawnSync,
  });
  assert.throws(() => failed.capture(), /Unable to capture the pre-launch terminal mode/u);

  const malformed = new SttyTerminalMode({
    isTerminal: () => true,
    spawn: (() => ({ pid: 1, output: [], stdout: "not a valid snapshot\n", stderr: "", status: 0, signal: null })) as unknown as typeof spawnSync,
  });
  assert.throws(() => malformed.capture(), /terminal mode snapshot is invalid/u);
});

test("stty terminal mode reports keyboard cleanup write failure after restoring termios", () => {
  const calls: string[][] = [];
  const mode = new SttyTerminalMode({
    isTerminal: () => true,
    spawn: ((_command: string, args: readonly string[]) => {
      calls.push([...args]);
      return { pid: 1, output: [], stdout: null, stderr: "", status: 0, signal: null };
    }) as unknown as typeof spawnSync,
    write: () => { throw new Error("terminal output closed"); },
  });

  assert.throws(() => mode.restore("saved-mode"), /Unable to restore terminal keyboard reporting/u);
  assert.deepEqual(calls, [["saved-mode"]]);
});
