import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GhosttyAdapterError,
  ghosttyProcessError,
  parseActionEcho,
  parseActiveContext,
  parseHierarchy,
  parseGhosttySnapshot,
  parseWorkingDirectory,
} from "../../../src/integrations/ghostty/protocol.js";

test("Ghostty protocol parses strict active and hierarchy rows", () => {
  assert.deepEqual(parseActiveContext("w-1\tt-1\tterm-1\n"), {
    adapter: "ghostty", windowId: "w-1", tabId: "t-1", terminalId: "term-1",
  });
  assert.equal(parseHierarchy("w-1\tt-1\tterm-1\nw-1\tt-2\tterm-2\n").length, 2);
  assert.equal(parseHierarchy("w-1\tt-1\tterm-1\n\n").length, 1);
  assert.deepEqual(parseHierarchy(""), []);
  assert.equal(parseWorkingDirectory("/tmp/project\n"), "/tmp/project");
  assert.equal(parseWorkingDirectory("AGENT_BOARD_NO_WORKING_DIRECTORY\n"), undefined);
});

test("Ghostty protocol parses one dual-view snapshot", () => {
  assert.deepEqual(parseGhosttySnapshot("VISIBLE\tw-1\tt-1\tterm-1\nENUMERABLE\tterm-1\nENUMERABLE\tterm-hidden\n"), {
    visible: [{ adapter: "ghostty", windowId: "w-1", tabId: "t-1", terminalId: "term-1" }],
    enumerableTerminalIds: ["term-1", "term-hidden"],
  });
  assert.deepEqual(parseGhosttySnapshot("VISIBLE\tw-1\tt-1\tterm-1\nENUMERABLE\tterm-1\n\n"), {
    visible: [{ adapter: "ghostty", windowId: "w-1", tabId: "t-1", terminalId: "term-1" }],
    enumerableTerminalIds: ["term-1"],
  });
  assert.deepEqual(parseGhosttySnapshot(""), { visible: [], enumerableTerminalIds: [] });
});

test("process errors recognize straight-apostrophe application failures", () => {
  const error = ghosttyProcessError("Application isn't running", 1);
  assert.equal(error.ghosttyCode, "GHOSTTY_UNSUPPORTED");
});

test("Ghostty protocol rejects malformed, duplicate, and unsafe rows", () => {
  assert.throws(() => parseActiveContext("w\tt\n"), (error: unknown) => error instanceof GhosttyAdapterError && error.ghosttyCode === "GHOSTTY_PROTOCOL_ERROR");
  assert.throws(() => parseHierarchy("w\tt\tterm\nw\tt2\tterm\n"), /duplicate terminal ID/);
  assert.throws(() => parseHierarchy("w\tt\tterm\n\nw\tt2\tterm2\n"), /exactly 3 fields/);
  assert.throws(() => parseGhosttySnapshot("VISIBLE\tw\tt\tterm\nENUMERABLE\tother\n"), /absent from enumerable/);
  assert.throws(() => parseGhosttySnapshot("ENUMERABLE\tterm\nENUMERABLE\tterm\n"), /duplicate enumerable/);
  assert.throws(() => parseGhosttySnapshot("VISIBLE\tw\tt\tterm\nVISIBLE\tw2\tt2\tterm\nENUMERABLE\tterm\n"), /duplicate visible/);
  assert.throws(() => parseGhosttySnapshot("OTHER\tterm\n"), /unknown marker/);
});

test("title action acknowledgements distinguish target and action failures", () => {
  assert.doesNotThrow(() => parseActionEcho("OK:term-1\n", "term-1"));
  assert.throws(() => parseActionEcho("MISSING_TARGET\n", "term-1"), (error: unknown) => error instanceof GhosttyAdapterError && error.ghosttyCode === "GHOSTTY_TARGET_NOT_FOUND");
  assert.throws(() => parseActionEcho("AGENT_BOARD_ACTION_FAILED\n", "term-1"), (error: unknown) => error instanceof GhosttyAdapterError && error.ghosttyCode === "GHOSTTY_ACTION_FAILED");
  assert.throws(() => parseActionEcho("OK:other\n", "term-1"), /did not acknowledge/);
});
