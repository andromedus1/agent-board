---
source_handle: rps-agent-deck-tui-reference
fetched: 2026-10-26
source_url: https://github.com/asheshgoplani/agent-deck/blob/main/skills/agent-deck/references/tui-reference.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Current TUI reference for agent-deck: lists status glyphs, a Claude background-work substate, and states that federated remote rows carry only coarse running/waiting/idle/error status.

## Key passages

- [1] Lines 197-205 (Local Status Indicators): glyph table: running (green, content changed in last 2 seconds), waiting (yellow, stopped and unacknowledged), idle (gray, stopped and acknowledged), error (red, tmux session does not exist), starting (yellow).
- [2] Line 207: a Claude session whose foreground turn is over but which has background agents, shells or a Monitor in flight is shown as running with substate background-work.
- [3] Line 209: 'Federated remote rows currently carry coarse running/waiting/idle/error status; local Honest Status substates are not included in the remote payload.'
- [4] Line 74: a key marks an idle session unread, turning it into waiting (acknowledgement is operator-controlled).

## Structural notes

Raw file from the public repository fetched on 2026-10-26; line numbers refer to the raw file.
