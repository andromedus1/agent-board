---
id: research-handoff-codex-claude-symmetric-support-3
kind: feature
stage: done
tags: [integration, cli, state]
parent: epic-codex-claude-symmetric-support
depends_on: [research-handoff-codex-claude-symmetric-support-1, research-handoff-codex-claude-symmetric-support-2]
release_binding: null
gate_origin: null
research_origin: codex-claude-symmetric-support
created: 2026-08-20
updated: 2026-08-20
---

# Cross-provider capability diagnostics and doctor coverage

## Finding

Expose provider adapter identity, evidence authority, confidence, capability,
extension provenance, and fallback reasons through session diagnostics and the
operator doctor. Detect the installed Claude CLI and required plugin/hook
surface, and fail visibly to diagnostic state when policy, version, packaging,
or hook availability prevents trustworthy observation.

Keep detection, state authority, presentation metadata, session identity, and
terminal control distinct so an inferred or unavailable capability never
masquerades as provider-native state.

## Simplification opportunity

Extend the existing doctor component/report model and board diagnostics rather
than creating a provider-specific diagnostic command.

## Research grounding

**Source**: `.research/analysis/campaigns/codex-claude-symmetric-support/parent.md`
(slug: `codex-claude-symmetric-support`)

The research and Herdr prior art make explainable capability degradation a
condition of honest provider-neutral support, not an optional debugging aid.

## Design

### Architectural choice

Extend the existing doctor report with a `claude` component rather than adding
a provider command. A bounded, shell-free Claude diagnostic port checks version
output and validates the exact packaged plugin directory through Claude's
native `plugin validate` command. The report exposes stable availability,
version, and hook-package codes; the session list keeps using canonical
projection diagnostics, evidence kind, and confidence, with adapter identity
added as an explicit row field.

Static adapter capabilities remain in the feature-1 registry; doctor reports
whether the runtime can supply them. Persisted capability snapshots and
heuristic version promises are rejected as drift-prone.

### Implementation units

1. `src/integrations/claude/compatibility.ts`: parse bounded version output and
   define the tested minimum required by the hook/plugin contract.
2. `src/integrations/claude/process.ts`: expose version and plugin-validation
   probes through the existing bounded process-runner pattern.
3. `src/application/doctor.ts`, doctor composition, and output: add ordered
   Claude checks and actionable unavailable/version/plugin-policy remediation.
4. Session-list/CLI projection: include provider identity and retain evidence
   confidence/diagnostic reasons without changing the five shared glyphs.

### Testing and acceptance

- Compatibility and doctor tests cover installed, missing, old, unrecognized,
  and invalid/blocked plugin cases while independent checks still run.
- Human and JSON doctor output remain one canonical report and readiness fails
  when either requested provider adapter is unusable.
- Board tests prove mixed rows expose `codex`/`claude`, confidence, and fallback
  diagnostics without presenting unsupported control capabilities.

No child stories are needed; this is one additive diagnostic/report contract.

## Implementation notes

- Doctor enforces Claude Code 2.1.226 as the compatibility floor, treats the
  2.1 family as tested, warns without failing readiness for newer untested
  families, and asks Claude itself to validate the exact npm-packed hook plugin.
- The canonical report distinguishes unavailable, unrecognized/unsupported,
  blocked/invalid plugin, compatible, and valid-plugin evidence; all existing
  components still run independently.
- Board rows now expose adapter identity, evidence kind, confidence, and static
  observation/control capabilities; human output names the provider beside the
  unchanged shared status label.
- Typecheck/build and 19 focused doctor, board, output, and compatibility tests
  pass.

## Review (2026-08-20)

Standard-weight review used the shared fresh-context Claude Opus pass. The
reviewer approved provider/evidence/capability visibility and the observation-
only control boundary, while identifying an unnecessarily hard ceiling on
future Claude minor families and a missing packaged-handler filesystem check.

Receiver fixes retained the tested floor, downgraded newer compatible families
to an explicit warning, and validated both the plugin contract and installed
handler path. The deliberate product-wide doctor readiness contract remains:
both supported adapters must be usable for a fully ready mixed-provider setup.
Focused and full-suite verification pass; no second review is required.
