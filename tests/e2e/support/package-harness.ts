import { chmod, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const fixtures = join(projectRoot, "tests/e2e/fixtures");

export interface Scenario {
  readonly renamePrompt?: {
    readonly response?: string;
    readonly cancel?: boolean;
  };
  readonly ghostty: {
    readonly frontmost?: boolean;
    readonly focusedTerminalId?: string;
    readonly snapshotAvailable?: boolean;
    readonly titleActionFails?: boolean;
    readonly automationDenied?: boolean;
    readonly version?: string;
    readonly versionExitCode?: number;
    readonly configExitCode?: number;
    readonly defaultConfig?: string;
    readonly userConfig?: string;
    readonly terminals: Record<string, {
      windowId: string;
      tabId: string;
      terminalId: string;
      workingDirectory?: string;
      visible?: boolean;
      enumerable?: boolean;
      title?: string;
    }>;
  };
  readonly codex: {
    readonly version?: string;
    readonly versionExitCode?: number;
    readonly status?: "idle" | "working" | "input" | "error";
    readonly killServer?: boolean;
  };
  readonly claude: {
    readonly version?: string;
    readonly versionExitCode?: number;
    readonly pluginValid?: boolean;
    readonly exitCode?: number;
    readonly hook?: { readonly sequence: number; readonly event: string; readonly fields?: Record<string, unknown> };
  };
}

export interface RunningProcess {
  readonly child: ChildProcess;
  readonly stdout: Promise<string>;
  readonly stderr: Promise<string>;
  readonly exit: Promise<{ code: number | null; signal: NodeJS.Signals | null }>;
}

export interface PackageHarness {
  readonly root: string;
  readonly scenarioPath: string;
  readonly prefix: string;
  readonly env: NodeJS.ProcessEnv;
  bin(name: "agent-name" | "agent-codex" | "agent-claude" | "agents" | "agent-board"): string;
  readScenario(): Promise<Scenario>;
  writeScenario(mutator: (current: Scenario) => Scenario): Promise<void>;
  run(name: "agent-name" | "agent-codex" | "agent-claude" | "agents" | "agent-board", args?: readonly string[], options?: { timeoutMs?: number; stdinIsTTY?: boolean; env?: NodeJS.ProcessEnv }): Promise<{ code: number; stdout: string; stderr: string }>;
  start(name: "agent-name" | "agent-codex" | "agent-claude" | "agents" | "agent-board", args?: readonly string[]): RunningProcess;
  close(): Promise<void>;
}

function processResult(child: ChildProcess): RunningProcess {
  let stdout = "";
  let stderr = "";
  child.stdout?.on("data", (chunk: Buffer) => { stdout += chunk.toString("utf8"); });
  child.stderr?.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8"); });
  const exit = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolveExit) => {
    child.once("close", (code, signal) => resolveExit({ code, signal }));
  });
  return {
    child,
    stdout: exit.then(() => stdout),
    stderr: exit.then(() => stderr),
    exit,
  };
}

async function stopOwned(child: ChildProcess, exit: Promise<unknown>): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([exit, new Promise<void>((resolveWait) => setTimeout(resolveWait, 5_000))]);
  if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
  await Promise.race([exit, new Promise<void>((resolveWait) => setTimeout(resolveWait, 500))]);
}

