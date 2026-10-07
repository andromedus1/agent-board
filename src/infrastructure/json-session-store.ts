import { readdir, rm } from "node:fs/promises";

import { AgentBoardError } from "../domain/errors.js";
import { parseSessionRecord, type SessionRecord } from "../domain/session.js";
import type { SessionMutation, SessionStore } from "../domain/ports.js";
import {
  DEFAULT_LOCK_OPTIONS,
  withFileLock,
  withRegistryLock,
  type LockOptions,
} from "./file-lock.js";
import { readSessionFile, writeSessionFileAtomic } from "./session-files.js";
import {
  assertSafeSessionId,
  resolveStatePaths,
  type StatePaths,
} from "./state-paths.js";

export interface JsonSessionStoreOptions {
  paths?: StatePaths;
  lock?: Partial<LockOptions>;
}

function mergeLockOptions(options: Partial<LockOptions> | undefined): LockOptions {
  return {
    timeoutMs: options?.timeoutMs ?? DEFAULT_LOCK_OPTIONS.timeoutMs,
    staleMs: options?.staleMs ?? DEFAULT_LOCK_OPTIONS.staleMs,
  };
}

function invalidRecord(message: string, cause?: unknown): AgentBoardError {
  return new AgentBoardError("INVALID_RECORD", message, { cause });
}

function ensureRecordSessionId(record: SessionRecord, sessionId: string, path: string): SessionRecord {
  if (record.sessionId !== sessionId) {
    throw invalidRecord(`Session record id does not match canonical file ${path}`);
  }
  return record;
}

function cloneRecord(record: SessionRecord): SessionRecord {
  return structuredClone(record);
}

export class JsonSessionStore implements SessionStore {
  readonly paths: StatePaths;
  readonly lock: LockOptions;

  constructor(options: JsonSessionStoreOptions = {}) {
    this.paths = options.paths ?? resolveStatePaths();
    this.lock = mergeLockOptions(options.lock);
  }

  async get(sessionId: string): Promise<SessionRecord | null> {
    assertSafeSessionId(sessionId);
    const path = this.paths.sessionFile(sessionId);
    const record = await readSessionFile(path);
    return record === null ? null : ensureRecordSessionId(record, sessionId, path);
  }

  async list(): Promise<readonly SessionRecord[]> {
    let entries;
    try {
      entries = await readdir(this.paths.sessions, { withFileTypes: true });
    } catch (error) {
      if ((error as { code?: unknown } | null)?.code === "ENOENT") return [];
      throw error;
    }

    const canonical = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && !entry.name.startsWith("."))
      .map((entry) => entry.name.slice(0, -5))
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const records: SessionRecord[] = [];
    for (const sessionId of canonical) {
      assertSafeSessionId(sessionId);
      const path = this.paths.sessionFile(sessionId);
      const record = await readSessionFile(path);
      if (record !== null) records.push(ensureRecordSessionId(record, sessionId, path));
    }
    return records;
  }

  async create(record: SessionRecord): Promise<SessionRecord> {
    const validated = parseSessionRecord(record);
    assertSafeSessionId(validated.sessionId);
    if (validated.revision !== 0) {
      throw new AgentBoardError("CONFLICT", "New session records must start at revision 0");
    }
    const path = this.paths.sessionFile(validated.sessionId);
    return withFileLock(this.paths.sessionLockAnchor(validated.sessionId), this.lock, async () => {
      if (await readSessionFile(path) !== null) {
        throw new AgentBoardError("CONFLICT", `Session already exists: ${validated.sessionId}`);
      }
      await writeSessionFileAtomic(path, validated);
      return validated;
    });
  }

  async mutate(sessionId: string, mutation: SessionMutation): Promise<SessionRecord> {
    assertSafeSessionId(sessionId);
    const path = this.paths.sessionFile(sessionId);
    return withFileLock(this.paths.sessionLockAnchor(sessionId), this.lock, async () => {
      const current = await readSessionFile(path);
      if (current === null) {
        throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);
      }
      ensureRecordSessionId(current, sessionId, path);

      let output: unknown;
      try {
        output = mutation(cloneRecord(current));
      } catch (error) {
        throw error;
      }
      if (typeof output !== "object" || output === null || Array.isArray(output)) {
        throw invalidRecord(`Session mutation did not return a record: ${path}`);
      }

      const next = {
        ...(output as Record<string, unknown>),
        schemaVersion: current.schemaVersion,
        sessionId: current.sessionId,
        revision: current.revision + 1,
      };
      const validated = parseSessionRecord(next);
      await writeSessionFileAtomic(path, validated);
      return validated;
    });
  }

  async remove(sessionId: string): Promise<void> {
    assertSafeSessionId(sessionId);
    const path = this.paths.sessionFile(sessionId);
    await withFileLock(this.paths.sessionLockAnchor(sessionId), this.lock, async () => {
      await rm(path, { force: true });
    });
  }

  async withRegistrationLock<T>(operation: () => Promise<T>): Promise<T> {
    return withRegistryLock(this.paths, operation, this.lock);
  }
}
