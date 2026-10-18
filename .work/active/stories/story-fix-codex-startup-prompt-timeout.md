---
id: story-fix-codex-startup-prompt-timeout
kind: story
stage: review
tags: [bug, integration, cli]
parent: null
depends_on: []
release_binding: null
gate_origin: null
created: 2026-10-18
updated: 2026-10-18
---

# Allow interactive Codex startup before root-thread binding

## Symptom
Codex can stop with `Timed out binding Codex root thread` while the user is still at its Folder access trust prompt. Promoted from `idea-codex-startup-prompt-timeout`; the installed Codex 0.160.1 PTY reproduction is recorded in that backlog item’s Git history.

## Root cause
`bindCodexThread` starts one deadline before initial discovery and applies it to the empty notification stream before any thread exists. The interval includes human startup decisions.

## Fix approach
Keep initial discovery bounded. Wait abortably without a wall-clock deadline while no thread evidence exists; start the matching budget when thread evidence arrives, preserving cwd, parent, and ambiguity guards. Keep the Board diagnostic until this runtime binds. The launcher still owns TUI/server exits, transport failures and cancellation. Do not read screens to infer approval or answer startup prompts.

## Regression test
`tests/integrations/codex/thread-binding.test.ts`: delayed root after three binding budgets fails on the original code because the iterator was closed. Additional cases retain discovery timeout, unmatched-thread timeout and cancellation. Add application coverage for waiting, eventual binding and lifecycle exits.

## Implementation notes

- Execution: host Codex implements these focused fixes sequentially; no independent
  reviewer is required or permitted for standalone stories.
- Changed thread binding so initial discovery remains bounded and an empty
  subscription can wait for interactive startup. The first thread evidence starts
  a matching deadline that subsequent events do not extend. Abort, transport
  closure, process exit, wrong cwd, child-thread and ambiguity guards remain.
- The launcher publishes inferred unknown startup evidence and reconciles the
  title, so an old runtime’s working state cannot appear current while waiting.
  Stable identity and attention metadata remain separate from this evidence.
- Regression evidence: delayed startup and application launch tests failed before
  the fix (iterator closed / both child processes stopped); they pass after it.
  Tests also cover eventual root binding, unresponsive discovery, unmatched
  activity, stream closure, cancellation and TUI/server exit during startup.
- Typecheck passed. Full local suite: 244 passed, 3 opt-in probes skipped; two
  additional binding-edge tests subsequently passed in the focused run. Final
  complete-suite verification will run in required macOS Node 22/26 CI.
- Installed Codex 0.160.1 was launched through the real process host, app-server
  client and managed lifecycle in a disposable controlling PTY, with an in-memory
  Board store and fake terminal title adapter. Its real Folder access prompt
  remained unanswered and alive beyond 13 seconds; the Board stayed diagnostic
  without a bound thread. SIGTERM then produced interruption and stopped both
  owned children. No prompt was approved and no model task was sent.
- README now describes startup waiting and retained failure bounds.
- Adjacent issues: none newly parked. Required CI pending.

## Review (2026-10-18)

**Verdict**: Approve implementation; required CI pending.
**Blockers**: None in the implementation.
**Important / Nits / Rejected**: None.

Bounded inline standalone-story review, one host pass; no independent or
cross-model reviewer. Inspected deadline ownership, subscription/discovery race,
abort and timeout cleanup, stream closure, process lifecycle, fresh startup
projection and preserved binding guards. Empty startup waits carry no claim of
native agent state. Requests and matching after thread evidence remain bounded;
no permission response is synthesized. No CLI/schema migration or foundation
assertion drift. Red/green regressions and the real unanswered trust-prompt
probe support the behavior. Completion remains at review until Node 22/26 CI.
