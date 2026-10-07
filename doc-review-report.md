# Doc Review Report

**Project:** Agent Board

**Date:** 2026-09-12

**Scope:** Fresh system-level documentation consistency audit after admitting
the tested Codex `0.154.x` protocol family. Reviewed all six indexed planning
documents, `README.md`, `AGENTS.md`, generated knowledge indexes, compatibility
guidance and examples, relevant implementation contracts, delivery state, and
local cross-references. `CLAUDE.md` is absent; project rules live in `AGENTS.md`
and `.agents/rules/`. No module-level planning document sets were discovered.

**Documents reviewed:** 6 system planning documents plus supporting operator
and implementation surfaces

**Passes run:** 1 delegated system-level pass; 0 module passes

**Issues found:** 0 Critical, 0 High, 2 Medium, 0 Low, 1 Info

**Exit gate: PASS.** No Critical or High documentation findings. Both Medium
findings predate this compatibility repair and were receiver-confirmed and
parked together in `.work/backlog/idea-provider-observation-docs.md`. No source
documents were changed by this audit.

## Findings

### Critical (0)

None.

### High (0)

None.

### Medium (2)

#### Ordinary-Codex fallback wording remains stale

**File:** `docs/research-plan.md:18`

**What:** The research plan calls ordinary Codex a degraded-confidence
fallback. Current architecture, specification, README, and projection expose
ordinary registration as diagnostic-only until a managed launcher attaches
observation. There is no ordinary-Codex lifecycle observer. This is the same
pre-existing finding recorded in the previous documentation audit.

**Fix:** Describe ordinary registration as diagnostic until managed observation
attaches. Retain historical topology evidence in the research corpus.

#### Working-freshness summaries omit the provider capability condition

**Files:** `docs/SPEC.md:164`, `docs/SPEC.md:233`,
`docs/ARCHITECTURE.md:19`, `docs/ARCHITECTURE.md:377`, and
`docs/ARCHITECTURE.md:446`

**What:** These descriptions say a managed session with a verified live launcher
can retain working status regardless of observation age. The actual policy also
requires the provider's `workingWhileLauncherAlive` capability, enabled for
Codex and disabled for Claude in `src/domain/registries.ts`. Consequently,
Claude hook-derived working evidence still expires even when its launcher is
alive. `src/domain/projection.ts`, the regression at
`tests/domain/projection.test.ts:78`, and `README.md:200` agree on this
distinction. The broad foundation wording predates this compatibility repair.

**Fix:** Qualify the freshness exemption by adapter capability and explicitly
state that the current exemption applies to managed Codex; Claude retains its
hook-evidence freshness window. Keep the current runtime behavior.

### Low (0)

None.

### Info (1)

The parent task's knowledge-index regeneration reported zero errors and five
pre-existing missing-frontmatter warnings in research support/source artifacts.
These do not affect the six compliant planning documents or block index
generation. This pass checked the resulting indexes and their paths without
rerunning the generator; the parent owns final regeneration after work-item
archival.

## Clean Areas

- The accepted Codex families agree across the compatibility boundary,
  regression test, README, architecture, configuration guide, and copyable
  status-line example: `0.147.x`, `0.148.x`, `0.149.x`, `0.150.x`, `0.152.x`,
  `0.153.x`, and `0.154.x`. `0.151.x` and unverified future families remain
  excluded.
- The updated guidance correctly limits the installed-schema probe's claim to
  protocol shapes and lifecycle values; it does not claim to verify status-line
  visual rendering.
- Managed Codex app-server plus remote TUI, managed ordinary Claude plus bundled
  hooks, observation-only actions, shared glyphs, and diagnostic ordinary
  registration remain aligned across the implemented surfaces and current
  product contract, except for the two wording findings above.
- Session-record field names match `src/domain/session.ts`; the five package
  binaries and their documented implementation directories exist.
- All 25 local Markdown link targets checked across the planning documents,
  README, and AGENTS exist. All 25 indexed document paths exist. The index
  contains 6 planning documents, 18 research artifacts, and 1 historical
  document.
- All 6 planning documents have the required description, type, and current
  updated fields, using the project's supported planning type vocabulary.

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

All six delivery epics are marked `done`. Representative outputs and tests
exist for each completed surface; the compatibility repair does not contradict
those completion claims. The parent reports the compatibility story completed
its bounded inline review and reached `done` in commit `5eab8e6`.

| Completed surface | Representative evidence | Exists? |
| --- | --- | --- |
| Trustworthy session core | Domain schema/projection, atomic JSON store, domain/store tests | Yes |
| Managed Codex observation | Codex client/lifecycle, managed launcher, integration tests | Yes |
| Ghostty project surface | Ghostty client, registration/title use cases, adapter tests | Yes |
| Terminal attention board | `list-sessions`, CLI commands, packed golden journey | Yes |
| Operational readiness | Doctor, README, packed failure/chaos journeys | Yes |
| Mixed Codex/Claude support | Claude launcher/lifecycle, bundled hooks, packed mixed-provider journey | Yes |

The parent implementation task reported these current verification results:

- `npm run typecheck` passed.
- `AGENT_BOARD_LIVE_CODEX=1 npm test`: 231 tests, 229 passed, 0 failed, and
  2 intentional opt-in skips for installed Claude and live Ghostty probes.
- Installed Codex `0.154.0` passed generated-schema checks and a separate real
  app-server startup, endpoint, WebSocket initialization, and loaded-thread
  discovery smoke check.
- The installed `agent-board doctor` reported Ready.

This documentation pass inspected contracts and evidence without rerunning
those commands. It did not exercise a live interactive Codex or Claude turn,
Ghostty title rendering, or status-line visuals, and does not claim that the
schema/smoke checks establish those behaviors.

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
