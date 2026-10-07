import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

import { isMain } from "../../src/cli/is-main.js";

test("isMain recognizes npm-style symlinks and URL-escaped paths", () => {
  const directory = mkdtempSync(join(tmpdir(), "agent board "));
  try {
    const target = join(directory, "agents entry.js");
    const link = join(directory, "agents");
    writeFileSync(target, "");
    symlinkSync(target, link);

    assert.equal(isMain(pathToFileURL(realpathSync(target)).href, link), true);
    assert.equal(isMain(pathToFileURL(target).href, undefined), false);
    assert.equal(isMain(pathToFileURL(target).href, join(directory, "missing")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
