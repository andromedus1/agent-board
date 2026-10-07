---
source_handle: config-advanced-notifications
fetched: 2026-08-14
source_url: https://learn.chatgpt.com/docs/config-file/config-advanced
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The advanced configuration page documents two notification paths for terminal Codex: a configurable external `notify` program that fires on agent turn completion, and built-in terminal UI notifications that can emit for both turn completion and approval requests. The page also states that project-local config cannot set notification hooks.

## Key passages

- [1] Lines 1230-1257: `notify = ["python3", "/path/to/script.py"]` runs an external program whenever Codex emits supported events, currently only `agent-turn-complete`; the program receives `CODEX_SESSION_ID`, `CODEX_NOTIFY_KIND`, and for turn-complete notifications `CODEX_NOTIFY_TURN_ID`, `CODEX_NOTIFY_MESSAGE_COUNT`, and `CODEX_NOTIFY_LAST_MESSAGE`.
- [2] Lines 1265-1270: `tui.notifications` is built in to the TUI and can filter by event type including `agent-turn-complete` and `approval-requested`; `tui.notification_method` controls `auto`, `osc9`, or `bel`, and `tui.notification_condition` controls `unfocused` or `always`.
- [3] Lines 827-827: project-local `.codex/config.toml` cannot set `notify`; Codex ignores `notify` in project-local config and prints a startup warning.

## Structural notes

- Relevant section: “Notifications”.
- This page distinguishes external process hooks (`notify`) from built-in TUI notifications.
