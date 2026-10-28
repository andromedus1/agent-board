---
source_handle: rps-agent-deck-readme
fetched: 2026-10-26
source_url: https://github.com/asheshgoplani/agent-deck/blob/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Agent Deck is a Go TUI over tmux that supervises many agent sessions, with a built-in web UI, SSH remote instances, and a Telegram/Slack/Discord/Mattermost conductor bridge for phone control. Titles sync from the provider's own session name unless locked. Status uses provider hooks where installed (Codex notify hook, pi extension) and pane reading otherwise; remote rows carry only coarse status.

## Key passages

- [1] Line 22: describes itself as mission control showing every session running, waiting or done, and mentions a 'phone-controlled conductor'.
- [2] Line 116 and Web Mode section (lines ~1192-1260): 'agent-deck web' starts a web UI on http://127.0.0.1:8420 with a left menu and browser terminal UI; --read-only gives output-only mode; --token/--token-file protect API and WebSocket; 'Binding a non-loopback address without one of them is refused, because it would expose an unauthenticated remote-code-execution surface'; --allowed-host supports Tailscale Serve hostnames; --push gives browser push notifications that fire only while the tab is unfocused and need a secure context.
- [3] Lines 313-322: by default the displayed title syncs from the tool's own session name (Claude's /rename, claude --name), 'which ... means a title you set can later be overwritten'; --title-lock / --no-title-sync, sync_title = false, and push_title = false give stability controls; an explicit -t/--title locks automatically; a deck rename of a Claude session takes effect on the next start, not immediately.
- [4] Line 330: do not rely on titles or group names as machine keys because both are user-editable.
- [5] Line 373: 'Waiting sessions appear right in your tmux status bar' with Ctrl+b then 1-6 to jump to them (a notification bar, distinct from the session name).
- [6] Lines 609-665 and 746-753: conductors are persistent agent sessions that monitor others and can connect Telegram, Slack, Discord or Mattermost for remote control; a Telegram bridge is described as for 'mobile monitoring'; each conductor bot must own exactly one channel-owning session.
- [7] Lines 820-826 (Multi-Tool Support table): Claude Code and Gemini CLI listed Full; Codex listed with status detection, MCP, organization, conductor, fork; others (OpenCode, Copilot, Crush, Cursor, Hermes, pi, Oh My Pi, custom tools) listed at various levels.
- [8] Lines 843-856: Codex status detection uses Codex's notify hook (agent-deck codex-hooks install); without the hook, turn-level running/waiting status 'cannot converge reliably'; pi uses a hook extension, otherwise 'status is read from the pane, which is slower and occasionally wrong'.
- [9] Lines 1056-1069: opt-in dedicated tmux server (tmux -L agent-deck) so a stray tmux kill-server in the user's shell cannot take down managed sessions; default uses the user's default tmux server.
- [10] Lines 1148-1184: Remote Instances: 'Remote sessions report coarse live status'; agent-deck remote add/attach/sessions over SSH, installs agent-deck on the remote if missing; failed polls show auth failed, timeout, host down or poll failed; a conductor does not get remote completions automatically and needs 'agent-deck remote drain' because parent_session_id cannot point across machines.
- [11] Line 597: archiving a session stops its tmux process and hides it while preserving conversation, metadata and worktree; deleting removes it from the registry.

## Structural notes

Raw README.md of the public repository fetched on 2026-10-26; line numbers refer to that raw file. An earlier attestation (ashesh-agent-deck-tui) covers a different file and was not relied on for current behaviour.
