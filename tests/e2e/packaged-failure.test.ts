import { test } from "node:test";
import assert from "node:assert/strict";

import { createPackageHarness, waitForScenario } from "./support/package-harness.js";
import { readBoardRows, waitForBoardRow } from "./support/board.js";

test("packed failure journeys preserve actionable errors and retryable records", async () => {
  const harness = await createPackageHarness();
  let launcher;
  try {
    let result = await harness.run("agent-name", ["unsafe\nlabel"], { stdinIsTTY: true });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /INVALID_LABEL/u);
    assert.match((await harness.run("agents", ["--json"])).stdout, /sessions":\[\]/u);

    await harness.writeScenario((value) => ({
      ...value,
      ghostty: {
        ...value.ghostty,
        version: "Ghostty 1.2.9",
        defaultConfig: "macos-applescript = true\n",
        userConfig: "macos-applescript = false\n",
        automationDenied: true,
      },
      codex: { ...value.codex, version: "codex-cli 0.100.0" },
    }));
    result = await harness.run("agent-board", ["doctor"]);
    assert.equal(result.code, 1);
    assert.match(result.stdout, /CODEX_VERSION_UNSUPPORTED/u);
    assert.match(result.stdout, /GHOSTTY_VERSION_UNSUPPORTED/u);
    assert.match(result.stdout, /GHOSTTY_APPLESCRIPT_DISABLED/u);
    assert.match(result.stdout, /GHOSTTY_AUTOMATION_DENIED/u);

    await harness.writeScenario((value) => ({
      ...value,
      ghostty: { ...value.ghostty, version: "Ghostty 1.3.1", userConfig: "macos-applescript = true\n", automationDenied: false },
      codex: { ...value.codex, version: "codex-cli 0.147.2", status: "error" },
    }));
    result = await harness.run("agent-name", ["reporting"], { stdinIsTTY: true });
    assert.equal(result.code, 0, result.stderr);
    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, snapshotAvailable: false } }));
    const diagnostic = await waitForBoardRow(harness, (row) => row.label === "reporting" && row.glyph === "?");
    assert.equal(diagnostic.status, "diagnostic");
    assert.match(diagnostic.diagnostics.join(" "), /terminal is unknown/u);

    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, snapshotAvailable: true, focusedTerminalId: "term-one" } }));
    launcher = harness.start("agent-codex");
    await waitForBoardRow(harness, (row) => row.label === "reporting" && row.status === "error");
    const errorScenario = await waitForScenario(harness, (candidate) => candidate.ghostty.terminals["term-one"]?.title === "× reporting", 900);
    assert.equal(errorScenario.ghostty.terminals["term-one"]?.title, "× reporting");
    launcher.child.kill("SIGTERM");
    await launcher.exit;
  } finally {
    if (launcher && launcher.child.exitCode === null) launcher.child.kill("SIGTERM");
    await harness.close();
  }
});

test("failed title clear retains a record for a healthy retry", async () => {
  const harness = await createPackageHarness();
  try {
    let result = await harness.run("agent-name", ["clear-me"], { stdinIsTTY: true });
    assert.equal(result.code, 0, result.stderr);
    const current = await harness.run("agents", ["--json"]);
    const sessionId = (JSON.parse(current.stdout) as { sessions: Array<{ sessionId: string }> }).sessions[0]?.sessionId;
    assert.ok(sessionId);
    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, titleActionFails: true } }));
    result = await harness.run("agent-board", ["unregister", sessionId]);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /rejected the title action/u);
    assert.equal((await readBoardRows(harness)).length, 1);
    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, titleActionFails: false } }));
    result = await harness.run("agent-board", ["unregister", sessionId]);
    assert.equal(result.code, 0, result.stderr);
    assert.equal((await readBoardRows(harness)).length, 0);
  } finally {
    await harness.close();
  }
});
