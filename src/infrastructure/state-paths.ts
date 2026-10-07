import { homedir } from "node:os";
import { join, resolve } from "node:path";

export interface StatePaths {
  root: string;
  sessions: string;
  locks: string;
  sessionFile(sessionId: string): string;
  sessionLockAnchor(sessionId: string): string;
  registryLockAnchor: string;
}

/**
 * Session ids are used as filenames in the state directory. Keep this check
 * deliberately narrower than a general path sanitizer: ids are opaque values,
 * so path syntax has no useful meaning here.
 */
export function assertSafeSessionId(sessionId: string): void {
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    throw new TypeError("Session id must not be empty");
  }
  if (sessionId.startsWith(".")) {
    throw new TypeError("Session id cannot use a hidden-file prefix");
  }
  if (sessionId === "registry") {
    throw new TypeError("Session id is reserved for the registry lock");
  }
  if (/[/\\]/u.test(sessionId) || /[\u0000-\u001f\u007f-\u009f]/u.test(sessionId)) {
    throw new TypeError("Session id contains unsafe path characters");
  }
}

export function resolveStatePaths(env: NodeJS.ProcessEnv = process.env): StatePaths {
  const configuredRoot = env.AGENT_BOARD_STATE_DIR?.trim();
  const baseRoot = configuredRoot || join(env.HOME || homedir(), ".local", "state", "agent-board");
  const root = resolve(baseRoot, "v1");
  const sessions = join(root, "sessions");
  const locks = join(root, "locks");

  return {
    root,
    sessions,
    locks,
    sessionFile(sessionId: string): string {
      assertSafeSessionId(sessionId);
      return join(sessions, `${sessionId}.json`);
    },
    sessionLockAnchor(sessionId: string): string {
      assertSafeSessionId(sessionId);
      return join(locks, sessionId);
    },
    registryLockAnchor: join(locks, "registry"),
  };
}
