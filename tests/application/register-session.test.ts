import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { registerSession } from "../../src/application/register-session.js";
import { AgentBoardError } from "../../src/domain/errors.js";
import type {
  Clock,
  IdGenerator,
  RegistrationStore,
  RegistrationTerminalPort,
  RepositoryContextPort,
} from "../../src/domain/ports.js";
import type { TerminalIdentity } from "../../src/domain/session.js";
import { JsonSessionStore } from "../../src/infrastructure/json-session-store.js";
import type { StatePaths } from "../../src/infrastructure/state-paths.js";

const NOW = new Date("2026-08-14T23:00:00.000Z");

function paths(root: string): StatePaths {
  return {
    root,
    sessions: join(root, "sessions"),
    locks: join(root, "locks"),
    sessionFile: (id) => join(root, "sessions", `${id}.json`),
    sessionLockAnchor: (id) => join(root, "locks", id),
    registryLockAnchor: join(root, "locks", "registry"),
  };
}

class FakeTerminal implements RegistrationTerminalPort {
  currentCalls = 0;
  readonly titles: Array<{ identity: TerminalIdentity; title: string }> = [];
  constructor(private readonly context: { adapter: "ghostty"; windowId: string; tabId: string; terminalId: string; workingDirectory?: string }, private readonly titleError?: Error) {}
  async current() {
    this.currentCalls += 1;
    return this.context;
  }
  async setTitle(identity: TerminalIdentity, title: string): Promise<void> {
    if (this.titleError) throw this.titleError;
    this.titles.push({ identity, title });
  }
}

class FakeRepositories implements RepositoryContextPort {
  calls = 0;
  constructor(private readonly context: { repoPath?: string; gitBranch?: string }) {}
  async discover() {
    this.calls += 1;
    return this.context;
  }
}

class FixedClock implements Clock {
  calls = 0;
  now() {
    this.calls += 1;
    return new Date(NOW);
  }
}

function deps(
  store: RegistrationStore,
  terminal: RegistrationTerminalPort,
  repositories: RepositoryContextPort,
  clock = new FixedClock(),
  ids: IdGenerator = { sessionId: () => "session-1" },
) {
  return { adapter: "codex" as const, store, terminal, repositories, clock, ids, workingFreshForMs: 60_000 };
}

