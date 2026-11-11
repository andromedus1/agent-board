---
source_handle: hma-reboot-herdr-docs-named-sessions-handoff
fetched: 2026-11-10
source_url: https://herdr.dev/tui/docs/persistence-remote/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr TUI docs (Latest 0.9.5): Persistence and remote access (named sessions, server stop, SIGHUP) and the live-handoff and install-channel limits in Session state and restore. Complements hma-herdr-tui-session-state-docs and hma-herdr-tui-remote-docs.

## Key passages

- [1] Persistence and remote access, "Named sessions": "Use named sessions when you want independent Herdr servers." Commands listed: `herdr session list`, `herdr session attach work`, `herdr session stop work`, `herdr session delete side-project`; "A named session has its own panes, tabs, workspaces, sockets, and runtime state. It still shares the same global config file."
- [2] Persistence and remote access, "Detach and reattach": "When Herdr starts again after a full server stop, it restores the saved session shape."; "On Linux and macOS, the server ignores SIGHUP, so a hangup from its launching shell does not stop the panes. To stop it deliberately, use herdr server stop or SIGTERM".
- [3] Persistence and remote access, "Remote named sessions": `herdr --remote workbox --session agents` attaches to a named session on the remote host.
- [4] Session state, "Live handoff": it "asks the old server to transfer live panes to the new server, so pane processes can keep running across the server replacement"; "In-flight CLI or API requests, waits, subscription streams, client sockets, and pane-to-pane messages may be interrupted"; "Live handoff is experimental and opt-in: herdr update --handoff, herdr --remote workbox --handoff".
- [5] Session state, "Live handoff": "Updated Unix servers can send more than 64 panes in one handoff by transferring them in batches. The sending server must already contain this support: an older running server still enforces its 64-pane limit on the first upgrade. That limit may require a normal server restart, which ends pane processes."
- [6] Session state, "Live handoff": "herdr update --handoff only applies to installs managed by Herdr’s own updater. Homebrew, mise, and Nix installs are updated through their package managers, so herdr update is disabled there and cannot perform live handoff."
- [7] Session state, "Shutdown and snapshot recovery": the host-shutdown save delay is documented for "Linux systems with systemd-logind"; this "does not cover forced shutdown, power loss, or processes killed before the warning arrives."
- [8] Troubleshooting: "Live handoff preserves the source server’s service context and existing pane processes. Older servers therefore need a full session restart to adopt this fix; handoff cannot repair their inherited context."

## Structural notes

Official docs pages converted from HTML to text with curl on 2026-11-10 (captures herdr-persistence-remote.txt, herdr-session-state.txt, herdr-troubleshooting.txt under the source-captures/hma-reboot directory); version shown as Latest 0.9.5. The docs contain no launchd or systemd unit example for Herdr TUI, no boot-start instruction and no config key that starts a server or resumes agents without an attached client.
