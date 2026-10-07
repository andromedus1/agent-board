#!/usr/bin/env node

import { AgentBoardError } from "../domain/errors.js";
import { createAgentCodexCommand } from "../composition/create-agent-codex.js";
import { SttyTerminalMode, type TerminalModePort } from "../integrations/terminal-mode.js";
import { isMain } from "./is-main.js";

export interface AgentCodexCommandDependencies {
  launch(args: readonly string[], signal: AbortSignal): Promise<{ outcome: "clean" | "failed" | "terminated"; exitCode: number }>;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
}

export interface ProcessSignalPort {
  on(signal: NodeJS.Signals, listener: (signal: NodeJS.Signals) => void): unknown;
  off(signal: NodeJS.Signals, listener: (signal: NodeJS.Signals) => void): unknown;
}

function errorMessage(error: unknown): string {
  if (error instanceof AgentBoardError) return `${error.code}: ${error.message}`;
  return error instanceof Error ? error.message : "Unexpected failure";
}

export async function runAgentCodex(
  argv: readonly string[],
  dependencies: AgentCodexCommandDependencies,
  signal: AbortSignal,
): Promise<number> {
  try {
    const result = await dependencies.launch(argv, signal);
    return result.exitCode;
  } catch (error) {
    dependencies.stderr.write(`${errorMessage(error)}\n`);
    return 1;
  }
}

export async function runAgentCodexWithSignals(
  argv: readonly string[],
  dependencies: AgentCodexCommandDependencies,
  signals: ProcessSignalPort,
  terminalMode: TerminalModePort = new SttyTerminalMode(),
): Promise<number> {
  const controller = new AbortController();
  let terminalSnapshot: string | undefined;
  try {
    terminalSnapshot = terminalMode.capture();
  } catch (error) {
    dependencies.stderr.write(`${errorMessage(error)}\n`);
    return 1;
  }
  const onInterrupt = () => undefined;
  const onTerminate = (signal: NodeJS.Signals) => controller.abort(new Error(signal));
  signals.on("SIGINT", onInterrupt);
  signals.on("SIGHUP", onTerminate);
  signals.on("SIGTERM", onTerminate);
  try {
    return await runAgentCodex(argv, dependencies, controller.signal);
  } finally {
    signals.off("SIGINT", onInterrupt);
    signals.off("SIGHUP", onTerminate);
    signals.off("SIGTERM", onTerminate);
    if (terminalSnapshot !== undefined) {
      try {
        terminalMode.restore(terminalSnapshot);
      } catch (error) {
        dependencies.stderr.write(`${errorMessage(error)}; run reset to recover this shell\n`);
      }
    }
  }
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  const command = createAgentCodexCommand();
  return runAgentCodexWithSignals(argv, {
    ...command,
    stdout: process.stdout,
    stderr: process.stderr,
  }, process);
}

if (isMain(import.meta.url, process.argv[1])) {
  main().then((code) => { process.exitCode = code; }).catch((error: unknown) => {
    process.stderr.write(`${errorMessage(error)}\n`);
    process.exitCode = 1;
  });
}
