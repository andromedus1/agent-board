#!/usr/bin/env node

import { createAgentsCommand } from "../composition/create-agents.js";
import { formatCliError, renderBoard, renderBoardJson } from "./output.js";
import type { BoardRow } from "../application/list-sessions.js";
import { isMain } from "./is-main.js";

export interface AgentsCommandDependencies {
  readonly list: () => Promise<readonly BoardRow[]>;
  readonly stdout: Pick<NodeJS.WriteStream, "write">;
  readonly stderr: Pick<NodeJS.WriteStream, "write">;
}

const USAGE = "Usage: agents [--json]\n";

export async function runAgents(
  argv: readonly string[],
  dependencies: AgentsCommandDependencies,
): Promise<number> {
  const json = argv.length === 1 && argv[0] === "--json";
  if (argv.length > 1 || (argv.length === 1 && !json)) {
    dependencies.stderr.write(USAGE);
    return 2;
  }

  try {
    const rows = await dependencies.list();
    dependencies.stdout.write(json ? renderBoardJson(rows) : renderBoard(rows));
    return 0;
  } catch (error) {
    dependencies.stderr.write(`${formatCliError(error)}\n`);
    return 1;
  }
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  const command = createAgentsCommand();
  return runAgents(argv, {
    ...command,
    stdout: process.stdout,
    stderr: process.stderr,
  });
}

if (isMain(import.meta.url, process.argv[1])) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatCliError(error)}\n`);
    process.exitCode = 1;
  });
}
