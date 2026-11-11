---
source_handle: hma-android-codex-config-advanced
fetched: 2026-11-10
source_url: https://developers.openai.com/codex/config-advanced
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Official Codex advanced configuration page, read for the Notifications section: the notify external program and the built-in TUI notifications.

## Key passages

- [1] "Use notify to trigger an external program whenever Codex emits supported events (currently only agent-turn-complete). This is handy for desktop toasts, chat webhooks, CI updates, or any side-channel alerting that the built-in TUI notifications don't cover."
- [2] "tui.notifications is built in to the TUI and can optionally filter by event type (for example, agent-turn-complete and approval-requested)." "tui.notification_method controls how the TUI emits terminal notifications (auto, osc9, or bel)."
- [3] "In auto mode, Codex prefers OSC 9 notifications (a terminal escape sequence some terminals interpret as a desktop notification) and falls back to BEL (\x07) otherwise."

## Structural notes

- Official documentation; the page is large and only the Notifications section was read. The page was reached at developers.openai.com; the learn.chatgpt.com path returned 404.
