---
source_handle: rps-zellij-plugin-api
fetched: 2026-10-26
source_url: https://zellij.dev/documentation/plugin-api-commands.html
source_path: .research/source-captures/rps-zellij-tab-bar/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Zellij plugin API command reference (Rust). It exposes tab rename calls, tab information events carrying a tab `name`, and a permission model (ReadApplicationState, ChangeApplicationState) that the user grants.

## Key passages

- [1] `rename_tab(tab_position: u32, new_name)` and `rename_tab_with_id(tab_id: u64, new_name)`: required permission ChangeApplicationState; `undo_rename_tab()` reverts to the previous name.
- [2] `rename_session(name)`, `rename_terminal_pane(terminal_pane_id, new_name)` and `rename_plugin_pane(plugin_pane_id, new_name)` exist as separate calls.
- [3] `Event::TabUpdate(tabs)` example reads `focused.name` from `TabInfo`, i.e. a tab carries a single `name` string in the event example.
- [4] `get_pane_running_command(pane_id)` returns the command argv of a terminal pane; `get_pane_cwd` and `get_pane_pid` likewise; permission ReadApplicationState.
- [5] `request_permission(&[PermissionType...])`: the user is prompted to grant or deny; results delivered via `PermissionRequestResult`.

## Structural notes

- Full `TabInfo` field list was not read; only the `name` use in the example is attested. Whether a separate status field exists on tabs is not documented in the passages read.
