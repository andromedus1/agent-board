import { execFile, spawn } from "node:child_process";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";
import assert from "node:assert/strict";
import lockfile from "proper-lockfile";

import { withFileLock } from "../../src/infrastructure/file-lock.js";

const execFileAsync = promisify(execFile);

test("a contending process stays alive and reports the bounded lock timeout", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-board-lock-test-"));
  const anchor = join(root, "session.lock");
  await writeFile(anchor, "", "utf8");
  const release = await lockfile.lock(anchor, { realpath: false, stale: 2_000 });
  const sourceUrl = new URL("../../src/infrastructure/file-lock.ts", import.meta.url).href;
  const script = [
    `import { withFileLock } from ${JSON.stringify(sourceUrl)};`,
    `await withFileLock(${JSON.stringify(anchor)}, { timeoutMs: 100, staleMs: 2_000 }, async () => undefined);`,
  ].join("\n");

  try {
    const result: { code?: number; stdout?: string; stderr?: string } = await execFileAsync(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: process.cwd(),
      timeout: 2_000,
    }).catch((error: unknown) => error as { code?: number; stdout?: string; stderr?: string });

    assert.notEqual(result.code, undefined, "contending child unexpectedly exited successfully");
    assert.match(result.stderr ?? "", /LOCK_TIMEOUT|Timed out acquiring state lock/u);
  } finally {
    await release();
    await rm(root, { recursive: true, force: true });
  }
});

test("a crash-stale lock is taken over while a fresh heartbeat still times out", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-board-stale-lock-test-"));
  const anchor = join(root, "session.lock");
  await writeFile(anchor, "", "utf8");
  const options = { timeoutMs: 100, staleMs: 2_000 };

  const freshRelease = await lockfile.lock(anchor, { realpath: false, stale: options.staleMs });
  try {
    await assert.rejects(
      withFileLock(anchor, options, async () => "unexpectedly acquired"),
      (error: unknown) => error instanceof Error && /LOCK_TIMEOUT|Timed out acquiring state lock/u.test(error.message),
      "a live lock heartbeat must remain protected from takeover",
    );
  } finally {
    await freshRelease();
  }

  const source = [
    "import lockfile from 'proper-lockfile';",
    `const release = await lockfile.lock(${JSON.stringify(anchor)}, { realpath: false, stale: ${options.staleMs} });`,
    "process.stdout.write('ready\\n');",
    "setInterval(() => {}, 60_000);",
    "void release;",
  ].join("\n");
  const holder = spawn(process.execPath, ["--input-type=module", "--eval", source], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("stale-lock holder did not acquire its lock")), 5_000);
      holder.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString("utf8");
        if (output.includes("ready")) {
          clearTimeout(timer);
          resolve();
        }
      });
      holder.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      holder.once("exit", (code) => {
        if (!output.includes("ready")) {
          clearTimeout(timer);
          reject(new Error(`stale-lock holder exited before acquiring its lock (${code ?? "signal"})`));
        }
      });
    });
    assert.ok((await stat(`${anchor}.lock`)).isDirectory());
    holder.kill("SIGKILL");
    await new Promise<void>((resolve) => holder.once("exit", () => resolve()));

    // proper-lockfile's minimum stale interval is two seconds. Waiting past
    // that bound models a crashed process whose heartbeat can no longer move.
    await new Promise((resolve) => setTimeout(resolve, options.staleMs + 100));
    assert.equal(
      await withFileLock(anchor, { timeoutMs: 3_000, staleMs: options.staleMs }, async () => "taken over"),
      "taken over",
    );
  } finally {
    if (holder.exitCode === null && holder.signalCode === null) holder.kill("SIGKILL");
    await rm(root, { recursive: true, force: true });
  }
});
