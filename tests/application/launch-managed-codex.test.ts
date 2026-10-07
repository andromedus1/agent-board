import assert from "node:assert/strict";
import { test } from "node:test";

import { launchManagedCodex, type ManagedClient, type ManagedLaunchDependencies } from "../../src/application/launch-managed-codex.js";
import { AgentBoardError } from "../../src/domain/errors.js";
import type { SessionStore } from "../../src/domain/ports.js";
import type { SessionRecord } from "../../src/domain/session.js";
import type { CodexNotification } from "../../src/integrations/codex/protocol.js";
import type { ManagedChild, ProcessExit } from "../../src/integrations/codex/process.js";

const at = "2026-08-14T18:00:00Z";
const terminalIdentity = { adapter: "ghostty" as const, windowId: "w", tabId: "t", terminalId: "term" };

function record(): SessionRecord {
  return {
    schemaVersion: 1, revision: 0, sessionId: "session-1",
    identity: { projectLabel: "board", repoPath: "/repo", createdAt: at },
    terminal: { ...terminalIdentity, presence: "visible", observedAt: at },
    agent: { adapter: "codex", mode: "ordinary", activity: "idle", attention: "none", health: "live", observedAt: at, evidenceKind: "registration", confidence: "inferred" },
  };
}

function memoryStore(initial: SessionRecord): { store: SessionStore; current: () => SessionRecord } {
  let current = initial;
  return {
    current: () => current,
    store: {
      async get() { return current; },
      async list() { return [current]; },
      async create(value) { current = value; return current; },
      async mutate(_id, mutation) { current = { ...mutation(current), revision: current.revision + 1 }; return current; },
      async remove() {},
    },
  };
}

