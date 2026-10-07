import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("companion config releases Cmd-Shift-R from Ghostty's native title prompt", async () => {
  const config = await readFile(new URL("../../../examples/ghostty/agent-board.conf", import.meta.url), "utf8");
  const actions = config
    .split(/\r?\n/u)
    .map((line) => /^\s*keybind\s*=\s*cmd\+shift\+r\s*=\s*([^#\s]+)\s*(?:#.*)?$/u.exec(line)?.[1])
    .filter((action): action is string => action !== undefined);

  assert.deepEqual(actions, ["unbind"]);
});
