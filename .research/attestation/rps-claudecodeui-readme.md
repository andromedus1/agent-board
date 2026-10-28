---
source_handle: rps-claudecodeui-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/siteboon/claudecodeui/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of CloudCLI UI (formerly Claude Code UI): a desktop and mobile web UI over Claude Code, Cursor CLI and Codex that auto-discovers sessions from ~/.claude. Self-hosted instances require the host machine to stay on; a vendor-hosted CloudCLI Cloud tier is offered where the laptop can be closed. AGPL-3.0-or-later.

## Key passages

- [1] Intro: 'A desktop and mobile UI for Claude Code, Cursor CLI, and Codex. Use it locally or remotely to view your active projects and sessions from everywhere.'
- [2] Feature list: 'Session Management - Resume conversations, manage multiple sessions, and track history'.
- [3] Deployment table: Self-Hosted (npm) and Docker Sandbox - 'Machine needs to stay on: Yes', mobile access via any browser on your network; CloudCLI Cloud - 'Machine needs to stay on: No', any device, starts at 7 euros per month.
- [4] Agents column: Claude Code, Cursor CLI, Codex for npm and Cloud; Claude Code and Codex for the Docker sandbox (experimental).
- [5] FAQ vs Claude Code Remote Control: 'CloudCLI UI auto-discovers every session from your ~/.claude folder'; Remote Control is described as exposing a single active session, requiring the machine and terminal to stay on, and timing out after about 10 minutes without a network connection.
- [6] FAQ: 'CloudCLI Cloud runs in the cloud - close your laptop, the agent keeps running.'
- [7] Plugin table: a Web Terminal plugin (xterm.js, multi-tab) and a Sessions plugin to 'View, manage, and kill active Claude Code sessions'.
- [8] License section: AGPL-3.0-or-later with additional terms under Section 7.

## Structural notes

- Raw README. No documentation of session rename, status glyph, or push notifications appeared in the README text.
- GitHub API reported pushed_at 2026-10-24, not archived. The FAQ comparing against Remote Control is vendor self-description and a competitor claim.
