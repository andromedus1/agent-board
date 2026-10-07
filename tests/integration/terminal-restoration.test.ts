import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

interface TerminalReport {
  readonly before: string;
  readonly after: string;
  readonly code: number;
}

function waitForMarker(child: ChildProcess, marker: string, output: { value: string }): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for PTY marker ${marker}`)), 5_000);
    const onData = (chunk: Buffer): void => {
      output.value += chunk.toString("utf8");
      if (!output.value.includes(marker)) return;
      clearTimeout(timer);
      resolve();
    };
    child.stdout?.on("data", onData);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("close", (code, signal) => {
      if (output.value.includes(marker)) return;
      clearTimeout(timer);
      reject(new Error(`PTY child exited before marker (${code ?? signal ?? "unknown"})`));
    });
  });
}

test("forced managed shutdown restores the controlling PTY and keyboard cleanup", { skip: process.platform !== "darwin" ? "requires macOS controlling-PTY semantics" : false }, async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-board-pty-test-"));
  const reportPath = join(root, "terminal-report.json");
  const childPath = join(root, "pty-child.mjs");
  const sourceUrl = new URL("../../src/cli/agent-codex.ts", import.meta.url).href;
  const childSource = [
    "import { execFileSync } from 'node:child_process';",
    "import { writeFileSync } from 'node:fs';",
    `import { runAgentCodexWithSignals } from ${JSON.stringify(sourceUrl)};`,
    `const reportPath = ${JSON.stringify(reportPath)};`,
    "const stty = () => execFileSync('/bin/stty', ['-g'], { encoding: 'utf8', stdio: [0, 'pipe', 'pipe'] }).trim();",
    "const initial = stty();",
    "execFileSync('/bin/stty', ['-echo', '-icanon'], { stdio: [0, 'ignore', 'pipe'] });",
    "execFileSync('/bin/stty', [initial], { stdio: [0, 'ignore', 'pipe'] });",
    "await new Promise((resolve) => setTimeout(resolve, 25));",
    "const before = stty();",
    "const result = await runAgentCodexWithSignals([], {",
    "  launch: async (_args, signal) => {",
    "    execFileSync('/bin/stty', ['-echo', '-icanon', 'min', '1', 'time', '0'], { stdio: [0, 'ignore', 'pipe'] });",
    "    process.stdout.write('AGENT_BOARD_PTY_READY\\n');",
    "    const keepAlive = setInterval(() => undefined, 1_000);",
    "    setTimeout(() => process.kill(process.pid, 'SIGTERM'), 50);",
    "    try { await new Promise((resolve) => signal.addEventListener('abort', resolve, { once: true })); } finally { clearInterval(keepAlive); }",
    "    return { outcome: 'terminated', exitCode: 143 };",
    "  },",
    "  stdout: process.stdout,",
    "  stderr: process.stderr,",
    "}, process);",
    "const after = stty();",
    "writeFileSync(reportPath, JSON.stringify({ before, after, code: result }));",
  ].join("\n");
  await writeFile(childPath, childSource, "utf8");
  const output = { value: "" };
  let errorOutput = "";
  const expectProgram = [
    "log_user 1",
    "set timeout 10",
    "spawn -noecho /usr/bin/script -q /dev/null $env(AGENT_BOARD_NODE) --import tsx $env(AGENT_BOARD_CHILD)",
    "expect eof",
    "catch wait result",
    "exit [lindex $result 3]",
  ].join("\n");
  const child = spawn("/usr/bin/expect", ["-c", expectProgram], {
    cwd: process.cwd(),
    env: { ...process.env, AGENT_BOARD_NODE: process.execPath, AGENT_BOARD_CHILD: childPath },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stderr?.on("data", (chunk: Buffer) => { errorOutput += chunk.toString("utf8"); });
  try {
    await waitForMarker(child, "AGENT_BOARD_PTY_READY", output).catch((error: unknown) => {
      throw new Error(`${error instanceof Error ? error.message : String(error)}; stderr: ${errorOutput}`);
    });
    const [code, signal] = await new Promise<[number | null, NodeJS.Signals | null]>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("PTY child did not exit after forced shutdown")), 5_000);
      child.once("close", (exitCode, exitSignal) => {
        clearTimeout(timer);
        resolve([exitCode, exitSignal]);
      });
    });
    assert.equal(signal, null);
    assert.equal(code, 0, errorOutput);
    const report = JSON.parse(await readFile(reportPath, "utf8")) as TerminalReport;
    assert.equal(report.code, 143);
    assert.equal(report.after, report.before, "forced shutdown must restore the exact captured termios mode");
    assert.ok(output.value.includes("\u001b[<u\u001b[<u\u001b[>4;0m"), "cleanup must reset CSI-u and modifyOtherKeys reporting");
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    await rm(root, { recursive: true, force: true });
  }
});
