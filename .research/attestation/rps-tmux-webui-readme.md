---
source_handle: rps-tmux-webui-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/operonlab/tmux-webui/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

tmux-webui is a Go single-binary web UI that streams tmux panes to a browser or installable mobile PWA, built explicitly for AI CLI agents (Claude Code, Codex) running in tmux on a home server. It adds waiting-pane notifications, a touch 'deck' mode, multi-host federation, and a daemon mode.

## Key passages

- [1] Intro: 'A web UI for tmux. One static binary on the machine where tmux runs; your panes stream to any browser - a desktop grid or an installable mobile PWA.'
- [2] Purpose: 'AI CLI agents running on a machine at home. Claude Code, Codex, and friends live in tmux panes on a home server' - open the PWA, give one instruction, the agent keeps working; notification or TTS tells you when it is waiting.
- [3] Deck mode: 'live status chips for every pane, permission pills, and big context-aware buttons'.
- [4] Waiting-pane notify + TTS: an optional server-side watcher pushes a notification when an agent pane blocks on you (permission prompt, question), so a closed phone still gets alerted.
- [5] Multi-host federation: list other hosts in config and drive their tmux sessions from one UI under a `host/` prefix.
- [6] Daemon mode: install as a launchd or systemd user service; restarts on crash, survives reboots.
- [7] LAN mode: `tmux-webui --lan` binds all interfaces behind a token gate and prints a QR code.
- [8] Requires tmux; macOS or Linux (Windows via WSL).

## Structural notes

- GitHub API reported pushed_at 2026-07-08, not archived. License MIT per the WebFetch-processed repo page.
- Note: the README says LAN mode is behind a token gate; the remote-access doc says there is no authentication in LAN mode (see rps-tmux-webui-remote-doc).
