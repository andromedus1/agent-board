---
id: gate-tests-rework-domain-port-runtime-test
kind: story
tags: [testing, refactor]
parent: null
depends_on: []
release_binding: null
gate_origin: tests
created: 2026-08-16
updated: 2026-08-16
---

# Replace the tautological port-contract runtime test

## Priority

Low

## Value evidence

Item: `epic-trustworthy-session-core-domain-contract`

Contract / risk / regression / maintenance cost: The item requires compile-time port use sites through normal typecheck (`.work/active/features/epic-trustworthy-session-core-domain-contract.md:173`). `tests/domain/session.test.ts:184` constructs local fake implementations and lines 206–215 assert only the literal values returned by those same fakes, invoking no production behavior.

## Gap type

low-value-test-removal

## Suggested test

```typescript
// Retain a type-only compile fixture or satisfies declarations; remove the runtime assertions from the executed suite.
```

## Test location (suggested)

`tests/domain/session.test.ts`
