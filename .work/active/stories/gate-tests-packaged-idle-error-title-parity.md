---
id: gate-tests-packaged-idle-error-title-parity
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

# Assert packaged title parity for idle and error outcomes

## Priority

High

## Value evidence

Item: `epic-operational-readiness-packaged-e2e`

Contract / risk / regression / maintenance cost: The packaged feature requires title/board convergence across all five outcomes (`.work/active/features/epic-operational-readiness-packaged-e2e.md:134`). Golden coverage asserts titles for working, input, and completion (`tests/e2e/packaged-golden.test.ts:41`, `:61`) but only board idle at lines 67 and 82; failure coverage checks an error row (`tests/e2e/packaged-failure.test.ts:46`) without the external title.

## Gap type

e2e-seam

## Suggested test

```typescript
test("packed lifecycle keeps idle and error titles in parity with board rows", async () => { /* assert ○ label after clean idle and × label after managed failure within the convergence bound */ });
```

## Test location (suggested)

`tests/e2e/packaged-golden.test.ts and tests/e2e/packaged-failure.test.ts`

## Implementation notes

Extended the existing packaged golden lifecycle to assert the clean managed
idle title (`○ label`) alongside its board row, and the packaged failure
journey to assert the managed error title (`× label`) alongside the error row.
Both assertions use the harness scenario convergence helper and keep the
existing process cleanup path.

## Verification

- `npx tsx --test --test-concurrency=1 tests/e2e/packaged-golden.test.ts tests/e2e/packaged-failure.test.ts`
- `npm run typecheck`
- Bounded inline review: assertions exercise installed binaries and the fake
  Ghostty title boundary; no source imports or fixed sleeps were introduced.
