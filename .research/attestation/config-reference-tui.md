---
source_handle: config-reference-tui
fetched: 2026-08-14
source_url: https://learn.chatgpt.com/docs/config-file/config-reference
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The configuration reference specifies the terminal UI keys relevant to Agent Board: TUI notification defaults and the built-in terminal title writer. The reference says terminal title content defaults to `["spinner", "project"]` and can be disabled by setting the value to `null`.

## Key passages

- [1] Lines 1042-1045 and 4147-4147: the config schema defines `tui.notification_condition`, `tui.notification_method`, and `tui.notifications`, which enable TUI notifications and optionally restrict them to specific event types.
- [2] Lines 1049-1049 and 4205-4205: `tui.terminal_title` is an ordered list of terminal title item identifiers, defaults to `["spinner", "project"]`, and `null` disables title updates.

## Structural notes

- Relevant section: `## tui`.
- This page is the schema-style counterpart to the prose advanced-config page.
