---
source_handle: hooks-lifecycle
fetched: 2026-08-14
source_url: https://learn.chatgpt.com/docs/hooks
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The hooks documentation describes lifecycle-adjacent hook events, but not a complete runtime state API. It documents `PermissionRequest` before an approval prompt, `Stop` after a turn stops, and `SessionEnd` after a session ends or remains idle for 30 minutes without being open in any connected client. It also warns that hooks are not a complete enforcement boundary because hosted tools do not route through local function hooks.

## Key passages

- [1] Lines 1270-1308: `PermissionRequest` runs when Codex is about to ask for approval; an `allow` decision can let the request proceed without surfacing the approval prompt, and if no hook decides, Codex uses the normal approval flow.
- [2] Lines 1438-1455: `Stop` runs after Codex stops processing a turn; it can continue asynchronously, and a matching `Stop` hook can influence continuation behavior.
- [3] Lines 1169-1172: `SessionEnd` runs when a session ends, including when Codex closes normally or after a conversation has been idle and not open in any connected client for 30 minutes; switching away or calling `thread/unsubscribe` does not immediately run `SessionEnd`.
- [4] Lines 1034-1035: hosted tools such as `WebSearch` do not use the local function-tool hook path and therefore do not trigger tool hooks.
- [5] Lines 1036-1038: hook paths are useful guardrails but are not a complete enforcement boundary.

## Structural notes

- Relevant sections: hook event reference and hosted-tools caveats.
- The page supports using hooks as lifecycle signals, but not as a complete detector.
