---
source_handle: rps-purplemux-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/9018/purplemux/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

purplemux is a browser dashboard over tmux for Claude Code and Codex (and Pi/omp) sessions with working/needs-input status, web push, PWA, password auth and Tailscale HTTPS. Status uses agent event hooks plus process and JSONL polling. Session data stays on the host. This repository (9018/purplemux) was read; a separate repository subicura/purplemux with a near-identical README also exists.

## Key passages

- [1] Why purplemux: 'See working/needs-input status for every Claude Code, Codex, Pi, and omp session at a glance'; 'Push notifications - Desktop and mobile alerts when a task finishes or needs input'.
- [2] 'Uninterrupted sessions - Built on tmux. Close the browser and everything stays put.' and 'Self-hosted & open source - Code and session data never leave your machine. No external servers'.
- [3] Comparison with the official Remote Control: 'Use purplemux when you need multi-session management, push notifications, and persistent sessions.'
- [4] Terminal features: 'Tab management - ... auto titles from process names'; CLI example `purplemux tab create -w WS -t codex-cli -n "fix auth"` creates a named tab.
- [5] Status detection: 'Agent event hooks deliver instant updates via HTTP POST. Claude Code uses SessionStart, Stop, and Notification; Codex uses SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, and PermissionRequest. Polling every 5-15s inspects process trees and analyzes the last 8KB of JSONL files.'
- [6] Mobile: PWA, Web Push after the tab is closed, Tailscale Serve HTTPS, password authentication with scrypt hashing 'safe even when exposed externally'.
- [7] Codex tabs launch Codex CLI sessions with the same tmux-backed persistence as Claude; Windows not supported.
- [8] Shared GPTWork Codex sessions: purplemux can attach to a Codex runtime started by another application through a shared `tmux -L purple` server; a filesystem lease serializes writes without assigning exclusive ownership.
- [9] License: MIT (WebFetch-processed page extract).

## Structural notes

- GitHub API reported 9018/purplemux pushed_at 2026-10-19 (fork flag false) and subicura/purplemux pushed_at 2026-08-10; the relationship between the two repositories is not stated in the README text read.
- Which of the two is canonical is not established by this attestation.
