---
source_handle: rps-happy-cli-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/slopus/happy/main/packages/happy-cli/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of the original Happy CLI package. The CLI starts Claude Code or Codex sessions on the host, shows a QR code for phone or browser connection, and runs a background daemon on the user's machine that can spawn sessions remotely. Sessions are started 'while your computer is online'. Permission approvals for one backend are explicitly absent.

## Key passages

- [1] Usage: `happy` starts a Claude Code session, displays a QR code to connect from mobile or browser, allows real-time session control with all communication end-to-end encrypted, and allows starting new sessions from the phone or web 'while your computer is online'.
- [2] More agents: `happy codex`, `happy agy` (Antigravity CLI), `happy gemini` (deprecated), `happy openclaw`, and `happy acp <cli>` for any ACP-compatible CLI.
- [3] Note on agy permissions: the agy backend runs `agy --print`, which is one-shot with no interactive approval surface; tool calls proceed automatically, and Happy's permission mode only selects the flag passed to agy.
- [4] Daemon section: a background service that stays running on your machine and lets you spawn and manage coding sessions remotely from phone or web app without an open terminal; commands `happy daemon start|stop|status|list`.
- [5] Daemon across reboots: README recommends starting it from the shell profile; on macOS a LaunchAgent runs detached from the GUI login session so the bundled claude-agent-sdk cannot reach the keychain and fails authentication with 401.
- [6] Authentication: cryptographic key pairs; the private key stays on the user's machine; all session data is end-to-end encrypted before leaving the device.
- [7] Commands table: `happy resume <id>` resumes a previous session; `happy notify` sends a push notification to the user's devices.
- [8] Environment variable table: `HAPPY_DISABLE_CAFFEINATE` disables macOS sleep prevention.

## Structural notes

- Raw README of packages/happy-cli. It does not document session rename, a status glyph in a name, or how approval from the phone is transported (semantic versus keystroke).
