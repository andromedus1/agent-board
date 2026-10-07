---
id: gate-tests-stale-lock-takeover
kind: story
stage: done
tags: [testing]
parent: null
depends_on: []
release_binding: null
gate_origin: tests
created: 2026-08-16
updated: 2026-08-16
---

# Cover crash-stale lock takeover on the real filesystem

## Priority

High

## Value evidence

Item: `epic-trustworthy-session-core-atomic-store`

Contract / risk / regression / maintenance cost: The store design promises stale-lock recovery (`.work/active/features/epic-trustworthy-session-core-atomic-store.md:108`). Existing coverage verifies fresh-lock timeout/release (`tests/infrastructure/json-session-store.test.ts:131`) and the silent-exit contention regression (`tests/infrastructure/file-lock.test.ts:12`), but never proves takeover of an abandoned stale lock.

## Gap type

complex-unit

## Suggested test

```typescript
test("stale abandoned lock is recovered while fresh lock still times out", async () => { /* orphan and age a proper-lockfile lock, then prove takeover and fresh-heartbeat protection */ });
```

## Test location (suggested)

`tests/infrastructure/file-lock.test.ts`

## Implementation notes

Added real-filesystem coverage for both sides of the stale-lock contract. A
live `proper-lockfile` heartbeat remains protected and returns the existing
bounded `LOCK_TIMEOUT`; a separate child process is then killed without
release, and the abandoned lock is taken over after the documented two-second
minimum stale interval. The child is shell-free, bounded, and removed during
fixture cleanup.

## Verification

- `npx tsx --test --test-concurrency=1 tests/infrastructure/file-lock.test.ts`
- `npm run typecheck`
- Bounded inline review: the test uses the real proper-lockfile directory and
  process boundary, does not mutate production lock behavior, and cleans the
  temporary state root even on failure.
