import assert from "node:assert/strict";
import test from "node:test";

import { promptRenameSession } from "../../src/application/prompt-rename-session.js";
import { AgentBoardError } from "../../src/domain/errors.js";
import type { SessionMutation, SessionStore } from "../../src/domain/ports.js";
import type { SessionRecord, TerminalIdentity } from "../../src/domain/session.js";

const NOW = "2026-08-15T12:00:00.000Z";
const IDENTITY: TerminalIdentity = { adapter: "ghostty", windowId: "window-1", tabId: "tab-1", terminalId: "term-1" };

function record(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    schemaVersion: 1,
    revision: 2,
    sessionId: "session-1",
    identity: { projectLabel: "agent-board", createdAt: NOW },
    terminal: { ...IDENTITY, presence: "visible", observedAt: NOW },
    agent: {
      adapter: "codex",
      mode: "managed",
      activity: "working",
      attention: "none",
      health: "live",
      observedAt: NOW,
      evidenceKind: "thread/active",
      confidence: "authoritative",
    },
    ...overrides,
  };
}

class MemoryStore implements SessionStore {
  current: SessionRecord | null;
  mutateCalls = 0;
  constructor(initial: SessionRecord | null) { this.current = initial; }
  async get(sessionId: string) { return this.current?.sessionId === sessionId ? this.current : null; }
  async list() { return this.current === null ? [] : [this.current]; }
  async create(value: SessionRecord) { this.current = value; return value; }
  async mutate(sessionId: string, mutation: SessionMutation) {
    this.mutateCalls += 1;
    const current = await this.get(sessionId);
    if (!current) throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);
    this.current = { ...mutation(current), revision: current.revision + 1 };
    return this.current;
  }
  async remove() { this.current = null; }
}

function dependencies(store: MemoryStore, prompt: (label: string) => Promise<string | null>) {
  const events: string[] = [];
  const titles: string[] = [];
  return {
    events,
    titles,
    value: {
      store,
      terminal: {
        async focused() { events.push("focused"); return IDENTITY; },
        async setTitle(_identity: TerminalIdentity, title: string) { events.push("title"); titles.push(title); },
      },
      prompt: { async prompt(label: string) { events.push("prompt"); return prompt(label); } },
      clock: { now: () => new Date(NOW) },
      workingFreshForMs: 60_000,
    },
  };
}

test("prompt rename captures focus before prompting and preserves current agent state", async () => {
  const store = new MemoryStore(record());
  const setup = dependencies(store, async (label) => {
    assert.equal(label, "agent-board");
    return "data-platform";
  });

  const result = await promptRenameSession(setup.value);
  assert.equal(result.status, "renamed");
  assert.deepEqual(setup.events, ["focused", "prompt", "title"]);
  assert.deepEqual(setup.titles, ["● data-platform"]);
  assert.equal(store.current?.identity.projectLabel, "data-platform");
  assert.equal(store.current?.agent.activity, "working");
  assert.equal(store.current?.revision, 3);
});

test("prompt cancellation is a successful no-op", async () => {
  const store = new MemoryStore(record());
  const setup = dependencies(store, async () => null);
  assert.deepEqual(await promptRenameSession(setup.value), { status: "cancelled" });
  assert.equal(store.mutateCalls, 0);
  assert.deepEqual(setup.titles, []);
});

test("prompt rename does not treat a persisted launcher PID as verified liveness", async () => {
  const store = new MemoryStore(record({
    agent: {
      ...record().agent,
      launcherPid: 999_999,
      observedAt: "2026-08-15T10:00:00.000Z",
    },
  }));
  const setup = dependencies(store, async () => "renamed");

  const result = await promptRenameSession(setup.value);

  assert.equal(result.status, "renamed");
  assert.deepEqual(setup.titles, ["? renamed"]);
});

test("invalid labels fail before persistence and title output", async () => {
  const store = new MemoryStore(record());
  const setup = dependencies(store, async () => "bad\nlabel");
  await assert.rejects(promptRenameSession(setup.value), (error: unknown) => {
    return error instanceof AgentBoardError && error.code === "INVALID_LABEL";
  });
  assert.equal(store.mutateCalls, 0);
  assert.deepEqual(setup.titles, []);
});

test("a changed durable terminal identity cannot redirect the rename", async () => {
  const store = new MemoryStore(record());
  const setup = dependencies(store, async () => {
    store.current = record({ terminal: { ...record().terminal, terminalId: "term-replaced" } });
    return "new-name";
  });
  await assert.rejects(promptRenameSession(setup.value), (error: unknown) => {
    return error instanceof AgentBoardError && error.code === "CONFLICT";
  });
  assert.deepEqual(setup.titles, []);
});
