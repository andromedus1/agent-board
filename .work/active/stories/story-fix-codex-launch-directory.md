---
id: story-fix-codex-launch-directory
kind: story
stage: review
parent: null
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-20
updated: 2026-10-18
tags: [bug, integration, cli]
---

# Bind managed Codex to the current launch directory

## Symptom and root cause

Plain launches in a repository subdirectory or a reused tab disconnect after
`Timed out binding Codex root thread`. The observer mistakes the durable
Board record's Git root for the current runtime's working directory.

## Fix approach

Resolve the invocation directory at the Codex process boundary, using the same
base directory inherited by its children and standard `-C`/`--cd` overrides.
Feed that runtime directory to observation while retaining exact path, parent,
and ambiguity checks. Stable Board identity and labels remain durable.
No Codex version pin, timeout increase, state migration, or new dependency is
needed. Terminal-emulator cleanup remains a separate backlog item.

## Acceptance criteria

- Plain launches in a repository subdirectory and relaunches after changing
  directory bind the current runtime without the saved-root timeout.
- Stable Board session identity and user labels survive relaunch.
- Exact-directory, child-thread, and ambiguity checks remain enforced.
- Standard directory override spellings resolve relative to the same base
  inherited by the owned children, including physical symlink resolution.

## Regression test

`tests/application/launch-managed-codex.test.ts` reproduces both a subdirectory
and a different repository against a retained Board root. Both failed before
the fix with the reported binding timeout. Add process-boundary coverage for
directory overrides and packaged coverage for same-tab relaunch.

## Investigation evidence

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

## Implementation notes

Execution capability: one Codex owner for this focused two-file production
repair; no independent or cross-model reviewer is appropriate for a standalone
story. A documentation worker updated README guidance and verified existing
foundation assertions without finding drift.

`CodexProcessHost` captures the child-process base cwd and resolves the runtime
directory from it and `-C`/`--cd`. `launchManagedCodex` passes that directory to
the existing observer instead of `identity.repoPath`. There are no session
schema changes or migrations, and binding guards are unchanged.

Verification:

- Both application regressions failed before the fix with the reported
  `Timed out binding Codex root thread`, and pass after it.
- Process-boundary tests cover default cwd, separated/attached/equals override
  forms, absolute paths, and symlinks. Existing mismatched/child/ambiguous
  thread checks remain green.
- A packed-install journey launches from `src/`, then another directory in
  the same registered terminal, observes working state, and retains session ID
  and label across both managed runs.
- `npm run typecheck`: passed. `npm test`: 236 passed, 3 opt-in probes skipped.
- `AGENT_BOARD_LIVE_CODEX=1 npm run test:integration:codex`: passed against
  installed Codex 0.160.1.
- Live disposable-PTY launches using the real installed `agent-codex` and
  Codex, with isolated Board state and a simulated Ghostty boundary, stayed
  bound and healthy beyond 12 seconds both from `src/` and with a retained
  `/previous/repository` identity. The latter replaced the old native thread
  and preserved Board ID and label. No model turn was submitted.
- A live `-C src` run stopped at Codex's Folder access trust prompt, before
  thread creation. That distinct pre-existing timeout is preserved as
  `idea-codex-startup-prompt-timeout`; no trust prompt was accepted or
  operator trust setting changed. Direct installed-server probes confirmed
  relative and absolute `thread/start` cwd resolve to the same physical path.

Adjacent issues remain unbound: `idea-managed-terminal-screen-cleanup` and
`idea-codex-startup-prompt-timeout`. The new startup-prompt issue involves
interactive readiness and is outside this directory-correlation repair.
