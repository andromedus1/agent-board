---
source_handle: rps-tmux-webui-notify-doc
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/operonlab/tmux-webui/main/docs/notify.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Waiting-pane notification doc of tmux-webui: an opt-in server-side watcher scans panes every few seconds and POSTs a push payload to a configured webhook when a pane enters the waiting state.

## Key passages

- [1] Intro: an optional watcher that fires a push when an agent pane transitions into the waiting-on-you state; runs server-side independent of any open browser; off by default.
- [2] Config block: `webhook_url` (empty = watcher off), `interval` default 5 seconds, `cooldown` default 60 seconds per pane.
- [3] Payload example: title (session:window label and waiting text), body is the pane's last line (e.g. a y/n prompt), `tag` keyed off session:window:pane, `severity: high`.
- [4] Wiring: posts to an internal send endpoint of a separate notification module guarded by an `X-Local-Key` header; this notification backend is not part of tmux-webui itself.

## Structural notes

- The doc depends on a separate 'workshop notification module' not described in the doc; delivering a push therefore needs that backend or an equivalent webhook receiver {inferred}.
