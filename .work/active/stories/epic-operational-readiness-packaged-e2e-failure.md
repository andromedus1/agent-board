---
id: epic-operational-readiness-packaged-e2e-failure
kind: story
stage: done
tags: [e2e-test, testing]
parent: epic-operational-readiness-packaged-e2e
depends_on: [epic-operational-readiness-packaged-e2e-infra]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Packaged failure journeys

Implement Unit 3 from the parent feature: invalid inputs, independent doctor
failures, snapshot degradation, Codex failure projection, and recoverable
unregister/title-clear failure.

Acceptance:

- Failures have stable exit/output semantics and never create false idle,
  completion, or successful removal.
- Canonical files remain parseable and retryable after every failed operation.
- One failed dependency does not hide independent doctor evidence.

Test integrity: park real product bugs with a linked skipped failing test; fix
bad fixtures in-session; never loosen an error invariant merely to go green.

## Implementation notes
- Execution capability: GPT-5.6 inline feature owner, after the infrastructure checkpoint passed.
- Review weight: standard feature review; child checkpoint closes on acceptance evidence.
- Files changed: `tests/e2e/packaged-failure.test.ts` and shared package harness/fixtures.
- Tests added: invalid labels, independent Codex/Ghostty doctor errors, unavailable snapshot diagnostics, managed Codex error projection, and title-clear retry semantics.
- Simplification: failure assertions target stable user-visible output, row projections, and retryable canonical state rather than fixture internals.
- Discrepancies from design: title-clear failures surface the existing `ADAPTER_FAILURE` envelope with the actionable Ghostty message; the typed Ghostty subcode remains an adapter detail.
- Adjacent issues parked: none.

## Acceptance evidence
- `npx tsx --test --test-concurrency=1 tests/e2e/packaged-failure.test.ts` passes.
- Failed operations retain parseable records and healthy retries remove the title/record; independent doctor checks remain visible.
