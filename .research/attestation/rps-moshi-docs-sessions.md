---
source_handle: rps-moshi-docs-sessions
fetched: 2026-10-26
source_url: https://getmoshi.app/docs/terminal-sessions
source_path: .research/source-captures/rps-moshi-terminal-sessions/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation pages "Terminal sessions" and "tmux" (the latter captured at https://getmoshi.app/docs/tmux, .research/source-captures/rps-moshi-tmux/capture.html). They describe mosh plus tmux as the recommended pairing, reconnect behavior, and the tmux attach patterns used.

## Key passages

- [1] Terminal sessions: "The strongest setup is mosh for transport plus tmux for process lifetime."
- [2] Terminal sessions: mosh starts through SSH then uses UDP; "It is the better choice for mobile use when UDP is available"; if mosh fails but SSH works, check host firewall rules and UDP range.
- [3] Terminal sessions (Scrollback): the app keeps a fixed-size scrollback buffer; "The mosh protocol does not transmit history above the visible screen at connect time, so for durable, searchable scrollback run inside tmux."
- [4] Terminal sessions (Reconnect): "Mosh can survive network changes, but it does not keep the remote shell alive after the remote process exits. tmux handles that part." If the app is killed, Pro reconnects and automatically attaches the same tmux or Herdr session; Zellij sessions can be selected on new connection but are not restored automatically after reconnect.
- [5] tmux page: "tmux is the recommended host-side workspace for Moshi. It keeps shells and agents running on the host even when the mobile terminal disconnects."
- [6] tmux page: after installing moshi-hook, a `moshi <dir>` command resolves the directory, names the tmux session from the directory basename, and replaces itself with `tmux new-session -A -s <name> -c <dir>`.
- [7] tmux page tips: "Use short session and window names. Keep one agent per window when possible."
- [8] tmux page: `moshi://tmux?session=<name>` plus `&window=<0-9>` reopens a session and can focus a single-digit window.
- [9] tmux page troubleshooting: detection runs over a non-login, non-interactive SSH shell, so tmux must be on that PATH.

## Structural notes

- Vendor documentation; docs pages are marked "updated 1-2 months ago" on the page.
