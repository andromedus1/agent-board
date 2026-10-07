---
id: gate-cruft-packaged-golden-test-unused-harness-type-import
kind: story
stage: done
tags: [cleanup]
parent: null
depends_on: []
release_binding: null
gate_origin: cruft
created: 2026-08-16
updated: 2026-08-16
---

# Remove the unused packaged-golden harness type import

## Confidence

High

## Category

unused import

## Location

`tests/e2e/packaged-golden.test.ts:4`

## Evidence

```typescript
import { createPackageHarness, waitForScenario, type PackageHarness } from "./support/package-harness.js";
```

TypeScript reports TS6133 because `PackageHarness` has no use beyond this import.

## Removal

Remove the `PackageHarness` type specifier while retaining the two runtime imports.

## Implementation notes

Removed the unused `PackageHarness` type-only import from the packaged golden
test. No runtime behavior or harness boundary changed.

## Verification

- `npm run typecheck` (green; confirms TS6133 is absent)
- Bounded inline review: the diff removes only the unused type specifier and
  preserves both runtime imports.
