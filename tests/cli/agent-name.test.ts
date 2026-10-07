import assert from "node:assert/strict";
import test from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import { runAgentName } from "../../src/cli/agent-name.js";
import type { RegisterSessionInput } from "../../src/application/register-session.js";

function streams() {
  let stdout = "";
  let stderr = "";
  return {
    get stdout() { return stdout; },
    get stderr() { return stderr; },
    output: { stdout: { write(value: string) { stdout += value; return true; } }, stderr: { write(value: string) { stderr += value; return true; } } },
  };
}

const interactive = { stdin: { isTTY: true } };

test("agent-name routes zero arguments to the prompt and rejects multiple labels", async () => {
  const output = streams();
  let calls = 0;
  const register = async () => { calls += 1; throw new Error("should not run"); };
  const promptRename = async () => ({ status: "cancelled" as const });

  assert.equal(await runAgentName([], { register, promptRename, ...interactive, ...output.output }), 0);
  assert.equal(await runAgentName(["one", "two"], { register, promptRename, ...interactive, ...output.output }), 2);
  assert.equal(calls, 0);
  assert.equal(output.stdout, "");
  assert.equal(output.stderr, "Usage: agent-name [label]\n");
});

test("agent-name writes terse success and stable typed failure output", async () => {
  const success = streams();
  const result = await runAgentName(["data platform"], {
    register: async (input) => ({
      created: true,
      record: { identity: { projectLabel: input.projectLabel ?? "" } } as never,
    }),
    promptRename: async () => ({ status: "cancelled" }),
    ...interactive,
    ...success.output,
  });
  assert.equal(result, 0);
  assert.equal(success.stdout, "Registered data platform\n");
  assert.equal(success.stderr, "");

  const failure = streams();
  assert.equal(await runAgentName(["bad"], {
    register: async () => { throw new AgentBoardError("CONFLICT", "already registered"); },
    promptRename: async () => ({ status: "cancelled" }),
    ...interactive,
    ...failure.output,
  }), 1);
  assert.equal(failure.stdout, "");
  assert.equal(failure.stderr, "CONFLICT: already registered\n");
});

test("agent-name prints prompted renames and keeps cancellation silent", async () => {
  const renamed = streams();
  assert.equal(await runAgentName([], {
    register: async () => { throw new Error("should not run"); },
    promptRename: async () => ({
      status: "renamed",
      record: { identity: { projectLabel: "acquisition" } } as never,
    }),
    ...interactive,
    ...renamed.output,
  }), 0);
  assert.equal(renamed.stdout, "Renamed acquisition\n");

  const cancelled = streams();
  assert.equal(await runAgentName([], {
    register: async () => { throw new Error("should not run"); },
    promptRename: async () => ({ status: "cancelled" }),
    ...interactive,
    ...cancelled.output,
  }), 0);
  assert.equal(cancelled.stdout, "");
  assert.equal(cancelled.stderr, "");
});

test("agent-name refuses a detached label invocation before targeting the focused tab", async () => {
  const output = streams();
  let registerCalls = 0;
  const result = await runAgentName(["wrong-tab"], {
    register: async () => { registerCalls += 1; throw new Error("must not run"); },
    promptRename: async () => ({ status: "cancelled" }),
    stdin: { isTTY: false },
    ...output.output,
  });

  assert.equal(result, 1);
  assert.equal(registerCalls, 0);
  assert.equal(output.stdout, "");
  assert.equal(output.stderr, "CONFLICT: agent-name <label> must run in the target terminal; use the managed agent or a shell prompt\n");

  const shortcut = streams();
  let promptCalls = 0;
  assert.equal(await runAgentName([], {
    register: async () => { throw new Error("must not run"); },
    promptRename: async () => { promptCalls += 1; return { status: "cancelled" }; },
    stdin: { isTTY: false },
    ...shortcut.output,
  }), 0);
  assert.equal(promptCalls, 1);
  assert.equal(shortcut.stderr, "");
});

test("agent-name uses managed session identity for a detached Codex shell command", async () => {
  const output = streams();
  let received: RegisterSessionInput | undefined;
  const result = await runAgentName(["crux-2"], {
    register: async (input) => {
      received = input;
      return {
        created: false,
        record: { identity: { projectLabel: input.projectLabel } } as never,
      };
    },
    promptRename: async () => ({ status: "cancelled" }),
    targetSessionId: "managed-session",
    stdin: { isTTY: false },
    ...output.output,
  });

  assert.equal(result, 0);
  assert.deepEqual(received, { projectLabel: "crux-2", targetSessionId: "managed-session" });
  assert.equal(output.stdout, "Renamed crux-2\n");
});
