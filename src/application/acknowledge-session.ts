import { acknowledgeCompletion } from "./acknowledge.js";
import { reconcileSession, TitleRenderFailure } from "./reconcile-session.js";
import { resolveSessionTarget } from "./resolve-session-target.js";
import { AgentBoardError } from "../domain/errors.js";
import type { Clock, FocusedTerminalPort, LauncherLivenessPort, ReconciliationTerminalPort, SessionStore } from "../domain/ports.js";
import type { SessionRecord } from "../domain/session.js";

export interface AcknowledgeSessionDependencies {
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort & FocusedTerminalPort;
  readonly launcher: LauncherLivenessPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
}

export interface AcknowledgeSessionResult {
  readonly record: SessionRecord;
  readonly titleRendered: boolean;
}

function timestamp(clock: Clock): string {
  const now = clock.now();
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new AgentBoardError("INVALID_RECORD", "Clock returned an invalid Date");
  }
  return now.toISOString();
}

/**
 * Clear completion-unread state, then converge the corresponding Ghostty
 * title. Durable acknowledgement is authoritative if the title action fails.
 */
export async function acknowledgeSession(
  dependencies: AcknowledgeSessionDependencies,
  explicitSessionId?: string,
): Promise<AcknowledgeSessionResult> {
  const target = await resolveSessionTarget(
    dependencies.store,
    dependencies.terminal,
    explicitSessionId,
  );
  const acknowledged = await acknowledgeCompletion(
    dependencies.store,
    target.sessionId,
    "explicit",
    timestamp(dependencies.clock),
  );

  try {
    const reconciled = await reconcileSession(
      {
        store: dependencies.store,
        terminal: dependencies.terminal,
        launcher: dependencies.launcher,
        clock: dependencies.clock,
        workingFreshForMs: dependencies.workingFreshForMs,
      },
      acknowledged.sessionId,
    );
    return { record: reconciled.record, titleRendered: reconciled.titleRendered };
  } catch (error) {
    if (!(error instanceof TitleRenderFailure)) throw error;
    const current = await dependencies.store.get(acknowledged.sessionId);
    if (current === null) {
      throw new AgentBoardError("NOT_FOUND", `Session not found: ${acknowledged.sessionId}`);
    }
    return { record: current, titleRendered: false };
  }
}
