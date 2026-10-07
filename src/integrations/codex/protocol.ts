import { z } from "zod";

import { AgentBoardError } from "../../domain/errors.js";

const idSchema = z.number().int().nonnegative().safe();
const boundedText = z.string().min(1).max(8_192);

export const JsonRpcErrorSchema = z.object({
  code: z.number().int().safe(),
  message: boundedText,
  data: z.unknown().optional(),
}).passthrough();

export const JsonRpcResponseSchema = z.object({
  id: idSchema,
  result: z.unknown().optional(),
  error: JsonRpcErrorSchema.optional(),
}).passthrough().superRefine((value, context) => {
  if (value.result !== undefined && value.error !== undefined) {
    context.addIssue({ code: "custom", message: "JSON-RPC response cannot contain result and error" });
  }
  if (value.result === undefined && value.error === undefined) {
    context.addIssue({ code: "custom", message: "JSON-RPC response requires result or error" });
  }
});

export const JsonRpcNotificationSchema = z.object({
  method: z.string().min(1).max(256),
  params: z.unknown().optional(),
}).passthrough();

const ThreadStatusSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("notLoaded") }).passthrough(),
  z.object({ type: z.literal("idle") }).passthrough(),
  z.object({ type: z.literal("systemError") }).passthrough(),
  z.object({
    type: z.literal("active"),
    activeFlags: z.array(z.enum(["waitingOnApproval", "waitingOnUserInput"])),
  }).passthrough(),
]);

export const ThreadStatusChangedParamsSchema = z.object({
  threadId: z.string().min(1),
  status: ThreadStatusSchema,
}).passthrough();

const TurnErrorSchema = z.object({
  message: boundedText.optional(),
}).passthrough();

const TurnSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["completed", "interrupted", "failed", "inProgress"]),
  durationMs: z.number().int().nonnegative().safe().nullable().optional(),
  error: TurnErrorSchema.nullable().optional(),
}).passthrough();

export const TurnCompletedParamsSchema = z.object({
  threadId: z.string().min(1),
  turn: TurnSchema,
}).passthrough();

export const LoadedThreadSchema = z.object({
  id: z.string().min(1),
  status: ThreadStatusSchema,
  cwd: z.string().min(1).optional(),
  parentThreadId: z.string().min(1).nullable().optional(),
}).passthrough();

export const ThreadLoadedListResponseSchema = z.object({
  data: z.array(z.string().min(1)),
  nextCursor: z.string().nullable().optional(),
}).passthrough();

export const ThreadReadResponseSchema = z.object({
  thread: LoadedThreadSchema,
}).passthrough();

// Enriched internal discovery result consumed by thread binding after each
// loaded thread id has been resolved through thread/read.
export const ThreadLoadedListResultSchema = z.object({
  data: z.array(LoadedThreadSchema),
}).passthrough();

export const ThreadStartedParamsSchema = z.object({
  thread: LoadedThreadSchema,
}).passthrough();

export const ThreadClosedParamsSchema = z.object({
  threadId: z.string().min(1),
}).passthrough();

export const ErrorNotificationParamsSchema = z.object({
  threadId: z.string().min(1),
  turnId: z.string().min(1),
  error: TurnErrorSchema,
  willRetry: z.boolean(),
}).passthrough();

export type JsonRpcResponse = z.infer<typeof JsonRpcResponseSchema>;
export type JsonRpcNotification = z.infer<typeof JsonRpcNotificationSchema>;
export type ThreadLoadedListResult = z.infer<typeof ThreadLoadedListResultSchema>;
export type ThreadStatusChangedParams = z.infer<typeof ThreadStatusChangedParamsSchema>;
export type TurnCompletedParams = z.infer<typeof TurnCompletedParamsSchema>;
export type ThreadStartedParams = z.infer<typeof ThreadStartedParamsSchema>;
export type ThreadClosedParams = z.infer<typeof ThreadClosedParamsSchema>;
export type ErrorNotificationParams = z.infer<typeof ErrorNotificationParamsSchema>;

export type CodexNotification =
  | { method: "thread/status/changed"; params: ThreadStatusChangedParams }
  | { method: "turn/completed"; params: TurnCompletedParams }
  | { method: "thread/started"; params: ThreadStartedParams }
  | { method: "thread/closed"; params: ThreadClosedParams }
  | { method: "error"; params: ErrorNotificationParams };

function protocolFailure(method: string, cause: unknown): AgentBoardError {
  return new AgentBoardError("ADAPTER_FAILURE", `Invalid Codex ${method} notification`, { cause });
}

export function parseNotification(method: string, params: unknown): CodexNotification | null {
  if (method === "thread/status/changed") {
    const parsed = ThreadStatusChangedParamsSchema.safeParse(params);
    if (!parsed.success) throw protocolFailure(method, parsed.error);
    return { method, params: parsed.data };
  }
  if (method === "turn/completed") {
    const parsed = TurnCompletedParamsSchema.safeParse(params);
    if (!parsed.success) throw protocolFailure(method, parsed.error);
    return { method, params: parsed.data };
  }
  if (method === "thread/started") {
    const parsed = ThreadStartedParamsSchema.safeParse(params);
    if (!parsed.success) throw protocolFailure(method, parsed.error);
    return { method, params: parsed.data };
  }
  if (method === "thread/closed") {
    const parsed = ThreadClosedParamsSchema.safeParse(params);
    if (!parsed.success) throw protocolFailure(method, parsed.error);
    return { method, params: parsed.data };
  }
  if (method === "error") {
    const parsed = ErrorNotificationParamsSchema.safeParse(params);
    if (!parsed.success) throw protocolFailure(method, parsed.error);
    return { method, params: parsed.data };
  }
  return null;
}
