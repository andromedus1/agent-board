import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";

import { createPackageHarness } from "./support/package-harness.js";

test("packed install exposes source-free public bins over isolated executable boundaries", async () => {
  const harness = await createPackageHarness();
  try {
    const installed = await readdir(`${harness.prefix}/node_modules/agent-board`);
    assert.deepEqual(installed.sort(), ["README.md", "assets", "dist", "package.json"]);

    const detached = await harness.run("agent-name", ["wrong-target"]);
    assert.equal(detached.code, 1);
    assert.match(detached.stderr, /must run in the target terminal/u);

    const named = await harness.run("agent-name", ["data-platform"], { stdinIsTTY: true });
    assert.equal(named.code, 0, named.stderr);
    assert.match(named.stdout, /Registered data-platform/u);

    const registered = JSON.parse((await harness.run("agents", ["--json"])).stdout) as {
      sessions: Array<{ sessionId: string }>;
    };
    const managedRename = await harness.run("agent-name", ["data-hub"], {
      env: { AGENT_BOARD_SESSION_ID: registered.sessions[0]?.sessionId },
    });
    assert.equal(managedRename.code, 0, managedRename.stderr);
    assert.match(managedRename.stdout, /Renamed data-hub/u);

    const board = await harness.run("agents");
    assert.equal(board.code, 0, board.stderr);
    assert.match(board.stdout, /data-hub/u);

    const doctor = await harness.run("agent-board", ["doctor"]);
    assert.equal(doctor.code, 0, doctor.stderr);
    assert.match(doctor.stdout, /Runtime/u);
    assert.match(doctor.stdout, /State/u);
    assert.match(doctor.stdout, /Codex/u);
    assert.match(doctor.stdout, /Claude/u);
    assert.match(doctor.stdout, /Ghostty/u);
  } finally {
    await harness.close();
  }
});
