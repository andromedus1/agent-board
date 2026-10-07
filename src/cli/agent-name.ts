#!/usr/bin/env node

import { AgentBoardError } from "../domain/errors.js";
import type { RegisterSessionInput, RegisterSessionResult } from "../application/register-session.js";
import type { PromptRenameSessionResult } from "../application/prompt-rename-session.js";
import { createAgentNameCommand } from "../composition/create-agent-name.js";
import { isMain } from "./is-main.js";

export interface AgentNameCommandDependencies {
  register(input: RegisterSessionInput): Promise<RegisterSessionResult>;
  promptRename(): Promise<PromptRenameSessionResult>;
  targetSessionId?: string;
  stdin: Pick<NodeJS.ReadStream, "isTTY">;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
}

const USAGE = "Usage: agent-name [label]\n";
const DETACHED_LABEL_ERROR = "CONFLICT: agent-name <label> must run in the target terminal; use the managed agent or a shell prompt\n";

function errorMessage(error: unknown): string {
  if (error instanceof AgentBoardError) return `${error.code}: ${error.message}`;
  return error instanceof Error ? error.message : "Unexpected failure";
}

export async function runAgentName(
  argv: readonly string[],
  dependencies: AgentNameCommandDependencies,
): Promise<number> {
  if (argv.length > 1) {
    dependencies.stderr.write(USAGE);
    return 2;
  }
  if (argv.length === 1 && dependencies.targetSessionId === undefined && dependencies.stdin.isTTY !== true) {
    dependencies.stderr.write(DETACHED_LABEL_ERROR);
    return 1;
  }

  try {
    if (argv.length === 0) {
      const result = await dependencies.promptRename();
      if (result.status === "renamed") {
        dependencies.stdout.write(`Renamed ${result.record.identity.projectLabel}\n`);
      }
      return 0;
    }
    const result = await dependencies.register({
      projectLabel: argv[0],
      ...(dependencies.targetSessionId === undefined ? {} : { targetSessionId: dependencies.targetSessionId }),
    });
    dependencies.stdout.write(`${result.created ? "Registered" : "Renamed"} ${result.record.identity.projectLabel}\n`);
    return 0;
  } catch (error) {
    dependencies.stderr.write(`${errorMessage(error)}\n`);
    return 1;
  }
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  const command = createAgentNameCommand();
  return runAgentName(argv, {
    ...command,
    targetSessionId: process.env.AGENT_BOARD_SESSION_ID?.trim() || undefined,
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  });
}

if (isMain(import.meta.url, process.argv[1])) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error: unknown) => {
    process.stderr.write(`${errorMessage(error)}\n`);
    process.exitCode = 1;
  });
}
