---
source_handle: hma-android-codex-hooks-docs
fetched: 2026-11-10
source_url: https://learn.chatgpt.com/docs/hooks.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Official Codex hooks documentation, read for PermissionRequest.

## Key passages

- [1] "PermissionRequest runs when Codex is about to ask for approval, such as a shell escalation or managed-network approval. It can allow the request, deny the request, or decline to decide and let the normal approval prompt continue. It doesn't run for commands that don't need approval."
- [2] "allow lets the request proceed without surfacing the approval prompt. If no matching hook decides, Codex uses the normal approval flow."

## Structural notes

- Official documentation.
