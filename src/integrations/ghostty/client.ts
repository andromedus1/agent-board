import type { ProcessRequest, ProcessRunner } from "../process-runner.js";
import { NodeProcessRunner } from "../process-runner.js";
import type { TerminalIdentity } from "../../domain/session.js";
import {
  ghosttyProcessError,
  parseActionEcho,
  parseActiveContext,
  parseFocusedTerminal,
  parseHierarchy,
  parseGhosttySnapshot,
  parseWorkingDirectory,
  type GhosttyContext,
  type GhosttyHierarchyEntry,
} from "./protocol.js";
import { ACTIVE_CONTEXT_SCRIPT, CLEAR_TAB_TITLE_SCRIPT, FOCUSED_TERMINAL_SCRIPT, HIERARCHY_SCRIPT, SET_TAB_TITLE_SCRIPT, SNAPSHOT_SCRIPT, WORKING_DIRECTORY_SCRIPT } from "./scripts.js";

const DEFAULT_COMMAND = "/usr/bin/osascript";
const DEFAULT_TIMEOUT_MS = 2_000;
const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024;

export interface GhosttyClientOptions {
  command?: string;
  runner?: ProcessRunner;
  timeoutMs?: number;
  maxOutputBytes?: number;
}

export class GhosttyClient {
  private readonly command: string;
  private readonly runner: ProcessRunner;
  private readonly timeoutMs: number;
  private readonly maxOutputBytes: number;

  constructor(options: GhosttyClientOptions = {}) {
    this.command = options.command ?? DEFAULT_COMMAND;
    this.runner = options.runner ?? new NodeProcessRunner();
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
  }

  async current(): Promise<GhosttyContext> {
    const identity = parseActiveContext(await this.execute(ACTIVE_CONTEXT_SCRIPT));
    try {
      const workingDirectory = await this.workingDirectory(identity.terminalId);
      return workingDirectory === undefined ? identity : { ...identity, workingDirectory };
    } catch {
      return identity;
    }
  }

  async focused(): Promise<TerminalIdentity | null> {
    return parseFocusedTerminal(await this.execute(FOCUSED_TERMINAL_SCRIPT));
  }

  async hierarchy(): Promise<readonly GhosttyHierarchyEntry[]> {
    return parseHierarchy(await this.execute(HIERARCHY_SCRIPT));
  }

  async snapshot() {
    return parseGhosttySnapshot(await this.execute(SNAPSHOT_SCRIPT));
  }

  async workingDirectory(terminalId: string): Promise<string | undefined> {
    return parseWorkingDirectory(await this.execute(WORKING_DIRECTORY_SCRIPT, terminalId));
  }

  async setTitle(identity: TerminalIdentity, title: string): Promise<void> {
    parseActionEcho(await this.execute(SET_TAB_TITLE_SCRIPT, identity.terminalId, title), identity.terminalId);
  }

  async clearTitle(identity: TerminalIdentity): Promise<void> {
    parseActionEcho(await this.execute(CLEAR_TAB_TITLE_SCRIPT, identity.terminalId), identity.terminalId);
  }

  private async execute(script: string, ...args: readonly string[]): Promise<string> {
    const request: ProcessRequest = {
      command: this.command,
      args: ["-e", script, "--", ...args],
      timeoutMs: this.timeoutMs,
      maxOutputBytes: this.maxOutputBytes,
    };
    const result = await this.runner.run(request);
    if (result.exitCode !== 0) throw ghosttyProcessError(result.stderr, result.exitCode);
    return result.stdout;
  }
}
