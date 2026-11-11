---
source_handle: hma-lead-herdr-tui-state-api
fetched: 2026-11-10
source_url: https://herdr.dev/tui/docs/socket-api/
source_path: .research/source-captures/hma-lead/socket-api.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr TUI documentation (socket API, integrations, session state) on how
external integrations report agent lifecycle state to the Herdr server, how
that reported state takes precedence over screen detection, and when restored
agent panes resume after a server restart. Captures of all three pages are in
`.research/source-captures/hma-lead/`.

## Key passages

- [1] Socket API, "What you can control": the socket API can "report custom agent state from hooks and plugins". The raw method list includes `pane.report_agent`, `pane.report_agent_session`, `pane.report_metadata`, `pane.clear_agent_authority` and `pane.release_agent`.
- [2] Socket API, "Agent state reporting": "Integrations report agent state with pane.report_agent"; the example request carries `pane_id`, `source` (e.g. `custom:docs`), `agent`, `state` and `message`; "state carries semantic agent state and affects waits, notifications, and rollups."
- [3] Socket API: `pane.report_agent` and `pane.report_agent_session` accept an optional `resume_argv`; "A custom agent must hold the pane through pane.report_agent before it can attach a command"; the command "takes precedence over Herdr's built-in resume command for that agent."
- [4] Integrations page (https://herdr.dev/tui/docs/integrations/): "The Pi, OMP, Kimi Code CLI, OpenCode, Kilo Code CLI, and MastraCode integrations also report the agent's state. While they report, Herdr uses them instead of reading the screen. The others leave state to screen detection." CLI form: `herdr pane report-agent w1:p1 --source custom:docs --agent docs-bot --state working`.
- [5] Integrations page: "User hooks that run next to a Herdr-managed integration should use metadata instead of report-agent. Metadata changes presentation without taking over the integration's idle, working, blocked, or session restore authority."
- [6] Socket API, `agent.explain`: reports "the final state, manifest source and version, matched rule, evaluated rule evidence, skip-state reason, idle fallback reason, and screen_detection_skip_reason when a full lifecycle hook authority makes screen rules non-authoritative." `state_labels` keys must be idle, working, blocked, done or unknown.
- [7] Session-state page (https://herdr.dev/tui/docs/session-state/), "Native agent session restore": Herdr resumes panes "that reported a native session reference through a current official Herdr integration, and panes whose agent reported its own resume command"; "After a client attaches and provides terminal size and theme context, Herdr resumes eligible restored agent panes across workspaces and tabs without waiting for each pane to be focused."

## Structural notes

Fetched with curl on 2026-11-10 and converted from HTML to text for reading;
docs version shown as Herdr TUI 0.9.5. The pages describe the reporting
interface, not which states besides idle/working/blocked a custom reporter may
send; the full JSON Schema is available locally via `herdr api schema --json`
(not read). The pages do not say whether the sidebar shows the reporting source
to the user.
