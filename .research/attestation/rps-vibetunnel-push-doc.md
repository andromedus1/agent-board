---
source_handle: rps-vibetunnel-push-doc
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/amantus-ai/vibetunnel/main/docs/push-notification.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

VibeTunnel's notification design: a Session Monitor derives events from terminal activity (session start/end, command completion over three seconds, command failure, terminal bell) and sends macOS or web-push notifications.

## Key passages

- [1] Intro: notifications are driven by the Session Monitor, which tracks terminal activity and triggers alerts via native macOS notifications and web push.
- [2] Notification settings: session starts; session ends (with exit code); commands complete longer than 3 seconds ('Your Turn'); commands fail (non-zero exit code); terminal bell (ASCII 7).
- [3] Server event types: `sessionStart`, `sessionExit`, `commandFinished`, `commandError`, `bell`; events carry session id, display name, duration, exit codes.

## Structural notes

- Events are terminal-level (exit codes, bell); no agent-provider-native event types appear in the document.
