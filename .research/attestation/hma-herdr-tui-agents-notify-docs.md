---
source_handle: hma-herdr-tui-agents-notify-docs
fetched: 2026-11-10
source_url: https://herdr.dev/tui/docs/agents/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Currency re-fetch of Herdr TUI (0.9.5) docs on agent status, integrations, rename/labels, notifications and the socket API. Claude Code and Codex are still "Supported by Herdr": state is read from the live screen by manifest; their integration hooks report session identity (for native resume), not lifecycle state. Blocked is deliberately strict and falls back to idle. Rename commands exist for workspace, tab, pane and agent; metadata tokens are display-only. Notifications are toasts/terminal/system; an event subscription and send-keys API exist.

## Key passages

- [1] Agents, "Supported by Herdr": "Herdr recognizes these agents and reads their state from what they draw on screen"; Claude Code (integration `claude`) and Codex (`codex`) are in this table, while OpenCode, Pi, Kimi and Kilo are annotated "also reports state"; the "Supported by the agent" list (Command Code, Crush, Kiro CLI, Muse Code, Prime Agent) report their own state.
- [2] Agents, "How status works": "When an integration also reports state, Herdr uses those reports instead of reading the screen. For agents that support Herdr, the agent's own reports decide the state."
- [3] Integrations (https://herdr.dev/tui/docs/integrations/), Claude Code: "The hook reports Claude Code session identity to the local Herdr socket on session start. Claude Code state comes from Herdr's screen manifest detection." Codex: "The Codex hook reports session identity through the same local socket API ... Codex state comes from Herdr's screen manifest detection."
- [4] Agents, "Blocked state": "Herdr only marks blocked when the live bottom-buffer snapshot matches known visible approval, question, or permission UI. If no manifest rule matches for a known agent, Herdr falls back to idle"; "Unusual new agent prompts may initially show as idle instead of blocked ... idle status is not authorization to approve an action."
- [5] Agents, "State rollups": "A blocked agent makes its pane, tab, and workspace look blocked. A working agent makes the workspace look active. A done agent stays visible until you view it."
- [6] Concepts (https://herdr.dev/tui/docs/concepts/), Agent states: Done means idle and not yet seen; "Each client tracks which completions it has displayed. Viewing a completion in one client does not clear another client's Done badge." Socket API (https://herdr.dev/tui/docs/socket-api/): effective status values are idle, working, blocked, done and unknown.
- [7] Agents, "Custom agent labels": `herdr agent rename w1:p1 reviewer` renames an agent target "for display". CLI reference (https://herdr.dev/tui/docs/cli-reference/) lists `herdr workspace create --label`, `workspace rename`, `tab rename`, `pane rename <pane_id> <label>|--clear`, and `agent rename <target> <name>|--clear`.
- [8] Agents, "Custom status labels" and Socket API "Metadata": `pane report-metadata` supplies display-only tokens (`summary`, `title`, `display_agent`, per-state labels with keys idle, working, blocked, done, unknown) renderable in sidebar rows; "state controls waits, notifications, and rollups"; "Token metadata is not restored after a server restart"; `terminal_title` values are "ephemeral across a cold restart". Concepts says panes "can be renamed manually"; the fetched pages do not state whether workspace, tab, pane or agent rename labels persist across a server restart.
- [9] Agents, "Detection manifests": remote manifests from herdr.dev patch detection rules automatically unless `[update] manifest_check = false`; `herdr agent explain <target>` reports the matched rule, manifest source and idle fallback reason.
- [10] Configuration (https://herdr.dev/tui/docs/configuration/), "Notifications": `[ui.toast] delivery` can be `herdr` (in-app toast), `terminal` ("an outer-terminal notification that also works over SSH"), `system` (local OS service) or `off`; popups are suppressed for the active tab; sound plays "through the local Herdr client".
- [11] Socket API, "Event subscriptions": `events.subscribe` streams events including `pane.agent_status_changed`; "Event history is not durable"; a lagging subscriber receives `events_lost` and is closed. `notification.show` / `herdr notification show` raises a user notification.
- [12] CLI reference: `herdr agent send-keys <target> [key ...]` "sends logical terminal keys such as enter, up, esc, or ctrl+c"; Socket API lists `pane.send_text`, `pane.send_keys`, `pane.send_input`; Automation pages describe `agent prompt --wait`. No structured approve/deny decision method appears in the fetched pages.
- [13] Socket API, "Socket paths": the default socket is `~/.config/herdr/herdr.sock` (named sessions under `~/.config/herdr/sessions/<name>/herdr.sock`); transport is newline-delimited JSON over a Unix domain socket on Unix. The fetched text does not state socket file permissions.

## Structural notes

Official docs pages converted from HTML to text on 2026-11-10 (documentation version Latest 0.9.5). Supersedes for currency `rps-herdr-agents-currency-docs` (2026-10-26): Claude and Codex status authority is unchanged.
