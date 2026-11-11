---
source_handle: hma-reboot-herdr-issues-handoff
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/issues?q=handoff
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

State on 2026-11-10 of four open herdrdev/herdr issues about live handoff: #5443 (macOS agent_session cleared), #808 (macOS responsible-process/TCC attribution lost), #3864 (scrollback loss across 0.8.x to 0.9.0) and #4972 (handoff under a systemd user service). Evidence on handoff stability for a supervised host.

## Key passages

- [1] #5443 (OPEN, labels bug, p2, macos, sessions, triaged; created 2026-10-20): "When two panes have the same `agent_session` value, `herdr server live-handoff` keeps it on one pane and sets the other pane's `agent_session` to null. Both panes and their processes survive the handoff." Expected: "A live handoff leaves every pane's `agent_session` exactly as it was before the handoff." Cause of duplicate ids (comment goroshillc): Codex runs one shared background app-server that inherited one pane's `HERDR_PANE_ID`.
- [2] #808 (OPEN, no labels, created 2026-06-25, updated 2026-11-10): "After `herdr server live-handoff`, every pane under the new server loses macOS responsible-process attribution. Anything that shells out to `op` (1Password CLI integration) prompts on every call with no \"Always Allow\" option". Comment ciiiii (2026-08-16): "It also happens without handoff" when `herdr --remote` replaces a healthy server.
- [3] #3864 (OPEN, labels bug, maintainer-needed, p2, linux, sessions, install-update; created 2026-09-09): after `update --handoff` across 0.8.x to 0.9.0, "Each agent pane displays only an empty input box. The conversation transcript and visible pane content are gone." and "The agents themselves remain functional: relaunching each agent with --resume=<id> restores the context". Comment Yahook (2026-09-18, stable 0.9.0 to 0.9.1, Linux): "Processes, panes, workspaces and agent bindings all survived. The scrollback above the visible screen did not."
- [4] #4972 (OPEN, labels maintainer-needed, p2, linux, sessions, install-update, triaged; created 2026-10-05): "I run `herdr server` as a systemd user service ... A live handoff ... goes one of two ways: Default unit (`ExitType=main`): right after the handoff, the unit goes to `inactive (dead)` ... The new server and every pane are killed, and systemd doesn't restart anything. With `ExitType=cgroup`: the panes survive ... But systemd shows `MainPID=0`." Comment rchristensen (2026-10-14, 0.9.4 Linux): "the live handoff itself works well for us: across several 0.9.3 to 0.9.4 handoffs, every pane process kept its PID and state, in roughly 50–135 ms. The problem is purely supervision".

## Structural notes

Read with `gh issue view <n> --json` on 2026-11-10 (captures herdr-issue-5443.json, -808, -3864, -4972). Reports are user accounts; #4972 is Linux/systemd and is evidence about supervision of a handed-off server, not about macOS launchd. No fetched issue states how a launchd KeepAlive job behaves across handoff.
