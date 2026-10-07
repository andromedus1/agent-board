---
id: epic-trustworthy-session-core
kind: epic
stage: done
tags: [state]
parent: null
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Trustworthy Session Core

## Brief

Deliver the local source of truth that every Agent Board surface shares. This
arc owns the normalized identity, activity, attention, health, evidence, and
terminal-presence contracts; validated transitions; atomic per-session storage;
and the single projection policy that derives the five primary glyphs.

It must make concurrent CLI and observer updates safe, keep invalid or stale
records visible as diagnostics, and remain inspectable without a daemon or
database. It does not own Codex protocol messages, Ghostty scripting, or the
final CLI workflows; those consume this capability through ports.

## Research briefs

- `.research/analysis/campaigns/agent-board-prior-art/parent.md` — grounds the multidimensional state model, acknowledgement semantics, and no-daemon V1.
- `.research/analysis/briefs/ghostty-registration-liveness.md` — establishes terminal presence as distinct from process liveness.

## Foundation references

- `docs/SPEC.md` — normalized observed state, projection precedence, and persistence requirements.
- `docs/ARCHITECTURE.md` — session record, store concurrency, domain modules, and error conventions.
- `docs/PRINCIPLES.md` — one truthful state model and visible confidence.

## Anticipated child features

Provisional seams are the domain/state contract, atomic session repository, and
central transition/projection service.

<!-- The /epic-design pass will fill in real child feature specifics into a
## Decomposition section below this one. -->

## Design decisions

- Keep the canonical session shape free of adapter-specific payloads beyond
  bounded evidence metadata; adapters translate at the boundary.
- Use one current schema rather than compatibility layers because V1 has no
  external consumers or durable installed data.
- Make projection a pure domain operation consumed by both titles and board
  rows; diagnostics may use `?`, but no adapter invents another primary glyph.
- Keep persistence behind a port so domain and projection tests are independent
  from filesystem locking.

## Pre-mortem

- A loosely validated record could let one malformed observer write poison every
  reader. Runtime schemas and fail-visible reads belong in the first feature.
- Concurrent rename, observer, and reconciliation writes could lose fields.
  Revision-aware locked mutations and contention tests belong in the store
  feature.
- Projection precedence could drift between call sites. Only the shared
  projection feature may map normalized state to primary status.

## Decomposition

1. `epic-trustworthy-session-core-domain-contract` — normalized schemas,
   registries, invariants, errors, and ports. `depends_on: []`.
2. `epic-trustworthy-session-core-atomic-store` — versioned per-session files,
   locks, atomic mutation, listing, and pruning primitives. Depends on the domain
   contract.
3. `epic-trustworthy-session-core-transition-projection` — validated state
   transitions, freshness rules, and shared status/title/row projection. Depends
   on the domain contract and atomic store.

## Child features reviewed and complete

- `epic-trustworthy-session-core-domain-contract` — done after standard review;
  enum registry ownership and test-inclusive typechecking were corrected.
- `epic-trustworthy-session-core-atomic-store` — done after standard review;
  filename/listability and registry-lock namespace invariants were corrected.
- `epic-trustworthy-session-core-transition-projection` — done after standard
  review; dedicated completion evidence and abnormal-exit semantics were added.

Aggregate verification: `npm run typecheck`, `npm run build`, and `npm test`
pass with 36 tests. The core now exposes one validated record, atomic mutation
boundary, closed transition union, completion acknowledgement service, and
canonical immutable projection for downstream adapters.

## Review (2026-08-14)

Standard-weight aggregate review used one fresh-context cross-model pass with
Claude Sonnet. The reviewer found no blocking, important, or nit-level issues
at epic scope and confirmed the cross-feature validation, mutation,
acknowledgement, projection, and downstream port contracts compose as designed.

Receiver adjudication accepted the ready verdict without corrective changes.
Final verification remained green: `npm run typecheck`, `npm run build`, and
`npm test` (36/36). The epic is complete without a second review pass, as
required by the project's standard review policy.
