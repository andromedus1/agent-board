import { AgentBoardError } from "../domain/errors.js";
import type { Clock, FocusedTerminalPort, LauncherLivenessPort, ReconciliationTerminalPort, SessionStore } from "../domain/ports.js";
import type { ClaudeChild, ClaudeProcessExit } from "../integrations/claude/process.js";
import { observeAgent } from "./observe-agent.js";
import type { RegisterSessionResult } from "./register-session.js";
import { reconcileSession } from "./reconcile-session.js";
import { watchCompletionFocus } from "./watch-completion-focus.js";

export interface ManagedClaudeLaunchDependencies {
  readonly register: () => Promise<RegisterSessionResult>;
  readonly processes: {
    start(pluginRoot: string, args: readonly string[], sessionId: string): ClaudeChild;
    stop(child: ClaudeChild): Promise<void>;
  };
  readonly pluginRoot: string;
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort & FocusedTerminalPort;
  readonly launcher: LauncherLivenessPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
  readonly focusPollIntervalMs: number;
  readonly hookReadyTimeoutMs: number;
}

export interface ManagedClaudeLaunchResult {
  readonly sessionId: string;
  readonly exitCode: number;
  readonly outcome: "clean" | "failed" | "terminated";
}

function detail(error: unknown): string {
  const value = error instanceof Error ? error.message : String(error);
  return value.length > 500 ? `${value.slice(0, 497)}...` : value;
}

async function reconcile(dependencies: ManagedClaudeLaunchDependencies, sessionId: string): Promise<void> {
  try {
    await reconcileSession(dependencies, sessionId);
  } catch {
    // Reconciliation already preserves conservative terminal diagnostics.
  }
}

async function waitForHookEvidence(
  dependencies: ManagedClaudeLaunchDependencies,
  sessionId: string,
  child: ClaudeChild,
  signal: AbortSignal,
): Promise<void> {
  if (!Number.isSafeInteger(dependencies.hookReadyTimeoutMs) || dependencies.hookReadyTimeoutMs < 1) {
    throw new AgentBoardError("INVALID_RECORD", "Claude hook readiness timeout must be a positive safe integer");
  }
  const deadline = Date.now() + dependencies.hookReadyTimeoutMs;
  while (!signal.aborted && child.process.exitCode === null && child.process.signalCode === null && Date.now() < deadline) {
    const current = await dependencies.store.get(sessionId);
    if (current === null) throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);
    if (current.agent.nativeSessionId !== undefined && current.agent.evidenceKind.startsWith("claude.hook.")) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 25));
  }
  await dependencies.store.mutate(sessionId, (current) => {
    if (current.agent.adapter !== "claude" || current.agent.nativeSessionId !== undefined || current.agent.evidenceKind.startsWith("claude.hook.")) return current;
    return {
      ...current,
      agent: {
        ...current.agent,
        activity: "unknown",
        health: "stale",
        observedAt: dependencies.clock.now().toISOString(),
        evidenceKind: "claude.hook.unavailable",
        confidence: "corroborated",
        detail: "Claude hook observation did not become ready",
      },
    };
  });
  await reconcile(dependencies, sessionId);
}

async function markOutcome(
  dependencies: ManagedClaudeLaunchDependencies,
  sessionId: string,
  outcome: ManagedClaudeLaunchResult["outcome"],
  exit?: ClaudeProcessExit,
  cause?: unknown,
): Promise<void> {
  const observedAt = dependencies.clock.now().toISOString();
  if (outcome === "terminated") {
    await observeAgent(dependencies.store, { sessionId, transition: { type: "interrupted", observedAt, evidenceKind: "claude.launcher.interrupted", confidence: "corroborated", detail: "Agent Board launcher was terminated" } });
  } else if (outcome === "clean") {
    await observeAgent(dependencies.store, { sessionId, transition: { type: "process-exit", exitCode: 0, observedAt, evidenceKind: "claude.process-exit", confidence: "authoritative", detail: "Claude exited cleanly" } });
  } else if (exit !== undefined) {
    await observeAgent(dependencies.store, { sessionId, transition: { type: "process-exit", exitCode: exit.signal === null ? exit.exitCode : null, observedAt, evidenceKind: "claude.process-exit", confidence: "authoritative", detail: detail(cause ?? `Claude exited with ${exit.signal ?? exit.exitCode ?? "unknown"}`) } });
  } else {
    await observeAgent(dependencies.store, { sessionId, transition: { type: "error", observedAt, evidenceKind: "claude.launcher.failure", confidence: "corroborated", detail: detail(cause ?? "Claude launch failed") } });
  }
  await dependencies.store.mutate(sessionId, (current) => {
    const { launcherPid: _launcherPid, ...agent } = current.agent;
    return { ...current, agent };
  });
  await reconcile(dependencies, sessionId);
}

