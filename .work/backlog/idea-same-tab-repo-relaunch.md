---
id: idea-same-tab-repo-relaunch
created: 2026-08-20
updated: 2026-08-20
tags: [bug]
---

Investigate and fix managed-session relaunch when a Ghostty tab is reused for a
different repository. Reproduced by exiting a working `agent-codex` session in
`data-platform` with Ctrl+C, changing the same tab to `data-warehouse`, and
running `agent-codex` again. Two launches started Codex successfully but ended
after the 10-second root-thread binding timeout; opening a fresh tab worked.

The observed cause is that Agent Board intentionally preserves the stable Board
session after managed exit, then `registerSession` reuses the record for the
same terminal without refreshing its repository identity. The observer still
expects the stored `data-platform` path and rejects the new Codex root whose cwd
is `data-warehouse`. Current workaround: run `agent-board unregister` before
reusing a tab for another repository, or open a new tab.
