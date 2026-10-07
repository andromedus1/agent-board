---
id: story-fix-lock-contention-silent-exit
kind: story
stage: done
tags: [bug, state]
parent: null
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Prevent silent CLI exit during lock contention

## Symptom

The packaged golden journey intermittently observed `agents --json` exit zero
with empty stdout while `agent-codex` was updating the same session.

## Root cause

`withFileLock` configured retry timers with `unref: true`, allowing a contending
CLI's event loop to terminate while its command promise was still pending. The
same retry policy set `forever: true`, preventing `maxRetryTime` from enforcing
the documented lock-acquisition bound.

## Fix approach

Keep retry timers referenced and use a sufficiently large finite retry count so
`maxRetryTime` terminates contention with the canonical `LOCK_TIMEOUT` error.

## Regression test

`tests/infrastructure/file-lock.test.ts` holds a real lock, launches a fresh Node
process that calls `withFileLock`, and asserts it remains alive until it exits
nonzero with `LOCK_TIMEOUT` rather than silently succeeding with no output.

## Implementation notes

- Execution capability: GPT-5.6; the repair is a focused lock-policy bug with a
  deterministic subprocess reproduction.
- Files changed: `src/infrastructure/file-lock.ts` and
  `tests/infrastructure/file-lock.test.ts`.
- Confirmation: the regression failed with Node's unsettled-top-level-await
  warning and no Agent Board error before the fix; it now reports the bounded
  timeout. The focused lock/store suite passes 8/8.
- Adjacent issues parked: none; packaged-harness findings remain owned by the
  active e2e feature review.

## Review (2026-08-14)

**Verdict**: Approve.

Bounded inline review confirmed the finite retry count cannot expire before the
configured maximum retry time, referenced timers keep the CLI alive, the
canonical timeout mapping remains intact, and cleanup releases both the held
lock and temporary root. The subprocess regression distinguishes the original
silent success from the required typed failure. No independent review was used
for this standalone story.
