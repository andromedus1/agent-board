import { AgentBoardError } from "../domain/errors.js";
import type { FocusedTerminalPort, SessionStore } from "../domain/ports.js";
import type { SessionRecord, TerminalIdentity } from "../domain/session.js";

function sameIdentity(left: TerminalIdentity, right: TerminalIdentity): boolean {
  return left.adapter === right.adapter &&
    left.windowId === right.windowId &&
    left.tabId === right.tabId &&
    left.terminalId === right.terminalId;
}

function recordIdentity(record: SessionRecord): TerminalIdentity {
  return {
    adapter: record.terminal.adapter,
    windowId: record.terminal.windowId,
    tabId: record.terminal.tabId,
    terminalId: record.terminal.terminalId,
  };
}

function requireSessionId(sessionId: string): string {
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    throw new AgentBoardError("INVALID_RECORD", "Session id must not be empty");
  }
  return sessionId;
}

/** Resolve an explicit full id, or the one session matching current focus. */
export async function resolveSessionTarget(
  store: SessionStore,
  terminal: FocusedTerminalPort,
  explicitSessionId?: string,
): Promise<SessionRecord> {
  if (explicitSessionId !== undefined) {
    const sessionId = requireSessionId(explicitSessionId);
    const record = await store.get(sessionId);
    if (record === null) {
      throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);
    }
    return record;
  }

  const focused = await terminal.focused();
  if (focused === null) {
    throw new AgentBoardError(
      "NOT_FOUND",
      "Ghostty is not frontmost; pass an exact session id or focus the target tab",
    );
  }
  const records = await store.list();
  const matches = records.filter((record) => sameIdentity(recordIdentity(record), focused));
  if (matches.length === 0) {
    throw new AgentBoardError(
      "NOT_FOUND",
      `No registered session for focused terminal ${focused.terminalId}`,
    );
  }
  if (matches.length > 1) {
    throw new AgentBoardError(
      "CONFLICT",
      `Multiple sessions are registered for focused terminal ${focused.terminalId}`,
    );
  }
  return matches[0]!;
}