test("registration creates an ordinary inferred session and canonical title", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-board-registration-"));
  try {
    const store = new JsonSessionStore({ paths: paths(join(root, "v1")) });
    const terminal = new FakeTerminal({ adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term", workingDirectory: "/tmp/data-platform" });
    const repositories = new FakeRepositories({ repoPath: "/Users/a/data-platform", gitBranch: "feature/x" });
    const result = await registerSession(deps(store, terminal, repositories), {});

    assert.equal(result.created, true);
    assert.equal(result.record.identity.projectLabel, "data-platform");
    assert.deepEqual(result.record.identity, {
      projectLabel: "data-platform",
      repoPath: "/Users/a/data-platform",
      gitBranch: "feature/x",
      createdAt: NOW.toISOString(),
    });
    assert.equal(result.record.agent.mode, "ordinary");
    assert.equal(result.record.agent.evidenceKind, "registration");
    assert.deepEqual(terminal.titles[0], {
      identity: { adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term" },
      title: "? data-platform",
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("invalid labels are rejected before any external call", async () => {
  let currentCalls = 0;
  let repositoryCalls = 0;
  let lockCalls = 0;
  const store: RegistrationStore = {
    async get() { throw new Error("store should not be called"); },
    async list() { throw new Error("store should not be called"); },
    async create() { throw new Error("store should not be called"); },
    async mutate() { throw new Error("store should not be called"); },
    async remove() { throw new Error("store should not be called"); },
    async withRegistrationLock() { lockCalls += 1; throw new Error("store should not be called"); },
  };
  const terminal: RegistrationTerminalPort = {
    async current() { currentCalls += 1; throw new Error("terminal should not be called"); },
    async setTitle() { throw new Error("terminal should not be called"); },
  };
  const repositories: RepositoryContextPort = {
    async discover() { repositoryCalls += 1; return {}; },
  };

  await assert.rejects(registerSession(deps(store, terminal, repositories), { projectLabel: "bad\u0000label" }), (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_LABEL");
  assert.equal(currentCalls, 0);
  assert.equal(repositoryCalls, 0);
  assert.equal(lockCalls, 0);
});

test("managed session rename uses exact identity without consulting Ghostty focus", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-board-registration-"));
  try {
    const store = new JsonSessionStore({ paths: paths(join(root, "v1")) });
    const context = { adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term", workingDirectory: "/tmp/data-platform" };
    const terminal = new FakeTerminal(context);
    const repositories = new FakeRepositories({ repoPath: "/tmp/data-platform" });
    await registerSession(deps(store, terminal, repositories), { projectLabel: "old" });
    terminal.currentCalls = 0;
    repositories.calls = 0;

    const renamed = await registerSession(deps(store, terminal, repositories), {
      projectLabel: "crux-2",
      targetSessionId: "session-1",
    });

    assert.equal(renamed.created, false);
    assert.equal(renamed.record.identity.projectLabel, "crux-2");
    assert.equal(terminal.currentCalls, 0);
    assert.equal(repositories.calls, 0);
    assert.equal(terminal.titles.at(-1)?.title, "? crux-2");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("explicit rename preserves discovered context and durable state when title fails", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-board-registration-"));
  try {
    const store = new JsonSessionStore({ paths: paths(join(root, "v1")) });
    const terminal = new FakeTerminal({ adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term", workingDirectory: "/tmp/new" }, new AgentBoardError("ADAPTER_FAILURE", "title failed"));
    const repositories = new FakeRepositories({ repoPath: "/tmp/new", gitBranch: "new" });
    const original = await registerSession(deps(store, terminal, repositories, new FixedClock(), { sessionId: () => "session-1" }), { projectLabel: "old" }).catch(() => undefined);
    // The first call intentionally fails only after persisting; verify the
    // second invocation can still mutate the same durable record.
    assert.equal(original, undefined);
    const saved = await store.get("session-1");
    assert.equal(saved?.identity.projectLabel, "old");
    assert.equal(saved?.revision, 0);
    const renamed = await store.mutate("session-1", (current) => ({ ...current, identity: { ...current.identity, projectLabel: "new" } }));
    assert.equal(renamed.identity.repoPath, "/tmp/new");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("concurrent registrations for one terminal converge on one session", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-board-registration-"));
  try {
    const state = join(root, "v1");
    const storeA = new JsonSessionStore({ paths: paths(state) });
    const storeB = new JsonSessionStore({ paths: paths(state) });
    const context = { adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term", workingDirectory: "/tmp/repo" };
    const first = registerSession(deps(storeA, new FakeTerminal(context), new FakeRepositories({ repoPath: "/tmp/repo" }), new FixedClock(), { sessionId: () => "session-a" }), { projectLabel: "one" });
    const second = registerSession(deps(storeB, new FakeTerminal(context), new FakeRepositories({ repoPath: "/tmp/repo" }), new FixedClock(), { sessionId: () => "session-b" }), { projectLabel: "two" });
    const results = await Promise.all([first, second]);
    assert.equal(new Set(results.map((result) => result.record.sessionId)).size, 1);
    assert.equal((await storeA.list()).length, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a launcher adopts an ordinary pre-named tab but not a managed provider session", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-board-registration-"));
  try {
    const store = new JsonSessionStore({ paths: paths(join(root, "v1")) });
    const terminal = new FakeTerminal({ adapter: "ghostty", windowId: "w", tabId: "t", terminalId: "term" });
    const repositories = new FakeRepositories({});
    await registerSession(deps(store, terminal, repositories), {});
    const adopted = await registerSession({ ...deps(store, terminal, repositories), adapter: "claude" }, {});
    assert.equal(adopted.created, false);
    assert.equal(adopted.record.agent.adapter, "claude");
    await store.mutate(adopted.record.sessionId, (current) => ({ ...current, agent: { ...current.agent, mode: "managed" } }));
    await assert.rejects(registerSession(deps(store, terminal, repositories), {}), (error: unknown) => error instanceof AgentBoardError && error.code === "CONFLICT");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
