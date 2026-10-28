---
source_handle: rps-claude-remote-control-docs
fetched: 2026-10-26
source_url: https://code.claude.com/docs/en/remote-control
source_path: .research/source-captures/rps-claude-remote-control-docs/remote-control.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Official Claude Code page on Remote Control. Remote Control connects claude.ai/code or the Claude mobile app to a Claude Code session that keeps running on the user's own machine; web and mobile are a window into that local process. Server mode (`claude remote-control`) serves several concurrent sessions from one process; `claude --remote-control` and `/remote-control` expose a single interactive session. The page has grown since the 2026-08-20 attestation `symmetry-claude-remote-control` (adds Trusted Devices, push-notification settings, a Dispatch/Channels comparison table, crash-recovery in server mode, explicit outage limits). Capture saved verbatim under the source_path.

## Key passages

- [1] Intro: Remote Control connects claude.ai/code or the Claude app to a session "running on your machine"; Claude keeps running locally so execution and filesystem access stay on the machine. "Survive interruptions: if your laptop sleeps or your network drops, Claude Code reconnects automatically when your machine comes back online."
- [2] Intro: unlike cloud sessions, Remote Control sessions run on the user's machine; "The web and mobile interfaces are a window into that local session, so your computer has to stay on and the `claude` process has to keep running."
- [3] Requirements: Pro, Max, Team, Enterprise plans; API keys are not supported; on Team/Enterprise an Owner must enable the Remote Control toggle.
- [4] Start a session / flags: server mode `claude remote-control` stays running waiting for remote connections, shows a session URL, spacebar toggles a QR code; flags include `--name`, `--remote-control-session-name-prefix` (default hostname, e.g. `myhost-graceful-unicorn`), `-c/--continue`, `--session-id`, `--capacity <N>` (default 32 concurrent sessions), `--permission-mode`.
- [5] Connect from another device: sessions are found by name in the claude.ai/code or Claude app (Code tab) list; "Remote Control sessions show a computer icon with a green status dot when online."
- [6] Title order: (1) name passed to `--name`/`--remote-control`/`/remote-control`, (2) title set with `/rename`, (3) last meaningful message, (4) auto-generated name. "When you rename a session from claude.ai or the Claude app, Claude Code also updates the local title shown in `claude --resume`."
- [7] Check connection status: interactive terminal shows an `/rc active` indicator; on failure the indicator changes and the reason is shown in a notification and added to the conversation.
- [8] Connection and security: while connected, the session transcript is stored on Anthropic servers to keep devices in sync and let the session reconnect after a network drop; execution and filesystem stay on the machine.
- [9] Trusted Devices: optional, off by default, requires device verification before viewing or steering Remote Control sessions from claude.ai, the mobile apps, or Desktop.
- [10] Comparison table: Dispatch (message a task from the mobile app; runs on Desktop on your machine), Remote Control (CLI/Desktop/VS Code), Channels (push events from Telegram/Discord; CLI), Slack and self-hosted environments (cloud).
- [11] Mobile push notifications: when active, Claude "decides when to push", typically on long-task finish or when it needs a decision; `/config` offers "Push when Claude decides" and "Push when actions required" (permission prompts and questions); "there is no per-event configuration" beyond those toggles; pushes are skipped while the user is focused on the connected terminal.
- [12] Limitations: one remote session per interactive process outside server mode; "If you close the terminal ... or otherwise stop the `claude` process, the session goes offline until you bring it back"; for a remote machine, start `claude` inside `tmux` or `screen`.
- [13] Limitations: server mode "gives up after roughly 10 minutes" of extended network outage and the `claude remote-control` process exits; an interactive session retries as long as the outage lasts; interactive session disconnects after about 30 minutes of failed presence heartbeats; HTTP 403 retried up to three minutes.
- [14] Limitations: in server mode a crashed session is served again when a message is sent from a connected device (v2.1.238+); permission prompts and `AskUserQuestion` stay open until answered; other forwarded dialogs expire after five minutes by default (`dialogExpiry`).
- [15] Troubleshooting: "Remote Control disconnected" / "Can't reach" in the web UI "[doesn't] tell you whether Claude or a subagent you were watching is still working on your computer."
- [16] Limitations: `/model`, `/effort`, `/fast`, `/color`, `/rename` work from mobile/web by passing an argument; terminal-only commands such as `/plugin` and `/resume` do not work remotely.

## Structural notes

- Official Claude Code documentation page; capture is the full page markdown returned by the fetch.
- Prior attestation `symmetry-claude-remote-control` (2026-08-20) cites the same URL by line anchors; the content differs (this page includes sections on Trusted Devices, push settings, Dispatch table).
