---
source_handle: hma-android-claude-code-hooks-docs
fetched: 2026-11-10
source_url: https://code.claude.com/docs/en/hooks
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Official Claude Code hooks reference, read for the PermissionRequest and Notification events.

## Key passages

- [1] PermissionRequest "When a tool call needs a permission decision"; its decision control is hookSpecificOutput decision.behavior (allow/deny); exit code 2 is not honored and "Deny through the decision object instead".
- [2] Notification "When Claude Code sends a notification", with matcher values including permission_prompt, idle_prompt, agent_needs_input and agent_completed; Notification hooks have no decision control and are used for side effects.

## Structural notes

- Official documentation; large page, only these rows read.
