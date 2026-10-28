---
source_handle: rps-herdr-issues
fetched: 2026-10-26
source_url: https://github.com/herdrdev/herdr/issues/5170
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Two Herdr GitHub issues relevant to remote persistence: an open bug report (#5170) that a herdr --remote server on a Linux host died with the SSH session in one reporter's environment, and a closed feature request (#1779) for mosh transport so the attach survives sleep and roaming.

## Key passages

- [1] #5170 (open, opened 2026-10-11), body: reports that herdr --remote to a Linux host started a remote server that died when the local client or SSH session dropped, killing pane processes; the reporter's process tree was sshd-session to herdr remote-client-bridge to herdr server to panes, and the server's cgroup was the SSH logind session scope.
- [2] #5170 body, Impact: 'Remote coding-agent panes die on every local Herdr/SSH drop. Overnight agent work cannot survive a laptop sleep, client crash, or reconnect.' Reporter's environment: Herdr 0.9.3 stable, Amazon Linux 2023, local UI over Tailscale SSH, user linger on, no saved SSH machine.
- [3] #5170 first maintainer-style comment: could not reproduce over Tailscale SSH with KillUserProcesses=false and asked for the loginctl KillUserProcesses setting and whether plain OpenSSH also kills panes (the report is unresolved in the fetched thread).
- [4] #1779 (closed, opened 2026-07-23), body: states that remote Herdr server and panes survive but the thin-client attach dies with SSH on MacBook sleep/wake, Wi-Fi to cellular roaming and flaky networks, and proposes optional mosh transport for herdr --remote; it notes the workaround of 'mosh host -- herdr' or 'ssh host && herdr' which keeps the session alive but loses thin-client benefits.

## Structural notes

Additional URLs read: https://github.com/herdrdev/herdr/issues/1779.

GitHub issue pages for herdrdev/herdr read via the gh CLI on 2026-10-26; issue state is as of fetch. The closure reason of #1779 was not read.
