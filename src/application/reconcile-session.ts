import { AgentBoardError } from "../domain/errors.js";
import type {
  Clock,
  LauncherLivenessPort,
  ReconciliationTerminalPort,
  SessionStore,
  TerminalSnapshot,
} from "../domain/ports.js";
import {
  ObservationSchema,
  TerminalIdentitySchema,
  TerminalObservationSchema,
  type SessionRecord,
  type TerminalIdentity,
  type TerminalObservation,
} from "../domain/session.js";
import { renderSessionTitle } from "./render-title.js";

export interface ReconcileDependencies {
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort;
  readonly launcher: LauncherLivenessPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
}

export interface ReconcileResult {
  readonly record: SessionRecord;
  readonly titleRendered: boolean;
  /** PID whose existence was positively established for this result. */
  readonly verifiedLauncherPid?: number;
}

/** Distinguishes an attempted Ghostty title write from store/snapshot failures. */
export class TitleRenderFailure extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super("Ghostty title rendering failed");
    this.name = "TitleRenderFailure";
    this.cause = cause;
  }
}

function timestamp(clock: Clock): string {
  const now = clock.now();
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new AgentBoardError("INVALID_RECORD", "Clock returned an invalid Date");
  }
  const observedAt = now.toISOString();
  const parsed = ObservationSchema.safeParse({
    observedAt,
    evidenceKind: "ghostty.reconciliation",
    confidence: "authoritative",
  });
  if (!parsed.success) {
    throw new AgentBoardError("INVALID_RECORD", "Clock produced an invalid reconciliation timestamp", { cause: parsed.error });
  }
  return observedAt;
}

function sameIdentity(left: TerminalIdentity, right: TerminalIdentity): boolean {
  return left.adapter === right.adapter &&
    left.windowId === right.windowId &&
    left.tabId === right.tabId &&
    left.terminalId === right.terminalId;
}

function identityOf(record: SessionRecord): TerminalIdentity {
  return {
    adapter: record.terminal.adapter,
    windowId: record.terminal.windowId,
    tabId: record.terminal.tabId,
    terminalId: record.terminal.terminalId,
  };
}

function validateSnapshot(input: TerminalSnapshot): TerminalSnapshot {
  if (input === null || typeof input !== "object" ||
      !Array.isArray(input.visible) || !Array.isArray(input.enumerableTerminalIds)) {
    throw new AgentBoardError("INVALID_RECORD", "Invalid Ghostty terminal snapshot");
  }
  const visible: TerminalIdentity[] = [];
  const visibleIds = new Set<string>();
  for (const candidate of input.visible) {
    const parsed = TerminalIdentitySchema.safeParse(candidate);
    if (!parsed.success) throw new AgentBoardError("INVALID_RECORD", "Invalid visible terminal identity", { cause: parsed.error });
    if (visibleIds.has(parsed.data.terminalId)) {
      throw new AgentBoardError("INVALID_RECORD", `Duplicate visible terminal ID ${parsed.data.terminalId}`);
    }
    visibleIds.add(parsed.data.terminalId);
    visible.push(parsed.data);
  }
  const enumerableTerminalIds: string[] = [];
  const enumerableIds = new Set<string>();
  for (const candidate of input.enumerableTerminalIds) {
    if (typeof candidate !== "string" || candidate.length === 0 || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(candidate)) {
      throw new AgentBoardError("INVALID_RECORD", "Invalid enumerable terminal ID");
    }
    if (enumerableIds.has(candidate)) throw new AgentBoardError("INVALID_RECORD", `Duplicate enumerable terminal ID ${candidate}`);
    enumerableIds.add(candidate);
    enumerableTerminalIds.push(candidate);
  }
  for (const terminalId of visibleIds) {
    if (!enumerableIds.has(terminalId)) throw new AgentBoardError("INVALID_RECORD", `Visible terminal ${terminalId} is not enumerable`);
  }
  return { visible, enumerableTerminalIds };
}

