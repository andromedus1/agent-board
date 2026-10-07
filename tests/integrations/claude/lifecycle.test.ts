import assert from "node:assert/strict";
import { test } from "node:test";

import { mapClaudeHook } from "../../../src/integrations/claude/lifecycle.js";

const at = "2026-08-20T20:00:00.000Z";
const hook = (hook_event_name: string, fields: Record<string, unknown> = {}) => ({
  session_id: "claude-session",
  hook_event_name,
  transcript_path: "/private/transcript",
  cwd: "/repo",
  ...fields,
});

test("Claude hooks normalize into the shared lifecycle vocabulary", () => {
  const cases = [
    ["SessionStart", ["idle"]],
    ["UserPromptSubmit", ["input-resolved", "working"]],
    ["PermissionRequest", ["input-required"]],
    ["Elicitation", ["input-required"]],
    ["PostToolUse", ["input-resolved"]],
    ["PermissionDenied", ["input-resolved"]],
    ["ElicitationResult", ["input-resolved"]],
    ["Stop", ["input-resolved", "completed"]],
    ["StopFailure", ["input-resolved", "error"]],
    ["SessionEnd", ["session-ended"]],
  ] as const;
  for (const [event, types] of cases) {
    const result = mapClaudeHook(hook(event), at);
    assert.equal(result.nativeSessionId, "claude-session");
    assert.deepEqual(result.transitions.map((item) => item.type), types);
    assert.ok(result.transitions.every((item) => item.evidenceKind === `claude.hook.${event}`));
  }
});

test("Stop preserves working while native background work remains", () => {
  const result = mapClaudeHook(hook("Stop", { background_tasks: [{ id: "task" }] }), at);
  assert.deepEqual(result.transitions.map((item) => item.type), ["input-resolved", "working"]);
  assert.equal(result.transitions[1]?.confidence, "authoritative");
});

test("scheduled work does not masquerade as in-flight background activity", () => {
  const result = mapClaudeHook(hook("Stop", { session_crons: [{ id: "cron" }] }), at);
  assert.deepEqual(result.transitions.map((item) => item.type), ["input-resolved", "completed"]);
  assert.match(result.transitions[1]?.detail ?? "", /scheduled/u);
});

test("compaction start preserves current lifecycle while other starts can rebind", () => {
  assert.deepEqual(mapClaudeHook(hook("SessionStart", { source: "compact" }), at).transitions, []);
  assert.deepEqual(mapClaudeHook(hook("SessionStart", { source: "clear" }), at).transitions.map((item) => item.type), ["idle"]);
});

test("mapping does not retain prompt, tool, transcript, or failure contents", () => {
  const sensitive = "secret-prompt-token";
  const result = mapClaudeHook(hook("UserPromptSubmit", {
    prompt: sensitive,
    tool_input: { command: sensitive },
    error_details: sensitive,
  }), at);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(sensitive));
  assert.doesNotMatch(JSON.stringify(result), /transcript/);
});

test("invalid or unsupported hook envelopes fail explicitly", () => {
  assert.throws(() => mapClaudeHook({}, at), /invalid session or event/);
  assert.throws(() => mapClaudeHook(hook("UnknownEvent"), at), /invalid session or event/);
});
