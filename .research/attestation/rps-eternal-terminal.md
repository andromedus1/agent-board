---
source_handle: rps-eternal-terminal
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/MisterTea/EternalTerminal/master/README.md
source_path: .research/source-captures/rps-eternal-terminal/capture.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of Eternal Terminal (ET), a remote shell that reconnects automatically. It authenticates over SSH then runs a separate TCP service (etserver). The current README also describes a bundled multiplexer, HTM, that speaks tmux control mode and owns persistent multiplexer sessions.

## Key passages

- [1] Top: "Eternal Terminal is a remote shell that automatically reconnects without interrupting the session."
- [2] Installed programs: `et` client uses SSH to authenticate and start the session then maintains the reconnectable connection; `etserver` is the system service with default TCP port 2022.
- [3] Installed programs: `htm` is a foreground client for HTM, the bundled terminal multiplexer, which "speaks tmux control mode so compatible terminal emulators can show native windows, tabs, and splits"; `htmd` is the per-user daemon that "owns persistent multiplexer sessions".
- [4] Usage: "ET uses ssh for handshaking and encryption" and "ET uses TCP, so you need an open port on your server. By default, it uses 2022."
- [5] Install (macOS): a launchd plist is provided to launch etserver on every boot.
- [6] VS Code/Cursor section: ET can stand in as the Remote-SSH transport so a remote window rides out laptop sleep and network changes.
- [7] Saved sessions: `et` saves each direct session's reattachment credentials in `~/.et/sessions` (owner-only, plaintext) so after a client crash or reboot you can return to a remote shell that is still running; `--attach` and `--kill` accept a session name or a unique substring of the name or terminal title; port forwards, agent forwarding and jumphosts are not restored on attach; `--no-persist` skips writing credentials.

## Structural notes

- The README does not document phone clients; passages are the current master README and may postdate released packages.
- The "still running" shell in [7] is a server-side process; persistence of that shell across a server reboot is not stated.
