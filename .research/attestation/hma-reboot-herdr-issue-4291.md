---
source_handle: hma-reboot-herdr-issue-4291
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/issues/4291
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdrdev/herdr issue #4291 (OPEN at 2026-11-10; labels bug, maintainer-needed, p2, macos, linux, remote, sessions): a saved-machine client's remote-client-bridge starts a server on the host whenever none is listening, including after an operator stop or a reboot, and on macOS that server inherits the SSH login context.

## Key passages

- [1] Body (reporter, herdr 0.9.1): "A server that was stopped on purpose comes straight back if a client has that host as an enabled saved SSH machine. On its next reconnect attempt, the client's remote-client-bridge finds nothing listening and spawns a new herdr server." and "The restarted server also inherits the SSH login environment instead of the service unit's." The reporter's environment: named session `crystal` "started by the OS service manager (launchd, systemd user unit)".
- [2] Body, code references (reporter v0.9.1): "`src/remote/host.rs:38-60`: `ensure_remote_server_running()` calls `spawn_server_daemon()` whenever nothing is listening."
- [3] Comment ben-vargas (2026-10-05, 0.9.3, macOS arm64): the respawned server "inherits the SSH login's security session, so every pane loses login-keychain access: gh and other keychain-backed CLIs fail, and security show-keychain-info reports \"User interaction is not allowed\"."
- [4] Comment atonkevin (2026-10-17, 0.9.5, macOS 27 arm64, server run by a user LaunchAgent in the gui/<uid> domain): "Claude Code sessions in those panes lost their Remote Control connection after a routine launchctl kickstart -k of the server, because the peer's bridge got there first during the restart gap."; and "`launchd_spawn.rs` falls back to a direct spawn when `SSH_CONNECTION` is set, which is always the case when the bridge starts it."
- [5] Comment MichaelJarvisSendient (2026-10-30, 0.9.3, macOS arm64): "After one reboots, the other's remote-client-bridge reconnects over SSH within seconds and starts herdr server inside the no-tty sshd-session. Every pane then inherits a Background launchd context"; "SSH comes up before GUI login, so the bridge usually wins."
- [6] Comment LC1207 (2026-11-01, 0.9.5, macOS): "a mac mini reboots nightly around 04:10 and two peers have it as a saved machine; their bridges win the start race, the server comes up inside sshd, and every Claude Code pane in it is signed out since it can't read the login keychain." Workaround described: an ssh forced command on the peers' keys that refuses `herdr remote-client-bridge` unless a server is already listening and its environment has no SSH_CONNECTION.
- [7] Status: no maintainer response or fix appears in the thread read; the issue was open at fetch.

## Structural notes

Read with `gh issue view 4291 --json` on 2026-11-10 (capture herdr-issue-4291.json). Comments are user reports; mechanisms are reporter accounts except where a code path is cited. Applies to hosts that are saved SSH machines of another Herdr client; whether a plain `ssh host herdr` attach also starts a direct-spawn server is supported by hma-reboot-herdr-pr-5236 ("Starts over SSH ... keep the old direct spawn").