async function waitFor<T>(read: () => Promise<T>, predicate: (value: T) => boolean, timeoutMs = 2_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await read();
    if (predicate(value)) return value;
    await new Promise<void>((resolveWait) => setTimeout(resolveWait, 20));
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for scenario convergence`);
}

export async function waitForScenario(harness: PackageHarness, predicate: (scenario: Scenario) => boolean, timeoutMs?: number): Promise<Scenario> {
  return waitFor(harness.readScenario, predicate, timeoutMs);
}

export async function createPackageHarness(initial?: Partial<Scenario>): Promise<PackageHarness> {
  const root = await mkdtemp(join(tmpdir(), "agent-board-e2e-"));
  if (!root.startsWith(`${tmpdir()}/agent-board-e2e-`)) throw new Error("Harness temp root failed containment check");
  try {
    const prefix = join(root, "prefix");
    const state = join(root, "state");
    const scenarioPath = join(root, "scenario.json");
    const scenario: Scenario = {
    ghostty: {
      ...initial?.ghostty,
      focusedTerminalId: initial?.ghostty?.focusedTerminalId ?? "term-one",
      terminals: {
        "term-one": { windowId: "window-one", tabId: "tab-one", terminalId: "term-one", workingDirectory: projectRoot },
        ...(initial?.ghostty?.terminals ?? {}),
      },
    },
    codex: { status: "idle", ...(initial?.codex ?? {}) },
    claude: { ...(initial?.claude ?? {}) },
  };
    await writeFile(scenarioPath, `${JSON.stringify(scenario)}\n`, "utf8");
    const pack = await execFileAsync("npm", ["pack", "--ignore-scripts", "--json"], { cwd: projectRoot, maxBuffer: 2 ** 20 });
    const packed = JSON.parse(pack.stdout) as Array<{ filename: string }>;
    const tarball = join(projectRoot, packed[0]?.filename ?? "");
    try {
      await execFileAsync("npm", ["install", "--offline", "--ignore-scripts", "--no-save", "--prefix", prefix, tarball], { cwd: projectRoot, maxBuffer: 4 * 2 ** 20 });
    } finally {
      await rm(tarball, { force: true });
    }
    const env: NodeJS.ProcessEnv = {
    ...process.env,
    AGENT_BOARD_STATE_DIR: state,
    AGENT_BOARD_E2E_SCENARIO: scenarioPath,
    AGENT_BOARD_CODEX_COMMAND: join(fixtures, "fake-codex.mjs"),
    AGENT_BOARD_CLAUDE_COMMAND: join(fixtures, "fake-claude.mjs"),
    AGENT_BOARD_GHOSTTY_COMMAND: join(fixtures, "fake-ghostty.mjs"),
    AGENT_BOARD_OSASCRIPT_COMMAND: join(fixtures, "fake-osascript.mjs"),
  };
    const owned = new Set<RunningProcess>();
    const harness: PackageHarness = {
    root,
    scenarioPath,
    prefix,
    env,
    bin: (name) => join(prefix, "node_modules", ".bin", name),
    readScenario: async () => JSON.parse(await readFile(scenarioPath, "utf8")) as Scenario,
    writeScenario: async (mutator) => {
      const current = JSON.parse(await readFile(scenarioPath, "utf8")) as Scenario;
      const temporary = `${scenarioPath}.${process.pid}.${Date.now()}.tmp`;
      await writeFile(temporary, `${JSON.stringify(mutator(current))}\n`, "utf8");
      await rename(temporary, scenarioPath);
    },
    run: async (name, args = [], options = {}) => {
      const executable = options.stdinIsTTY ? process.execPath : harness.bin(name);
      const executableArgs = options.stdinIsTTY
        ? ["--require", join(fixtures, "fake-tty.cjs"), harness.bin(name), ...args]
        : [...args];
      const result = await execFileAsync(executable, executableArgs, {
        cwd: projectRoot,
        env: { ...env, ...options.env },
        timeout: options.timeoutMs ?? 5_000,
        maxBuffer: 2 ** 20,
      }).catch((error: unknown) => {
        const value = error as { code?: number | string; stdout?: string; stderr?: string; killed?: boolean };
        if (value.killed) throw error;
        return { stdout: value.stdout ?? "", stderr: value.stderr ?? "", errorCode: value.code };
      });
      return {
        code: "errorCode" in result ? Number(result.errorCode) || 1 : 0,
        stdout: result.stdout,
        stderr: result.stderr,
      };
    },
    start: (name, args = []) => {
      const running = processResult(spawn(harness.bin(name), [...args], { cwd: projectRoot, env, shell: false, stdio: ["ignore", "pipe", "pipe"] }));
      owned.add(running);
      void running.exit.finally(() => owned.delete(running));
      return running;
    },
    close: async () => {
      for (const running of [...owned]) await stopOwned(running.child, running.exit);
      if (!root.startsWith(`${tmpdir()}/agent-board-e2e-`)) throw new Error("Refusing cleanup outside harness temp root");
      await rm(root, { recursive: true, force: true });
    },
    };
    await chmod(join(fixtures, "fake-codex.mjs"), 0o755);
    await chmod(join(fixtures, "fake-claude.mjs"), 0o755);
    await chmod(join(fixtures, "fake-ghostty.mjs"), 0o755);
    await chmod(join(fixtures, "fake-osascript.mjs"), 0o755);
    return harness;
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
