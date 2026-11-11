---
source_handle: hma-android-moshi-docs-terminal-sessions
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/terminal-sessions
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation on terminal transports, reconnect expectations and scrollback, current version.

## Key passages

- [1] "SSH gives you broad compatibility and works anywhere TCP SSH works." "The strongest setup is mosh for transport plus tmux for process lifetime." Mosh starts through SSH, then uses UDP; "It is the better choice for mobile use when UDP is available." If mosh fails but SSH works, check host firewall rules and the configured UDP range.
- [2] "Mosh can survive network changes, but it does not keep the remote shell alive after the remote process exits. tmux handles that part."
- [3] "If the app gets killed or the connection has to start over, Pro reconnects to the host and automatically attaches the same tmux or Herdr session." Zellij sessions are not yet restored automatically.
- [4] "The mosh protocol does not transmit history above the visible screen at connect time, so for durable, searchable scrollback run inside tmux."

## Structural notes

- Vendor documentation; page marked updated 1 month ago.
