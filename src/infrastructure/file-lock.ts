import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import lockfile from "proper-lockfile";

import { AgentBoardError } from "../domain/errors.js";
import type { StatePaths } from "./state-paths.js";

export interface LockOptions {
  timeoutMs: number;
  staleMs: number;
}

const DEFAULT_LOCK_OPTIONS: LockOptions = {
  timeoutMs: 5_000,
  staleMs: 10_000,
};

function lockError(error: unknown, releasing = false): AgentBoardError {
  const code = (error as { code?: unknown } | null)?.code;
  const message = error instanceof Error ? error.message : String(error);
  if (!releasing && (code === "ELOCKED" || message.includes("RetryOperation timeout"))) {
    return new AgentBoardError("LOCK_TIMEOUT", "Timed out acquiring state lock", { cause: error });
  }
  return new AgentBoardError(
    "ADAPTER_FAILURE",
    releasing ? "Failed to release state lock" : "Failed to acquire state lock",
    { cause: error },
  );
}

function lockOptions(options: LockOptions): Parameters<typeof lockfile.lock>[1] {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? Math.max(1, options.timeoutMs) : DEFAULT_LOCK_OPTIONS.timeoutMs;
  const staleMs = Number.isFinite(options.staleMs) ? Math.max(2_000, options.staleMs) : DEFAULT_LOCK_OPTIONS.staleMs;
  const minTimeout = Math.min(25, timeoutMs);
  return {
    realpath: false,
    stale: staleMs,
    retries: {
      retries: Math.max(1, Math.ceil(timeoutMs / minTimeout)),
      unref: false,
      maxRetryTime: timeoutMs,
      minTimeout,
      maxTimeout: Math.min(100, timeoutMs),
      randomize: false,
    },
  };
}

export async function withFileLock<T>(
  anchorPath: string,
  options: LockOptions,
  operation: () => Promise<T>,
): Promise<T> {
  await mkdir(dirname(anchorPath), { recursive: true });

  let release: (() => Promise<void>) | undefined;
  try {
    release = await lockfile.lock(anchorPath, lockOptions(options));
  } catch (error) {
    throw lockError(error);
  }

  let value: T | undefined;
  let completed = false;
  let operationError: unknown;
  try {
    value = await operation();
    completed = true;
  } catch (error) {
    operationError = error;
  }

  let releaseError: unknown;
  try {
    await release();
  } catch (error) {
    releaseError = error;
  }

  if (!completed) throw operationError;
  if (releaseError !== undefined) throw lockError(releaseError, true);
  return value as T;
}

export async function withRegistryLock<T>(
  paths: StatePaths,
  operation: () => Promise<T>,
  options: LockOptions = DEFAULT_LOCK_OPTIONS,
): Promise<T> {
  return withFileLock(paths.registryLockAnchor, options, operation);
}

export { DEFAULT_LOCK_OPTIONS };
