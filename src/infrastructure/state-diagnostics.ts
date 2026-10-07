import { randomUUID } from "node:crypto";
import { mkdir, open, rm, stat } from "node:fs/promises";
import { join } from "node:path";

import { AgentBoardError } from "../domain/errors.js";
import type { StateProbePort } from "../application/doctor.js";
import { resolveStatePaths, type StatePaths } from "./state-paths.js";

const PROBE_MODE = 0o600;

function probeFailure(message: string, cause?: unknown): AgentBoardError {
  return new AgentBoardError("ADAPTER_FAILURE", message, { cause });
}

async function ensureDirectory(path: string): Promise<void> {
  try {
    const entry = await stat(path);
    if (!entry.isDirectory()) throw probeFailure("Agent Board state path is not a directory");
    return;
  } catch (error) {
    if ((error as { code?: unknown } | null)?.code !== "ENOENT") throw error;
  }

  try {
    await mkdir(path, { recursive: true, mode: 0o700 });
    const entry = await stat(path);
    if (!entry.isDirectory()) throw probeFailure("Agent Board state path is not a directory");
  } catch (error) {
    if (error instanceof AgentBoardError) throw error;
    throw probeFailure("Agent Board state directory could not be created", error);
  }
}

export interface StateDirectoryProbeOptions {
  readonly paths?: StatePaths;
  readonly id?: () => string;
}

/**
 * Proves the narrow write capability required by the store. It never reads
 * session records and its cleanup target is one unique file beneath root.
 */
export class StateDirectoryProbe implements StateProbePort {
  private readonly paths: StatePaths;
  private readonly id: () => string;

  constructor(options: StateDirectoryProbeOptions = {}) {
    this.paths = options.paths ?? resolveStatePaths();
    this.id = options.id ?? randomUUID;
  }

  async probe(): Promise<string> {
    await ensureDirectory(this.paths.root);
    await ensureDirectory(this.paths.sessions);
    await ensureDirectory(this.paths.locks);

    const probePath = join(this.paths.root, `.doctor-${process.pid}-${this.id()}.probe`);
    let handle: Awaited<ReturnType<typeof open>> | undefined;
    try {
      handle = await open(probePath, "wx", PROBE_MODE);
      await handle.writeFile("agent-board doctor probe\n", "utf8");
      await handle.sync();
      await handle.close();
      handle = undefined;
      return this.paths.root;
    } catch (error) {
      throw probeFailure("Agent Board state directory write probe failed", error);
    } finally {
      await handle?.close().catch(() => undefined);
      try {
        await rm(probePath, { force: true });
      } catch (error) {
        throw probeFailure("Agent Board state directory probe cleanup failed", error);
      }
    }
  }
}
