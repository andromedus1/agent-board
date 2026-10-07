---
id: gate-cruft-register-session-test-unused-domain-imports
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

# Remove unused register-session domain imports

## Confidence

High

## Category

unused import

## Location

`tests/application/register-session.test.ts:16`

## Evidence

```typescript
import { SCHEMA_VERSION, type SessionRecord, type TerminalIdentity } from "../../src/domain/session.js";
```

TypeScript reports TS6133 for both `SCHEMA_VERSION` and `SessionRecord`; neither has a use beyond this import.

## Removal

Remove `SCHEMA_VERSION` and `SessionRecord`, reducing the declaration to a type-only import of `TerminalIdentity`.

## Implementation notes

- Execution capability: GPT-5.6 Sol inherited implementation worker; direct-read mechanical cleanup with no behavior risk.
- Review weight: standard, from the caller and project conventions; bounded inline standalone-story review.
- Files changed: `tests/application/register-session.test.ts` and this item.
- Tests added/removed: none; the existing registration suite remains the focused behavioral check.
- Simplification: reduced the domain import to the one used `TerminalIdentity` type.
- Discrepancies from design: none.
- Adjacent issues parked: none.

## Verification

- `npx tsx --test --test-concurrency=1 tests/application/register-session.test.ts` passes.

## Bounded inline review

The diff removes only the unused schema-version value and record type while
retaining the terminal type used by the fake adapter. No blocker found.
