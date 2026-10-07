import { AgentBoardError } from "../../domain/errors.js";
import {
  parseAgentTransition,
  type AgentTransition,
} from "../../domain/transitions.js";
import type { Observation } from "../../domain/session.js";
import type {
  CodexNotification,
  ThreadLoadedListResult,
} from "./protocol.js";

type ThreadStatus = ThreadLoadedListResult["data"][number]["status"];
type StatusType = ThreadStatus["type"];

export interface CodexLifecycleContext {
  readonly threadId: string;
  readonly previousStatus?: StatusType;
  readonly waiting: boolean;
}

export interface CodexLifecycleMapping {
  readonly transition?: AgentTransition;
  readonly nextStatus?: StatusType;
  readonly waiting: boolean;
}

function failure(message: string, cause?: unknown): AgentBoardError {
  return new AgentBoardError("ADAPTER_FAILURE", message, { cause });
}

function evidence(
  observedAt: string,
  evidenceKind: string,
  confidence: Observation["confidence"],
  detail?: string,
): Observation {
  return { observedAt, evidenceKind, confidence, ...(detail === undefined ? {} : { detail }) };
}

function transition(input: AgentTransition): AgentTransition {
  // Keep the mapper boundary honest when called directly by an adapter or test.
  return parseAgentTransition(input);
}

function result(nextStatus: StatusType, waiting: boolean, next?: AgentTransition): CodexLifecycleMapping {
  return { ...(next === undefined ? {} : { transition: next }), nextStatus, waiting };
}

function statusTransition(
  status: ThreadStatus,
  observedAt: string,
  confidence: Observation["confidence"],
  detailPrefix: string,
): CodexLifecycleMapping {
  const kind = `${detailPrefix}.${status.type}`;
  switch (status.type) {
    case "notLoaded":
      throw failure("Codex root thread is not loaded");
    case "idle":
      return result("idle", false, transition({ type: "idle", ...evidence(observedAt, kind, confidence) }));
    case "systemError":
      return result("systemError", false, transition({
        type: "error", ...evidence(observedAt, kind, "authoritative", "Codex reported a system error"),
      }));
    case "active": {
      const waiting = status.activeFlags.length > 0;
      return result("active", waiting, transition({
        type: waiting ? "input-required" : "working",
        ...evidence(observedAt, kind, confidence, waiting ? "Codex is waiting for user input" : undefined),
      }));
    }
  }
}

export function mapInitialCodexStatus(
  status: ThreadStatus,
  observation: Observation,
): CodexLifecycleMapping {
  return statusTransition(status, observation.observedAt, observation.confidence, observation.evidenceKind);
}

function foreign(notification: CodexNotification, context: CodexLifecycleContext): boolean {
  switch (notification.method) {
    case "thread/status/changed": return notification.params.threadId !== context.threadId;
    case "turn/completed": return notification.params.threadId !== context.threadId;
    case "thread/started": return notification.params.thread.id !== context.threadId;
    case "thread/closed": return notification.params.threadId !== context.threadId;
    case "error": return notification.params.threadId !== context.threadId;
  }
}

export function mapCodexNotification(
  notification: CodexNotification,
  context: CodexLifecycleContext,
  observedAt: string,
): CodexLifecycleMapping {
  if (foreign(notification, context)) {
    return { waiting: context.waiting, ...(context.previousStatus === undefined ? {} : { nextStatus: context.previousStatus }) };
  }

  switch (notification.method) {
    case "thread/started":
      return statusTransition(notification.params.thread.status, observedAt, "authoritative", "codex.thread.started.status");
    case "thread/status/changed": {
      const status = notification.params.status;
      if (status.type === "notLoaded") throw failure("Codex emitted an invalid notLoaded status for the bound thread");
      if (status.type === "systemError") {
        return result("systemError", false, transition({
          type: "error", ...evidence(observedAt, "codex.thread.status.changed.systemError", "authoritative", "Codex reported a system error"),
        }));
      }
      if (status.type === "active") {
        const waiting = status.activeFlags.length > 0;
        if (waiting) return result("active", true, transition({
          type: "input-required",
          ...evidence(observedAt, "codex.thread.status.changed.active.waiting", "authoritative", "Codex is waiting for user input"),
        }));
        return result("active", false, transition({
          type: context.waiting ? "input-resolved" : "working",
          ...evidence(observedAt, "codex.thread.status.changed.active", "authoritative"),
        }));
      }
      if (context.previousStatus === "active") {
        return result("idle", false, transition({
          type: "completed",
          ...evidence(observedAt, "codex.thread.status.changed.active-to-idle", "corroborated", "Codex active-to-idle edge; detailed turn outcome unavailable"),
        }));
      }
      return result("idle", false, transition({
        type: "idle", ...evidence(observedAt, "codex.thread.status.changed.idle", "authoritative"),
      }));
    }
    case "turn/completed": {
      const turn = notification.params.turn;
      if (turn.status === "inProgress") throw failure("Codex emitted inProgress as a completed turn outcome");
      const kind = `codex.turn.completed.${turn.status}`;
      if (turn.status === "completed") return result("idle", false, transition({
        type: "completed", ...evidence(observedAt, kind, "authoritative", "Codex turn completed"),
      }));
      if (turn.status === "interrupted") return result("idle", false, transition({
        type: "interrupted", ...evidence(observedAt, kind, "authoritative", "Codex turn interrupted"),
      }));
      return result("systemError", false, transition({
        type: "error", ...evidence(observedAt, kind, "authoritative", "Codex turn failed"),
      }));
    }
    case "error":
      if (notification.params.willRetry) {
        return { waiting: context.waiting, ...(context.previousStatus === undefined ? {} : { nextStatus: context.previousStatus }) };
      }
      return result(context.previousStatus ?? "systemError", context.waiting, transition({
        type: "error", ...evidence(observedAt, "codex.error.non-retryable", "authoritative", "Codex reported a non-retryable error"),
      }));
    case "thread/closed":
      return result("systemError", false, transition({
        type: "error", ...evidence(observedAt, "codex.thread.closed", "corroborated", "Bound Codex thread closed unexpectedly"),
      }));
  }
}
