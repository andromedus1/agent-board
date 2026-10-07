import { AgentBoardError } from "../domain/errors.js";
import type { BoardRow } from "../application/list-sessions.js";

export interface BoardEnvelope {
  readonly schemaVersion: 1;
  readonly sessions: readonly BoardRow[];
}

const STATUS_LABELS: Readonly<Record<BoardRow["status"], string>> = {
  idle: "idle",
  working: "working",
  finished: "finished",
  "needs-input": "needs input",
  error: "error",
  diagnostic: "diagnostic",
};

export function renderBoard(rows: readonly BoardRow[]): string {
  if (rows.length === 0) return "AGENT BOARD\n\nNo registered agents.\n";

  const longestLabel = rows.reduce(
    (longest, row) => Math.max(longest, row.displayLabel.length),
    0,
  );
  const lines = rows.map((row) => {
    const diagnostic = row.diagnostics.length > 0
      ? ` [${row.diagnostics.join("; ")}]`
      : "";
    // Keep a generous, stable gutter between the label and status so the
    // board remains scannable when diagnostics are appended.
    return `${row.glyph} ${row.displayLabel.padEnd(longestLabel + 8)}${STATUS_LABELS[row.status]} (${row.adapter})${diagnostic}`;
  });
  return `AGENT BOARD\n\n${lines.join("\n")}\n`;
}

export function renderBoardJson(rows: readonly BoardRow[]): string {
  const envelope: BoardEnvelope = { schemaVersion: 1, sessions: rows };
  return `${JSON.stringify(envelope)}\n`;
}

export function formatCliError(error: unknown): string {
  if (error instanceof AgentBoardError) return `${error.code}: ${error.message}`;
  if (error instanceof Error) return error.message;
  return "Unexpected failure";
}
