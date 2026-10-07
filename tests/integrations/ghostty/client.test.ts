import assert from "node:assert/strict";
import { test } from "node:test";

import type { ProcessRequest, ProcessResult, ProcessRunner } from "../../../src/integrations/process-runner.js";
import { GhosttyClient } from "../../../src/integrations/ghostty/client.js";

class FakeRunner implements ProcessRunner {
  readonly requests: ProcessRequest[] = [];
  constructor(private readonly results: ProcessResult[]) {}
  async run(request: ProcessRequest): Promise<ProcessResult> {
    this.requests.push(request);
    const result = this.results.shift();
    if (!result) throw new Error("unexpected process call");
    return result;
  }
}

const identity = { adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term" };

test("client uses exact osascript argv and enriches active context", async () => {
  const runner = new FakeRunner([
    { stdout: "w\tt\tterm\n", stderr: "", exitCode: 0 },
    { stdout: "/tmp/project\n", stderr: "", exitCode: 0 },
    { stdout: "OK:term\n", stderr: "", exitCode: 0 },
    { stdout: "OK:term\n", stderr: "", exitCode: 0 },
  ]);
  const client = new GhosttyClient({ runner });
  assert.deepEqual(await client.current(), { ...identity, workingDirectory: "/tmp/project" });
  await client.setTitle(identity, "bad; $(not-shell)");
  await client.clearTitle(identity);
  assert.equal(runner.requests[0]?.command, "/usr/bin/osascript");
  assert.deepEqual(runner.requests[0]?.args.slice(-1), ["--"]);
  assert.deepEqual(runner.requests[2]?.args.slice(-3, -1), ["--", "term"]);
  assert.deepEqual(runner.requests[3]?.args.slice(-2), ["--", "term"]);
  assert.equal(runner.requests[2]?.args.at(-2), "term");
  assert.equal(runner.requests[2]?.args.includes("bad; $(not-shell)"), true);
  assert.match(runner.requests[2]?.args[1] ?? "", /perform action .* on term/u);
  assert.match(runner.requests[3]?.args[1] ?? "", /perform action .* on term/u);
});

test("client maps permission failures without exposing script details", async () => {
  const runner = new FakeRunner([{ stdout: "", stderr: "Not authorized to send Apple events", exitCode: 1 }]);
  await assert.rejects(new GhosttyClient({ runner }).hierarchy(), (error: unknown) => {
    return typeof error === "object" && error !== null && "ghosttyCode" in error && error.ghosttyCode === "GHOSTTY_PERMISSION_DENIED";
  });
});

test("client obtains the dual-view snapshot in one shell-free request", async () => {
  const runner = new FakeRunner([{ stdout: "VISIBLE\tw\tt\tterm\nENUMERABLE\tterm\n", stderr: "", exitCode: 0 }]);
  const snapshot = await new GhosttyClient({ runner }).snapshot();
  assert.deepEqual(snapshot.enumerableTerminalIds, ["term"]);
  assert.equal(snapshot.visible[0]?.terminalId, "term");
  assert.equal(runner.requests.length, 1);
  assert.equal(runner.requests[0]?.command, "/usr/bin/osascript");
  assert.equal(runner.requests[0]?.args.includes("--"), true);
});

test("client reports only exact frontmost focus evidence", async () => {
  const runner = new FakeRunner([
    { stdout: "AGENT_BOARD_NOT_FRONTMOST\n", stderr: "", exitCode: 0 },
    { stdout: "FRONTMOST\tw	t\tterm\n", stderr: "", exitCode: 0 },
  ]);
  const client = new GhosttyClient({ runner });
  assert.equal(await client.focused(), null);
  assert.deepEqual(await client.focused(), identity);
  assert.equal(runner.requests[0]?.args.includes("AGENT_BOARD_NOT_FRONTMOST"), false);
});
