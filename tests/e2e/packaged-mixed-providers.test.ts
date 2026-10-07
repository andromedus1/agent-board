import assert from "node:assert/strict";
import { test } from "node:test";

import { createPackageHarness, waitForScenario } from "./support/package-harness.js";
import { readBoardRows, waitForBoardRow } from "./support/board.js";

test("packed Codex and Claude tabs share glyphs while preserving provider identity", async () => {
  const harness = await createPackageHarness({
    ghostty: { terminals: { "term-two": { windowId: "window-two", tabId: "tab-two", terminalId: "term-two", workingDirectory: "/tmp/claude-project" } } },
  });
  const codex = harness.start("agent-codex");
  let claude;
  try {
    const codexIdle = await waitForBoardRow(harness, (row) => row.adapter === "codex" && row.agentMode === "managed" && row.glyph === "○");
    assert.equal(codexIdle.glyph, "○");
    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, focusedTerminalId: "term-two" } }));
    const named = await harness.run("agent-name", ["claude-project"], { stdinIsTTY: true });
    assert.equal(named.code, 0, named.stderr);
    claude = harness.start("agent-claude", ["--continue"]);
    const claudeIdle = await waitForBoardRow(harness, (row) => row.adapter === "claude" && row.agentMode === "managed" && row.glyph === "○", 3_000);
    assert.equal(claudeIdle.glyph, "○");
    assert.notEqual(claudeIdle.sessionId, codexIdle.sessionId);
    assert.equal(claudeIdle.label, "claude-project");
    assert.deepEqual(claudeIdle.adapterCapabilities, { workingWhileLauncherAlive: false, observation: "native-hooks", semanticControl: "none" });

    await harness.writeScenario((value) => ({ ...value, codex: { ...value.codex, status: "working" }, claude: { ...value.claude, hook: { sequence: 1, event: "UserPromptSubmit" } } }));
    assert.equal((await waitForBoardRow(harness, (row) => row.adapter === "codex" && row.glyph === "●")).status, "working");
    assert.equal((await waitForBoardRow(harness, (row) => row.adapter === "claude" && row.glyph === "●", 3_000)).status, "working");

    await harness.writeScenario((value) => ({ ...value, codex: { ...value.codex, status: "input" }, claude: { ...value.claude, hook: { sequence: 2, event: "PermissionRequest" } } }));
    assert.equal((await waitForBoardRow(harness, (row) => row.adapter === "codex" && row.glyph === "!")).status, "needs-input");
    assert.equal((await waitForBoardRow(harness, (row) => row.adapter === "claude" && row.glyph === "!", 3_000)).status, "needs-input");

    await harness.writeScenario((value) => ({
      ...value,
      ghostty: { ...value.ghostty, frontmost: false },
      claude: { ...value.claude, hook: { sequence: 3, event: "Stop" } },
    }));
    const completed = await waitForBoardRow(harness, (row) => row.adapter === "claude" && row.glyph === "✓", 3_000);
    assert.equal(completed.status, "finished");
    await waitForScenario(harness, (value) => value.ghostty.terminals["term-two"]?.title?.startsWith("✓ ") === true, 3_000);
    const ack = await harness.run("agent-board", ["ack", completed.sessionId]);
    assert.equal(ack.code, 0, ack.stderr);
    assert.equal((await waitForBoardRow(harness, (row) => row.sessionId === completed.sessionId && row.glyph === "○")).adapter, "claude");

    await harness.writeScenario((value) => ({ ...value, claude: { ...value.claude, hook: { sequence: 4, event: "Stop", fields: { background_tasks: [{ id: "task" }] } } } }));
    assert.equal((await waitForBoardRow(harness, (row) => row.adapter === "claude" && row.glyph === "●", 3_000)).status, "working");
    await harness.writeScenario((value) => ({ ...value, claude: { ...value.claude, hook: { sequence: 5, event: "StopFailure" } } }));
    assert.equal((await waitForBoardRow(harness, (row) => row.adapter === "claude" && row.glyph === "×", 3_000)).status, "error");
    await harness.writeScenario((value) => ({ ...value, claude: { ...value.claude, hook: { sequence: 6, event: "SessionEnd" } } }));
    assert.equal((await waitForBoardRow(harness, (row) => row.adapter === "claude" && row.glyph === "×", 3_000)).status, "error");
    await harness.writeScenario((value) => ({ ...value, claude: { ...value.claude, exitCode: 7 } }));
    assert.equal((await claude.exit).code, 7);

    const rows = await readBoardRows(harness);
    assert.deepEqual(new Set(rows.map((row) => row.adapter)), new Set(["codex", "claude"]));
  } finally {
    codex.child.kill("SIGTERM");
    if (claude && claude.child.exitCode === null) claude.child.kill("SIGTERM");
    await harness.close();
  }
});

test("packed doctor validates both provider adapters and the Claude hook package", async () => {
  const harness = await createPackageHarness();
  try {
    const result = await harness.run("agent-board", ["doctor"]);
    assert.equal(result.code, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /CODEX_COMPATIBLE/u);
    assert.match(result.stdout, /CLAUDE_COMPATIBLE/u);
    assert.match(result.stdout, /CLAUDE_PLUGIN_VALID/u);
  } finally {
    await harness.close();
  }
});
