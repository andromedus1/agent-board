---
source_handle: rps-zellij-resurrection
fetched: 2026-10-26
source_url: https://zellij.dev/documentation/session-resurrection.html
source_path: .research/source-captures/rps-zellij-resurrection/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Zellij documentation on session resurrection. Sessions are serialized to the user's cache folder and can be recreated after an intentional quit or crash; layout and the command in each pane are restored, with the commands held behind a confirmation banner.

## Key passages

- [1] "by default, each Zellij session is serialized and kept in the user's cache folder waiting to be recreated after an intentional quit or an unintentional crash"; exited sessions are listed via CLI or the session-manager and resurrected by attaching or selecting them in the EXITED section.
- [2] "By default, Zellij serializes the session layout (panes and tabs) and the command running in each pane (it will re-run them in command panes)"; viewport and scrollback serialization are opt-in (`pane_viewport_serialization`, `scrollback_lines_to_serialize`).
- [3] "Zellij does not immediately run resurrected commands, but rather places them behind a 'Press ENTER to run...' banner".
- [4] `post_command_discovery_hook` exists because command discovery "can sometimes be inaccurate", for example inside wrappers.
- [5] `session_serialization false` in config disables serialization and resurrection.

## Structural notes

- Page does not say whether tab names are serialized (layout of "panes and tabs" is stated); it does state tabs are serialized in order.
