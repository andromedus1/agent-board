import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { AgentBoardError } from "../../domain/errors.js";
import type { ProcessRunner } from "../process-runner.js";

// Only inspect the contract consumed by this adapter; runtime Zod schemas still
// validate every response and relevant notification from the running server.
interface Schema {
  type?: string;
  required?: string[];
  properties?: Record<string, Schema>;
  definitions?: Record<string, Schema>;
  oneOf?: Schema[];
  enum?: string[];
  items?: Schema;
}

function requireCapability(condition: unknown, name: string): asserts condition {
  if (!condition) throw new AgentBoardError("ADAPTER_FAILURE", `Codex capability check failed: ${name}`);
}

function sameValues(actual: string[] | undefined, expected: string[], name: string): void {
  requireCapability(Array.isArray(actual) && actual.length === expected.length && expected.every((value) => actual.includes(value)), name);
}

export async function probeCodexCapabilities(
  runner: ProcessRunner,
  command: string,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<void> {
  const run = async (args: string[]): Promise<string> => {
    signal?.throwIfAborted();
    const result = await runner.run({ command, args, timeoutMs, maxOutputBytes: 128 * 1024 });
    signal?.throwIfAborted();
    requireCapability(result.exitCode === 0, `${args.slice(0, 2).join(" ")} exited with code ${result.exitCode}`);
    return result.stdout;
  };
  requireCapability(/(?:^|\s)--remote\s/u.test(await run(["--help"])), "remote TUI --remote option is missing");
  requireCapability(/(?:^|\s)--listen\s/u.test(await run(["app-server", "--help"])), "app-server --listen option is missing");

  const root = await mkdtemp(join(tmpdir(), "agent-board-codex-capabilities-"));
  try {
    await run(["app-server", "generate-json-schema", "--out", root]);
    const read = async (name: string): Promise<Schema> => {
      const path = join(root, name);
      requireCapability((await stat(path)).size <= 2 * 1024 * 1024, `${name} exceeds the schema size limit`);
      return JSON.parse(await readFile(path, "utf8")) as Schema;
    };
    const loaded = await read("v2/ThreadLoadedListResponse.json");
    requireCapability(loaded.required?.includes("data") && loaded.properties?.data?.type === "array"
      && loaded.properties.data.items?.type === "string", "thread/loaded/list must return required string IDs");

    const readThread = await read("v2/ThreadReadResponse.json");
    const thread = readThread.definitions?.Thread;
    requireCapability(readThread.required?.includes("thread") && readThread.properties?.thread
      && thread?.required?.includes("id") && thread.required.includes("status")
      && thread.properties?.id?.type === "string" && thread.properties.status,
    "thread/read must return thread identity and status");

    const notifications = await read("ServerNotification.json");
    const methods = notifications.oneOf?.flatMap((variant) => variant.properties?.method?.enum ?? []);
    for (const method of ["thread/started", "thread/status/changed", "thread/closed", "turn/completed", "error"]) {
      requireCapability(methods?.includes(method), `${method} notification is missing`);
    }
    const definitions = notifications.definitions;
    const statuses = definitions?.ThreadStatus?.oneOf;
    sameValues(statuses?.flatMap((variant) => variant.properties?.type?.enum ?? []), ["notLoaded", "idle", "systemError", "active"], "thread status values changed");
    const active = statuses?.find((variant) => variant.properties?.type?.enum?.includes("active"));
    requireCapability(active?.required?.includes("activeFlags") && active.properties?.activeFlags?.type === "array", "active thread status must contain activeFlags");
    sameValues(definitions?.ThreadActiveFlag?.enum, ["waitingOnApproval", "waitingOnUserInput"], "thread active flag values changed");
    sameValues(definitions?.TurnStatus?.enum, ["completed", "interrupted", "failed", "inProgress"], "turn status values changed");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
