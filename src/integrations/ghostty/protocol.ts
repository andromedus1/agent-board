import { AgentBoardError } from "../../domain/errors.js";
import type { TerminalIdentity } from "../../domain/session.js";

export type GhosttyErrorCode =
  | "GHOSTTY_PROTOCOL_ERROR"
  | "GHOSTTY_PERMISSION_DENIED"
  | "GHOSTTY_UNSUPPORTED"
  | "GHOSTTY_TARGET_NOT_FOUND"
  | "GHOSTTY_ACTION_FAILED";

export class GhosttyAdapterError extends AgentBoardError {
  readonly ghosttyCode: GhosttyErrorCode;

  constructor(code: GhosttyErrorCode, message: string, options?: { cause?: unknown }) {
    super("ADAPTER_FAILURE", message, options);
    this.name = "GhosttyAdapterError";
    this.ghosttyCode = code;
  }
}

export interface GhosttyContext extends TerminalIdentity {
  workingDirectory?: string;
}

export interface GhosttyHierarchyEntry extends TerminalIdentity {}

export interface GhosttySnapshot {
  readonly visible: readonly GhosttyHierarchyEntry[];
  readonly enumerableTerminalIds: readonly string[];
}

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u;

function fail(message: string, cause?: unknown): never {
  throw new GhosttyAdapterError("GHOSTTY_PROTOCOL_ERROR", message, { cause });
}

function parseIdentity(fields: readonly string[], row: string): TerminalIdentity {
  if (fields.length !== 3) fail(`Ghostty identity row must contain exactly 3 fields: ${JSON.stringify(row)}`);
  if (fields.some((field) => field.length === 0 || CONTROL_CHARACTERS.test(field))) {
    fail("Ghostty identity contains an empty or control-character field");
  }
  return { adapter: "ghostty", windowId: fields[0], tabId: fields[1], terminalId: fields[2] };
}

function withoutTrailingLineBreaks(stdout: string): string {
  return stdout.replace(/(?:\r?\n)+$/u, "");
}

export function parseActiveContext(stdout: string): GhosttyContext {
  const body = withoutTrailingLineBreaks(stdout);
  if (body.length === 0 || body.includes("\n")) fail("Ghostty active-context output must contain one row");
  return parseIdentity(body.split("\t"), body);
}

export function parseFocusedTerminal(stdout: string): TerminalIdentity | null {
  const body = withoutTrailingLineBreaks(stdout);
  if (body === "AGENT_BOARD_NOT_FRONTMOST") return null;
  if (body.length === 0 || body.includes("\n")) fail("Ghostty focus output must contain one row");
  const fields = body.split("\t");
  if (fields[0] !== "FRONTMOST") fail("Ghostty focus output did not provide frontmost evidence");
  return parseIdentity(fields.slice(1), body);
}

export function parseHierarchy(stdout: string): readonly GhosttyHierarchyEntry[] {
  const body = withoutTrailingLineBreaks(stdout);
  if (body.length === 0) return [];
  const rows = body.split("\n");
  const entries = rows.map((row) => parseIdentity(row.split("\t"), row));
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.terminalId)) fail(`Ghostty hierarchy contains duplicate terminal ID ${entry.terminalId}`);
    seen.add(entry.terminalId);
  }
  return entries;
}

export function parseGhosttySnapshot(stdout: string): GhosttySnapshot {
  const body = withoutTrailingLineBreaks(stdout);
  if (body.length === 0) return { visible: [], enumerableTerminalIds: [] };

  const visible: GhosttyHierarchyEntry[] = [];
  const enumerableTerminalIds: string[] = [];
  const visibleIds = new Set<string>();
  const enumerableIds = new Set<string>();
  for (const row of body.split("\n")) {
    const fields = row.split("\t");
    const marker = fields[0];
    if (marker === "VISIBLE") {
      const entry = parseIdentity(fields.slice(1), row);
      if (visibleIds.has(entry.terminalId)) fail(`Ghostty snapshot contains duplicate visible terminal ID ${entry.terminalId}`);
      visibleIds.add(entry.terminalId);
      visible.push(entry);
      continue;
    }
    if (marker === "ENUMERABLE") {
      if (fields.length !== 2) fail(`Ghostty enumerable row must contain exactly 2 fields: ${JSON.stringify(row)}`);
      const terminalId = fields[1];
      if (terminalId.length === 0 || CONTROL_CHARACTERS.test(terminalId)) fail("Ghostty enumerable terminal ID is empty or contains a control character");
      if (enumerableIds.has(terminalId)) fail(`Ghostty snapshot contains duplicate enumerable terminal ID ${terminalId}`);
      enumerableIds.add(terminalId);
      enumerableTerminalIds.push(terminalId);
      continue;
    }
    fail(`Ghostty snapshot row has unknown marker: ${JSON.stringify(marker)}`);
  }
  for (const terminalId of visibleIds) {
    if (!enumerableIds.has(terminalId)) fail(`Ghostty visible terminal ${terminalId} is absent from enumerable terminals`);
  }
  return { visible, enumerableTerminalIds };
}

export function parseWorkingDirectory(stdout: string): string | undefined {
  let value = stdout;
  if (value.endsWith("\n")) value = value.slice(0, -1);
  if (value.length === 0 || value === "AGENT_BOARD_NO_WORKING_DIRECTORY") return undefined;
  return value;
}

export function parseActionEcho(stdout: string, terminalId: string): void {
  const value = withoutTrailingLineBreaks(stdout);
  if (value === "MISSING_TARGET") {
    throw new GhosttyAdapterError("GHOSTTY_TARGET_NOT_FOUND", `Ghostty terminal ${terminalId} was not found`);
  }
  if (value === "AGENT_BOARD_ACTION_FAILED") {
    throw new GhosttyAdapterError("GHOSTTY_ACTION_FAILED", "Ghostty rejected the title action");
  }
  if (value !== `OK:${terminalId}`) {
    throw new GhosttyAdapterError("GHOSTTY_ACTION_FAILED", "Ghostty did not acknowledge the title action");
  }
}

export function ghosttyProcessError(stderr: string, exitCode: number): GhosttyAdapterError {
  const lower = stderr.toLowerCase();
  if (lower.includes("not authorized") || lower.includes("not permitted") || lower.includes("automation") || lower.includes("apple events")) {
    return new GhosttyAdapterError("GHOSTTY_PERMISSION_DENIED", "macOS Automation permission denied for Ghostty", { cause: stderr });
  }
  if (lower.includes("no such application") || lower.includes("can't get application") || lower.includes("application isn't running") || lower.includes("application isn’t running") || lower.includes("application is not running")) {
    return new GhosttyAdapterError("GHOSTTY_UNSUPPORTED", "Ghostty is not running or does not expose AppleScript", { cause: stderr });
  }
  if (lower.includes("missing value") || lower.includes("can't get") || lower.includes("cannot get")) {
    return new GhosttyAdapterError("GHOSTTY_TARGET_NOT_FOUND", "Ghostty target was not found", { cause: stderr });
  }
  return new GhosttyAdapterError("GHOSTTY_PROTOCOL_ERROR", `Ghostty AppleScript failed with exit code ${exitCode}`, { cause: stderr });
}
