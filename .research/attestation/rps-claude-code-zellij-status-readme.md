---
source_handle: rps-claude-code-zellij-status-readme
fetched: 2026-10-26
source_url: https://github.com/thoo/claude-code-zellij-status/blob/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

A Claude Code plugin that maps Claude Code hook events to activity symbols written to state files and piped into a zellij zjstatus bar. Claude Code only; the display is a status bar segment, not part of tab names.

## Key passages

- [1] Lines 3 and 40-43: monitors Claude Code activity across multiple Zellij panes in real time via zjstatus; features include colour-coded symbols and notifications for done, asking and permission needed.
- [2] Lines 45-67 (Symbol Reference): a table of about 19 glyphs including working, thinking, reading, writing, running bash, asking user, permission needed, done and idle.
- [3] Lines 84-118 (How It Works): Claude Code hook events are parsed by claude-activity-hook.sh, which writes state files under /tmp/claude-zellij-status/ and sends a 'zellij pipe' message that zjstatus displays in the status bar.
- [4] Lines 13-15: requires Zellij, the zjstatus plugin and the Claude Code CLI; no Codex support is mentioned.

## Structural notes

Raw README.md fetched on 2026-10-26; line numbers refer to the raw file. Found via web search; only this README was read.
