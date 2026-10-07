---
id: epic-codex-claude-symmetric-support
kind: epic
stage: done
tags: [integration, cli, state]
parent: null
depends_on: []
release_binding: null
gate_origin: null
research_origin: codex-claude-symmetric-support
created: 2026-08-20
updated: 2026-08-20
---

# Symmetric Codex and Claude supervision

## Brief

Enable Andrew to run `agent-claude` in ordinary interactive Claude tabs beside
`agent-codex` tabs and read both through the same Agent Board glyph, title,
naming, acknowledgement, and attention-routing workflow.

Symmetry is outcome-level, not signal-level. Codex retains its managed
app-server observer; Claude uses a managed ordinary CLI with bundled
observation hooks. Provider identity, evidence authority, confidence,
capabilities, and fallback diagnostics remain inspectable, and unsupported
evidence projects `?` rather than a false primary state.

## Strategic decisions

- **Shared product contract**: both providers use `○`, `●`, `✓`, `!`, and `×`
  for the same operator outcomes; `?` remains the honest diagnostic fallback.
- **Claude topology**: preserve the ordinary interactive Claude CLI and add a
  per-run observation plugin/hook integration; do not replace it with an
  SDK-owned agent loop.
- **Control boundary**: this epic is observation and attention routing only.
  Generic terminal keys never imply semantic approval or question response.
- **Confidence boundary**: Claude prompt-start and user-interrupt recovery stay
  lower-confidence until validated; presentation parity does not erase that.
- **UI alignment**: reuse the existing tab-title and `agents` board vocabulary.
  No new UI surface or mockup is required.

## Decomposition

Decomposition pre-existed from the operator-confirmed research handoff: four
child features split by delivered capability rather than technical layer. The
contract lands first, then the Claude runtime, then diagnostics, then the
cross-provider acceptance matrix.

### Child features

1. `research-handoff-codex-claude-symmetric-support-1` — provider-neutral
   adapter identity and capability contract.
2. `research-handoff-codex-claude-symmetric-support-2` — managed
   `agent-claude` launcher and lifecycle adapter.
3. `research-handoff-codex-claude-symmetric-support-3` — capability diagnostics
   and doctor coverage.
4. `research-handoff-codex-claude-symmetric-support-4` — mixed-provider glyph
   and packaged-runtime validation.

### Decomposition risks

- Claude user interruption has no terminal `Stop` hook; the runtime feature
  must keep recovery diagnostic until a validated subsequent signal resolves it.
- The persisted session shape has real local data implications; feature design
  must prefer an additive provider binding unless an explicit migration is
  approved.
- Hook packaging must work from the installed npm artifact, not only a source
  checkout.

## Simplification opportunity

Keep glyph projection, session persistence, Ghostty title ownership,
acknowledgement, reconciliation, and board rendering provider-neutral. Reuse the
existing launcher/store/title capabilities rather than cloning Codex
application logic. Provider-specific code should be limited to lifecycle
acquisition, compatibility, native binding, and evidence mapping.

## Foundation roll-forward

- `docs/VISION.md` expands the supported first-user workflow from Codex-only to
  mixed Codex and Claude tabs.
- `docs/SPEC.md` defines shared outcome glyphs over asymmetric provider
  evidence.
- `docs/ARCHITECTURE.md` adds the managed Claude launcher/hook topology while
  retaining the daemonless modular-monolith boundary.
- `docs/PRINCIPLES.md` needs no change; its existing capability and evidence
  rules already govern the expansion.

## Research grounding

**Source**: `.research/analysis/campaigns/codex-claude-symmetric-support/parent.md`
(slug: `codex-claude-symmetric-support`)

The full-rigor campaign and locked position establish the provider-neutral
contract, topology choice, confidence limitations, and required validation
matrix for this delivery arc.

## Child features reviewed and complete (2026-08-20)

- The provider-neutral adapter contract preserves one durable session model,
  transition reducer, projection policy, title vocabulary, and acknowledgement
  path while exposing provider identity, native bindings, evidence, confidence,
  and static capabilities.
- `agent-claude` runs the ordinary interactive Claude CLI with a packaged,
  per-run, fail-open observation plugin and bounded diagnostic degradation when
  native hook evidence is unavailable.
- The Board and doctor expose truthful cross-provider evidence and capability
  diagnostics, including a tested Claude floor and visible warnings for newer
  untested families.
- The installed-package harness drives the real hook declaration and proves
  concurrent Codex and Claude tabs share glyphs without sharing identity or
  fabricating semantic control.
- All four features completed one standard independent cross-model review pass,
  receiver adjudication, and green integrated verification. The assembled epic
  is ready for aggregate closure.

## Review (2026-08-20)

**Verdict**: Approve with verified fixes.

**Material findings resolved**: the aggregate Claude Opus review found two
current-cycle blockers: `agent-name` pre-registration prevented the promised
pre-name then `agent-claude` workflow, and a managed Claude session could show
false idle before any native hook evidence. Ordinary pre-registration is now
atomically adopted by the launcher while managed collisions still fail, and
inferred managed evidence remains diagnostic until native observation arrives.

**Important findings adjudicated**: session end preserves failure/completion
while clearing vanished input waits; scheduled work no longer masquerades as
background activity; compaction cannot spuriously rebind lifecycle state;
routine tool hooks avoid unnecessary terminal reconciliation; newer untested
Claude families warn instead of hard-failing; the fake provider executes the
real packed hook declaration; installed-test claims now match the opt-in smoke;
and public naming/error guidance is provider-neutral. The product-wide doctor
readiness contract and static capability registry remain deliberate design
choices.

**Verification**: `npm run typecheck`, build through `npm test`, focused
adapter regressions, real npm-package mixed-provider journeys, and the complete
serialized suite all pass. The final suite reports 231 tests: 228 passed, zero
failed, and three intentional opt-in installed-environment probes skipped.

Standard review weight used one independent cross-model aggregate pass. The
receiver fixed every confirmed material issue and closed without a second pass,
as required by standard policy.
