import { spawn as nodeSpawn, type ChildProcess } from "node:child_process";

import { AgentBoardError } from "../../domain/errors.js";
import type { ProcessRunner } from "../process-runner.js";
import { NodeProcessRunner } from "../process-runner.js";
import { checkCodexCompatibility, type CodexCompatibility } from "./compatibility.js";
import { parseAdvertisedEndpoint, type AppServerEndpoint } from "./endpoint.js";

const DEFAULT_READINESS_TIMEOUT_MS = 10_000;
const DEFAULT_SHUTDOWN_GRACE_MS = 2_000;
const DEFAULT_STARTUP_OUTPUT_BYTES = 64 * 1024;
const DEFAULT_DIAGNOSTIC_TAIL_BYTES = 8 * 1024;

export interface ProcessExit {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
}

export interface ManagedChild {
  readonly pid: number;
  readonly processGroup: boolean;
  readonly exited: Promise<ProcessExit>;
  readonly diagnosticTail: () => string;
}

export interface StartedAppServer {
  readonly child: ManagedChild;
  readonly endpoint: AppServerEndpoint;
}

export interface CodexProcessHostOptions {
  readonly command?: string;
  readonly runner?: ProcessRunner;
  readonly spawn?: typeof nodeSpawn;
  readonly kill?: typeof process.kill;
  readonly readinessTimeoutMs?: number;
  readonly shutdownGraceMs?: number;
  readonly maxStartupOutputBytes?: number;
  readonly maxDiagnosticTailBytes?: number;
}

type StreamChild = ChildProcess & {
  stdout: NodeJS.ReadableStream | null;
  stderr: NodeJS.ReadableStream | null;
};

function failure(message: string, cause?: unknown): AgentBoardError {
  return new AgentBoardError("ADAPTER_FAILURE", message, { cause });
}

function positive(name: string, value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) throw failure(`${name} must be a positive safe integer`);
  return value;
}

function abortError(): AgentBoardError {
  return failure("Codex process operation aborted");
}

function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort)).catch(() => undefined);
  });
}

function appendTail(current: string, chunk: Buffer, maxBytes: number): string {
  const text = chunk.toString("utf8");
  const combined = current + text;
  const bytes = Buffer.byteLength(combined, "utf8");
  if (bytes <= maxBytes) return combined;
  const output = Buffer.from(combined, "utf8");
  return output.subarray(output.byteLength - maxBytes).toString("utf8");
}

function processExit(child: ChildProcess, diagnosticTail: () => string): Promise<ProcessExit> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: ProcessExit): void => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    child.once("error", (error) => {
      // A spawn error has no reliable exit status. Keep the diagnostic on the
      // child and settle the same promise used by normal close events.
      void error;
      finish({ exitCode: null, signal: null });
    });
    child.once("close", (exitCode, signal) => finish({ exitCode, signal }));
    void diagnosticTail;
  });
}

function forbiddenForwardedArgs(args: readonly string[]): string | undefined {
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--") return argument;
    if (argument === "--remote" || argument.startsWith("--remote=")) return argument;
    if (argument === "--remote-auth" || argument.startsWith("--remote-auth=") || argument.startsWith("--remote-auth-")) return argument;
    if (argument === "--remote-url" || argument.startsWith("--remote-url=")) return argument;
    if ((argument === "-c" || argument === "--config") && args[index + 1]?.startsWith("tui.terminal_title=")) {
      return `${argument} ${args[index + 1]}`;
    }
    if (argument.startsWith("--config=tui.terminal_title=") || argument.startsWith("-ctui.terminal_title=")) return argument;
    if (argument.startsWith("tui.terminal_title=")) return argument;
  }
  return undefined;
}

export class CodexProcessHost {
  private readonly command: string;
  private readonly runner: ProcessRunner;
  private readonly spawnProcess: typeof nodeSpawn;
  private readonly killProcess: typeof process.kill;
  private readonly readinessTimeoutMs: number;
  private readonly shutdownGraceMs: number;
  private readonly maxStartupOutputBytes: number;
  private readonly maxDiagnosticTailBytes: number;
  private readonly stops = new WeakMap<object, Promise<ProcessExit>>();

