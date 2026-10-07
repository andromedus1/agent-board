import { spawn, type ChildProcess } from "node:child_process";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

import { AgentBoardError } from "../../domain/errors.js";
import { NodeProcessRunner, type ProcessRunner } from "../process-runner.js";
import { checkClaudeCompatibility, type ClaudeCompatibility } from "./compatibility.js";

export interface ClaudeProcessExit {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
}

export interface ClaudeChild {
  readonly pid: number;
  readonly exited: Promise<ClaudeProcessExit>;
  readonly process: ChildProcess;
}

export interface ClaudeProcessHostOptions {
  readonly command?: string;
  readonly spawnProcess?: typeof spawn;
  readonly runner?: ProcessRunner;
  readonly diagnosticTimeoutMs?: number;
}

const DISALLOWED_INTERACTIVE_ARGS = new Set(["-p", "--print", "--bare", "--background"]);

export class ClaudeProcessHost {
  private readonly command: string;
  private readonly spawnProcess: typeof spawn;
  private readonly runner: ProcessRunner;
  private readonly diagnosticTimeoutMs: number;

  constructor(options: ClaudeProcessHostOptions = {}) {
    this.command = options.command ?? "claude";
    this.spawnProcess = options.spawnProcess ?? spawn;
    this.runner = options.runner ?? new NodeProcessRunner();
    this.diagnosticTimeoutMs = options.diagnosticTimeoutMs ?? 5_000;
  }

  async compatibility(): Promise<ClaudeCompatibility> {
    const result = await this.runner.run({ command: this.command, args: ["--version"], timeoutMs: this.diagnosticTimeoutMs, maxOutputBytes: 16 * 1024 });
    if (result.exitCode !== 0) throw new AgentBoardError("ADAPTER_FAILURE", "Claude version check failed");
    return checkClaudeCompatibility(result.stdout);
  }

  async validatePlugin(pluginRoot: string): Promise<void> {
    const result = await this.runner.run({ command: this.command, args: ["plugin", "validate", pluginRoot], timeoutMs: this.diagnosticTimeoutMs, maxOutputBytes: 64 * 1024 });
    if (result.exitCode !== 0) throw new AgentBoardError("ADAPTER_FAILURE", "Claude rejected the Agent Board hook plugin");
    try { await access(resolve(pluginRoot, "../../dist/cli/agent-claude-hook.js")); }
    catch (error) { throw new AgentBoardError("ADAPTER_FAILURE", "Packaged Claude hook handler is unavailable", { cause: error }); }
  }

  start(pluginRoot: string, forwardedArgs: readonly string[], sessionId: string): ClaudeChild {
    const forbidden = forwardedArgs.find((arg) => DISALLOWED_INTERACTIVE_ARGS.has(arg));
    if (forbidden !== undefined) {
      throw new AgentBoardError("ADAPTER_FAILURE", `${forbidden} is incompatible with managed interactive Claude observation`);
    }
    let child: ChildProcess;
    try {
      child = this.spawnProcess(this.command, ["--plugin-dir", pluginRoot, ...forwardedArgs], {
        shell: false,
        stdio: "inherit",
        env: { ...process.env, AGENT_BOARD_SESSION_ID: sessionId },
      });
    } catch (error) {
      throw new AgentBoardError("ADAPTER_FAILURE", "Unable to start Claude", { cause: error });
    }
    const pid = child.pid;
    if (pid === undefined || !Number.isSafeInteger(pid) || pid <= 1) {
      child.kill("SIGTERM");
      throw new AgentBoardError("ADAPTER_FAILURE", "Claude did not expose a safe process id");
    }
    const exited = new Promise<ClaudeProcessExit>((resolve, reject) => {
      child.once("error", (error) => reject(new AgentBoardError("ADAPTER_FAILURE", "Claude process failed", { cause: error })));
      child.once("close", (exitCode, signal) => resolve({ exitCode, signal }));
    });
    return { pid, process: child, exited };
  }

  async stop(child: ClaudeChild): Promise<void> {
    if (child.process.exitCode !== null || child.process.signalCode !== null) return;
    child.process.kill("SIGTERM");
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        child.exited.then(() => undefined),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 5_000);
          timer.unref?.();
        }),
      ]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
    if (child.process.exitCode === null && child.process.signalCode === null) child.process.kill("SIGKILL");
  }
}
