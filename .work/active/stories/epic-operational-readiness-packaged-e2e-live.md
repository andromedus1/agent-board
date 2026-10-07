---
id: epic-operational-readiness-packaged-e2e-live
kind: story
stage: done
tags: [e2e-test, testing, integration]
parent: epic-operational-readiness-packaged-e2e
depends_on: [epic-operational-readiness-packaged-e2e-golden]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Opt-in installed compatibility probes

Implement Unit 5 from the parent feature: separately named, environment-gated
Codex narrow-contract and disposable-Ghostty identity/title probes.

Acceptance:

- Default `npm test` never starts either live probe.
- Missing opt-in/prerequisites produce explicit skips before live mutation.
- Ghostty mutation targets only a newly created captured surface and always
  clears/closes it in `finally`; no existing tab is borrowed.
- The Codex probe is bounded and validates only the protocol shapes consumed by
  Agent Board.

Test integrity: park real compatibility bugs with a linked skipped failing test;
fix bad fixtures in-session; never turn a failed live contract into a silent
pass.

## Implementation notes
- Execution capability: GPT-5.6 inline feature owner, after the golden checkpoint passed.
- Review weight: standard feature review; child checkpoint closes on acceptance evidence.
- Files changed: `tests/integration/installed-codex.test.ts`, `tests/integration/disposable-ghostty.test.ts`, and package integration scripts.
- Tests added: opt-in installed Codex version plus `ServerNotification.json` schema contract; opt-in Ghostty disposable-window create/set/read/clear/close identity probe with original-terminal non-interference assertion.
- Simplification: live probes are separate from default tests and skip before mutation when macOS/Automation prerequisites are not present; no user tab is borrowed.
- Discrepancies from design: Ghostty clear restores its shell-derived title rather than an empty string, so the probe asserts the unique Agent Board marker is gone and the original title is unchanged.
- Adjacent issues parked: none.

## Acceptance evidence
- Default suite reports both live probes as explicit skips and performs no live mutation.
- `npm run typecheck` passes; opt-in commands are `npm run test:integration:codex` and `npm run test:integration:ghostty`.
