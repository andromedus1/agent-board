import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";

import type { ProcessRequest, ProcessResult, ProcessRunner } from "../../../src/integrations/process-runner.js";
import { CodexProcessHost } from "../../../src/integrations/codex/process.js";

class FakeChild extends EventEmitter {
  readonly stdout = new EventEmitter();
  readonly stderr = new EventEmitter();
  readonly pid = 4321;
}

class FakeRunner implements ProcessRunner {
  async run(_request: ProcessRequest): Promise<ProcessResult> { return { stdout: "codex-cli 0.147.0\n", stderr: "", exitCode: 0 }; }
}

test("process host uses split stream readiness and exact remote argv", async () => {
  const children: FakeChild[] = [];
  const requests: { command: string; args: readonly string[]; options: unknown }[] = [];
  const spawn = ((command: string, args: readonly string[], options: unknown) => {
    const child = new FakeChild(); children.push(child); requests.push({ command, args, options });
    if (args[0] === "app-server") setImmediate(() => { child.stdout.emit("data", Buffer.from("listening on ws://127.0.")); child.stderr.emit("data", Buffer.from("0.1:45")); });
    return child;
  }) as never;
  const host = new CodexProcessHost({ runner: new FakeRunner(), spawn, readinessTimeoutMs: 500 });
  assert.equal(await host.version(), "0.147.0");
  const started = await host.startAppServer(new AbortController().signal, "session-1");
  assert.equal(started.endpoint.websocketUrl.port, "45");
  await host.startRemoteTui(started.endpoint, ["--full-auto"], "session-1");
  assert.deepEqual(requests[0]?.args, [
    "app-server",
    "--listen",
    "ws://127.0.0.1:0",
    "-c",
    'shell_environment_policy.set.AGENT_BOARD_SESSION_ID="session-1"',
  ]);
  assert.deepEqual(requests[1]?.args, ["--full-auto", "--remote", "ws://127.0.0.1:45/", "-c", "tui.terminal_title=[]"]);
  assert.deepEqual(requests[1]?.options, {
    shell: false,
    detached: false,
    stdio: "inherit",
    env: { ...process.env, AGENT_BOARD_SESSION_ID: "session-1" },
  });
  assert.deepEqual(requests[0]?.options, {
    shell: false,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, AGENT_BOARD_SESSION_ID: "session-1" },
  });
  for (const child of children) child.emit("close", 0, null);
});

test("process host rejects reserved topology arguments before spawn", async () => {
  let calls = 0;
  const spawn = (() => { calls += 1; return new FakeChild(); }) as never;
  const host = new CodexProcessHost({ spawn });
  const endpoint = { websocketUrl: new URL("ws://127.0.0.1:45") };
  for (const args of [
    ["--remote", "elsewhere"],
    ["--config=tui.terminal_title=unsafe"],
    ["-ctui.terminal_title=unsafe"],
    ["--", "--remote", "positional"],
  ]) {
    await assert.rejects(host.startRemoteTui(endpoint, args));
  }
  assert.equal(calls, 0);
});

test("app-server readiness timeout performs bounded TERM to KILL cleanup", async () => {
  const child = new FakeChild();
  const signals: Array<{ pid: number; signal: NodeJS.Signals }> = [];
  const kill = ((pid: number, signal: NodeJS.Signals) => {
    signals.push({ pid, signal });
    if (signal === "SIGKILL") setImmediate(() => child.emit("close", null, "SIGKILL"));
    return true;
  }) as typeof process.kill;
  const host = new CodexProcessHost({
    spawn: (() => child) as never,
    kill,
    readinessTimeoutMs: 5,
    shutdownGraceMs: 5,
  });

  await assert.rejects(host.startAppServer(new AbortController().signal), /readiness timed out/);
  assert.deepEqual(signals, [
    { pid: -4321, signal: "SIGTERM" },
    { pid: -4321, signal: "SIGKILL" },
  ]);
});

test("app-server startup output overflow fails and terminates the owned group", async () => {
  const child = new FakeChild();
  const signals: NodeJS.Signals[] = [];
  const kill = ((_pid: number, signal: NodeJS.Signals) => {
    signals.push(signal);
    setImmediate(() => child.emit("close", null, signal));
    return true;
  }) as typeof process.kill;
  const host = new CodexProcessHost({
    spawn: (() => child) as never,
    kill,
    readinessTimeoutMs: 100,
    shutdownGraceMs: 5,
    maxStartupOutputBytes: 4,
  });
  setImmediate(() => child.stderr.emit("data", Buffer.from("12345")));

  await assert.rejects(host.startAppServer(new AbortController().signal), /startup output exceeded/);
  assert.deepEqual(signals, ["SIGTERM"]);
});

test("app-server exit before readiness fails without signaling an observed dead child", async () => {
  const child = new FakeChild();
  let killCalls = 0;
  const host = new CodexProcessHost({
    spawn: (() => child) as never,
    kill: (() => { killCalls += 1; return true; }) as typeof process.kill,
    readinessTimeoutMs: 100,
    shutdownGraceMs: 5,
  });
  setImmediate(() => child.emit("close", 2, null));

  await assert.rejects(host.startAppServer(new AbortController().signal), /exited before readiness \(2\)/);
  assert.equal(killCalls, 0);
});

test("stop escalates an unresponsive TUI without signaling a process group", async () => {
  const child = new FakeChild();
  const signals: Array<{ pid: number; signal: NodeJS.Signals }> = [];
  const kill = ((pid: number, signal: NodeJS.Signals) => {
    signals.push({ pid, signal });
    if (signal === "SIGKILL") setImmediate(() => child.emit("close", null, "SIGKILL"));
    return true;
  }) as typeof process.kill;
  const host = new CodexProcessHost({ spawn: (() => child) as never, kill, shutdownGraceMs: 5 });
  const tui = await host.startRemoteTui({ websocketUrl: new URL("ws://127.0.0.1:45") }, []);

  assert.deepEqual(await host.stop(tui), { exitCode: null, signal: "SIGKILL" });
  assert.deepEqual(signals, [
    { pid: 4321, signal: "SIGTERM" },
    { pid: 4321, signal: "SIGKILL" },
  ]);
});

test("stop never signals a child whose exit was already observed", async () => {
  const child = new FakeChild();
  let killCalls = 0;
  const host = new CodexProcessHost({
    spawn: (() => child) as never,
    kill: (() => { killCalls += 1; return true; }) as typeof process.kill,
    shutdownGraceMs: 5,
  });
  const tui = await host.startRemoteTui({ websocketUrl: new URL("ws://127.0.0.1:45") }, []);
  child.emit("close", 0, null);

  assert.deepEqual(await host.stop(tui), { exitCode: 0, signal: null });
  assert.equal(killCalls, 0);
});
