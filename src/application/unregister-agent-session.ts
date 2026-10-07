import { unregisterSession, type UnregisterSessionDependencies } from "./unregister-session.js";
import { resolveSessionTarget } from "./resolve-session-target.js";
import type { FocusedTerminalPort, ReconciliationTerminalPort } from "../domain/ports.js";
import type { SessionRecord } from "../domain/session.js";

export interface UnregisterAgentSessionDependencies extends UnregisterSessionDependencies {
  readonly terminal: ReconciliationTerminalPort & FocusedTerminalPort;
}

/** Resolve once, preserve the existing clear-before-remove contract, and return the canonical id. */
export async function unregisterAgentSession(
  dependencies: UnregisterAgentSessionDependencies,
  explicitSessionId?: string,
): Promise<SessionRecord> {
  const target = await resolveSessionTarget(
    dependencies.store,
    dependencies.terminal,
    explicitSessionId,
  );
  await unregisterSession(dependencies, target.sessionId);
  return target;
}
