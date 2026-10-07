---
id: epic-operational-readiness-packaged-e2e-golden
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

# Packaged golden journeys

Implement Unit 2 from the parent feature: actual installed-bin journeys for
doctor/all-bin packaging, two-session register/rename and title-board parity,
managed lifecycle convergence across working/input/completion/idle, and safe
acknowledge/unregister.

Acceptance:

- Assertions observe only public command output, installed canonical state, and
  externally visible mock-service title/process outcomes.
- Each lifecycle event converges title and board within the declared 1,000 ms.
- The multi-session journey preserves independent identity and cleanup.

Test integrity: park real product bugs with a linked skipped failing test; fix
bad fixtures in-session; never game an assertion or mirror production logic.

## Implementation notes
- Execution capability: GPT-5.6 inline feature owner, after the infrastructure checkpoint passed.
- Review weight: standard feature review; child checkpoint closes on acceptance evidence.
- Files changed: `tests/e2e/packaged-golden.test.ts` and shared package harness/fixtures.
- Tests added: two-session registration and rename, title/board parity, managed Codex working/input/completion/idle convergence, focused acknowledgement, and exact-ID unregister.
- Simplification: assertions consume only installed-bin output, canonical JSON, and fixture-observed titles; no source imports or invocation-count assertions.
- Discrepancies from design: completion after input includes the explicit Codex input-resolved active edge before the final idle edge, matching the normalized lifecycle contract.
- Adjacent issues parked: none.

## Acceptance evidence
- `npx tsx --test --test-concurrency=1 tests/e2e/packaged-golden.test.ts` passes.
- Each lifecycle event converges within the harness bounded polling window; the independent second session remains registered and titled after the first is acknowledged/unregistered.
