import { spawnSync as nodeSpawnSync } from "node:child_process";

import { AgentBoardError } from "../domain/errors.js";

const MAX_SNAPSHOT_BYTES = 4 * 1024;
// Mirrors Codex's exit cleanup: pop one keyboard-enhancement level, reset any
// remaining levels, then disable xterm modifyOtherKeys reporting.
const KEYBOARD_REPORTING_RESET = "\x1b[<u\x1b[<u\x1b[>4;0m";

export interface TerminalModePort {
  capture(): string | undefined;
  restore(snapshot: string): void;
}

export interface SttyTerminalModeOptions {
  readonly command?: string;
  readonly inputFd?: number;
  readonly isTerminal?: () => boolean;
  readonly spawn?: typeof nodeSpawnSync;
  readonly write?: (value: string) => unknown;
}

/** Preserves the exact controlling-terminal mode without imposing defaults. */
export class SttyTerminalMode implements TerminalModePort {
  private readonly command: string;
  private readonly inputFd: number;
  private readonly isTerminal: () => boolean;
  private readonly spawnProcess: typeof nodeSpawnSync;
  private readonly writeTerminal: (value: string) => unknown;

  constructor(options: SttyTerminalModeOptions = {}) {
    this.command = options.command ?? "/bin/stty";
    this.inputFd = options.inputFd ?? 0;
    this.isTerminal = options.isTerminal ?? (() => process.stdin.isTTY === true);
    this.spawnProcess = options.spawn ?? nodeSpawnSync;
    this.writeTerminal = options.write ?? ((value) => process.stdout.write(value));
  }

  capture(): string | undefined {
    if (!this.isTerminal()) return undefined;
    const result = this.spawnProcess(this.command, ["-g"], {
      encoding: "utf8",
      shell: false,
      stdio: [this.inputFd, "pipe", "pipe"],
    });
    if (result.error !== undefined || result.status !== 0 || typeof result.stdout !== "string") {
      throw new AgentBoardError("ADAPTER_FAILURE", "Unable to capture the pre-launch terminal mode", {
        cause: result.error ?? result.stderr,
      });
    }
    const snapshot = result.stdout.trim();
    if (snapshot.length === 0 || Buffer.byteLength(snapshot, "utf8") > MAX_SNAPSHOT_BYTES || /[\s\0]/u.test(snapshot)) {
      throw new AgentBoardError("ADAPTER_FAILURE", "The pre-launch terminal mode snapshot is invalid");
    }
    return snapshot;
  }

  restore(snapshot: string): void {
    const result = this.spawnProcess(this.command, [snapshot], {
      encoding: "utf8",
      shell: false,
      stdio: [this.inputFd, "ignore", "pipe"],
    });
    if (result.error !== undefined || result.status !== 0) {
      throw new AgentBoardError("ADAPTER_FAILURE", "Unable to restore the pre-launch terminal mode", {
        cause: result.error ?? result.stderr,
      });
    }
    try {
      this.writeTerminal(KEYBOARD_REPORTING_RESET);
    } catch (error) {
      throw new AgentBoardError("ADAPTER_FAILURE", "Unable to restore terminal keyboard reporting", {
        cause: error,
      });
    }
  }
}
