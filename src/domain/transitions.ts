import { z } from "zod";

import { AgentBoardError } from "./errors.js";
import { ObservationSchema, parseSessionRecord, type SessionRecord } from "./session.js";

const evidence = ObservationSchema;

const transitionSchemas = [
  z.object({ type: z.literal("working") }).merge(evidence).strict(),
  z.object({ type: z.literal("idle") }).merge(evidence).strict(),
  z.object({ type: z.literal("input-required") }).merge(evidence).strict(),
  z.object({ type: z.literal("input-resolved") }).merge(evidence).strict(),
  z.object({ type: z.literal("completed") }).merge(evidence).strict(),
  z.object({ type: z.literal("interrupted") }).merge(evidence).strict(),
  z.object({ type: z.literal("session-ended") }).merge(evidence).strict(),
  z.object({ type: z.literal("error") }).merge(evidence).strict(),
  z.object({
    type: z.literal("process-exit"),
    exitCode: z.number().int().nonnegative().safe().nullable(),
  }).merge(evidence).strict(),
] as const;

export const AgentTransitionSchema = z.discriminatedUnion("type", transitionSchemas);
export type AgentTransition = z.infer<typeof AgentTransitionSchema>;

function invalidTransition(error: unknown): AgentBoardError {
  return new AgentBoardError("INVALID_RECORD", "Invalid agent transition", { cause: error });
}

export function parseAgentTransition(input: unknown): AgentTransition {
  const result = AgentTransitionSchema.safeParse(input);
  if (!result.success) throw invalidTransition(result.error);
  return result.data;
}

function withEvidence(
  current: Readonly<SessionRecord>,
  transition: AgentTransition,
  fields: Partial<SessionRecord["agent"]>,
): SessionRecord {
  const {
    detail: _oldDetail,
    completionObservedAt: currentCompletionObservedAt,
    ...agentWithoutTransientFields
  } = current.agent;
  const nextAttention = fields.attention ?? current.agent.attention;
  const completionObservedAt = nextAttention === "completion_unread"
    ? fields.attention === "completion_unread"
      ? transition.observedAt
      : currentCompletionObservedAt
    : undefined;
  const detail = transition.detail ?? fields.detail;
  const nextAgent = {
    ...agentWithoutTransientFields,
    ...fields,
    observedAt: transition.observedAt,
    evidenceKind: transition.evidenceKind,
    confidence: transition.confidence,
    ...(completionObservedAt === undefined ? {} : { completionObservedAt }),
    ...(detail === undefined ? {} : { detail }),
  };
  return { ...current, agent: nextAgent };
}

/** Apply one normalized native observation without allowing it to rewrite identity. */
export function applyAgentTransition(
  current: Readonly<SessionRecord>,
  input: AgentTransition,
): SessionRecord {
  const record = parseSessionRecord(current);
  const transition = parseAgentTransition(input);

  switch (transition.type) {
    case "working":
      return withEvidence(record, transition, {
        activity: "working",
        attention: record.agent.attention === "input_required" ? "input_required" : "none",
        health: "live",
      });
    case "idle":
      return withEvidence(record, transition, { activity: "idle", health: "live" });
    case "input-required":
      return withEvidence(record, transition, {
        activity: "idle",
        attention: "input_required",
        health: "live",
      });
    case "input-resolved":
      return withEvidence(record, transition, {
        activity: "working",
        attention: record.agent.attention === "input_required" ? "none" : record.agent.attention,
        health: "live",
      });
    case "completed":
      return withEvidence(record, transition, {
        activity: "idle",
        attention: record.agent.attention === "input_required" ? "input_required" : "completion_unread",
        health: "live",
      });
    case "interrupted":
      return withEvidence(record, transition, {
        activity: "idle",
        attention: "none",
        health: "live",
      });
    case "session-ended":
      return withEvidence(record, transition, record.agent.attention === "input_required"
        ? { activity: "idle", attention: "none", health: record.agent.health }
        : { activity: "idle", health: record.agent.health });
    case "error":
      return withEvidence(record, transition, {
        activity: "idle",
        attention: record.agent.attention === "input_required" ? "input_required" : "none",
        health: "error",
      });
    case "process-exit":
      return withEvidence(record, transition, transition.exitCode === 0
        ? { activity: "idle" }
        : {
            activity: "idle",
            health: "error",
            detail: transition.exitCode === null
              ? "agent process exited without a code"
              : `agent process exited with code ${transition.exitCode}`,
          });
  }
}
