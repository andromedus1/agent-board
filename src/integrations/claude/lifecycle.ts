import { AgentBoardError } from "../../domain/errors.js";
import type { AgentTransition } from "../../domain/transitions.js";

export const CLAUDE_HOOK_EVENTS = [
  "SessionStart", "UserPromptSubmit", "PermissionRequest", "PermissionDenied",
  "PostToolUse", "PostToolUseFailure", "Elicitation", "ElicitationResult",
  "Stop", "StopFailure", "SessionEnd",
] as const;

export type ClaudeHookEvent = (typeof CLAUDE_HOOK_EVENTS)[number];

export interface ClaudeLifecycleObservation {
  readonly nativeSessionId: string;
  readonly event: ClaudeHookEvent;
  readonly transitions: readonly AgentTransition[];
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function evidence(observedAt: string, event: ClaudeHookEvent, confidence: AgentTransition["confidence"], detail?: string) {
  return {
    observedAt,
    evidenceKind: `claude.hook.${event}`,
    confidence,
    ...(detail === undefined ? {} : { detail }),
  } as const;
}

export function mapClaudeHook(input: unknown, observedAt: string): ClaudeLifecycleObservation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new AgentBoardError("INVALID_RECORD", "Claude hook input must be an object");
  }
  const value = input as Record<string, unknown>;
  const nativeSessionId = text(value.session_id);
  const eventValue = text(value.hook_event_name);
  if (nativeSessionId === undefined || eventValue === undefined || !CLAUDE_HOOK_EVENTS.includes(eventValue as ClaudeHookEvent)) {
    throw new AgentBoardError("INVALID_RECORD", "Claude hook input has an invalid session or event");
  }
  const event = eventValue as ClaudeHookEvent;
  let transitions: readonly AgentTransition[];
  switch (event) {
    case "SessionStart":
      transitions = value.source === "compact"
        ? []
        : [{ type: "idle", ...evidence(observedAt, event, "authoritative") }];
      break;
    case "UserPromptSubmit":
      transitions = [
        { type: "input-resolved", ...evidence(observedAt, event, "corroborated") },
        { type: "working", ...evidence(observedAt, event, "corroborated", "Claude prompt submission observed; interruption is not natively observable") },
      ];
      break;
    case "PermissionRequest":
    case "Elicitation":
      transitions = [{ type: "input-required", ...evidence(observedAt, event, "authoritative") }];
      break;
    case "PermissionDenied":
    case "PostToolUse":
    case "PostToolUseFailure":
    case "ElicitationResult":
      transitions = [{ type: "input-resolved", ...evidence(observedAt, event, "authoritative") }];
      break;
    case "Stop": {
      const hasBackgroundWork = Array.isArray(value.background_tasks) && value.background_tasks.length > 0;
      const hasScheduledWork = Array.isArray(value.session_crons) && value.session_crons.length > 0;
      transitions = hasBackgroundWork
        ? [
            { type: "input-resolved", ...evidence(observedAt, event, "authoritative") },
            { type: "working", ...evidence(observedAt, event, "authoritative", "Claude response stopped with background work still active") },
          ]
        : [
            { type: "input-resolved", ...evidence(observedAt, event, "authoritative") },
            { type: "completed", ...evidence(observedAt, event, "authoritative", hasScheduledWork ? "Claude completed with scheduled session work pending" : undefined) },
          ];
      break;
    }
    case "StopFailure":
      transitions = [
        { type: "input-resolved", ...evidence(observedAt, event, "authoritative") },
        { type: "error", ...evidence(observedAt, event, "authoritative", "Claude reported a turn failure") },
      ];
      break;
    case "SessionEnd":
      transitions = [{ type: "session-ended", ...evidence(observedAt, event, "authoritative", "Claude session ended") }];
      break;
  }
  return Object.freeze({ nativeSessionId, event, transitions: Object.freeze([...transitions]) });
}
