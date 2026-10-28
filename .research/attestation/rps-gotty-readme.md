---
source_handle: rps-gotty-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/yudai/gotty/master/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

GoTTY turns a CLI tool into a web application. Clients cannot write by default; the README warns about writes and unencrypted traffic and suggests wrapping a command in tmux or GNU Screen for multi-client sharing.

## Key passages

- [1] Options: `--permit-write, -w` permits clients to write to the TTY (BE CAREFUL); `--credential` basic authentication; `--random-url`; `--title-format` (default `{{ .command }}@{{ .hostname }}`); `--reconnect`; `--once`.
- [2] Security: 'By default, GoTTY doesn't allow clients to send any keystrokes or commands except terminal window resizing.' and accepting input from remote clients is dangerous for most commands.
- [3] Security: 'All traffic between the server and clients are NOT encrypted by default'; TLS is enabled with `-t`.
- [4] Sharing with multiple clients: run `gotty tmux new -A -s gotty top` so clients see the screen while the operator keeps control from a local tmux attach.
- [5] License: MIT badge.

## Structural notes

- GitHub API reported repository pushed_at 2024-08-01 and archived false at fetch time.
