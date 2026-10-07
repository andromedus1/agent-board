import { projectSession, type ProjectionOptions, type ProjectionStatus, type ProjectionGlyph } from "../domain/projection.js";
import { AGENT_ADAPTER_CAPABILITIES, type AgentAdapter, type AgentAdapterCapabilities, type AgentMode, type ConfidenceLevel } from "../domain/registries.js";
import type { SessionRecord } from "../domain/session.js";
import {
  reconcileSessions,
  type ReconcileDependencies,
  type ReconcileResult,
} from "./reconcile-session.js";

export interface BoardRow {
  readonly sessionId: string;
  readonly label: string;
  readonly displayLabel: string;
  readonly glyph: ProjectionGlyph;
  readonly status: ProjectionStatus;
  readonly diagnostics: readonly string[];
  readonly confidence: ConfidenceLevel;
  readonly agentMode: AgentMode;
  readonly adapter: AgentAdapter;
  readonly evidenceKind: string;
  readonly adapterCapabilities: AgentAdapterCapabilities;
  readonly observedAt: string;
  readonly titleRendered: boolean;
}

export interface ListSessionsDependencies extends ReconcileDependencies {}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareRecords(left: SessionRecord, right: SessionRecord): number {
  const labelOrder = compareStrings(left.identity.projectLabel, right.identity.projectLabel);
  if (labelOrder !== 0) return labelOrder;

  const leftCreated = Date.parse(left.identity.createdAt);
  const rightCreated = Date.parse(right.identity.createdAt);
  if (leftCreated !== rightCreated) return leftCreated - rightCreated;
  return compareStrings(left.sessionId, right.sessionId);
}

function shortestUniquePrefix(sessionId: string, ids: readonly string[]): string {
  const minimumLength = Math.min(8, sessionId.length);
  for (let length = minimumLength; length <= sessionId.length; length += 1) {
    const prefix = sessionId.slice(0, length);
    if (ids.every((otherId) => otherId === sessionId || !otherId.startsWith(prefix))) {
      return prefix;
    }
  }
  return sessionId;
}

function displayLabels(records: readonly SessionRecord[]): ReadonlyMap<string, string> {
  const groups = new Map<string, string[]>();
  for (const record of records) {
    const label = record.identity.projectLabel;
    const group = groups.get(label);
    if (group === undefined) groups.set(label, [record.sessionId]);
    else group.push(record.sessionId);
  }

  const labels = new Map<string, string>();
  for (const record of records) {
    const label = record.identity.projectLabel;
    const ids = groups.get(label) ?? [];
    const displayLabel = ids.length > 1
      ? `[${shortestUniquePrefix(record.sessionId, ids)}] ${label}`
      : label;
    labels.set(record.sessionId, displayLabel);
  }
  return labels;
}

function boardDiagnostics(
  result: ReconcileResult,
  projectionDiagnostics: readonly string[],
): readonly string[] {
  const diagnostics = [...projectionDiagnostics];
  const record = result.record;

  if (record.terminal.presence === "visible" && !result.titleRendered) {
    diagnostics.push("title is not synchronized");
  }
  if (record.agent.confidence === "corroborated" && !diagnostics.includes("evidence is corroborated")) {
    diagnostics.push("evidence is corroborated");
  }
  return Object.freeze(diagnostics);
}

export function buildBoardRows(
  results: readonly ReconcileResult[],
  options: ProjectionOptions,
): readonly BoardRow[] {
  const sorted = [...results].sort((left, right) => compareRecords(left.record, right.record));
  const labels = displayLabels(sorted.map((result) => result.record));
  const rows = sorted.map((result): BoardRow => {
    const projection = projectSession(result.record, {
      ...options,
      ...(result.verifiedLauncherPid === undefined
        ? {}
        : { verifiedLauncherPid: result.verifiedLauncherPid }),
    });
    return Object.freeze({
      sessionId: result.record.sessionId,
      label: projection.label,
      displayLabel: labels.get(result.record.sessionId) ?? projection.label,
      glyph: projection.glyph,
      status: projection.status,
      diagnostics: boardDiagnostics(result, projection.diagnostics),
      confidence: projection.confidence,
      agentMode: result.record.agent.mode,
      adapter: result.record.agent.adapter,
      evidenceKind: result.record.agent.evidenceKind,
      adapterCapabilities: AGENT_ADAPTER_CAPABILITIES[result.record.agent.adapter],
      observedAt: projection.observedAt,
      titleRendered: result.titleRendered,
    });
  });
  return Object.freeze(rows);
}

export async function listSessions(
  dependencies: ListSessionsDependencies,
): Promise<readonly BoardRow[]> {
  const results = await reconcileSessions(dependencies);
  return buildBoardRows(results, {
    now: dependencies.clock.now(),
    workingFreshForMs: dependencies.workingFreshForMs,
  });
}
