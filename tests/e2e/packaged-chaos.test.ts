import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

import { createPackageHarness, type PackageHarness } from "./support/package-harness.js";
import { readBoardRows, waitForBoardRow } from "./support/board.js";

async function assertCanonicalState(harness: PackageHarness): Promise<void> {
  const sessionDir = `${harness.env.AGENT_BOARD_STATE_DIR}/v1/sessions`;
  for (const file of await readdir(sessionDir)) {
    if (!file.endsWith(".json")) continue;
    const value = JSON.parse(await readFile(`${sessionDir}/${file}`, "utf8")) as { sessionId?: string };
    assert.equal(value.sessionId, file.slice(0, -5));
  }
}

test("killing the owned app-server projects bounded error evidence without corrupting state", async () => {
  const harness = await createPackageHarness({ codex: { status: "working" } });
  const launcher = harness.start("agent-codex");
  try {
    await waitForBoardRow(harness, (row) => row.glyph === "●");
    await harness.writeScenario((value) => ({ ...value, codex: { ...value.codex, killServer: true } }));
    const failed = await waitForBoardRow(harness, (row) => row.glyph === "×", 3_000);
    assert.equal(failed.status, "error");
    const exit = await launcher.exit;
    assert.equal(exit.code, 1);
    await assertCanonicalState(harness);
  } finally {
    if (launcher.child.exitCode === null) launcher.child.kill("SIGTERM");
    await harness.close();
  }
});

test("snapshot loss and restoration yields a diagnostic then repairs the canonical title", async () => {
  const harness = await createPackageHarness();
  try {
    const named = await harness.run("agent-name", ["recovery"], { stdinIsTTY: true });
    assert.equal(named.code, 0, named.stderr);
    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, snapshotAvailable: false } }));
    await waitForBoardRow(harness, (row) => row.glyph === "?");
    await harness.writeScenario((value) => ({ ...value, ghostty: { ...value.ghostty, snapshotAvailable: true } }));
    await waitForBoardRow(harness, (row) => row.glyph === "?" && row.diagnostics.includes("session is not managed"));
    const scenario = await harness.readScenario();
    assert.equal(scenario.ghostty.terminals["term-one"]?.title, "? recovery");
    await assertCanonicalState(harness);
  } finally {
    await harness.close();
  }
});

test("launcher termination interrupts an active TUI and never records completion", async () => {
  const harness = await createPackageHarness({ codex: { status: "working" } });
  const launcher = harness.start("agent-codex");
  try {
    await waitForBoardRow(harness, (row) => row.glyph === "●");
    launcher.child.kill("SIGTERM");
    const exit = await launcher.exit;
    assert.equal(exit.code, 143);
    const current = await readBoardRows(harness);
    assert.equal(current.length, 1);
    assert.notEqual(current[0]?.glyph, "✓");
    await assertCanonicalState(harness);
  } finally {
    if (launcher.child.exitCode === null) launcher.child.kill("SIGTERM");
    await harness.close();
  }
});
