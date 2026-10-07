---
id: gate-cruft-list-sessions-test-unused-terminal-identity-import
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

# Remove the unused list-sessions TerminalIdentity import

## Confidence

High

## Category

unused import

## Location

`tests/application/list-sessions.test.ts:7`

## Evidence

```typescript
import { SCHEMA_VERSION, type SessionRecord, type TerminalIdentity } from "../../src/domain/session.js";
```

TypeScript reports TS6133 because `TerminalIdentity` has no use beyond this import.

## Removal

Remove the `TerminalIdentity` type specifier while retaining `SCHEMA_VERSION` and `SessionRecord`.

## Implementation notes

- Execution capability: GPT-5.6 Sol inherited implementation worker; direct-read mechanical cleanup with no behavior risk.
- Review weight: standard, from the caller and project conventions; bounded inline standalone-story review.
- Files changed: `tests/application/list-sessions.test.ts` and this item.
- Tests added/removed: none; the existing list-sessions suite remains the focused behavioral check.
- Simplification: removed the unused `TerminalIdentity` type import.
- Discrepancies from design: none.
- Adjacent issues parked: none.

## Verification

- `npx tsx --test --test-concurrency=1 tests/application/list-sessions.test.ts` passes.

## Bounded inline review

The diff removes only the unreferenced type specifier while retaining the
schema-version value and record type used by the fixtures. No blocker found.