/** Purely classify one registered identity against one validated snapshot. */
export function classifyTerminalPresence(
  registered: TerminalIdentity,
  snapshot: TerminalSnapshot,
  observedAt: string,
): TerminalObservation {
  const identity = TerminalIdentitySchema.safeParse(registered);
  if (!identity.success) throw new AgentBoardError("INVALID_RECORD", "Invalid registered terminal identity", { cause: identity.error });
  const checked = validateSnapshot(snapshot);
  const timestampResult = TerminalObservationSchema.safeParse({
    ...identity.data,
    presence: "unknown",
    observedAt,
  });
  if (!timestampResult.success) throw new AgentBoardError("INVALID_RECORD", "Invalid terminal observation timestamp", { cause: timestampResult.error });

  const visible = checked.visible.find((candidate) => candidate.terminalId === identity.data.terminalId);
  const presence = visible === undefined
    ? checked.enumerableTerminalIds.includes(identity.data.terminalId) ? "hidden" : "missing"
    : "visible";
  const observation = visible === undefined
    ? { ...identity.data, presence, observedAt }
    : { ...visible, presence, observedAt };
  const parsed = TerminalObservationSchema.safeParse(observation);
  if (!parsed.success) throw new AgentBoardError("INVALID_RECORD", "Invalid classified terminal observation", { cause: parsed.error });
  return parsed.data;
}

function unknownTerminal(current: SessionRecord, observedAt: string): SessionRecord {
  return {
    ...current,
    terminal: { ...current.terminal, presence: "unknown", observedAt },
  };
}

function hasManagedWorkingLauncher(record: SessionRecord): boolean {
  const pid = record.agent.launcherPid;
  return record.agent.mode === "managed" &&
    record.agent.activity === "working" &&
    record.agent.health === "live" &&
    pid !== undefined;
}

async function reconcileLauncherLiveness(
  dependencies: ReconcileDependencies,
  record: SessionRecord,
): Promise<{ readonly record: SessionRecord; readonly verifiedLauncherPid?: number }> {
  if (!hasManagedWorkingLauncher(record)) return { record };

  let alive = false;
  try {
    alive = await dependencies.launcher.isAlive(record.agent.launcherPid as number);
  } catch {
    // An adapter that cannot establish process existence is not positive
    // liveness evidence; keep the board conservative and diagnostic.
  }
  if (alive) {
    return { record, verifiedLauncherPid: record.agent.launcherPid as number };
  }

  const observedAt = timestamp(dependencies.clock);
  const stale = await dependencies.store.mutate(record.sessionId, (current) => {
    if (!hasManagedWorkingLauncher(current) || current.agent.launcherPid !== record.agent.launcherPid) {
      return current;
    }
    return {
      ...current,
      agent: {
        ...current.agent,
        health: "stale",
        observedAt,
        evidenceKind: "agent-board.launcher-liveness",
        confidence: "corroborated",
        detail: "Managed launcher process is no longer running",
      },
    };
  });
  return { record: stale };
}

async function persistUnknown(
  dependencies: ReconcileDependencies,
  sessionId: string,
): Promise<SessionRecord> {
  const observedAt = timestamp(dependencies.clock);
  return dependencies.store.mutate(sessionId, (current) => unknownTerminal(current, observedAt));
}

function hasGhosttyCode(error: unknown, code: string, seen = new Set<unknown>()): boolean {
  if (error === null || typeof error !== "object" || seen.has(error)) return false;
  seen.add(error);
  if ((error as { ghosttyCode?: unknown }).ghosttyCode === code) return true;
  return hasGhosttyCode((error as { cause?: unknown }).cause, code, seen);
}

