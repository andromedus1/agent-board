#!/usr/bin/env node

import { createAgentBoardCommand, type AgentBoardCommand } from "../composition/create-agent-board.js";
import type { DoctorReport } from "../application/doctor.js";
import { formatCliError } from "./output.js";
import { renderDoctor, renderDoctorJson } from "./doctor-output.js";
import { isMain } from "./is-main.js";

export interface AgentBoardCliDependencies {
  readonly ack: AgentBoardCommand["ack"];
  readonly unregister: AgentBoardCommand["unregister"];
  readonly doctor: () => Promise<DoctorReport>;
  readonly stdout: Pick<NodeJS.WriteStream, "write">;
  readonly stderr: Pick<NodeJS.WriteStream, "write">;
}

interface CommandResult {
  readonly output: string;
  readonly exitCode: number;
}

interface CommandDefinition {
  execute(args: readonly string[], dependencies: AgentBoardCliDependencies): Promise<CommandResult | null>;
}

function parseOptionalTarget(args: readonly string[]): string | undefined | null {
  if (args.length > 1) return null;
  if (args.length === 0) return undefined;
  const target = args[0];
  if (target === undefined || target.length === 0 || target.startsWith("-")) return null;
  return target;
}

const COMMANDS: Readonly<Record<string, CommandDefinition>> = {
  ack: {
    async execute(args, dependencies) {
      const target = parseOptionalTarget(args);
      if (target === null) return null;
      const result = await dependencies.ack(target);
      const deferred = result.titleRendered ? "" : " Title sync deferred.";
      return { output: `Acknowledged ${result.record.sessionId}.${deferred}\n`, exitCode: 0 };
    },
  },
  unregister: {
    async execute(args, dependencies) {
      const target = parseOptionalTarget(args);
      if (target === null) return null;
      const result = await dependencies.unregister(target);
      return { output: `Unregistered ${result.sessionId}.\n`, exitCode: 0 };
    },
  },
  doctor: {
    async execute(args, dependencies) {
      if (args.length > 1 || (args.length === 1 && args[0] !== "--json")) return null;
      const report = await dependencies.doctor();
      return {
        output: args[0] === "--json" ? renderDoctorJson(report) : renderDoctor(report),
        exitCode: report.ready ? 0 : 1,
      };
    },
  },
};

const USAGE = "Usage: agent-board <ack|unregister|doctor> [session-id|--json]\n";

export async function runAgentBoard(
  argv: readonly string[],
  dependencies: AgentBoardCliDependencies,
): Promise<number> {
  const command = argv[0];
  const definition = command !== undefined && Object.hasOwn(COMMANDS, command)
    ? COMMANDS[command]
    : undefined;
  if (definition === undefined) {
    dependencies.stderr.write(USAGE);
    return 2;
  }

  let result: CommandResult | null;
  try {
    result = await definition.execute(argv.slice(1), dependencies);
  } catch (error) {
    dependencies.stderr.write(`${formatCliError(error)}\n`);
    return 1;
  }
  if (result === null) {
    dependencies.stderr.write(USAGE);
    return 2;
  }
  dependencies.stdout.write(result.output);
  return result.exitCode;
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  return runAgentBoard(argv, {
    ...createAgentBoardCommand(),
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
