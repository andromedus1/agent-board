import { AgentBoardError } from "../../domain/errors.js";
import type { ProjectRenamePromptPort } from "../../domain/ports.js";
import type { ProcessRequest, ProcessRunner } from "../process-runner.js";
import { NodeProcessRunner } from "../process-runner.js";
import { PROJECT_RENAME_PROMPT_SCRIPT } from "./scripts.js";

const DEFAULT_COMMAND = "/usr/bin/osascript";
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1_000;
const DEFAULT_MAX_OUTPUT_BYTES = 4 * 1_024;
const CANCELLED = "AGENT_BOARD_CANCELLED";
const RENAMED_PREFIX = "AGENT_BOARD_RENAMED\u001e";

export interface MacOSRenamePromptOptions {
  readonly command?: string;
  readonly runner?: ProcessRunner;
  readonly timeoutMs?: number;
  readonly maxOutputBytes?: number;
}

function withoutOneTrailingLineBreak(value: string): string {
  return value.endsWith("\n") ? value.slice(0, -1) : value;
}

export class MacOSRenamePrompt implements ProjectRenamePromptPort {
  private readonly command: string;
  private readonly runner: ProcessRunner;
  private readonly timeoutMs: number;
  private readonly maxOutputBytes: number;

  constructor(options: MacOSRenamePromptOptions = {}) {
    this.command = options.command ?? DEFAULT_COMMAND;
    this.runner = options.runner ?? new NodeProcessRunner();
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
  }

  async prompt(currentLabel: string): Promise<string | null> {
    const request: ProcessRequest = {
      command: this.command,
      args: ["-e", PROJECT_RENAME_PROMPT_SCRIPT, "--", currentLabel],
      timeoutMs: this.timeoutMs,
      maxOutputBytes: this.maxOutputBytes,
    };
    const result = await this.runner.run(request);
    if (result.exitCode !== 0) {
      throw new AgentBoardError(
        "ADAPTER_FAILURE",
        `macOS rename prompt failed with exit code ${result.exitCode}`,
        { cause: result.stderr },
      );
    }

    const output = withoutOneTrailingLineBreak(result.stdout);
    if (output === CANCELLED) return null;
    if (output.startsWith(RENAMED_PREFIX)) return output.slice(RENAMED_PREFIX.length);
    throw new AgentBoardError("ADAPTER_FAILURE", "macOS rename prompt returned an invalid response");
  }
}
