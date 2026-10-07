import { spawn } from "node:child_process";

import { AgentBoardError } from "../domain/errors.js";

export interface ProcessRequest {
  command: string;
  args: readonly string[];
  timeoutMs: number;
  maxOutputBytes: number;
  env?: NodeJS.ProcessEnv;
}

export interface ProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ProcessRunner {
  run(request: ProcessRequest): Promise<ProcessResult>;
}

/** A bounded, shell-free child-process boundary for integrations. */
export class NodeProcessRunner implements ProcessRunner {
  run(request: ProcessRequest): Promise<ProcessResult> {
    if (!Number.isSafeInteger(request.timeoutMs) || request.timeoutMs <= 0) {
      throw new AgentBoardError("ADAPTER_FAILURE", "Process timeout must be a positive integer");
    }
    if (!Number.isSafeInteger(request.maxOutputBytes) || request.maxOutputBytes <= 0) {
      throw new AgentBoardError("ADAPTER_FAILURE", "Process output limit must be a positive integer");
    }

    return new Promise<ProcessResult>((resolve, reject) => {
      let child;
      try {
        child = spawn(request.command, [...request.args], {
          shell: false,
          env: request.env,
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        reject(new AgentBoardError("ADAPTER_FAILURE", "Unable to start integration process", { cause: error }));
        return;
      }

      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];
      let outputBytes = 0;
      let settled = false;
      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        fail(new AgentBoardError("ADAPTER_FAILURE", `Integration process timed out after ${request.timeoutMs}ms`));
      }, request.timeoutMs);

      const fail = (error: AgentBoardError): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      };

      const collect = (target: Buffer[], chunk: Buffer): void => {
        outputBytes += chunk.byteLength;
        if (outputBytes > request.maxOutputBytes) {
          child.kill("SIGTERM");
          fail(new AgentBoardError("ADAPTER_FAILURE", `Integration process output exceeded ${request.maxOutputBytes} bytes`));
          return;
        }
        target.push(chunk);
      };
      child.stdout.on("data", (chunk: Buffer) => collect(stdout, chunk));
      child.stderr.on("data", (chunk: Buffer) => collect(stderr, chunk));
      child.on("error", (error: NodeJS.ErrnoException) => {
        fail(new AgentBoardError("ADAPTER_FAILURE", "Integration process could not be started", { cause: error }));
      });
      child.on("close", (exitCode: number | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({
          stdout: Buffer.concat(stdout).toString("utf8"),
          stderr: Buffer.concat(stderr).toString("utf8"),
          exitCode: exitCode ?? 1,
        });
      });
    });
  }
}
