---
source_handle: rps-zellij-cli-actions
fetched: 2026-10-26
source_url: https://zellij.dev/documentation/cli-actions.html
source_path: .research/source-captures/rps-zellij-cli-actions/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Zellij documentation of `zellij action ...` CLI subcommands. Relevant entries are tab, pane and session renaming, tab queries, plugin pipes, and `send-keys`/`write`. Tab names and pane names are separate entities each with its own rename command.

## Key passages

- [1] `rename-tab`: "Renames the focused tab"; arg: the tab name; option `-t, --tab-id <TAB_ID>`; examples `zellij action rename-tab "alice the cat"` and `zellij action rename-tab --tab-id 3 "my tab"`.
- [2] `rename-tab-by-id`: "Rename a tab by its stable ID"; example `zellij action rename-tab-by-id 5 "my new tab name"`.
- [3] `undo-rename-tab`: "Remove a previously set tab name"; `--tab-id` option.
- [4] `rename-pane`: "Renames the focused pane (title will appear on the pane frame)".
- [5] `rename-session`: "Rename the current session"; example `zellij action rename-session "my-new-session-name"`.
- [6] `query-tab-names`: "Query all tab names (receive a textual list on the command line)"; `current-tab-info`: "Get information about the currently active tab. Returns the tab name and ID by default."
- [7] `pipe`: "Send data to one or more plugins via a pipe. Plugins will be launched if they are not already running"; options include `--name`, `--args key=value`, `--plugin <URL>`, `--plugin-configuration`.
- [8] The action list includes `list-tabs`, `list-panes`, `send-keys`, `write`, `write-chars`, `dump-screen`, `go-to-tab-name`, `save-session`.

## Structural notes

- The page documents commands, not how the default tab name is derived or whether OSC title sequences from programs change tab names.
