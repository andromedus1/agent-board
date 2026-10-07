import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { AgentBoardError } from "../../src/domain/errors.js";
import { SCHEMA_VERSION, type SessionRecord } from "../../src/domain/session.js";
import { JsonSessionStore } from "../../src/infrastructure/json-session-store.js";
import { resolveStatePaths } from "../../src/infrastructure/state-paths.js";

const timestamp = "2026-08-14T18:00:00Z";

function validRecord(sessionId: string, revision = 0): SessionRecord {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision,
    sessionId,
    identity: { projectLabel: sessionId, createdAt: timestamp },
    terminal: {
      adapter: "ghostty",
      windowId: `window-${sessionId}`,
      tabId: `tab-${sessionId}`,
      terminalId: `terminal-${sessionId}`,
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

async function withStore(
  run: (store: JsonSessionStore, root: string) => Promise<void>,
  lock?: { timeoutMs?: number; staleMs?: number },
): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "agent-board-store-"));
  try {
    const paths = resolveStatePaths({ AGENT_BOARD_STATE_DIR: root, HOME: root });
    await run(new JsonSessionStore({ paths, lock }), root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("create, get, list, and remove use deterministic canonical files", async () => {
  await withStore(async (store) => {
    await store.create(validRecord("zulu"));
    await store.create(validRecord("alpha"));
    assert.deepEqual((await store.list()).map((record) => record.sessionId), ["alpha", "zulu"]);
    assert.equal((await store.get("alpha"))?.revision, 0);
    await assert.rejects(store.create(validRecord("alpha")), (error: unknown) =>
      error instanceof AgentBoardError && error.code === "CONFLICT");
    await store.remove("alpha");
    await store.remove("alpha");
    assert.equal(await store.get("alpha"), null);
  });
});

test("rejects unlistable, reserved, traversal ids and invalid starting revisions", async () => {
  await withStore(async (store) => {
    await assert.rejects(store.create(validRecord(".hidden-session")), (error: unknown) => error instanceof TypeError);
    await assert.rejects(store.create(validRecord("registry")), (error: unknown) => error instanceof TypeError);
    await assert.rejects(store.get("../escape"), (error: unknown) => error instanceof TypeError);
    await assert.rejects(store.get("."), (error: unknown) => error instanceof TypeError);
    await assert.rejects(store.create(validRecord("bad", 1)), (error: unknown) =>
      error instanceof AgentBoardError && error.code === "CONFLICT");
  });
});

test("mutations preserve identity and schema, increment revision, and release after throws", async () => {
  await withStore(async (store) => {
    await store.create(validRecord("session-1"));
    const changed = await store.mutate("session-1", (current) => ({
      ...current,
      schemaVersion: 999 as 1,
      sessionId: "redirected",
      revision: 999,
      identity: { ...current.identity, projectLabel: "renamed" },
    }));
    assert.equal(changed.sessionId, "session-1");
    assert.equal(changed.schemaVersion, SCHEMA_VERSION);
    assert.equal(changed.revision, 1);
    assert.equal(changed.identity.projectLabel, "renamed");

    await assert.rejects(
      store.mutate("session-1", () => { throw new Error("mutation failed"); }),
      /mutation failed/,
    );
    const afterThrow = await store.mutate("session-1", (current) => ({
      ...current,
      identity: { ...current.identity, projectLabel: "after-throw" },
    }));
    assert.equal(afterThrow.revision, 2);
  });
});

test("concurrent updates from separate store instances do not lose revisions", async () => {
  await withStore(async (store, root) => {
    await store.create(validRecord("session-1"));
    const paths = resolveStatePaths({ AGENT_BOARD_STATE_DIR: root, HOME: root });
    const peers = Array.from({ length: 20 }, () => new JsonSessionStore({ paths }));
    await Promise.all(peers.map((peer) => peer.mutate("session-1", (current) => ({
      ...current,
      agent: { ...current.agent, detail: `revision-${current.revision + 1}` },
    }))));
    const current = await store.get("session-1");
    assert.equal(current?.revision, 20);
  });
});

test("list validates every canonical JSON file and ignores only hidden temporary files", async () => {
  await withStore(async (store, root) => {
    await store.create(validRecord("good"));
    const sessions = join(root, "v1", "sessions");
    await writeFile(join(sessions, ".good.json.tmp"), "partial", "utf8");
    await writeFile(join(sessions, "corrupt.json"), "not-json", "utf8");
    await assert.rejects(store.list(), (error: unknown) =>
      error instanceof AgentBoardError && error.code === "INVALID_RECORD");
  });
});

test("registration lock times out within its configured bound and releases cleanly", async () => {
  await withStore(async (store, root) => {
    const paths = resolveStatePaths({ AGENT_BOARD_STATE_DIR: root, HOME: root });
    const holder = new JsonSessionStore({ paths, lock: { timeoutMs: 500, staleMs: 2_000 } });
    const contender = new JsonSessionStore({ paths, lock: { timeoutMs: 60, staleMs: 2_000 } });
    let releaseHolder: (() => void) | undefined;
    const holding = holder.withRegistrationLock(() => new Promise<void>((resolve) => {
      releaseHolder = resolve;
    }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    const started = Date.now();
    await assert.rejects(
      contender.withRegistrationLock(async () => undefined),
      (error: unknown) => error instanceof AgentBoardError && error.code === "LOCK_TIMEOUT",
    );
    assert.ok(Date.now() - started < 500);
    releaseHolder?.();
    await holding;
    await store.withRegistrationLock(async () => undefined);
  });
});

test("missing mutation target returns NOT_FOUND", async () => {
  await withStore(async (store) => {
    await assert.rejects(
      store.mutate("missing", (current) => current),
      (error: unknown) => error instanceof AgentBoardError && error.code === "NOT_FOUND",
    );
  });
});
