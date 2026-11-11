---
source_handle: rps-zellij-keybind-actions
fetched: 2026-10-26
source_url: https://zellij.dev/documentation/keybindings-possible-actions.html
source_path: .research/source-captures/rps-zellij-keybind-actions/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Zellij documentation of actions that can be bound in a keybinding configuration. Tab rename is done through a RenameTab input mode with `TabNameInput`; `MessagePlugin` sends a pipe message to a plugin from a keybinding; `Run` opens a command in a new pane.

## Key passages

- [1] `TabNameInput`: "Send byte input for renaming the focused tab. Typically used in the `RenameTab` input mode."
- [2] `RenamePane`, `RenameSession` ("Rename the current session"; example `bind "a" { RenameSession "my-new-session-name"; }`) and `UndoRenamePane` exist as keybinding actions.
- [3] `MessagePlugin`: "Send a message to one or more plugins, using a pipe - meaning the plugin will be launched if it is not already running"; `name`, `payload`, `cwd` arguments; `MessagePluginId` targets a running plugin by numeric ID.
- [4] `Run`: "Run the specified command in a new pane" with `cwd` and `direction`.
- [5] `SwitchToMode "locked"` example for mode switching.

## Structural notes

- The page was read for rename-related actions; the rename input mode being an interactive prompt (rather than a templated command with prefilled text) is inferred from `TabNameInput` taking byte values and is not stated outright.
