---
source_handle: hma-android-agent-deck-readme
fetched: 2026-11-10
source_url: https://github.com/asheshgoplani/agent-deck/blob/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of agent-deck, a terminal session manager for coding agents, read for web UI, notification channels and platform scope. Latest release v1.16.38 published 2026-11-07 per the GitHub API.

## Key passages

- [1] Platform badge: macOS, Linux, WSL. The text contains no mention of Android and none of Herdr; sessions run in tmux (waiting sessions appear in the tmux status bar).
- [2] "agent-deck web  # Start web UI on http://127.0.0.1:8420"; the web UI has a dedicated Archived tab. The sections read do not say whether the web UI carries agent permission approvals (the only web-UI approval statement found concerns worktree script hooks, not agent prompts).
- [3] Status filters in the TUI: running, waiting, idle, error. Telegram bridge (optional): "Connect a Telegram bot for mobile monitoring"; watchers include ntfy pushes and other event sources.
- [4] Titles and groups: "Don't rely on titles or group names as machine keys. Both are user-editable."

## Structural notes

- Project README; only keyword-matched sections read (large file). Not verified against a running instance.
