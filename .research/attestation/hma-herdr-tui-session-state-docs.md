---
source_handle: hma-herdr-tui-session-state-docs
fetched: 2026-11-10
source_url: https://herdr.dev/tui/docs/session-state/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr TUI's session-state page defines what survives detach, server restart and update. Processes survive only while the server runs; after a server stop/start (including host reboot) Herdr restores layout and relaunches supported agents with native resume commands when official integrations reported session ids. Layout snapshots are kept; shutdown-delay protection is documented for Linux systemd-logind only.

## Key passages

- [1] "What survives" table: Detach and reattach - processes keep running, layout returns, conversation resumes "because the process never stopped"; Server restart - processes "No", layout "Yes", agent conversation resumes "Only with native agent session restore".
- [2] "Live persistence": "Normal detach keeps the Herdr server running ... This is the strongest persistence path because the original processes never stop."
- [3] "Snapshot restore": after the server stops and starts "the original pane processes are gone. Herdr restores the saved session shape: workspaces, tabs, panes, cwd, layout, and focus"; panes that cannot use a stronger restore path "come back as new shells in their saved directories".
- [4] "Shutdown and snapshot recovery": "On Linux systems with systemd-logind, Herdr listens for the host shutdown warning and requests a short delay while it saves and stops"; this "does not cover forced shutdown, power loss"; up to 48 layout snapshots are kept in `session-snapshots/` on all platforms, at most one per 15 minutes.
- [5] "Native agent session restore": enabled by default (`[session] resume_agents_on_restore`); Herdr resumes panes that reported a session reference "through a current official Herdr integration"; table lists Claude Code (integration version 6, `claude --resume <id>`) and Codex (version 5, `codex resume <id>`); "Unsupported, missing, invalid, duplicated, or stale session references restore as normal shells in the saved pane directory."
- [6] "Pane screen history replay": off by default (`[experimental] pane_history`) because pane output can include secrets.
- [7] "Live handoff": experimental and opt-in (`herdr update --handoff`, `herdr --remote <host> --handoff`) to replace a running server without losing pane processes; in-flight requests, waits and subscription streams may be interrupted.

## Structural notes

Official docs page converted from HTML to text on 2026-11-10; anchors are headings. The macOS-specific pre-shutdown save is stated in the v0.9.4 release notes, see hma-herdr-releases.
