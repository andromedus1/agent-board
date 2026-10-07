---
id: gate-patterns-inconsistency-launcher-focused-terminal-port
kind: story
stage: done
tags: [refactor]
parent: feature-align-shared-port-composition-overrides
depends_on: []
release_binding: null
gate_origin: patterns
created: 2026-08-16
updated: 2026-08-16
---

# Reuse the shared focused-terminal port in managed launch

## Pattern

`shared-capability-port-reuse`

## Divergence

`src/application/launch-managed-codex.ts:24` redeclares
`FocusedTerminalPort`, although the same capability is already owned by
`src/domain/ports.ts:44`.

## Behavior-preserving reconciliation

Import the shared type and remove the local declaration. This changes only the
compile-time ownership of the interface; runtime construction and calls remain
unchanged.

## Acceptance Criteria

- [ ] Import `FocusedTerminalPort` from `src/domain/ports.ts`.
- [ ] Delete the identical local declaration.
- [ ] Typecheck and managed-launch tests pass without behavioral changes.

## Risk and rollback

Low risk. Revert the single import/declaration commit if type ownership does not
remain equivalent.

## Implementation notes

Reused the canonical `FocusedTerminalPort` from `domain/ports.ts` and removed
the identical managed-launch-local declaration. Runtime dependencies and calls
are unchanged.

## Verification

- `npx tsx --test --test-concurrency=1 tests/application/launch-managed-codex.test.ts`
- `npm run typecheck`
- Bounded inline review confirmed the diff is limited to type ownership.
