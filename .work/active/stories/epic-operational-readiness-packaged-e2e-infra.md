---
id: epic-operational-readiness-packaged-e2e-infra
kind: story
stage: done
tags: [e2e-test, testing]
parent: epic-operational-readiness-packaged-e2e
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Package harness and executable services

Implement Unit 1 from the parent feature: packed temporary-prefix installation,
bounded bin/process helpers, isolated scenario state, fake Codex/Ghostty CLI/
AppleScript executable services, and the narrow validated production command
override seam.

Acceptance:

- A source-free installed prefix exposes and runs all four bins.
- Product processes use only argv-based configured mock executables and the
  temporary state root; production defaults remain unchanged.
- Setup/readiness/teardown are bounded, hermetic, and cannot clean outside the
  recorded temp root.

Test integrity: park real product bugs with a linked skipped failing test; fix
bad fixtures in-session; never game an assertion or assert only mock calls.

## Implementation notes
- Execution capability: GPT-5.6 inline feature owner; the harness and executable fixtures share one isolated lifecycle.
- Review weight: standard feature review; child checkpoint closes on acceptance evidence.
- Files changed: `src/integrations/command-config.ts`, command composition/integration seams, `tests/e2e/support/package-harness.ts`, `tests/e2e/fixtures/fake-{codex,ghostty,osascript}.mjs`, `tests/e2e/packaged-infra.test.ts`, and package integration scripts.
- Tests added: packed npm install, source-free prefix inspection, all four installed bins, temporary state, and out-of-process executable boundaries.
- Simplification: no shell wrapper or in-process product mock was introduced; the harness uses argv arrays and one temporary root.
- Discrepancies from design: Docker Compose was not used because the real boundary is a macOS executable/process protocol; deterministic local executables are closer to the product boundary.
- Adjacent issues parked: none.

## Acceptance evidence
- `npm run typecheck` passes.
- `npx tsx --test --test-concurrency=1 tests/e2e/packaged-infra.test.ts` passes.
- Installed prefix exposes only `README.md`, `dist`, and `package.json`; all four public bins execute with temporary state and absolute fixture commands.