  constructor(options: CodexProcessHostOptions = {}) {
    this.command = options.command ?? "codex";
    this.runner = options.runner ?? new NodeProcessRunner();
    this.spawnProcess = options.spawn ?? nodeSpawn;
    this.killProcess = options.kill ?? process.kill;
    this.readinessTimeoutMs = positive("readinessTimeoutMs", options.readinessTimeoutMs ?? DEFAULT_READINESS_TIMEOUT_MS);
    this.shutdownGraceMs = positive("shutdownGraceMs", options.shutdownGraceMs ?? DEFAULT_SHUTDOWN_GRACE_MS);
    this.maxStartupOutputBytes = positive("maxStartupOutputBytes", options.maxStartupOutputBytes ?? DEFAULT_STARTUP_OUTPUT_BYTES);
    this.maxDiagnosticTailBytes = positive("maxDiagnosticTailBytes", options.maxDiagnosticTailBytes ?? DEFAULT_DIAGNOSTIC_TAIL_BYTES);
  }

  async compatibility(signal?: AbortSignal): Promise<CodexCompatibility> {
    const request = this.runner.run({ command: this.command, args: ["--version"], timeoutMs: this.readinessTimeoutMs, maxOutputBytes: this.maxDiagnosticTailBytes });
    const result = await (signal === undefined ? request : withAbort(request, signal));
    if (result.exitCode !== 0) throw failure(`Codex version probe exited with code ${result.exitCode}`, result.stderr.slice(-this.maxDiagnosticTailBytes));
    return checkCodexCompatibility(`${result.stdout}\n${result.stderr}`);
  }

  async version(signal?: AbortSignal): Promise<string> {
    const compatibility = await this.compatibility(signal);
    if (!compatibility.compatible) throw failure(compatibility.reason ?? "Installed Codex is incompatible with managed observation");
    if (compatibility.version === undefined) throw failure("Codex compatibility check did not return a version");
    return compatibility.version;
  }

