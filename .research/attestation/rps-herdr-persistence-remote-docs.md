---
source_handle: rps-herdr-persistence-remote-docs
fetched: 2026-10-26
source_url: https://herdr.dev/docs/persistence-remote/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr's persistence and remote page documents detach/reattach, named sessions, the SSH remote-attach bridge, the SIGHUP-ignoring server, and a direct terminal attach plus read-only observer and writable controller streams intended for third-party bridges.

## Key passages

- [1] Lines 3-7: Herdr keeps panes running in a background server; ctrl+b q detaches while panes and agents keep running; herdr server stop stops the session and its panes.
- [2] Line 9: on Linux and macOS the server ignores SIGHUP, so a hangup from its launching shell does not stop the panes.
- [3] Lines 12-19: named sessions are independent Herdr servers with their own panes, tabs, workspaces, sockets and runtime state, sharing one global config file.
- [4] Lines 36-37: in herdr --remote mode the remote server owns running panes and sends terminal content and session state over SSH; the local Herdr draws the UI; local keybindings are used by default.
- [5] Line 48: remote attach uses normal OpenSSH authentication; for a passphrase-protected key in a non-interactive shell, script, CI job or mobile terminal that cannot show a prompt, load the key into ssh-agent first.
- [6] Line 53: a version difference alone does not replace or restart a running remote server; stopping a server ends its pane processes and the default answer to the prompt is No.
- [7] Lines 81-97: for third-party bridges, 'herdr terminal session observe' emits newline-delimited JSON terminal.frame records with base64 ANSI bytes to multiple read-only observers, and 'herdr terminal session control' is a writable controller that reads JSON commands (terminal.input, terminal.resize, terminal.scroll, terminal.mouse) on stdin; only one controller owns input at a time.

## Structural notes

Official documentation page 'Persistence and remote access', converted from raw HTML to text; line numbers refer to the extracted text.
