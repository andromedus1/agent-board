---
source_handle: agent-island-status-monitor
fetched: 2026-08-14
source_url: https://agent-island.dev/claude-code-status-monitor/
provenance: source-direct
substrate_confidence: source-direct
source_class: product-engineering-note
---

# Agent Island — Claude Code status monitor and your-turn alerts

## Summary

This engineering note explains how Agent Island derives an attention-oriented state from several local signals. It is unusually explicit about freshness, false positives, session filtering, and the limits of inferred state.

## Key passages

1. The monitor combines recent file writes, semantic transcript events, and desktop-session activity because none is reliable alone: modification time can be bookkeeping, completion can be stale, and desktop activity can lag a final agent event. (Section “Start with local signals”; lines 12–15.)
2. Its state vocabulary is idle, working, your turn, stalled, authentication required, and rate limited. It reserves attention states for evidence that requires action rather than treating all pauses as errors. (Section “Use a small state model”; lines 16–19.)
3. Completed-turn attention expires; sufficiently old evidence returns to idle. Events predating monitor startup may be shown as context but should not create a new alert. (Sections “Use a small state model” and “Freshness beats file modification time”; lines 19–22.)
4. Archived sessions, subagent transcripts, and duplicate records are filtered or collapsed, and the provider-level indicator chooses the most urgent current state. (Section “Choose one useful status from many sessions”; lines 23–25.)
5. Transcript activity cannot prove code correctness, product-level task completion, or process health; `stalled` is characterized as an attention hint rather than a diagnosis. (Section “What a status monitor cannot know”; lines 26–29.)

## Structural metadata

Product engineering article dated 2026-07-15 on the official Agent Island site. It links to the open-source scanner and state tests but the fetched article itself is the attested source.
