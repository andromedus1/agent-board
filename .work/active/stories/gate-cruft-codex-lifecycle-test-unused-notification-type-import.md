---
id: gate-cruft-codex-lifecycle-test-unused-notification-type-import
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

# Remove the unused CodexNotification test import

## Confidence

High

## Category

unused import

## Location

`tests/integrations/codex/lifecycle.test.ts:6`

## Evidence

```typescript
import type { CodexNotification } from "../../../src/integrations/codex/protocol.js";
```

TypeScript reports TS6133 because `CodexNotification` has no use beyond this import.

## Removal

Delete the unused type-import line. No callers, tests, or surrounding imports need adjustment.

## Implementation notes

- Execution capability: GPT-5.6 Sol inherited implementation worker; direct-read mechanical cleanup with no behavior risk.
- Review weight: standard, from the caller and project conventions; bounded inline standalone-story review.
- Files changed: `tests/integrations/codex/lifecycle.test.ts` and this item.
- Tests added/removed: none; the existing lifecycle test file remains the focused behavioral check.
- Simplification: removed the unused `CodexNotification` type import.
- Discrepancies from design: none.
- Adjacent issues parked: none.

## Verification

- `npx tsx --test --test-concurrency=1 tests/integrations/codex/lifecycle.test.ts` passes.

## Bounded inline review

The diff deletes only an unreferenced type import. Lifecycle fixtures,
assertions, and production code are unchanged. No blocker found.
