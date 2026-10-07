import { observeAgent } from "./observe-agent.js";
import { observeManagedCodex } from "./observe-managed-codex.js";
import { reconcileSession } from "./reconcile-session.js";
import { watchCompletionFocus } from "./watch-completion-focus.js";
import type { RegisterSessionResult } from "./register-session.js";
import type { Clock, FocusedTerminalPort, LauncherLivenessPort, ReconciliationTerminalPort, SessionStore } from "../domain/ports.js";
import type { CodexProcessHost, ManagedChild, ProcessExit, StartedAppServer } from "../integrations/codex/process.js";
import type { ThreadBindingClient } from "../integrations/codex/thread-binding.js";
import { AgentBoardError } from "../domain/errors.js";

export interface ManagedLaunchDependencies {
  readonly register: () => Promise<RegisterSessionResult>;
  readonly processes: Pick<CodexProcessHost, "version" | "startAppServer" | "startRemoteTui" | "stop">;
  readonly connectClient: (endpoint: StartedAppServer["endpoint"]) => Promise<ManagedClient>;
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort & FocusedTerminalPort;
  readonly launcher: LauncherLivenessPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
  readonly bindTimeoutMs: number;
  readonly focusPollIntervalMs: number;
}

export interface ManagedClient extends ThreadBindingClient {
  initialize(clientInfo: { name: string; version: string }): Promise<void>;
  close(): Promise<void>;
}

export interface ManagedLaunchResult {
  readonly sessionId: string;
  readonly exitCode: number;
  readonly outcome: "clean" | "failed" | "terminated";
}

type Outcome = ManagedLaunchResult["outcome"];

function timestamp(clock: Clock): string { return clock.now().toISOString(); }

async function bestEffortReconcile(dependencies: ManagedLaunchDependencies, sessionId: string): Promise<void> {
  try {
    await reconcileSession({
      store: dependencies.store,
      terminal: dependencies.terminal,
      launcher: dependencies.launcher,
      clock: dependencies.clock,
      workingFreshForMs: dependencies.workingFreshForMs,
    }, sessionId);
  } catch {
    // A missing/closed Ghostty target is already represented by reconciliation
    // diagnostics; it must not turn a healthy Codex lifecycle into a crash.
  }
}

function failureDetail(error: unknown): string {
  const value = error instanceof Error ? error.message : String(error);
  return value.length > 500 ? `${value.slice(0, 497)}...` : value;
}

async function markOutcome(
  dependencies: ManagedLaunchDependencies,
  sessionId: string,
  outcome: Outcome,
  tuiExit?: ProcessExit,
  cause?: unknown,
): Promise<void> {
  const observedAt = timestamp(dependencies.clock);
  if (outcome === "clean") {
    await observeAgent(dependencies.store, {
      sessionId,
      transition: { type: "process-exit", exitCode: 0, observedAt, evidenceKind: "codex.process-exit", confidence: "authoritative", detail: "Codex remote TUI exited cleanly" },
    });
  } else if (outcome === "terminated") {
    await observeAgent(dependencies.store, {
      sessionId,
      transition: { type: "interrupted", observedAt, evidenceKind: "codex.launcher.interrupted", confidence: "authoritative", detail: "Agent Board launcher was terminated" },
    });
  } else if (tuiExit !== undefined) {
    // Process exit is the authoritative evidence for a TUI-owned failure.
    await observeAgent(dependencies.store, {
      sessionId,
      transition: { type: "process-exit", exitCode: tuiExit.signal === null ? tuiExit.exitCode : null, observedAt, evidenceKind: "codex.process-exit", confidence: "authoritative", detail: failureDetail(cause ?? `Codex remote TUI exited with ${tuiExit.signal ?? tuiExit.exitCode ?? "unknown"}`) },
    });
  } else {
    await observeAgent(dependencies.store, {
      sessionId,
      transition: { type: "error", observedAt, evidenceKind: "codex.launcher.failure", confidence: "corroborated", detail: failureDetail(cause ?? "Codex managed lifecycle failed") },
    });
  }
  await dependencies.store.mutate(sessionId, (current) => {
    const { launcherPid: _launcherPid, ...agent } = current.agent;
    return { ...current, agent };
  });
  await bestEffortReconcile(dependencies, sessionId);
}

async function safeClose(client: ManagedClient | undefined): Promise<void> {
  if (client === undefined) return;
  try { await client.close(); } catch { /* cleanup must not mask the first outcome */ }
}

