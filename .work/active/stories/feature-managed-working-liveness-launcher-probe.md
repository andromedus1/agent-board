---
id: feature-managed-working-liveness-launcher-probe
kind: story
stage: done
tags: [state, integration]
parent: feature-managed-working-liveness
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-16
updated: 2026-08-16
---

# Add a non-destructive launcher liveness boundary

Introduce the domain port and Node process adapter that answer whether the
persisted managed launcher PID still exists using signal 0. Preserve explicit
`EPERM`/`ESRCH` semantics and inject all process behavior in tests.

## Acceptance evidence

- Existing, missing, permission-denied, and unsafe PID cases are covered at the
  adapter boundary.
- No test or production probe sends a destructive process signal.

## Implementation evidence

- Added `LauncherLivenessPort` and `NodeLauncherLiveness` with signal-zero
  probing, safe-positive PID validation, and conservative `EPERM`/`ESRCH`/other
  error handling.
- Tests inject the process kill function and cover success, missing,
  permission-denied, unexpected failure, and unsafe PID inputs.
- Verification: `npx tsx --test --test-concurrency=1
  tests/integrations/launcher-liveness.test.ts` (2 passed), `npm run typecheck`
  (passed), and `git diff --check` (passed).
