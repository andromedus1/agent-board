---
id: epic-operational-readiness-packaged-e2e-chaos
kind: story
stage: done
tags: [e2e-test, testing]
parent: epic-operational-readiness-packaged-e2e
depends_on: [epic-operational-readiness-packaged-e2e-golden]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Deterministic degradation and recovery

Implement Unit 4 from the parent feature: readiness-gated app-server loss,
Ghostty snapshot loss/restoration, and launcher termination during an active
remote TUI.

Acceptance:

- Each injected failure is deterministic and asserts a named visible
  degradation/recovery invariant.
- Owned processes exit within bounded TERM→KILL cleanup and no canonical record
  is corrupt or falsely completed.
- Tests assert product output/state, never only fixture signals.

Test integrity: park real product bugs with a linked skipped failing test; fix
bad fixtures in-session; never hide or de-randomize a failure by weakening its
assertions.

## Implementation notes
- Execution capability: GPT-5.6 inline feature owner, after the golden checkpoint passed.
- Review weight: standard feature review; child checkpoint closes on acceptance evidence.
- Files changed: `tests/e2e/packaged-chaos.test.ts`, fake Codex control vocabulary, and shared package harness.
- Tests added: app-server kill, Ghostty snapshot loss/recovery, and launcher termination during an active remote TUI.
- Simplification: chaos is deterministic and readiness/control-file driven; no randomness, sleeps, PID guesses, or machine-wide cleanup.
- Discrepancies from design: app-server kill closes fixture sockets before exit so the real observer sees the bounded failure; the public result remains the same.
- Adjacent issues parked: none.

## Acceptance evidence
- `npx tsx --test --test-concurrency=1 tests/e2e/packaged-chaos.test.ts` passes (3/3).
- All canonical session files remain parseable and interruption never projects completion.
