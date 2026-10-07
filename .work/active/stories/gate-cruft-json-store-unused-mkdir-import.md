---
id: gate-cruft-json-store-unused-mkdir-import
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

# Remove the unused JSON-store mkdir import

## Confidence

High

## Category

unused import

## Location

`src/infrastructure/json-session-store.ts:1`

## Evidence

```typescript
import { mkdir, readdir, rm } from "node:fs/promises";
```

TypeScript reports TS6133 because `mkdir` has no use beyond this import.

## Removal

Remove the `mkdir` specifier while retaining `readdir` and `rm`.

## Implementation notes

- Execution capability: GPT-5.6 Sol inherited implementation worker; direct-read mechanical cleanup with no behavior risk.
- Review weight: standard, from the caller and project conventions; bounded inline standalone-story review.
- Files changed: `src/infrastructure/json-session-store.ts` and this item.
- Tests added/removed: none; the existing JSON-store suite remains the focused behavioral check.
- Simplification: removed the unused `mkdir` filesystem import.
- Discrepancies from design: none.
- Adjacent issues parked: none.

## Verification

- `npx tsx --test --test-concurrency=1 tests/infrastructure/json-session-store.test.ts` passes.

## Bounded inline review

The diff removes only the unused import specifier and retains both filesystem
operations used by the store. Persistence and locking behavior are unchanged.
No blocker found.
