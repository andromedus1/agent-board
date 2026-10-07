import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import { SCHEMA_VERSION, type SessionRecord } from "../../src/domain/session.js";
import { readSessionFile, writeSessionFileAtomic } from "../../src/infrastructure/session-files.js";

const timestamp = "2026-08-14T18:00:00Z";

function validRecord(sessionId = "session-1"): SessionRecord {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    sessionId,
    identity: { projectLabel: "agent-board", createdAt: timestamp },
    terminal: {
      adapter: "ghostty",
      windowId: "window-1",
      tabId: "tab-1",
      terminalId: "terminal-1",
      presence: "visible",
      observedAt: timestamp,
    },
    agent: {
      adapter: "codex",
      mode: "managed",
      activity: "idle",
      attention: "none",
      health: "live",
      observedAt: timestamp,
      evidenceKind: "test",
      confidence: "authoritative",
    },
  };
}

async function withTempDir(run: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "agent-board-session-files-"));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("atomic session files round-trip through a real filesystem", async () => {
  await withTempDir(async (root) => {
    const path = join(root, "sessions", "session-1.json");
    const record = validRecord();
    await writeSessionFileAtomic(path, record);
    assert.deepEqual(await readSessionFile(path), record);
  });
});

test("malformed JSON and invalid canonical records fail with INVALID_RECORD and path context", async () => {
  await withTempDir(async (root) => {
    const malformedPath = join(root, "malformed.json");
    await writeFile(malformedPath, "{not-json", "utf8");
    await assert.rejects(
      readSessionFile(malformedPath),
      (error: unknown) => error instanceof AgentBoardError &&
        error.code === "INVALID_RECORD" && error.message.includes("malformed.json"),
    );

    const invalidPath = join(root, "invalid.json");
    await writeFile(invalidPath, JSON.stringify({ ...validRecord(), revision: -1 }), "utf8");
    await assert.rejects(
      readSessionFile(invalidPath),
      (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_RECORD",
    );
  });
});

test("missing canonical files return null while temporary files remain ordinary hidden entries", async () => {
  await withTempDir(async (root) => {
    const path = join(root, "sessions", "session-1.json");
    assert.equal(await readSessionFile(path), null);
    await writeSessionFileAtomic(path, validRecord());
    await writeFile(join(root, "sessions", ".session-1.json.123.tmp"), "partial", "utf8");
    assert.deepEqual(await readSessionFile(path), validRecord());
  });
});
