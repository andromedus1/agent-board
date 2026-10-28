---
source_handle: rps-moshi-docs-multiplexer
fetched: 2026-10-26
source_url: https://getmoshi.app/docs/multiplexer
source_path: .research/source-captures/rps-moshi-multiplexer/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation on multiplexer support (tmux, Zellij, Herdr) and the "Jump to..." sheet (captured at https://getmoshi.app/docs/jump-to, .research/source-captures/rps-moshi-jump-to/capture.html). Check-mark cells in the support matrix did not survive text extraction; only the prose rows below are attested.

## Key passages

- [1] Multiplexer page: Herdr and tmux get the deepest integration (automatic reattach after full reconnect, remote approvals from the Inbox, Jump To session tree, session deep links); Zellij covers detection, picker, initial auto-attach, remote approvals and a shortcut panel but "sits out reconnect auto-attach and the navigation extras".
- [2] Multiplexer page: tapping Approve or Deny injects keys into the exact pane after moshi-hook has re-captured the screen and verified the prompt is still the one the user saw; "All three multiplexers expose the capture and send-keys primitives this needs."
- [3] Multiplexer page: Jump To shows Herdr rows with each agent's blocked/working/done status; the tmux tree is described as sessions and their windows; Zellij "has nothing to enumerate here yet".
- [4] Multiplexer page: moshi-hook context reporting is `kind=tmux` with pane and cwd, `kind=herdr` with session/workspace/tab, `kind=zellij` with session/pane.
- [5] Jump to page: the sheet shows the current session as a two-level tree "fetched live from the host"; Herdr rows carry a status dot and the header sums a "waiting" count; for tmux the page describes only sessions and windows.
- [6] Jump to page: the sheet asks moshi-hook on the host for a live snapshot of the multiplexer, so the hook daemon must run there; a bare shell or Zellij session has nothing to enumerate; "Jump to... is a Pro feature" (first 10 switches free).
- [7] Jump to page: tapping a row focuses the window or tab on the host "no prefix chords involved".

## Structural notes

- Vendor documentation. The pages do not say whether tmux window names or any user option are rendered as status in Jump To rows; the status dot is documented for Herdr rows only.
