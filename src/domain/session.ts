import { z } from "zod";

import { AgentBoardError } from "./errors.js";
import {
  ACTIVITIES,
  AGENT_ADAPTERS,
  AGENT_MODES,
  ATTENTIONS,
  CONFIDENCE_LEVELS,
  HEALTH_STATES,
  TERMINAL_PRESENCES,
} from "./registries.js";

export const SCHEMA_VERSION = 1 as const;

const nonEmptyString = z.string().min(1);

// RFC 3339 timestamps are deliberately kept as strings at the domain boundary:
// they remain portable in JSON and retain the producer's precision and offset.
const RFC3339_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/;
function isRfc3339Timestamp(value: string): boolean {
  const match = RFC3339_TIMESTAMP.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[8] ? Number(match[8]) : 0;
  const offsetMinute = match[9] ? Number(match[9]) : 0;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return (
    month >= 1 && month <= 12 &&
    day >= 1 && day <= daysInMonth &&
    hour <= 23 && minute <= 59 && second <= 59 &&
    offsetHour <= 23 && offsetMinute <= 59 &&
    Number.isFinite(Date.parse(value))
  );
}
const rfc3339Timestamp = z.string().refine(
  isRfc3339Timestamp,
  { message: "must be an RFC3339 timestamp" },
);

const unsafeLabelCharacters = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u;
const terminalSafeDetail = z.string().min(1).refine(
  (value) => !unsafeLabelCharacters.test(value),
  { message: "contains terminal-unsafe control characters" },
);
export const ProjectLabelSchema = z.string().superRefine((value, context) => {
  if (value.trim().length === 0) {
    context.addIssue({ code: "custom", message: "must not be empty or whitespace-only" });
  }
  if (unsafeLabelCharacters.test(value)) {
    context.addIssue({ code: "custom", message: "contains terminal-unsafe control characters" });
  }
});

export const ObservationSchema = z
  .object({
    observedAt: rfc3339Timestamp,
    evidenceKind: nonEmptyString,
    confidence: z.enum(CONFIDENCE_LEVELS),
    detail: terminalSafeDetail.optional(),
  })
  .strict();

export const TerminalIdentitySchema = z
  .object({
    adapter: z.literal("ghostty"),
    windowId: nonEmptyString,
    tabId: nonEmptyString,
    terminalId: nonEmptyString,
  })
  .strict();

export const TerminalObservationSchema = TerminalIdentitySchema.extend({
  presence: z.enum(TERMINAL_PRESENCES),
  observedAt: rfc3339Timestamp,
}).strict();

export const SessionIdentitySchema = z
  .object({
    projectLabel: ProjectLabelSchema,
    repoPath: nonEmptyString.optional(),
    gitBranch: nonEmptyString.optional(),
    createdAt: rfc3339Timestamp,
  })
  .strict();

export const AgentObservationSchema = z
  .object({
    adapter: z.enum(AGENT_ADAPTERS),
    mode: z.enum(AGENT_MODES),
    nativeThreadId: nonEmptyString.optional(),
    nativeSessionId: nonEmptyString.optional(),
    launcherPid: z.number().int().nonnegative().safe().optional(),
    activity: z.enum(ACTIVITIES),
    attention: z.enum(ATTENTIONS),
    completionObservedAt: rfc3339Timestamp.optional(),
    health: z.enum(HEALTH_STATES),
    observedAt: rfc3339Timestamp,
    evidenceKind: nonEmptyString,
    confidence: z.enum(CONFIDENCE_LEVELS),
    detail: terminalSafeDetail.optional(),
  })
  .strict()
  .superRefine((agent, context) => {
    if (agent.adapter !== "codex" && agent.nativeThreadId !== undefined) {
      context.addIssue({ code: "custom", path: ["nativeThreadId"], message: "is only valid for the Codex adapter" });
    }
    if (agent.adapter !== "claude" && agent.nativeSessionId !== undefined) {
      context.addIssue({ code: "custom", path: ["nativeSessionId"], message: "is only valid for the Claude adapter" });
    }
    if (agent.attention === "completion_unread" && agent.completionObservedAt === undefined) {
      context.addIssue({
        code: "custom",
        path: ["completionObservedAt"],
        message: "is required while completion attention is unread",
      });
    }
    if (agent.attention !== "completion_unread" && agent.completionObservedAt !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["completionObservedAt"],
        message: "is only valid while completion attention is unread",
      });
    }
  });

export const SessionRecordSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    revision: z.number().int().nonnegative().safe(),
    sessionId: nonEmptyString,
    identity: SessionIdentitySchema,
    terminal: TerminalObservationSchema,
    agent: AgentObservationSchema,
  })
  .strict();

export type Observation = z.infer<typeof ObservationSchema>;
export type TerminalIdentity = z.infer<typeof TerminalIdentitySchema>;
export type TerminalObservation = z.infer<typeof TerminalObservationSchema>;
export type SessionIdentity = z.infer<typeof SessionIdentitySchema>;
export type AgentObservation = z.infer<typeof AgentObservationSchema>;
export type SessionRecord = z.infer<typeof SessionRecordSchema>;

function formatValidationMessage(prefix: string, error: z.ZodError): string {
  const issue = error.issues[0];
  const location = issue?.path.length ? ` at ${issue.path.join(".")}` : "";
  return `${prefix}${location}: ${issue?.message ?? "invalid value"}`;
}

export function parseProjectLabel(input: unknown): string {
  const result = ProjectLabelSchema.safeParse(input);
  if (!result.success) {
    throw new AgentBoardError(
      "INVALID_LABEL",
      formatValidationMessage("Invalid project label", result.error),
      { cause: result.error },
    );
  }
  return result.data;
}

export function parseSessionRecord(input: unknown): SessionRecord {
  if (
    typeof input === "object" &&
    input !== null &&
    "schemaVersion" in input &&
    (input as { schemaVersion?: unknown }).schemaVersion !== SCHEMA_VERSION
  ) {
    throw new AgentBoardError("UNSUPPORTED_SCHEMA", "Unsupported session record schema version", {
      cause: (input as { schemaVersion?: unknown }).schemaVersion,
    });
  }

  const result = SessionRecordSchema.safeParse(input);
  if (!result.success) {
    throw new AgentBoardError(
      "INVALID_RECORD",
      formatValidationMessage("Invalid session record", result.error),
      { cause: result.error },
    );
  }
  return result.data;
}
