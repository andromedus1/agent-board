import { test } from "node:test";
import assert from "node:assert/strict";

import { createPackageHarness, waitForScenario } from "./support/package-harness.js";
import { readBoardRows, waitForBoardRow } from "./support/board.js";

test("packed golden journeys preserve board/title parity and independent session identity", async () => {
  const harness = await createPackageHarness({
    ghostty: {
      terminals: {
        "term-two": { windowId: "window-two", tabId: "tab-two", terminalId: "term-two", workingDirectory: "/tmp/second-project" },
      },
    },
  });
  let launcher;
  try {
    let result = await harness.run("agent-name", ["data-platform"], { stdinIsTTY: true });
    assert.equal(result.code, 0, result.stderr);
    await harness.writeScenario((scenario) => ({ ...scenario, renamePrompt: { response: "data-hub" } }));
    result = await harness.run("agent-name");
    assert.equal(result.code, 0, result.stderr);
    assert.equal(result.stdout, "Renamed data-hub\n");
    assert.equal((await harness.readScenario()).ghostty.terminals["term-one"]?.title, "? data-hub");
    result = await harness.run("agent-name", ["data-platform"], { stdinIsTTY: true });
    assert.equal(result.code, 0, result.stderr);
    await harness.writeScenario((scenario) => ({ ...scenario, ghostty: { ...scenario.ghostty, focusedTerminalId: "term-two" } }));
    result = await harness.run("agent-name", ["acquisition"], { stdinIsTTY: true });
    assert.equal(result.code, 0, result.stderr);

    let currentRows = await readBoardRows(harness);
    assert.deepEqual(currentRows.map((row) => row.label), ["acquisition", "data-platform"]);
    let scenario = await harness.readScenario();
    assert.equal(scenario.ghostty.terminals["term-one"]?.title, "? data-platform");
    assert.equal(scenario.ghostty.terminals["term-two"]?.title, "? acquisition");

    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, focusedTerminalId: "term-one" }, codex: { ...value.codex, status: "idle" } }));
    launcher = harness.start("agent-codex");
    const managed = await waitForBoardRow(harness, (row) => row.label === "data-platform" && row.agentMode === "managed");
    assert.equal(managed.glyph, "○");
    scenario = await waitForScenario(harness, (candidate) => candidate.ghostty.terminals["term-one"]?.title === "○ data-platform", 900);
    assert.equal(scenario.ghostty.terminals["term-one"]?.title, "○ data-platform");

    for (const [status, glyph, title] of [["working", "●", "● data-platform"], ["input", "!", "! data-platform"]] as const) {
      const startedAt = performance.now();
      await harness.writeScenario((value) => ({ ...value, codex: { ...value.codex, status } }));
      const row = await waitForBoardRow(harness, (candidate) => candidate.label === "data-platform" && candidate.glyph === glyph, 900);
      assert.equal(row.titleRendered, true);
      scenario = await waitForScenario(harness, (candidate) => candidate.ghostty.terminals["term-one"]?.title === title, 900);
      assert.equal(scenario.ghostty.terminals["term-one"]?.title, title);
      assert.ok(performance.now() - startedAt < 1_000, `lifecycle convergence exceeded 1000ms for ${status}`);
    }

    // Codex reports resolution of the input wait before the final idle edge;
    // this is the public lifecycle contract that clears input attention.
    await harness.writeScenario((value) => ({ ...value, codex: { ...value.codex, status: "working" } }));
    await waitForBoardRow(harness, (candidate) => candidate.label === "data-platform" && candidate.glyph === "●");
    const completionStartedAt = performance.now();
    await harness.writeScenario((value) => ({
      ...value,
      ghostty: { ...value.ghostty, frontmost: false },
      codex: { ...value.codex, status: "idle" },
    }));
    let completed = await waitForBoardRow(harness, (candidate) => candidate.label === "data-platform" && candidate.glyph === "✓", 900);
    assert.equal(completed.status, "finished");
    scenario = await waitForScenario(harness, (candidate) => candidate.ghostty.terminals["term-one"]?.title === "✓ data-platform", 900);
    assert.equal(scenario.ghostty.terminals["term-one"]?.title, "✓ data-platform");
    assert.ok(performance.now() - completionStartedAt < 1_000, "completion convergence exceeded 1000ms");

    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, frontmost: true } }));
    await waitForBoardRow(harness, (candidate) => candidate.label === "data-platform" && candidate.glyph === "○");

    await harness.writeScenario((value) => ({
      ...value,
      ghostty: { ...value.ghostty, frontmost: false },
      codex: { ...value.codex, status: "working" },
    }));
    await waitForBoardRow(harness, (candidate) => candidate.label === "data-platform" && candidate.glyph === "●");
    await harness.writeScenario((value) => ({ ...value, codex: { ...value.codex, status: "idle" } }));
    completed = await waitForBoardRow(harness, (candidate) => candidate.label === "data-platform" && candidate.glyph === "✓");

    result = await harness.run("agent-board", ["ack", completed.sessionId]);
    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /Acknowledged/u);
    await waitForBoardRow(harness, (candidate) => candidate.label === "data-platform" && candidate.glyph === "○");

    await harness.writeScenario((value) => {
      const { "term-one": _closed, ...terminals } = value.ghostty.terminals;
      return { ...value, ghostty: { ...value.ghostty, focusedTerminalId: "term-two", terminals } };
    });
    currentRows = await readBoardRows(harness);
    assert.deepEqual(currentRows.map((row) => row.label), ["acquisition"]);
    currentRows = await readBoardRows(harness);
    assert.deepEqual(currentRows.map((row) => row.label), ["acquisition"]);
    scenario = await harness.readScenario();
    assert.equal(scenario.ghostty.terminals["term-two"]?.title, "? acquisition");
  } finally {
    if (launcher) launcher.child.kill("SIGTERM");
    await harness.close();
  }
});
