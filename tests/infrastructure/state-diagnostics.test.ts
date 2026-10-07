import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, symlink, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { StateDirectoryProbe } from "../../src/infrastructure/state-diagnostics.js";
import { resolveStatePaths } from "../../src/infrastructure/state-paths.js";

async function withTempRoot(run: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "agent-board-doctor-"));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("state probe creates scoped directories, preserves sessions, and removes its file", async () => {
  await withTempRoot(async (root) => {
    const paths = resolveStatePaths({ HOME: root } as NodeJS.ProcessEnv);
    const probe = new StateDirectoryProbe({ paths, id: () => "test" });
    const returned = await probe.probe();
    assert.equal(returned, paths.root);
    assert.equal((await stat(paths.root)).isDirectory(), true);
    assert.equal((await stat(paths.sessions)).isDirectory(), true);
    assert.equal((await stat(paths.locks)).isDirectory(), true);
    assert.deepEqual(await readdir(paths.root), ["locks", "sessions"]);

    const sessionPath = paths.sessionFile("session-1");
    await writeFile(sessionPath, "preserve me\n", { mode: 0o600 });
    await probe.probe();
    assert.equal(await readFile(sessionPath, "utf8"), "preserve me\n");
    assert.deepEqual(await readdir(paths.root), ["locks", "sessions"]);
  });
});

test("state probe follows the same intentional directory symlinks as the store", async () => {
  await withTempRoot(async (root) => {
    const target = join(root, "target");
    const paths = resolveStatePaths({ HOME: root } as NodeJS.ProcessEnv);
    await mkdir(target, { recursive: true });
    await mkdir(join(root, ".local", "state", "agent-board"), { recursive: true });
    await symlink(target, paths.root, "dir");
    assert.equal(await new StateDirectoryProbe({ paths, id: () => "linked" }).probe(), paths.root);
    assert.deepEqual(await readdir(target), ["locks", "sessions"]);
  });
});

test("state probe rejects an invalid non-directory root without broad cleanup", async () => {
  await withTempRoot(async (root) => {
    const paths = resolveStatePaths({ HOME: root } as NodeJS.ProcessEnv);
    await mkdir(join(root, ".local", "state", "agent-board"), { recursive: true });
    await writeFile(paths.root, "not a directory\n");
    await assert.rejects(new StateDirectoryProbe({ paths }).probe(), /not a directory/u);
    assert.equal(await readFile(paths.root, "utf8"), "not a directory\n");
  });
});
