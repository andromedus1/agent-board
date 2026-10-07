import assert from "node:assert/strict";
import { test } from "node:test";

import { NodeProcessRunner } from "../../src/integrations/process-runner.js";

const runner = new NodeProcessRunner();

test("process runner preserves argv without shell evaluation", async () => {
  const result = await runner.run({
    command: process.execPath,
    args: ["-e", "process.stdout.write(process.argv.slice(1).join('|'))", "--", "a; echo unsafe", "$(not-a-command)"],
    timeoutMs: 1_000,
    maxOutputBytes: 1_024,
  });
  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, "a; echo unsafe|$(not-a-command)");
});

test("process runner bounds timeout and output", async () => {
  await assert.rejects(
    runner.run({ command: process.execPath, args: ["-e", "setTimeout(() => {}, 10_000)"], timeoutMs: 20, maxOutputBytes: 1_024 }),
    /timed out/,
  );
  await assert.rejects(
    runner.run({ command: process.execPath, args: ["-e", "process.stdout.write('0123456789')"], timeoutMs: 1_000, maxOutputBytes: 4 }),
    /output exceeded/,
  );
});
