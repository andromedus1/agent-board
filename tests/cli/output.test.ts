import assert from "node:assert/strict";
import { test } from "node:test";

import { renderBoard, renderBoardJson } from "../../src/cli/output.js";
import type { BoardRow } from "../../src/application/list-sessions.js";

function row(overrides: Partial<BoardRow> = {}): BoardRow {
  return {
    sessionId: "session-1",
    label: "data-platform",
    displayLabel: "data-platform",
    glyph: "●",
    status: "working",
    diagnostics: [],
    confidence: "authoritative",
    agentMode: "managed",
    adapter: "codex",
    evidenceKind: "codex.thread.status",
    adapterCapabilities: { workingWhileLauncherAlive: true, observation: "native-stream", semanticControl: "none" },
    observedAt: "2026-08-14T23:00:00.000Z",
    titleRendered: true,
    ...overrides,
  };
}

test("renderBoard renders the exact five-state board and appends diagnostics", () => {
  assert.equal(
    renderBoard([
      row({ label: "data-platform", displayLabel: "data-platform", glyph: "●", status: "working" }),
      row({ sessionId: "session-2", label: "acquisition", displayLabel: "acquisition", glyph: "!", status: "needs-input" }),
      row({ sessionId: "session-3", label: "agent-board", displayLabel: "agent-board", glyph: "✓", status: "finished" }),
      row({ sessionId: "session-4", label: "legacy-engine", displayLabel: "legacy-engine", glyph: "○", status: "idle" }),
      row({ sessionId: "session-5", label: "reporting", displayLabel: "reporting", glyph: "×", status: "error", diagnostics: ["agent mode is ordinary"] }),
    ]),
    "AGENT BOARD\n\n● data-platform        working (codex)\n! acquisition          needs input (codex)\n✓ agent-board          finished (codex)\n○ legacy-engine        idle (codex)\n× reporting            error (codex) [agent mode is ordinary]\n",
  );
});

test("renderBoard has a stable empty state and JSON is escaped/versioned", () => {
  assert.equal(renderBoard([]), "AGENT BOARD\n\nNo registered agents.\n");
  const rendered = renderBoardJson([row({ label: 'say "hi" 🧪', displayLabel: 'say "hi" 🧪', diagnostics: ["title is not synchronized"] })]);
  assert.equal(rendered.endsWith("\n"), true);
  const envelope = JSON.parse(rendered) as { schemaVersion: number; sessions: BoardRow[] };
  assert.equal(envelope.schemaVersion, 1);
  assert.equal(envelope.sessions[0]?.label, 'say "hi" 🧪');
  assert.equal(envelope.sessions[0]?.titleRendered, true);
});
