---
source_handle: ashesh-agent-deck-tui
fetched: 2026-08-14
source_url: https://github.com/asheshgoplani/agent-deck/blob/main/skills/agent-deck/references/tui-reference.md
provenance: source-direct
substrate_confidence: source-direct
source_class: project-documentation
---

# agent-deck TUI reference

## Summary

This project’s TUI reference makes acknowledgement explicit in both its status definitions and user actions. It also exposes the typical expansion from observation into session creation, navigation, grouping, lifecycle control, and archives.

## Key passages

1. Statuses are Running (recent content change), Waiting (stopped and unacknowledged), Idle (stopped and acknowledged), Error (tmux session missing), and Starting. (Section “Status Indicators”; lines 262–270.)
2. The user can manually mark an idle session unread, changing it to waiting. (Section “Session Actions”; lines 213–231.)
3. The TUI supports attach, create, rename, restart, reorder, group, archive, fork, filter, and tmux-session import operations. (Sections “Session Actions”, “Group Actions”, and “Search & Filter”; lines 213–260.)

## Structural metadata

TUI reference in the public `asheshgoplani/agent-deck` repository, fetched 2026-08-14.