export async function launchManagedClaude(
  dependencies: ManagedClaudeLaunchDependencies,
  forwardedArgs: readonly string[],
  signal: AbortSignal,
): Promise<ManagedClaudeLaunchResult> {
  const registered = await dependencies.register();
  const sessionId = registered.record.sessionId;
  let child: ClaudeChild | undefined;
  let focusController: AbortController | undefined;
  let focusPromise: Promise<void> | undefined;
  let exit: ClaudeProcessExit | undefined;
  let outcome: ManagedClaudeLaunchResult["outcome"] | undefined;
  let cause: unknown;
  let removeAbort: (() => void) | undefined;
  try {
    await dependencies.store.mutate(sessionId, (current) => {
      const { nativeSessionId: _nativeSessionId, ...agent } = current.agent;
      if (agent.adapter !== "claude") throw new AgentBoardError("CONFLICT", "Claude launcher received a non-Claude session");
      return { ...current, agent: { ...agent, mode: "managed" } };
    });
    child = dependencies.processes.start(dependencies.pluginRoot, forwardedArgs, sessionId);
    await dependencies.store.mutate(sessionId, (current) => ({
      ...current,
      agent: { ...current.agent, launcherPid: child?.pid },
    }));
    await waitForHookEvidence(dependencies, sessionId, child, signal);
    focusController = new AbortController();
    focusPromise = watchCompletionFocus({
      store: dependencies.store,
      terminal: dependencies.terminal,
      clock: dependencies.clock,
      pollIntervalMs: dependencies.focusPollIntervalMs,
      onRecord: async () => reconcile(dependencies, sessionId),
    }, sessionId, focusController.signal);
    const abort = new Promise<"terminated">((resolve) => {
      if (signal.aborted) resolve("terminated");
      else {
        const listener = () => resolve("terminated");
        signal.addEventListener("abort", listener, { once: true });
        removeAbort = () => signal.removeEventListener("abort", listener);
      }
    });
    const winner = await Promise.race([
      child.exited.then((value) => ({ kind: "exit" as const, value })),
      focusPromise.then(() => ({ kind: "focus" as const }), (error) => ({ kind: "failure" as const, error })),
      abort.then(() => ({ kind: "terminated" as const })),
    ]);
    if (winner.kind === "exit") {
      exit = winner.value;
      outcome = exit.exitCode === 0 && exit.signal === null ? "clean" : "failed";
      if (outcome === "failed") cause = new Error(`Claude exited with ${exit.signal ?? exit.exitCode ?? "unknown"}`);
    } else if (winner.kind === "terminated") outcome = "terminated";
    else {
      outcome = "failed";
      cause = winner.kind === "failure" ? winner.error : new Error("Claude focus observer stopped unexpectedly");
    }
  } catch (error) {
    outcome = signal.aborted ? "terminated" : "failed";
    cause = error;
  } finally {
    removeAbort?.();
    focusController?.abort();
    if (child !== undefined && outcome !== "clean" && exit === undefined) {
      try { await dependencies.processes.stop(child); } catch (error) { cause = cause ?? error; }
    }
    await Promise.allSettled([focusPromise ?? Promise.resolve()]);
  }
  const finalOutcome = outcome ?? "failed";
  try {
    await markOutcome(dependencies, sessionId, finalOutcome, exit, cause);
  } catch (reportingError) {
    throw new AgentBoardError("ADAPTER_FAILURE", `Managed Claude ended ${finalOutcome} but outcome reporting failed: ${detail(reportingError)}`, { cause: reportingError });
  }
  return { sessionId, outcome: finalOutcome, exitCode: finalOutcome === "clean" ? 0 : finalOutcome === "terminated" ? 143 : exit?.exitCode ?? 1 };
}
