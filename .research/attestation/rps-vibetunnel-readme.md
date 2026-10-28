---
source_handle: rps-vibetunnel-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/amantus-ai/vibetunnel/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

VibeTunnel README: a browser-based terminal proxy (macOS menu bar app, Node.js server, web frontend) for forwarding terminal sessions, marketed for monitoring AI terminal tools. Activity is shown as active or idle from recent input/output. Titles can be static, filtered or app-controlled, and settable with `vt title`. Authentication has several modes including none, and remote access is via Tailscale, ngrok, Pinggy or similar tunnels. The README does not mention tmux.

## Key passages

- [1] Features: 'AI Agent Friendly - Perfect for monitoring Claude Code, ChatGPT, or any terminal-based AI tools'.
- [2] Features: 'Session Activity Indicators - Real-time activity tracking shows which sessions are active or idle'.
- [3] Features: 'Mobile Ready - Native iOS app and responsive web interface'; note: 'The iOS app is still work in progress and not recommended for production use yet.'
- [4] Terminal Title Management: modes `static` (working directory and command), `filter` (blocks all title changes from applications), `none` (applications control their own titles; the default in the CLI option list).
- [5] Activity Detection: 'Activity indicators are based on recent input/output and drive active/idle UI states.'
- [6] `vt title "Building Production Release"` updates the session name from inside a VibeTunnel session.
- [7] `vt` is a forwarding wrapper that proxies input and output between the terminal and the browser through VibeTunnel's server.
- [8] Authentication section: system auth, environment credentials, SSH keys, `--no-auth` ('For trusted environments only'), and `--allow-local-bypass` ('DEVELOPMENT ONLY - NOT FOR PRODUCTION').
- [9] Remote access: Tailscale (private or Funnel public), ngrok (free URLs change on restart), Pinggy, and other tunnels; a docs link covers web push notifications.
- [10] License section: MIT.

## Structural notes

- Raw README. A grep of the README for 'tmux' returned no matches, so persistence of a session across a server restart is not documented there; the README says sessions are recorded in asciinema format (via the WebFetch-processed repo page, lower confidence).
- GitHub API reported pushed_at 2026-08-05, not archived.
