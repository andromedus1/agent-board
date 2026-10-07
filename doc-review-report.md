# Doc Review Report

**Project:** Agent Board

**Date:** 2026-10-06

**Scope:** Fresh system-level documentation consistency audit after replacing
Codex's upper version allowlist with capability checks for newer releases.
Reviewed all six indexed planning documents, `README.md`, `AGENTS.md`, the
knowledge index, compatibility guidance and examples, relevant implementation
contracts, delivery state, and local cross-references. `CLAUDE.md` is absent;
project rules live in `AGENTS.md` and `.agents/rules/`. No module-level planning
document sets were discovered.

**Documents reviewed:** 6 system planning documents plus supporting operator
and implementation surfaces

**Passes run:** 1 delegated system-level pass; 0 module passes

**Issues found:** 0 Critical, 0 High, 3 Medium, 0 Low, 0 Info

**Exit gate: PASS.** No Critical or High documentation findings. The first two
Medium findings remain tracked in
`.work/backlog/idea-provider-observation-docs.md`; the third concerns canonical
process paths left over from the Mac migration. No source documents were changed
by this audit. The parent task owns final knowledge-index regeneration.

## Findings

### Critical (0)

None.

### High (0)

None.

### Medium (3)

#### Ordinary-Codex fallback wording remains stale

**File:** `docs/research-plan.md:18`

**What:** The research plan calls ordinary Codex a degraded-confidence
fallback. Current architecture, specification, README, and projection expose
ordinary registration as diagnostic-only until a managed launcher attaches
observation. There is no ordinary-Codex lifecycle observer. This pre-existing
finding remains recorded in `idea-provider-observation-docs`.

**Fix:** Describe ordinary registration as diagnostic until managed observation
attaches. Retain historical topology evidence in the research corpus.

#### Working-freshness summaries omit the provider capability condition

**Files:** `docs/SPEC.md:164`, `docs/SPEC.md:232`,
`docs/ARCHITECTURE.md:19`, `docs/ARCHITECTURE.md:377`, and
`docs/ARCHITECTURE.md:446`

**What:** These descriptions say a managed session with a verified live launcher
can retain working status regardless of observation age. The actual policy also
requires the provider's `workingWhileLauncherAlive` capability, enabled for
Codex and disabled for Claude in `src/domain/registries.ts`. Consequently,
Claude hook-derived working evidence still expires even when its launcher is
alive. `src/domain/projection.ts` and the README agree on this distinction.
This pre-existing finding remains recorded in `idea-provider-observation-docs`.

**Fix:** Qualify the freshness exemption by adapter capability and explicitly
state that the current exemption applies to managed Codex; Claude retains its
hook-evidence freshness window. Keep the current runtime behavior.

#### Canonical process references point to the previous Mac's home directory

**File:** `AGENTS.md:12`

**What:** All four canonical references use
`/Users/andrewclark/dev/skills-v2/`, which does not exist on the current Mac.
The same referenced files exist under `/Users/andromedus/dev/skills-v2/`.
These instruction paths are stale and cannot be followed literally here.

**Fix:** Express the canonical checkout through a portable home-relative
reference, or update the paths to the current checkout. This does not affect
Agent Board's runtime or the compatibility repair.

### Low (0)

None.

### Info (0)

None.

## Clean Areas

- The compatibility boundary, README, architecture, configuration guide,
  research plan's implementation summary, and copyable status-line example
  agree on the Codex 0.147 minimum, explicit 0.151.x exclusion, and automatic
  capability checks for newer untested releases.
- The documented tested-family fast path matches `checkCodexCompatibility`:
  `0.147.x`, `0.148.x`, `0.149.x`, `0.150.x`, `0.152.x`, `0.153.x`, and
  `0.154.x`. Later minor and major versions reach the production capability
  probe rather than being rejected solely by their version number.
- The production probe checks remote-TUI and app-server listener options,
  loaded-thread ID and read-thread identity/status schema surfaces, required
  notification names, and lifecycle enum values. Commands and schema reads are
  bounded, temporary output is removed in `finally`, and no persistent probe
  cache is stored. Doctor and managed launch share this compatibility path.
- Guidance preserves runtime response/event validation and limits the probe's
  claim to managed observation compatibility. It does not claim to verify
  status-line rendering or guarantee compatibility with every future release.
- Managed Codex app-server plus remote TUI, managed ordinary Claude plus bundled
  hooks, observation-only actions, shared glyphs, and diagnostic ordinary
  registration remain aligned, except for the two previously tracked wording
  findings above. Claude installation is intentionally deferred on this Mac;
  its absence is not a documentation finding.
- Session-record fields match `src/domain/session.ts`; all five package binary
  entry points and the documented implementation modules exist.
- All 25 local Markdown link targets checked across the planning documents,
  README, and AGENTS exist. All 25 indexed document paths exist: 6 planning,
  18 research, and 1 historical document. The separately checked absolute
  process references are covered by the third Medium finding.
- All 6 planning documents have non-empty description, type, and updated
  fields using the project's supported planning type vocabulary. Temporary
  generated-index date differences are excluded while parent regeneration is
  pending.

## Blocking Research Status

The research plan's six decision-bearing outputs exist and declare locked
status. It commissions no missing blocker for the compatibility repair.

| Output | Exists on disk? | Status |
| --- | --- | --- |
| `.research/analysis/campaigns/agent-board-prior-art/parent.md` | Yes | Locked |
| `.research/analysis/briefs/codex-detector-topology.md` | Yes | Locked |
| `.research/analysis/briefs/ghostty-registration-liveness.md` | Yes | Locked |
| `.research/analysis/campaigns/codex-claude-symmetric-support/parent.md` | Yes | Locked |
| `.research/analysis/briefs/claude-code-adapter-feasibility.md` | Yes | Locked |
| `.research/analysis/positions/codex-claude-common-glyph-contract.md` | Yes | Locked |

## Completed Delivery Verification

All six established delivery epics are marked `done`. Representative outputs
and tests exist for each completed surface. The new compatibility story remains
at `implementing` during this audit; this report does not assert its completion.

| Completed surface | Representative evidence | Exists? |
| --- | --- | --- |
| Trustworthy session core | Domain schema/projection, atomic JSON store, domain/store tests | Yes |
| Managed Codex observation | Codex client/lifecycle, managed launcher, installed probe | Yes |
| Ghostty project surface | Ghostty client, registration/title use cases, adapter tests | Yes |
| Terminal attention board | `list-sessions`, CLI commands, packed golden journey | Yes |
| Operational readiness | Doctor, README, packed failure/chaos journeys | Yes |
| Mixed Codex/Claude support | Claude launcher/lifecycle, bundled hooks, `packaged-mixed-providers.test.ts` | Yes |

The new compatibility regression, installed probe, and packed golden journey
exercise the documented compatibility path. This documentation pass inspected
those contracts and test files without rerunning the suite or claiming test
results. The parent implementation task owns runtime verification. This audit
did not exercise live interactive agent turns, Ghostty title rendering, or
status-line visuals.

## Provenance Summary

The decision-bearing outputs comprise three briefs, two campaign parents, and
one position. Supporting campaign artifacts are not separate commissioned
briefs.

| research_method | Decision-bearing outputs | Latest updated |
| --- | --- | --- |
| `/research` | 5 | 2026-08-20 |
| `/scout` | 1 | 2026-08-14 |
| Missing | 0 | — |

No refresh candidates arise under the configured tier/recency rule. Historical
research versions remain evidence of their original verification dates; current
supported versions belong to the compatibility boundary and operator guidance.
