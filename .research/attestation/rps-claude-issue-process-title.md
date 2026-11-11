---
source_handle: rps-claude-issue-process-title
fetched: 2026-10-26
source_url: https://claudeissues.com/issue/49852-process-title-is-set-to-version-number-instead-of-claude-breaking-tmux-window-na
source_path: .research/source-captures/rps-claude-issue-process-title/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

A third-party mirror (claudeissues.com) of a Claude Code issue report, not the upstream tracker page. The report states that Claude Code sets `process.title` to its version string, so tmux's automatic-rename shows the version as the window name. The mirror shows the issue as closed, not planned.

## Key passages

- [1] Description: Claude Code sets `process.title` to its version string (example `2.1.112`); tools reading the process name, "most notably tmux's `automatic-rename`", then display the version as the window name instead of `claude`. Reproduction: run `claude` in a tmux pane with automatic-rename enabled (the default) and observe the window name.
- [2] Metadata: reported on v2.1.112; opened Apr 17, 2026; closed May 30, 2026 with status "Closed - not planned"; maintainer reply "None cached".

## Structural notes

- Mirror site, not the upstream tracker; reporter's description, not maintainer-confirmed behavior. Current behavior on later Claude Code versions was not tested.
