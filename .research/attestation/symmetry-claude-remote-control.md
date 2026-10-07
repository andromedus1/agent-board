---
source_handle: symmetry-claude-remote-control
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/remote-control
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Code Remote Control

Remote Control connects claude.ai/code or the Claude mobile app to a local
Claude Code process; it is not the web-cloud execution topology. Server mode
can serve several sessions, while a normal interactive process supports one
remote session.

## Key passages and anchors

- [1] `remote-control.md:116-118` — Remote Control is unavailable through named
  third-party provider routes or a non-Anthropic API base URL and requires
  first trusting the project workspace.
- [2] `remote-control.md:135-151` — server mode remains a local terminal process;
  it offers a custom name, generated-name prefix, resume-by-last / ID,
  same-directory/worktree/single-session spawn modes, and a capacity setting.
- [3] `remote-control.md:157-177` — `claude --remote-control` keeps the ordinary
  interactive terminal usable locally while web/mobile also controls that
  conversation; the session continues using the local filesystem, MCP servers,
  tools, and configuration, and `/remote-control` carries existing history into
  a remote session.
- [4] `remote-control.md:190-204, 215-216` — the terminal footer expresses active
  and failed Remote Control state, and documents long-turn and repeated-
  permission attention notifications; connected clients can see existing
  background subagents/workflows.
- [5] `remote-control.md:256-263, 379-384` — server sessions have a limited
  reconnection window after stop; remote dialogs have documented behavior and
  some terminal-picker commands remain local-only.