function deferred<T>(): { promise: Promise<T>; resolve(value: T): void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function child(pid: number, exit: Promise<ProcessExit>, processGroup: boolean): ManagedChild {
  return { pid, processGroup, exited: exit, diagnosticTail: () => "" };
}

function client(events: string[]): ManagedClient {
  return {
    async initialize() { events.push("initialize"); },
    async loadedThreads() {
      events.push("list");
      return { data: [{ id: "root", cwd: "/repo", parentThreadId: null, status: { type: "idle" as const } }] };
    },
    notifications(signal) {
      events.push("subscribe");
      return {
        [Symbol.asyncIterator]() {
          return {
            next: () => new Promise<IteratorResult<CodexNotification>>((resolve, reject) => {
              if (signal?.aborted) { reject(new Error("aborted")); return; }
              signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
              void resolve;
            }),
          };
        },
      };
    },
    async close() { events.push("close-client"); },
  };
}

function dependencies(
  serverExit: Promise<ProcessExit>,
  tuiExit: Promise<ProcessExit>,
  stoppedExit: ProcessExit,
): { dependencies: ManagedLaunchDependencies; current: () => SessionRecord; events: string[]; stopped: number[] } {
  const state = memoryStore(record());
  const events: string[] = [];
  const stopped: number[] = [];
  const server = child(10, serverExit, true);
  const tui = child(11, tuiExit, false);
  const managedClient = client(events);
  return {
    current: state.current,
    events,
    stopped,
    dependencies: {
      register: async () => ({ record: state.current(), created: true }),
      processes: {
        async version() { events.push("version"); return "0.147.0"; },
        async startAppServer(_signal, sessionId) { events.push(`start-server:${sessionId ?? "missing"}`); return { child: server, endpoint: { websocketUrl: new URL("ws://127.0.0.1:45") } }; },
        async startRemoteTui(_endpoint, _args, sessionId) { events.push(`start-tui:${sessionId ?? "missing"}`); return tui; },
        async stop(value) { stopped.push(value.pid); events.push(`stop-${value.pid}`); return stoppedExit; },
      },
      connectClient: async () => { events.push("connect"); return managedClient; },
      store: state.store,
      terminal: {
        async focused() { return null; },
        async snapshot() { return { visible: [terminalIdentity], enumerableTerminalIds: [terminalIdentity.terminalId] }; },
        async setTitle() {},
        async clearTitle() {},
      },
      launcher: { isAlive: async () => true },
      clock: { now: () => new Date(at) },
      workingFreshForMs: 60_000,
      bindTimeoutMs: 100,
      focusPollIntervalMs: 10,
    },
  };
}

type LaunchFixture = ReturnType<typeof dependencies>;

const postServerStartupFailures: readonly {
  readonly name: string;
  readonly configure: (fixture: LaunchFixture) => void;
  readonly stopped: readonly number[];
  readonly clientCloses: number;
  readonly detail: string;
}[] = [
  {
    name: "connect",
    configure: (fixture) => {
      fixture.dependencies = {
        ...fixture.dependencies,
        connectClient: async () => { throw new Error("connect failed"); },
      };
    },
    stopped: [10],
    clientCloses: 0,
    detail: "connect failed",
  },
  {
    name: "initialize",
    configure: (fixture) => {
      const connect = fixture.dependencies.connectClient;
      fixture.dependencies = {
        ...fixture.dependencies,
        connectClient: async (endpoint: Parameters<typeof connect>[0]) => {
        const connected = await connect(endpoint);
        return {
          ...connected,
          initialize: async () => { fixture.events.push("initialize"); throw new Error("initialize failed"); },
        };
        },
      };
    },
    stopped: [10],
    clientCloses: 1,
    detail: "initialize failed",
  },
  {
    name: "observer start",
    configure: (fixture) => {
      const connect = fixture.dependencies.connectClient;
      fixture.dependencies = {
        ...fixture.dependencies,
        connectClient: async (endpoint: Parameters<typeof connect>[0]) => {
        const connected = await connect(endpoint);
        return {
          ...connected,
          loadedThreads: async () => { fixture.events.push("list"); throw new Error("observer start failed"); },
        };
        },
      };
    },
    stopped: [11, 10],
    clientCloses: 1,
    detail: "Codex root-thread binding failed",
  },
  {
    name: "TUI start",
    configure: (fixture) => {
      fixture.dependencies.processes.startRemoteTui = async () => {
        fixture.events.push("start-tui");
        throw new Error("TUI start failed");
      };
    },
    stopped: [10],
    clientCloses: 1,
    detail: "TUI start failed",
  },
];

for (const scenario of postServerStartupFailures) {
  test(`managed launch cleans ${scenario.name} failure exactly once`, async () => {
    const never = deferred<ProcessExit>();
    const fixture = dependencies(never.promise, never.promise, { exitCode: null, signal: "SIGTERM" });
    scenario.configure(fixture);

    const result = await launchManagedCodex(fixture.dependencies, [], new AbortController().signal);

    assert.deepEqual(result, { sessionId: "session-1", outcome: "failed", exitCode: 1 });
    assert.deepEqual(fixture.stopped, scenario.stopped);
    assert.equal(fixture.events.filter((event) => event === "close-client").length, scenario.clientCloses);
    assert.equal(fixture.current().agent.launcherPid, undefined);
    assert.equal(fixture.current().agent.health, "error");
    assert.equal(fixture.current().agent.evidenceKind, "codex.launcher.failure");
    assert.match(fixture.current().agent.detail ?? "", new RegExp(scenario.detail));
  });
}

test("managed launch subscribes before TUI spawn and records a clean TUI exit", async () => {
  const serverExit = deferred<ProcessExit>();
  const tuiExit = deferred<ProcessExit>();
  const fixture = dependencies(serverExit.promise, tuiExit.promise, { exitCode: 0, signal: null });
  const launched = launchManagedCodex(fixture.dependencies, ["--full-auto"], new AbortController().signal);
  await new Promise((resolve) => setImmediate(resolve));
  tuiExit.resolve({ exitCode: 0, signal: null });

  assert.deepEqual(await launched, { sessionId: "session-1", outcome: "clean", exitCode: 0 });
  assert.ok(fixture.events.includes("start-server:session-1"));
  assert.ok(fixture.events.indexOf("subscribe") < fixture.events.indexOf("start-tui:session-1"));
  assert.deepEqual(fixture.stopped, [10]);
  assert.equal(fixture.current().agent.activity, "idle");
  assert.equal(fixture.current().agent.health, "live");
  assert.equal(fixture.current().agent.evidenceKind, "codex.process-exit");
  assert.equal(fixture.current().agent.launcherPid, undefined);
});

test("managed relaunch replaces the previous runtime thread binding", async () => {
  const serverExit = deferred<ProcessExit>();
  const tuiExit = deferred<ProcessExit>();
  const fixture = dependencies(serverExit.promise, tuiExit.promise, { exitCode: 0, signal: null });
  await fixture.dependencies.store.mutate("session-1", (current) => ({
    ...current,
    agent: { ...current.agent, nativeThreadId: "previous-thread" },
  }));

  const launched = launchManagedCodex(fixture.dependencies, [], new AbortController().signal);
  await new Promise((resolve) => setImmediate(resolve));
  tuiExit.resolve({ exitCode: 0, signal: null });

  assert.deepEqual(await launched, { sessionId: "session-1", outcome: "clean", exitCode: 0 });
  assert.equal(fixture.current().agent.nativeThreadId, "root");
});

test("app-server failure remains launcher evidence after cleanup stops the TUI", async () => {
  const serverExit = deferred<ProcessExit>();
  const tuiExit = deferred<ProcessExit>();
  const fixture = dependencies(serverExit.promise, tuiExit.promise, { exitCode: null, signal: "SIGTERM" });
  const launched = launchManagedCodex(fixture.dependencies, [], new AbortController().signal);
  await new Promise((resolve) => setImmediate(resolve));
  serverExit.resolve({ exitCode: 1, signal: null });

  assert.deepEqual(await launched, { sessionId: "session-1", outcome: "failed", exitCode: 1 });
  assert.deepEqual(fixture.stopped, [11, 10]);
  assert.equal(fixture.current().agent.health, "error");
  assert.equal(fixture.current().agent.evidenceKind, "codex.launcher.failure");
  assert.match(fixture.current().agent.detail ?? "", /app-server exited unexpectedly/);
});

test("signal-owned TUI exit cannot be projected as a clean process exit", async () => {
  const serverExit = deferred<ProcessExit>();
  const tuiExit = deferred<ProcessExit>();
  const fixture = dependencies(serverExit.promise, tuiExit.promise, { exitCode: 0, signal: null });
  const launched = launchManagedCodex(fixture.dependencies, [], new AbortController().signal);
  await new Promise((resolve) => setImmediate(resolve));
  tuiExit.resolve({ exitCode: 0, signal: "SIGTERM" });

  assert.equal((await launched).outcome, "failed");
  assert.equal(fixture.current().agent.health, "error");
  assert.match(fixture.current().agent.detail ?? "", /SIGTERM/);
});

test("external termination records interruption and cleans both children", async () => {
  const serverExit = deferred<ProcessExit>();
  const tuiExit = deferred<ProcessExit>();
  const fixture = dependencies(serverExit.promise, tuiExit.promise, { exitCode: null, signal: "SIGTERM" });
  const controller = new AbortController();
  const launched = launchManagedCodex(fixture.dependencies, [], controller.signal);
  await new Promise((resolve) => setImmediate(resolve));
  controller.abort();

  assert.deepEqual(await launched, { sessionId: "session-1", outcome: "terminated", exitCode: 143 });
  assert.deepEqual(fixture.stopped, [11, 10]);
  assert.equal(fixture.current().agent.activity, "idle");
  assert.equal(fixture.current().agent.attention, "none");
  assert.equal(fixture.current().agent.health, "live");
  assert.equal(fixture.current().agent.evidenceKind, "codex.launcher.interrupted");
});

test("failure to persist the final outcome is raised as a bounded adapter error", async () => {
  const never = deferred<ProcessExit>();
  const fixture = dependencies(never.promise, never.promise, { exitCode: 0, signal: null });
  fixture.dependencies.processes.version = async () => { throw new Error("version probe failed"); };
  fixture.dependencies.store.mutate = async () => { throw new Error("state directory unavailable"); };

  await assert.rejects(
    launchManagedCodex(fixture.dependencies, [], new AbortController().signal),
    (error: unknown) => error instanceof AgentBoardError &&
      error.code === "ADAPTER_FAILURE" &&
      /version probe failed/.test(error.message) &&
      /state directory unavailable/.test(error.message),
  );
});
