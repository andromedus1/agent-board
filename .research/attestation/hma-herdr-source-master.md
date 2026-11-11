---
source_handle: hma-herdr-source-master
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/blob/master/src/workspace/aggregate.rs
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Spot check of herdrdev/herdr master (commit ee5bfb5041bb3e4a49d591c72308aae3c81ecdde at fetch) confirming the attention-priority ordering used for workspace rollups and that Claude and Codex remain screen-manifest agents.

## Key passages

- [1] `src/workspace/aggregate.rs` lines 50-56: `pane_attention_priority` maps (Blocked, any) to 4, (Idle, unseen) to 3, (Working, any) to 2, (Idle, seen) to 1, (Unknown, any) to 0; `aggregate_state` takes the maximum-priority pane (`max_by_key`), defaulting to Unknown when a workspace has none.
- [2] `src/detect/mod.rs`: `SCREEN_MANIFEST_AGENTS: [Self; 22]` includes `Self::Claude` and `Self::Codex` (lines 98-101 of the fetched file).

## Structural notes

Read via `gh api repos/herdrdev/herdr/contents/{path}` on 2026-11-10 with master at the commit named above (the contents were grepped for the named symbols rather than read in full). Agrees with the 2026-08-20 `herdr-source-repo` capture on the ordering.
