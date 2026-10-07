import { AgentBoardError } from "./errors.js";
import { AGENT_ADAPTER_CAPABILITIES, type ConfidenceLevel, type TerminalPresence } from "./registries.js";
import { parseSessionRecord, type SessionRecord } from "./session.js";

export type PrimaryGlyph = "○" | "●" | "✓" | "!" | "×";
export type ProjectionGlyph = PrimaryGlyph | "?";
export type ProjectionStatus = "idle" | "working" | "finished" | "needs-input" | "error" | "diagnostic";

export interface SessionProjection {
  glyph: ProjectionGlyph;
  status: ProjectionStatus;
  label: string;
  title: string;
  diagnostics: readonly string[];
  confidence: ConfidenceLevel;
  observedAt: string;
}

export interface ProjectionOptions {
  now: Date;
  workingFreshForMs: number;
  /** Launcher PID positively verified for this projection operation. */
  verifiedLauncherPid?: number;
}

function invalidOptions(message: string): AgentBoardError {
  return new AgentBoardError("INVALID_RECORD", message);
}

function addTerminalDiagnostic(diagnostics: string[], presence: TerminalPresence): void {
  if (presence !== "visible") diagnostics.push(`terminal is ${presence}`);
}

export function projectSession(
  input: Readonly<SessionRecord>,
  options: ProjectionOptions,
): SessionProjection {
  const record = parseSessionRecord(input);
  if (
    options === null ||
    typeof options !== "object" ||
    !(options.now instanceof Date) ||
    !Number.isFinite(options.now.getTime())
  ) {
    throw invalidOptions("Projection now must be a valid Date");
  }
  if (!Number.isFinite(options.workingFreshForMs) || options.workingFreshForMs < 0) {
    throw invalidOptions("Projection freshness must be a non-negative finite number");
  }
  if (options.verifiedLauncherPid !== undefined &&
      (!Number.isSafeInteger(options.verifiedLauncherPid) || options.verifiedLauncherPid <= 0)) {
    throw invalidOptions("Verified launcher PID must be a positive safe integer");
  }

  const diagnostics: string[] = [];
  const observedTime = Date.parse(record.agent.observedAt);
  const now = options.now.getTime();
  const age = now - observedTime;
  const workingFuture = record.agent.activity === "working" && age < 0;
  const launcherVerifiedWorking = record.agent.mode === "managed" &&
    AGENT_ADAPTER_CAPABILITIES[record.agent.adapter].workingWhileLauncherAlive &&
    record.agent.activity === "working" &&
    record.agent.health === "live" &&
    record.agent.launcherPid !== undefined &&
    record.agent.launcherPid === options.verifiedLauncherPid;
  const workingStale = record.agent.activity === "working" &&
    !launcherVerifiedWorking &&
    age > options.workingFreshForMs;

  if (record.agent.health === "stale") diagnostics.push("agent health is stale");
  addTerminalDiagnostic(diagnostics, record.terminal.presence);
  if (record.agent.mode === "ordinary") diagnostics.push("session is not managed");
  if (record.agent.activity === "unknown") diagnostics.push("activity is unknown");
  if (workingFuture) diagnostics.push("working evidence is from the future");
  else if (workingStale) diagnostics.push("working evidence is stale");
  if (record.agent.confidence === "inferred") diagnostics.push("evidence is inferred");
  if (record.agent.detail !== undefined) diagnostics.push(record.agent.detail);

  let glyph: ProjectionGlyph;
  let status: ProjectionStatus;
  switch (true) {
    case record.terminal.presence !== "visible":
      glyph = "?";
      status = "diagnostic";
      break;
    case record.agent.mode === "ordinary":
      glyph = "?";
      status = "diagnostic";
      break;
    case record.agent.confidence === "inferred":
      glyph = "?";
      status = "diagnostic";
      break;
    case record.agent.health === "error":
      glyph = "×";
      status = "error";
      break;
    case record.agent.attention === "input_required":
      glyph = "!";
      status = "needs-input";
      break;
    case record.agent.attention === "completion_unread":
      glyph = "✓";
      status = "finished";
      break;
    case record.agent.activity === "working" && !workingFuture && !workingStale && record.terminal.presence === "visible" && record.agent.health === "live":
      glyph = "●";
      status = "working";
      break;
    case record.agent.activity === "idle" && record.terminal.presence === "visible" && record.agent.health === "live":
      glyph = "○";
      status = "idle";
      break;
    default:
      glyph = "?";
      status = "diagnostic";
      break;
  }

  const projection: SessionProjection = {
    glyph,
    status,
    label: record.identity.projectLabel,
    title: `${glyph} ${record.identity.projectLabel}`,
    diagnostics: Object.freeze(diagnostics),
    confidence: record.agent.confidence,
    observedAt: record.agent.observedAt,
  };
  return Object.freeze(projection);
}
