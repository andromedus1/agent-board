import { AgentBoardError } from "../domain/errors.js";
import type { Clock, ReconciliationTerminalPort, SessionStore } from "../domain/ports.js";
import type { SessionRecord, TerminalIdentity } from "../domain/session.js";
import { classifyTerminalPresence } from "./reconcile-session.js";

export interface UnregisterSessionDependencies {
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort;
  readonly clock: Clock;
}

function timestamp(clock: Clock): string {
  const value = clock.now();
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new AgentBoardError("INVALID_RECORD", "Clock returned an invalid Date");
  }
  return value.toISOString();
}

function identity(record: SessionRecord): TerminalIdentity {
  return {
    adapter: record.terminal.adapter,
    windowId: record.terminal.windowId,
    tabId: record.terminal.tabId,
    terminalId: record.terminal.terminalId,
  };
}

export async function unregisterSession(
  dependencies: UnregisterSessionDependencies,
  sessionId: string,
): Promise<void> {
  const record = await dependencies.store.get(sessionId);
  if (record === null) throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);

  // No mutation occurs before this succeeds. Snapshot failure therefore
  // retains the tombstone and makes the explicit operation retryable.
  const snapshot = await dependencies.terminal.snapshot();
  const observation = classifyTerminalPresence(identity(record), snapshot, timestamp(dependencies.clock));

  if (observation.presence === "visible" || observation.presence === "hidden") {
    await dependencies.terminal.clearTitle(observation);
  }
  await dependencies.store.remove(sessionId);
}