  async startAppServer(signal: AbortSignal, sessionId?: string): Promise<StartedAppServer> {
    if (signal.aborted) throw abortError();
    const config = sessionId === undefined
      ? []
      : ["-c", `shell_environment_policy.set.AGENT_BOARD_SESSION_ID=${JSON.stringify(sessionId)}`];
    let child: StreamChild;
    try {
      child = this.spawnProcess(this.command, ["app-server", "--listen", "ws://127.0.0.1:0", ...config], {
        shell: false,
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
        ...(sessionId === undefined
          ? {}
          : { env: { ...process.env, AGENT_BOARD_SESSION_ID: sessionId } }),
      }) as StreamChild;
    } catch (error) {
      throw failure("Unable to start Codex app-server", error);
    }
    const appServerPid = child.pid;
    if (typeof appServerPid !== "number" || !Number.isSafeInteger(appServerPid) || appServerPid <= 1) throw failure("Codex app-server did not expose a safe process id");

    let tail = "";
    const managed = this.makeManagedChild(child, true, () => tail);
    let startupText = "";
    let startupBytes = 0;
    let endpoint: AppServerEndpoint | undefined;
    let startupError: unknown;
    let resolveReady!: (value: StartedAppServer) => void;
    let rejectReady!: (error: unknown) => void;
    const ready = new Promise<StartedAppServer>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
    let timer = setTimeout(() => rejectReady(failure(`Codex app-server readiness timed out after ${this.readinessTimeoutMs}ms`)), this.readinessTimeoutMs);
    let settled = false;
    const finishError = (error: unknown): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rejectReady(error instanceof AgentBoardError ? error : failure("Codex app-server failed during startup", error));
    };
    const finishReady = (value: StartedAppServer): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveReady(value);
    };
    const consume = (chunk: Buffer): void => {
      tail = appendTail(tail, chunk, this.maxDiagnosticTailBytes);
      if (endpoint !== undefined || startupError !== undefined || settled) return;
      startupBytes += chunk.byteLength;
      startupText += chunk.toString("utf8");
      if (startupBytes > this.maxStartupOutputBytes) {
        startupError = failure(`Codex app-server startup output exceeded ${this.maxStartupOutputBytes} bytes`);
        finishError(startupError);
        return;
      }
      const output = startupText;
      if (!/\bws:\/\//iu.test(output)) return;
      // Stream chunks may split an endpoint in the middle of a host or port.
      // Wait for a line boundary, or for a complete loopback host/port token,
      // before treating parser rejection as a real incompatibility.
      const hasLineBoundary = /[\r\n]/u.test(output);
      const hasCompleteLoopbackToken = /ws:\/\/(?:127\.0\.0\.1|localhost):\d{1,5}(?:[\/\s]|$)/iu.test(output);
      if (!hasLineBoundary && !hasCompleteLoopbackToken) return;
      try {
        endpoint = parseAdvertisedEndpoint(output);
        finishReady({ child: managed, endpoint });
      } catch (error) {
        startupError = error;
        finishError(error);
      }
    };
    child.stdout?.on("data", consume);
    child.stderr?.on("data", consume);
    child.once("error", (error) => finishError(failure("Codex app-server could not be started", error)));
    child.once("close", (exitCode, closeSignal) => {
      if (!settled) finishError(failure(`Codex app-server exited before readiness (${closeSignal ?? exitCode ?? "unknown"})`, tail));
    });
    const abort = () => finishError(abortError());
    signal.addEventListener("abort", abort, { once: true });
    try {
      return await ready;
    } catch (error) {
      try { await this.stop(managed); } catch { /* preserve the startup failure */ }
      throw error;
    } finally {
      signal.removeEventListener("abort", abort);
    }
  }

  async startRemoteTui(endpoint: AppServerEndpoint, forwardedArgs: readonly string[], sessionId?: string): Promise<ManagedChild> {
    const forbidden = forbiddenForwardedArgs(forwardedArgs);
    if (forbidden !== undefined) throw failure(`Codex argument is reserved by Agent Board: ${forbidden}`);
    const args = [...forwardedArgs, "--remote", endpoint.websocketUrl.toString(), "-c", "tui.terminal_title=[]"];
    let child: ChildProcess;
    try {
      child = this.spawnProcess(this.command, args, {
        shell: false,
        detached: false,
        stdio: "inherit",
        ...(sessionId === undefined
          ? {}
          : { env: { ...process.env, AGENT_BOARD_SESSION_ID: sessionId } }),
      });
    } catch (error) {
      throw failure("Unable to start Codex remote TUI", error);
    }
    const tuiPid = child.pid;
    if (typeof tuiPid !== "number" || !Number.isSafeInteger(tuiPid) || tuiPid <= 1) throw failure("Codex remote TUI did not expose a safe process id");
    return this.makeManagedChild(child, false, () => "");
  }

  async stop(child: ManagedChild): Promise<ProcessExit> {
    const existing = this.stops.get(child as object);
    if (existing !== undefined) return existing;
    const operation = this.stopOnce(child);
    this.stops.set(child as object, operation);
    return operation;
  }

  private makeManagedChild(child: ChildProcess, processGroup: boolean, diagnosticTail: () => string): ManagedChild {
    return { pid: child.pid!, processGroup, exited: processExit(child, diagnosticTail), diagnosticTail };
  }

  private async stopOnce(child: ManagedChild): Promise<ProcessExit> {
    const send = (signal: NodeJS.Signals): void => {
      try { this.killProcess(child.processGroup ? -child.pid : child.pid, signal); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
      }
    };
    const wait = async (milliseconds: number): Promise<ProcessExit | undefined> => Promise.race([
      child.exited,
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), milliseconds)),
    ]);
    const alreadyExited = await wait(0);
    if (alreadyExited !== undefined) return alreadyExited;
    try {
      send("SIGTERM");
    } catch (error) {
      throw failure("Unable to terminate Codex child", error);
    }
    const graceful = await wait(this.shutdownGraceMs);
    if (graceful !== undefined) return graceful;
    try { send("SIGKILL"); } catch (error) { throw failure("Unable to kill Codex child", error); }
    const killed = await wait(this.shutdownGraceMs);
    if (killed !== undefined) return killed;
    throw failure(`Codex child ${child.pid} did not exit after bounded termination`);
  }
}