async function reconcileLoaded(
  dependencies: ReconcileDependencies,
  record: SessionRecord,
  snapshot: TerminalSnapshot,
): Promise<ReconcileResult> {
  const launcherReconciliation = await reconcileLauncherLiveness(dependencies, record);
  const launcherReconciled = launcherReconciliation.record;
  const observedAt = timestamp(dependencies.clock);
  let updated: SessionRecord;
  try {
    const observation = classifyTerminalPresence(identityOf(launcherReconciled), snapshot, observedAt);
    updated = await dependencies.store.mutate(launcherReconciled.sessionId, (current) => ({
      ...current,
      terminal: observation,
    }));
  } catch (error) {
    await persistUnknown(dependencies, launcherReconciled.sessionId);
    throw error;
  }

  const latest = await dependencies.store.get(launcherReconciled.sessionId);
  if (latest === null) throw new AgentBoardError("NOT_FOUND", `Session not found: ${launcherReconciled.sessionId}`);
  if (updated.terminal.presence !== "visible" || latest.terminal.presence !== "visible") {
    return {
      record: latest,
      titleRendered: false,
      ...(launcherReconciliation.verifiedLauncherPid === undefined
        ? {}
        : { verifiedLauncherPid: launcherReconciliation.verifiedLauncherPid }),
    };
  }
  const visible = snapshot.visible.find((candidate) => candidate.terminalId === latest.terminal.terminalId);
  if (visible === undefined || !sameIdentity(latest.terminal, visible)) {
    return {
      record: latest,
      titleRendered: false,
      ...(launcherReconciliation.verifiedLauncherPid === undefined
        ? {}
        : { verifiedLauncherPid: launcherReconciliation.verifiedLauncherPid }),
    };
  }

  try {
    const rendered = await renderSessionTitle({
      ...dependencies,
      terminal: {
        setTitle: async (identity, title) => {
          try {
            await dependencies.terminal.setTitle(identity, title);
          } catch (error) {
            throw new TitleRenderFailure(error);
          }
        },
      },
    }, launcherReconciled.sessionId, {
      expectedIdentity: visible,
      ...(launcherReconciliation.verifiedLauncherPid === undefined
        ? {}
        : { verifiedLauncherPid: launcherReconciliation.verifiedLauncherPid }),
    });
    return {
      record: rendered,
      titleRendered: true,
      ...(launcherReconciliation.verifiedLauncherPid === undefined
        ? {}
        : { verifiedLauncherPid: launcherReconciliation.verifiedLauncherPid }),
    };
  } catch (error) {
    if (error instanceof TitleRenderFailure && hasGhosttyCode(error.cause, "GHOSTTY_TARGET_NOT_FOUND")) {
      await persistUnknown(dependencies, launcherReconciled.sessionId);
    }
    throw error;
  }
}

export async function reconcileSession(
  dependencies: ReconcileDependencies,
  sessionId: string,
  suppliedSnapshot?: TerminalSnapshot,
): Promise<ReconcileResult> {
  const record = await dependencies.store.get(sessionId);
  if (record === null) throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);
  let snapshot: TerminalSnapshot;
  try {
    snapshot = suppliedSnapshot ?? await dependencies.terminal.snapshot();
    snapshot = validateSnapshot(snapshot);
  } catch (error) {
    const diagnostic = await persistUnknown(dependencies, sessionId);
    if (error instanceof Error) (error as Error & { diagnostic?: SessionRecord }).diagnostic = diagnostic;
    throw error;
  }
  return reconcileLoaded(dependencies, record, snapshot);
}

export async function reconcileSessions(
  dependencies: ReconcileDependencies,
): Promise<readonly ReconcileResult[]> {
  const records = await dependencies.store.list();
  // An empty, valid store has nothing to reconcile. In particular, avoid
  // consulting Ghostty so `agents` remains useful before the first
  // registration and does not pay for an unnecessary adapter call.
  if (records.length === 0) return [];

  let snapshot: TerminalSnapshot;
  try {
    snapshot = validateSnapshot(await dependencies.terminal.snapshot());
  } catch {
    const results: ReconcileResult[] = [];
    for (const record of records) {
      const diagnostic = await persistUnknown(dependencies, record.sessionId);
      results.push({ record: diagnostic, titleRendered: false });
    }
    return results;
  }

  const results: ReconcileResult[] = [];
  for (const record of records) {
    try {
      const result = await reconcileLoaded(dependencies, record, snapshot);
      if (result.record.terminal.presence === "missing") {
        await dependencies.store.remove(record.sessionId);
        continue;
      }
      results.push(result);
    } catch (error) {
      // A target race or failed cleanup is a visible diagnostic for this
      // record; other records still receive the same atomic snapshot and
      // should not be abandoned.
      const current = await dependencies.store.get(record.sessionId);
      if (current !== null) results.push({ record: current, titleRendered: false });
      // If the record is gone, cleanup (or a concurrent removal) reached the
      // intended durable state even when a later lock-release step failed.
    }
  }
  return results;
}
