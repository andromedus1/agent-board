import type { RepositoryContext, RepositoryContextPort } from "../../domain/ports.js";
import type { ProcessRequest, ProcessRunner } from "../process-runner.js";
import { NodeProcessRunner } from "../process-runner.js";

const COMMAND = "git";
const DEFAULT_TIMEOUT_MS = 1_000;
const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024;

export interface GitRepositoryContextOptions {
  runner?: ProcessRunner;
  timeoutMs?: number;
  maxOutputBytes?: number;
}

function oneLine(value: string): string | undefined {
  // Git normally emits LF. Treat CRLF as the same one trailing line break,
  // while rejecting any additional line so derived labels remain predictable.
  let normalized = value;
  if (normalized.endsWith("\r\n")) normalized = normalized.slice(0, -2);
  else if (normalized.endsWith("\n")) normalized = normalized.slice(0, -1);
  if (normalized.length === 0 || normalized.includes("\n") || normalized.includes("\r")) return undefined;
  return normalized;
}

export class GitRepositoryContext implements RepositoryContextPort {
  private readonly runner: ProcessRunner;
  private readonly timeoutMs: number;
  private readonly maxOutputBytes: number;

  constructor(options: GitRepositoryContextOptions = {}) {
    this.runner = options.runner ?? new NodeProcessRunner();
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
  }

  async discover(workingDirectory?: string): Promise<RepositoryContext> {
    if (workingDirectory === undefined || workingDirectory.length === 0) return {};

    const repoPath = await this.query(workingDirectory, ["rev-parse", "--show-toplevel"]);
    if (repoPath === undefined) return {};

    const gitBranch = await this.query(workingDirectory, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
    return gitBranch === undefined ? { repoPath } : { repoPath, gitBranch };
  }

  private async query(workingDirectory: string, args: readonly string[]): Promise<string | undefined> {
    const request: ProcessRequest = {
      command: COMMAND,
      args: ["-C", workingDirectory, ...args],
      timeoutMs: this.timeoutMs,
      maxOutputBytes: this.maxOutputBytes,
    };
    try {
      const result = await this.runner.run(request);
      if (result.exitCode !== 0) return undefined;
      return oneLine(result.stdout);
    } catch {
      // Registration is useful outside Git repositories and when Git is not
      // installed. The process boundary has already enforced its limits.
      return undefined;
    }
  }
}
