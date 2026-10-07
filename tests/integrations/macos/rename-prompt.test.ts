import assert from "node:assert/strict";
import test from "node:test";

import { AgentBoardError } from "../../../src/domain/errors.js";
import { MacOSRenamePrompt } from "../../../src/integrations/macos/rename-prompt.js";
import type { ProcessRequest, ProcessResult, ProcessRunner } from "../../../src/integrations/process-runner.js";

class FakeRunner implements ProcessRunner {
  readonly requests: ProcessRequest[] = [];
  constructor(private readonly result: ProcessResult) {}
  async run(request: ProcessRequest): Promise<ProcessResult> {
    this.requests.push(request);
    return this.result;
  }
}

test("native prompt transports the current label as shell-free argv", async () => {
  const runner = new FakeRunner({ stdout: "AGENT_BOARD_RENAMED\u001edata; $(not-shell)\n", stderr: "", exitCode: 0 });
  const prompt = new MacOSRenamePrompt({ runner, command: "/fake/osascript" });
  assert.equal(await prompt.prompt("old; $(not-shell)"), "data; $(not-shell)");
  assert.equal(runner.requests[0]?.command, "/fake/osascript");
  assert.deepEqual(runner.requests[0]?.args.slice(-2), ["--", "old; $(not-shell)"]);
  assert.equal(runner.requests[0]?.timeoutMs, 900_000);
  assert.equal(runner.requests[0]?.maxOutputBytes, 4_096);
});

test("native prompt maps cancellation and rejects malformed or failed responses", async () => {
  assert.equal(await new MacOSRenamePrompt({ runner: new FakeRunner({ stdout: "AGENT_BOARD_CANCELLED\n", stderr: "", exitCode: 0 }) }).prompt("old"), null);

  await assert.rejects(
    new MacOSRenamePrompt({ runner: new FakeRunner({ stdout: "surprise\n", stderr: "", exitCode: 0 }) }).prompt("old"),
    (error: unknown) => error instanceof AgentBoardError && error.code === "ADAPTER_FAILURE",
  );
  await assert.rejects(
    new MacOSRenamePrompt({ runner: new FakeRunner({ stdout: "", stderr: "script failed", exitCode: 1 }) }).prompt("old"),
    /failed with exit code 1/u,
  );
});
