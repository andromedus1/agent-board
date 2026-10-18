---
id: idea-same-tab-repo-relaunch
created: 2026-08-20
updated: 2026-10-18
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

Investigation on 2026-10-18 confirmed a second trigger: a plain launch from a
repository subdirectory. `launchManagedCodex` passes the registered
`identity.repoPath` (Git root) as `expectedWorkingDirectory`, and
`bindCodexThread` requires exact equality with the native thread's `cwd`.
Even a newly registered tab therefore rejects a healthy thread launched below
the Git root. Opening a new tab or unregistering does not address this case.

Andrew reported disconnection a few seconds after a plain `agent-codex` launch.
The retained session record contained `Timed out binding Codex root thread`.
Runtime metadata showed an earlier thread in
`project-blueprint/blueprint-suite` against the saved `project-blueprint` root;
the latest failed launch's workspace command used `agent-board` while the same
Board record still retained `project-blueprint`. Both mismatch forms are
consistent with the existing exact-path filter.

Live reproduction with installed Codex 0.160.1, using a disposable app-server
and an ephemeral thread: starting the thread in this repository's `src/` with
the repository root as the expected directory produced the identical binding
timeout. Binding that same healthy thread with its actual `src/` directory
succeeded. A separate real remote-TUI probe in the matching repository root
also bound successfully. The installed capability/schema integration test
passed. No model turn was submitted by these probes.

On timeout, `launchManagedCodex` stops the TUI and its private app-server and
returns exit code 1; the useful failure detail is persisted in the session
record rather than printed by the CLI. The forced-shutdown display issue is
tracked separately in `idea-managed-terminal-screen-cleanup`.
