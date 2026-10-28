---
source_handle: rps-shpool
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/shell-pool/shpool/master/README.md
source_path: .research/source-captures/rps-shpool/capture.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of shpool, a daemon providing named persistent shell sessions that survive connection drops. It deliberately provides no window splitting or tiling and does not take over the terminal, so native scrollback and copy-paste are preserved. Runs on Linux and macOS (macOS support described as having some failing tests).

## Key passages

- [1] Intro: shpool is a service that enables session persistence by allowing creation of named shell sessions owned by shpool so the session is not lost if the connection drops; a lighter-weight alternative to tmux or GNU screen; it "only provides persistent sessions" and does not break native scrollback or copy-paste.
- [2] Platform Support: runs on Linux and mac; Linux primary; mac "still has a few tests which don't pass".
- [3] Usage: install on the remote host, no extra client software; `shpool attach main` creates or reattaches a named session; use a separate named session per terminal.
- [4] Usage: if a stuck terminal still holds the session, `shpool detach main` forces a detach.
- [5] Subcommands: `shpool list` (with `--json`), `detach`, `kill`, `attach` (with `--ttl`), `var`; attach to a name that exists attaches only if no other terminal is connected.
- [6] Install: daemon can run under systemd (user unit, `loginctl enable-linger`), under Homebrew services on macOS, or via autodaemonization (fork a daemon on the fly if missing, default enabled).
- [7] Templates: `{var}` templates in session names, with `shpool var set` causing attached clients to reconnect to renamed sessions.
- [8] Auto-connect: `RemoteCommand shpool attach -f %k` in ssh config; a shell function using `ssh -t -oRemoteCommand=...`.
- [9] Shell config: bash `huponexit` recommended so child processes exit when a shell is left.

## Structural notes

- README only; CONFIG.md and wiki troubleshooting were not fetched.
- The README says nothing about window titles, OSC sequences, or status rendering.
