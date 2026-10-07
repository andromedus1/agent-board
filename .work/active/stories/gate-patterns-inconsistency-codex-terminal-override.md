---
id: gate-patterns-inconsistency-codex-terminal-override
kind: story
stage: done
tags: [refactor]
parent: feature-align-shared-port-composition-overrides
depends_on: [gate-patterns-inconsistency-launcher-focused-terminal-port]
release_binding: null
gate_origin: patterns
created: 2026-08-16
updated: 2026-08-16
---

# Narrow the Codex terminal composition override to ports

## Pattern

`port-overrideable-per-binary-composition-root`

## Divergence

`src/composition/create-agent-codex.ts:19` requires the concrete
`GhosttyClient` type for its terminal override in addition to the registration,
reconciliation, and focus capabilities it actually consumes.

## Behavior-preserving reconciliation

Replace the concrete constraint with the required shared-port intersection.
The production default and every runtime method call remain unchanged.

## Acceptance Criteria

- [ ] The terminal override is the intersection of registration,
      reconciliation, and focused-terminal ports.
- [ ] `GhosttyClient` remains only the production default implementation.
- [ ] Typecheck and composition tests pass without behavioral changes.

## Risk and rollback

Low risk. Revert the type-only composition change if an actual consumed
capability is missing.

## Implementation notes

Narrowed the Codex composition terminal override to the three shared ports it
consumes: registration, reconciliation, and focused-terminal capabilities.
`GhosttyClient` remains the production default implementation.

## Verification

- `npm run typecheck`
- Bounded inline review confirmed no runtime construction or method calls changed.
