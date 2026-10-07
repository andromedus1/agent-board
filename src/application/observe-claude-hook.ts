import { AgentBoardError } from "../domain/errors.js";
import type { Clock, LauncherLivenessPort, ReconciliationTerminalPort, SessionStore } from "../domain/ports.js";
import { applyAgentTransition } from "../domain/transitions.js";
import type { SessionRecord } from "../domain/session.js";
import { mapClaudeHook } from "../integrations/claude/lifecycle.js";
import { reconcileSession } from "./reconcile-session.js";

export interface ObserveClaudeHookDependencies {
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort;
  readonly launcher: LauncherLivenessPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
}

export async function observeClaudeHook(
  dependencies: ObserveClaudeHookDependencies,
  sessionId: string,
  input: unknown,
): Promise<void> {
  const observation = mapClaudeHook(input, dependencies.clock.now().toISOString());
  let projectedStateChanged = true;
  await dependencies.store.mutate(sessionId, (current) => {
    if (current.agent.adapter !== "claude" || current.agent.mode !== "managed") {
      throw new AgentBoardError("CONFLICT", `Session ${sessionId} is not a managed Claude session`);
    }
    if (current.agent.nativeSessionId !== undefined && current.agent.nativeSessionId !== observation.nativeSessionId && observation.event !== "SessionStart") {
      throw new AgentBoardError("CONFLICT", `Session ${sessionId} is bound to another Claude session`);
    }
    if (
      (observation.event === "PostToolUse" || observation.event === "PostToolUseFailure") &&
      current.agent.nativeSessionId === observation.nativeSessionId &&
      current.agent.activity === "working" && current.agent.attention === "none" && current.agent.health === "live"
    ) projectedStateChanged = false;
    let next: SessionRecord = {
      ...current,
      agent: { ...current.agent, nativeSessionId: observation.nativeSessionId },
    };
    for (const transition of observation.transitions) next = applyAgentTransition(next, transition);
    return next;
  });
  if (!projectedStateChanged) return;
  await reconcileSession({
    store: dependencies.store,
    terminal: dependencies.terminal,
    launcher: dependencies.launcher,
    clock: dependencies.clock,
    workingFreshForMs: dependencies.workingFreshForMs,
  }, sessionId);
}
