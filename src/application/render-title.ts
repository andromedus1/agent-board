import { AgentBoardError } from "../domain/errors.js";
import type { Clock, SessionStore, RegistrationTerminalPort } from "../domain/ports.js";
import { projectSession } from "../domain/projection.js";
import type { SessionRecord, TerminalIdentity } from "../domain/session.js";

export interface RenderTitleDependencies {
  readonly store: SessionStore;
  readonly terminal: Pick<RegistrationTerminalPort, "setTitle">;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
}

export interface RenderTitleOptions {
  /** Identity proven visible by the snapshot that authorized this write. */
  readonly expectedIdentity?: TerminalIdentity;
  /** Launcher PID positively verified before this title projection. */
  readonly verifiedLauncherPid?: number;
}

/** Render a title from the latest durable record, after registration locking. */
export async function renderSessionTitle(
  dependencies: RenderTitleDependencies,
  sessionId: string,
  options: RenderTitleOptions = {},
): Promise<SessionRecord> {
  const record = await dependencies.store.get(sessionId);
  if (record === null) {
    throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);
  }
  if (record.terminal.presence !== "visible") {
    throw new AgentBoardError("ADAPTER_FAILURE", `Cannot render a ${record.terminal.presence} terminal title`);
  }
  if (options.expectedIdentity !== undefined &&
      (record.terminal.adapter !== options.expectedIdentity.adapter ||
       record.terminal.windowId !== options.expectedIdentity.windowId ||
       record.terminal.tabId !== options.expectedIdentity.tabId ||
       record.terminal.terminalId !== options.expectedIdentity.terminalId)) {
    throw new AgentBoardError("CONFLICT", `Session ${sessionId} no longer matches the verified Ghostty terminal`);
  }

  const projection = projectSession(record, {
    now: dependencies.clock.now(),
    workingFreshForMs: dependencies.workingFreshForMs,
    ...(options.verifiedLauncherPid === undefined
      ? {}
      : { verifiedLauncherPid: options.verifiedLauncherPid }),
  });
  const identity = {
    adapter: record.terminal.adapter,
    windowId: record.terminal.windowId,
    tabId: record.terminal.tabId,
    terminalId: record.terminal.terminalId,
  } as const;
  await dependencies.terminal.setTitle(identity, projection.title);
  return record;
}
