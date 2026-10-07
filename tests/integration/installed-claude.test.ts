import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "node:test";

const run = promisify(execFile);
const enabled = process.env.AGENT_BOARD_LIVE_CLAUDE === "1";

test("installed Claude reports a compatible version and validates the packaged hook plugin", { skip: enabled ? false : "Set AGENT_BOARD_LIVE_CLAUDE=1 to opt into the installed Claude probe" }, async () => {
  const command = process.env.AGENT_BOARD_CLAUDE_COMMAND ?? "claude";
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const version = await run(command, ["--version"], { timeout: 5_000 });
  assert.match(version.stdout, /\d+\.\d+\.\d+/u);
  const validation = await run(command, ["plugin", "validate", resolve(root, "assets/claude-plugin")], { timeout: 10_000 });
  assert.match(`${validation.stdout}${validation.stderr}`, /Validation passed/u);
});
