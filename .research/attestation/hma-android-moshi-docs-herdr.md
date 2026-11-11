---
source_handle: hma-android-moshi-docs-herdr
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/herdr
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation page for using Herdr behind Moshi: session picker, agent state in the Herdr sidebar, how moshi-hook tags events with Herdr context, deep links, gestures, and Herdr detection troubleshooting.

## Key passages

- [1] "When Moshi connects to a host that has running Herdr sessions, the session picker lists them under a Herdr tab." Named sessions are separate persistent servers; Moshi shows only sessions whose server is currently running.
- [2] "The sidebar shows each agent pane's state (blocked, working, done) so you can scan the whole session at a glance. moshi-hook reads $HERDR_ENV and $HERDR_SESSION and reports kind=herdr plus the session and workspace on inbox events, so approvals and turn completion are tagged with the right session and workspace."
- [3] "Opening one of those agent events from the Moshi Inbox reconnects to the host and reattaches that Herdr session"; an external app or notification can reopen an active card with moshi://herdr?workspace=<workspace id>.
- [4] Gestures: swipe moves tabs, two-finger swipe moves panes, two-finger vertical swipe moves workspaces, pinch zooms a pane; the Herdr panel composes shortcuts as <prefix> + <suffix> with the default Ctrl-B prefix.
- [5] Mobile tips: "Prefer separate tabs over many small panes"; "The agent-state sidebar is most useful in landscape on iPad; on iPhone, fold it down with Ctrl-B chords rather than fighting for screen space."
- [6] Detection runs over a non-login, non-interactive SSH shell, so herdr must be on that PATH (common causes ~/.local/bin or /usr/local/bin missing); the background daemon may need MOSHI_HERDR_PATH set on systemd hosts.
- [7] Moshi calls herdr session list --json; the always-emitted default entry is filtered out when its server is stopped.

## Structural notes

- Vendor documentation; page marked updated 1 month ago. Wording is iOS-oriented (iPad, iPhone) with no Android-specific statement.
