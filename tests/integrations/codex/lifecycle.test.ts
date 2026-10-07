import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentBoardError } from "../../../src/domain/errors.js";
import { mapCodexNotification, mapInitialCodexStatus } from "../../../src/integrations/codex/lifecycle.js";

const at = "2026-08-14T18:00:00Z";
const context = { threadId: "root", waiting: false, previousStatus: "active" as const };
const status = (type: "idle" | "systemError" | "active", activeFlags: ("waitingOnApproval" | "waitingOnUserInput")[] = []) => type === "active" ? { type, activeFlags } : { type };

test("maps initial statuses and both Codex wait flags", () => {
  assert.equal(mapInitialCodexStatus(status("idle"), { observedAt: at, evidenceKind: "initial", confidence: "authoritative" }).transition?.type, "idle");
  const approval = mapCodexNotification({ method: "thread/status/changed", params: { threadId: "root", status: status("active", ["waitingOnApproval"]) } }, { ...context, previousStatus: "idle" }, at);
  assert.equal(approval.transition?.type, "input-required");
  const question = mapCodexNotification({ method: "thread/status/changed", params: { threadId: "root", status: status("active", ["waitingOnUserInput"]) } }, { ...context, previousStatus: "idle" }, at);
  assert.equal(question.transition?.type, "input-required");
});

test("maps wait resolution, corroborated active-to-idle, and authoritative outcomes", () => {
  const resolved = mapCodexNotification({ method: "thread/status/changed", params: { threadId: "root", status: status("active") } }, { ...context, waiting: true }, at);
  assert.equal(resolved.transition?.type, "input-resolved");
  const inferred = mapCodexNotification({ method: "thread/status/changed", params: { threadId: "root", status: status("idle") } }, context, at);
  assert.equal(inferred.transition?.type, "completed");
  assert.equal(inferred.transition?.confidence, "corroborated");
  const interrupted = mapCodexNotification({ method: "turn/completed", params: { threadId: "root", turn: { id: "turn", status: "interrupted" } } }, context, at);
  assert.equal(interrupted.transition?.type, "interrupted");
  assert.equal(interrupted.transition?.confidence, "authoritative");
  const failed = mapCodexNotification({ method: "turn/completed", params: { threadId: "root", turn: { id: "turn", status: "failed", error: { message: "do not retain" } } } }, context, at);
  assert.equal(failed.transition?.type, "error");
  assert.equal(failed.transition?.detail, "Codex turn failed");
});

test("retryable errors are nonterminal while system and close errors are visible", () => {
  const retry = mapCodexNotification({ method: "error", params: { threadId: "root", turnId: "turn", error: {}, willRetry: true } }, context, at);
  assert.equal(retry.transition, undefined);
  const system = mapCodexNotification({ method: "thread/status/changed", params: { threadId: "root", status: status("systemError") } }, context, at);
  assert.equal(system.transition?.type, "error");
  const closed = mapCodexNotification({ method: "thread/closed", params: { threadId: "root" } }, context, at);
  assert.equal(closed.transition?.type, "error");
});

test("foreign notifications cannot mutate the bound lifecycle", () => {
  const mapped = mapCodexNotification({ method: "turn/completed", params: { threadId: "other", turn: { id: "turn", status: "completed" } } }, context, at);
  assert.equal(mapped.transition, undefined);
  assert.equal(mapped.nextStatus, "active");
});

test("contradictory completed outcome and malformed interruption evidence fail visibly", () => {
  assert.throws(() => mapCodexNotification({ method: "turn/completed", params: { threadId: "root", turn: { id: "turn", status: "inProgress" } } }, context, at), (error: unknown) => error instanceof AgentBoardError && error.code === "ADAPTER_FAILURE");
  assert.throws(() => mapCodexNotification({ method: "turn/completed", params: { threadId: "root", turn: { id: "turn", status: "interrupted" } } }, context, "bad"), (error: unknown) => error instanceof AgentBoardError && error.code === "INVALID_RECORD");
});
