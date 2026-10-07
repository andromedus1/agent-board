---
id: research-handoff-codex-claude-symmetric-support-4
kind: feature
stage: done
tags: [integration, cli, state]
parent: epic-codex-claude-symmetric-support
depends_on: [research-handoff-codex-claude-symmetric-support-1, research-handoff-codex-claude-symmetric-support-2, research-handoff-codex-claude-symmetric-support-3]
release_binding: null
gate_origin: null
research_origin: codex-claude-symmetric-support
created: 2026-08-20
updated: 2026-08-20
---

# Mixed Codex-Claude glyph and packaged-runtime validation

## Finding

Verify that concurrent `agent-codex` and `agent-claude` tabs project the same
primary glyphs for equivalent operator outcomes while retaining independent
provider identity, Ghostty identity, evidence confidence, diagnostics, naming,
and Board-owned completion acknowledgement.

Cover launch and resume, working, permission and other input waits, completion,
acknowledgement, interruption, provider and managed-process failure, background
work, clean and forced exit, unsupported extensions or versions, and concurrent
mixed-provider sessions. Absent or stale evidence must yield `?`, and no raw
terminal key may be described as semantic approval.

## Simplification opportunity

Extend the packed CLI harness with a fake Claude executable and hook-event
driver, reusing the existing fake Ghostty, state directory, title assertions,
and Board row parser.

## Research grounding

**Source**: `.research/analysis/campaigns/codex-claude-symmetric-support/parent.md`
(slug: `codex-claude-symmetric-support`)

The cross-provider runtime matrix is the release evidence that makes shared
glyph support a trustworthy product claim rather than a presentation-only edit.

## Design

### Architectural choice

Extend the scenario-driven packed CLI harness with one fake Claude executable
that understands `--version`, `plugin validate`, and an interactive launch. The
fake discovers the injected plugin, invokes its real packaged hook command with
native JSON fixtures, and remains independently controllable beside fake Codex.
This tests the installed tarball and provider boundary without scripting either
real proprietary TUI.

### Implementation units

1. `tests/e2e/fixtures/fake-claude.mjs`: bounded fake CLI and hook-event driver.
2. `tests/e2e/support/package-harness.ts`: Claude scenario state, executable
   configuration, `agent-claude` bin typing, and mixed-session helpers.
3. Packed golden/failure/chaos tests: concurrent Codex and Claude tabs covering
   working, input, completion/ack, stale Claude evidence, background work,
   clean/failing/forced exits, and independent terminal identity.
4. Installed integration smoke: validate the packaged plugin with the available
   Claude CLI when explicitly requested by the integration-test environment.

### Testing and acceptance

- Equivalent fresh normalized states render `○ ● ✓ ! ×` identically for both
  adapters; diagnostics use `?` and explain the provider-specific limitation.
- Concurrent mixed launchers never overwrite one another's provider, terminal,
  native session binding, title, or acknowledgement.
- The fake exercises the real packaged plugin path and hook entrypoint, not a
  test-only observer shortcut.
- Full typecheck, build, unit/integration suite, npm-pack inspection, and packed
  runtime suite pass with no raw-key semantic-control claim.

No child stories are needed; the harness and matrix form one release-evidence
boundary.

## Implementation notes

- Added a fake Claude executable that validates the real packed plugin, runs
  the real private hook handler, and drives native hook events without bypassing
  the production adapter boundary.
- The package harness now installs and configures both fake providers and
  exposes `agent-claude` as a first-class packed binary.
- Mixed-provider tests run simultaneous Codex and Claude launchers in distinct
  Ghostty tabs, prove shared idle/working/input/completion glyphs, explicit
  acknowledgement, provider/session/title isolation, and dual-provider doctor.
- The complete suite passes after updating the intentional package-layout
  assertion for the new `assets/` directory.

## Review (2026-08-20)

Standard-weight review used the shared fresh-context Claude Opus pass. It found
that the first fake Claude driver bypassed the packaged `hooks.json`, that
pre-name adoption and several failure/background edges were absent from the
mixed scenario, and that installed-integration documentation overstated what
the opt-in smoke proved.

Receiver fixes make the fake parse and execute the real packed hook declaration,
exercise pre-naming, capabilities, background work, failure and SessionEnd
preservation, and add an opt-in installed-Claude version/plugin-validation
probe. Public and architecture docs now state that probe's boundary precisely.
`npm test` passes 231 tests with 228 passed and three intentional opt-in skips;
the feature closes after this verified receiver pass without re-review.