export async function launchManagedCodex(
  dependencies: ManagedLaunchDependencies,
  forwardedArgs: readonly string[],
  signal: AbortSignal,
): Promise<ManagedLaunchResult> {
  const registered = await dependencies.register();
  const sessionId = registered.record.sessionId;
  let appServer: StartedAppServer | undefined;
  let tui: ManagedChild | undefined;
  let client: ManagedClient | undefined;
  let focusController: AbortController | undefined;
  let observerController: AbortController | undefined;
  let observerPromise: Promise<void> | undefined;
  let focusPromise: Promise<void> | undefined;
  let outcome: Outcome | undefined;
  let primaryTuiExit: ProcessExit | undefined;
  let failureCause: unknown;
  let removeSignalAbort: (() => void) | undefined;

  try {
    await dependencies.processes.version(signal);
    appServer = await dependencies.processes.startAppServer(signal, sessionId);
    await dependencies.store.mutate(sessionId, (current) => {
      const { nativeThreadId: _previousThread, ...agent } = current.agent;
      return {
        ...current,
        agent: { ...agent, mode: "managed", launcherPid: process.pid },
      };
    });
    client = await dependencies.connectClient(appServer.endpoint);
    await client.initialize({ name: "agent-board", version: "0.1.0" });

    observerController = new AbortController();
    const reconcile = async (): Promise<void> => { await bestEffortReconcile(dependencies, sessionId); };
    observerPromise = observeManagedCodex({
      client,
      store: dependencies.store,
      clock: dependencies.clock,
      bindTimeoutMs: dependencies.bindTimeoutMs,
      onRecord: async () => { await reconcile(); },
    }, { sessionId, expectedWorkingDirectory: registered.record.identity.repoPath }, observerController.signal);
    const observerRace = observerPromise.then(
      () => ({ kind: "observer" as const }),
      (error) => ({ kind: "failure" as const, error }),
    );
    tui = await dependencies.processes.startRemoteTui(appServer.endpoint, forwardedArgs, sessionId);
    focusController = new AbortController();
    focusPromise = watchCompletionFocus({
      store: dependencies.store,
      terminal: dependencies.terminal,
      clock: dependencies.clock,
      pollIntervalMs: dependencies.focusPollIntervalMs,
      onRecord: async () => { await reconcile(); },
    }, sessionId, focusController.signal);
    const focusRace = focusPromise.then(
      () => ({ kind: "focus" as const }),
      (error) => ({ kind: "failure" as const, error }),
    );

    const abortPromise = new Promise<"terminated">((resolve) => {
      if (signal.aborted) resolve("terminated");
      else {
        const onAbort = () => resolve("terminated");
        signal.addEventListener("abort", onAbort, { once: true });
        removeSignalAbort = () => signal.removeEventListener("abort", onAbort);
      }
    });
    const winner = await Promise.race([
      tui.exited.then((exit) => ({ kind: "tui" as const, exit })),
      appServer.child.exited.then((exit) => ({ kind: "server" as const, exit })),
      observerRace,
      focusRace,
      abortPromise.then((value) => ({ kind: value })),
    ]);
    if (winner.kind === "tui") {
      primaryTuiExit = winner.exit;
      outcome = winner.exit.exitCode === 0 && winner.exit.signal === null ? "clean" : "failed";
      if (outcome === "failed") failureCause = new Error(`Codex remote TUI exited with ${winner.exit.signal ?? winner.exit.exitCode ?? "unknown"}`);
    } else if (winner.kind === "terminated") {
      outcome = "terminated";
    } else {
      outcome = "failed";
      failureCause = "error" in winner ? winner.error : winner.kind === "server" ? new Error("Codex app-server exited unexpectedly") : new Error("Codex observer stopped unexpectedly");
    }
  } catch (error) {
    outcome = signal.aborted ? "terminated" : "failed";
    failureCause = error;
  } finally {
    removeSignalAbort?.();
    observerController?.abort();
    focusController?.abort();
    await safeClose(client);
    if (tui !== undefined && outcome !== "clean" && primaryTuiExit === undefined) {
      try { await dependencies.processes.stop(tui); } catch (error) { failureCause = failureCause ?? error; }
    }
    if (appServer !== undefined) {
      try { await dependencies.processes.stop(appServer.child); } catch (error) { failureCause = failureCause ?? error; }
    }
    await Promise.allSettled([observerPromise ?? Promise.resolve(), focusPromise ?? Promise.resolve()]);
  }

  const finalOutcome = outcome ?? "failed";
  try {
    await markOutcome(dependencies, sessionId, finalOutcome, primaryTuiExit, failureCause);
  } catch (reportingError) {
    const lifecycle = failureCause === undefined ? "" : ` after ${failureDetail(failureCause)}`;
    throw new AgentBoardError(
      "ADAPTER_FAILURE",
      `Managed Codex ended ${finalOutcome}${lifecycle}, but Agent Board could not persist the final outcome: ${failureDetail(reportingError)}`,
      { cause: { lifecycle: failureCause, reporting: reportingError } },
    );
  }
  return { sessionId, outcome: finalOutcome, exitCode: finalOutcome === "clean" ? 0 : finalOutcome === "terminated" ? 143 : 1 };
}
