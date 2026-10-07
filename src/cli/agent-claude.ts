#!/usr/bin/env node

import { createAgentClaudeCommand } from "../composition/create-agent-claude.js";
import { AgentBoardError } from "../domain/errors.js";
import { SttyTerminalMode, type TerminalModePort } from "../integrations/terminal-mode.js";
import { isMain } from "./is-main.js";

export interface AgentClaudeCommandDependencies {
  launch(args: readonly string[], signal: AbortSignal): Promise<{ outcome: "clean" | "failed" | "terminated"; exitCode: number }>;
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

export async function runAgentClaude(argv: readonly string[], dependencies: AgentClaudeCommandDependencies, signal: AbortSignal): Promise<number> {
  try { return (await dependencies.launch(argv, signal)).exitCode; }
  catch (error) { dependencies.stderr.write(`${errorMessage(error)}\n`); return 1; }
}

export async function runAgentClaudeWithSignals(
  argv: readonly string[],
  dependencies: AgentClaudeCommandDependencies,
  signals: ProcessSignalPort,
  terminalMode: TerminalModePort = new SttyTerminalMode(),
): Promise<number> {
  const controller = new AbortController();
  let snapshot: string | undefined;
  try { snapshot = terminalMode.capture(); }
  catch (error) { dependencies.stderr.write(`${errorMessage(error)}\n`); return 1; }
  const onInterrupt = () => undefined;
  const onTerminate = (signal: NodeJS.Signals) => controller.abort(new Error(signal));
  signals.on("SIGINT", onInterrupt);
  signals.on("SIGHUP", onTerminate);
  signals.on("SIGTERM", onTerminate);
  try { return await runAgentClaude(argv, dependencies, controller.signal); }
  finally {
    signals.off("SIGINT", onInterrupt);
    signals.off("SIGHUP", onTerminate);
    signals.off("SIGTERM", onTerminate);
    if (snapshot !== undefined) {
      try { terminalMode.restore(snapshot); }
      catch (error) { dependencies.stderr.write(`${errorMessage(error)}; run reset to recover this shell\n`); }
    }
  }
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  return runAgentClaudeWithSignals(argv, { ...createAgentClaudeCommand(), stderr: process.stderr }, process);
}

if (isMain(import.meta.url, process.argv[1])) {
  main().then((code) => { process.exitCode = code; }).catch((error: unknown) => {
    process.stderr.write(`${errorMessage(error)}\n`);
    process.exitCode = 1;
  });
}
