import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { createPackageHarness } from "./support/package-harness.js";
import { waitForBoardRow } from "./support/board.js";

test("packed Codex relaunch binds after changing directories in the same registered tab", async () => {
  const harness = await createPackageHarness({ codex: { status: "working" } });
  try {
    const named = await harness.run("agent-name", ["stable-label"], { stdinIsTTY: true });
    assert.equal(named.code, 0, named.stderr);
    const original = await waitForBoardRow(harness, (row) => row.label === "stable-label");
    const project = (await harness.readScenario()).ghostty.terminals["term-one"].workingDirectory!;
    const otherDirectory = join(harness.root, "another-project");
    await mkdir(otherDirectory);

    for (const cwd of [join(project, "src"), otherDirectory]) {
      await harness.writeScenario((scenario) => ({
        ...scenario,
        ghostty: {
          ...scenario.ghostty,
          terminals: {
            ...scenario.ghostty.terminals,
            "term-one": { ...scenario.ghostty.terminals["term-one"], workingDirectory: cwd },
          },
        },
      }));
      const launcher = harness.start("agent-codex", [], { cwd });
      try {
        const working = await waitForBoardRow(harness, (row) => row.glyph === "●");
        assert.equal(working.sessionId, original.sessionId);
        assert.equal(working.label, "stable-label");
        assert.equal(launcher.child.exitCode, null);
      } finally {
        launcher.child.kill("SIGTERM");
        await launcher.exit;
      }
    }
  } finally {
    await harness.close();
  }
});
