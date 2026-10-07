---
id: gate-patterns-inconsistency-codex-process-override
kind: story
stage: done
tags: [refactor]
parent: feature-align-shared-port-composition-overrides
depends_on: [gate-patterns-inconsistency-codex-terminal-override]
release_binding: null
gate_origin: patterns
created: 2026-08-16
updated: 2026-08-16
---

# Narrow the Codex process composition override to its capability

## Pattern

`port-overrideable-per-binary-composition-root`

## Divergence

`src/composition/create-agent-codex.ts:21` types the process override as the
concrete `CodexProcessHost`, unlike the other composition roots' capability
typed override seams.

## Behavior-preserving reconciliation

Type the override as `ManagedLaunchDependencies["processes"]` or an equivalent
narrow port. This preserves every invoked method and the production default.

## Acceptance Criteria

- [ ] The process override is typed from the managed-launch process capability.
- [ ] `CodexProcessHost` remains only the production default implementation.
- [ ] Typecheck, composition tests, build, and the full suite pass.

## Risk and rollback

Low risk. Revert the type-only composition change if the narrow capability does
not cover a consumed method.

## Implementation notes

Typed the Codex process override from the managed-launch capability, retaining
`CodexProcessHost` solely as the production default constructor.

## Verification

- `npm run typecheck`
- Bounded inline review confirmed the indexed capability includes every
  process method consumed by managed launch and no runtime wiring changed.
