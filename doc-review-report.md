# Doc Review Report

**Project:** Agent Board

**Date:** 2026-10-06

**Scope:** Fresh full system-level documentation consistency audit after the
provider-wording corrections, portable process references, CI documentation,
and completed-work archival. Reread all six indexed planning documents plus
`README.md`, `AGENTS.md`, project rules, generated knowledge indexes, the CI
workflow, examples, relevant implementation contracts, research-output metadata,
and archived delivery evidence. No module-level planning document sets were
discovered under `docs/` or `modules/`. `CLAUDE.md` is absent; project rules live
in `AGENTS.md` and `.agents/rules/`.

**Documents reviewed:** 6 system planning documents plus supporting operator,
process, CI, and implementation surfaces

**Passes run:** 1 delegated full system-level pass; 0 discovered module passes

**Issues found:** 0 Critical, 0 High, 0 Medium, 0 Low, 0 Info

**Exit gate: PASS.** No documentation findings remain. This pass audited the
complete discovered planning set, not only the previously affected statements.
No source document, index, work item, or implementation file was changed by this
audit. The housekeeping story is still in progress; its final runtime checks,
PR completion, and final index regeneration remain owned by the parent task.

## Findings

### Critical (0)

None.

### High (0)

None.

### Medium (0)

None.

### Low (0)

None.

### Info (0)

None.

## Clean Areas

- The vision, specification, architecture, and principles align on local,
  observation-only attention routing, shared glyphs, provider-specific evidence,
  explicit uncertainty, stable session identity, and deferred control surfaces.
  Current product contracts remain distinct from historical research and future
  options; missing future implementation was not treated as drift.
- Ordinary registration is consistently described as diagnostic until managed
  observation attaches. `projectSession` enforces that boundary before health,
  attention, or activity can produce a canonical glyph.
- The specification and architecture now explicitly restrict the launcher-based
  working-freshness exemption to managed Codex. Claude hook evidence retains the
  freshness window even with a live launcher. These statements match
  `AGENT_ADAPTER_CAPABILITIES`, `projectSession`, reconciliation, and the README.
- All four canonical process references in `AGENTS.md` use `~/dev/skills-v2/`
  and resolve to existing files after home expansion on this Mac.
- Codex compatibility guidance agrees across the implementation, README,
  architecture, configuration guide, research-plan implementation summary, and
  example: minimum 0.147, excluded 0.151.x, a tested-family fast path, and local
  capability checks for newer untested minor or major versions. Runtime
  validation remains in place, and the docs make no claim to verify status-line
  visual rendering or guarantee every future release.
- The README accurately distinguishes provider-specific launcher requirements
  from the aggregate doctor result. Each launcher composes only its own provider
  process host; doctor checks both and returns nonzero for any error, including
  an unused provider. Intentionally deferred Claude installation is not a
  documentation defect.
- Session-record fields, title and board projection, managed identity targeting,
  ordinary-session adoption, terminal cleanup, and state-directory descriptions
  agree with their implementation contracts. All five package binary entry
  points and representative documented implementation modules exist.
- The README's checkout, locked-dependency install, build, npm-link, tarball,
  update, and opt-in probe commands agree with `package.json` and test entry
  points. The Ghostty and Codex copyable examples match the configuration guide.
- CI guidance matches `.github/workflows/ci.yml`: pull requests, pushes to main,
  manual invocation, and a weekly schedule run macOS 15 jobs on Node 22 and 26;
  the Node 26 job additionally installs latest Codex and enables the installed
  compatibility/schema probe. The probe reads version/help/generated schemas
  without authentication or a model turn. Live Claude and Ghostty probes remain
  local opt-ins. Actions are pinned by commit and repository permission is
  read-only. This verifies workflow configuration, not successful CI completion.
- All 26 local Markdown link targets checked across the six planning documents,
  README, and AGENTS exist. All 25 indexed document paths exist: 6 planning,
  18 research, and 1 historical document. The historical concept document remains
  explicitly superseded by the current vision.
- All 6 planning documents have non-empty description, supported project type,
  and updated fields. The regenerated indexes reflect the current source dates
  and delivery counts at audit time: 1 active story, 12 backlog items, and 116
  archive stubs. The parent will regenerate again after final story archival.

## Blocking Research Status

The research plan's six decision-bearing outputs exist and declare locked
status. No missing research output blocks the current maintenance work.
Historical verification versions remain evidence of those engagements, while
current compatibility policy is owned by implementation and operator guidance.

| Output | Exists on disk? | Status |
| --- | --- | --- |
| `.research/analysis/campaigns/agent-board-prior-art/parent.md` | Yes | Locked |
| `.research/analysis/briefs/codex-detector-topology.md` | Yes | Locked |
| `.research/analysis/briefs/ghostty-registration-liveness.md` | Yes | Locked |
| `.research/analysis/campaigns/codex-claude-symmetric-support/parent.md` | Yes | Locked |
| `.research/analysis/briefs/claude-code-adapter-feasibility.md` | Yes | Locked |
| `.research/analysis/positions/codex-claude-common-glyph-contract.md` | Yes | Locked |

## Completed Delivery Verification

All six established delivery epics remain `done` in their archive metadata.
Their full pre-archive bodies resolve through their recorded Git references and
also declare `done`. All 116 archive stubs were checked for resolvable full
original bodies: 6 epics, 24 features, and 86 stories. Representative existing
implementation and test artifacts support the completed product surfaces.

| Completed surface | Representative evidence | Exists? |
| --- | --- | --- |
| Trustworthy session core | Domain schema/projection, atomic JSON store, domain/store tests | Yes |
| Managed Codex observation | Codex client/lifecycle, managed launcher, installed probe | Yes |
| Ghostty project surface | Ghostty client, registration/title use cases, adapter tests | Yes |
| Terminal attention board | `list-sessions`, CLI commands, packed golden journey | Yes |
| Operational readiness | Doctor, README, packed failure/chaos journeys | Yes |
| Mixed Codex/Claude support | Claude launcher/lifecycle, bundled hooks, packed mixed-provider journey | Yes |

`story-project-housekeeping` remains `implementing` during this audit; this
report does not assert that its CI, merge, branch cleanup, or final verification
is complete. The parent is repairing test-harness issues exposed by the initial
CI run. The lifecycle convergence assertions still enforce the documented
one-second budget. This documentation audit did not rerun runtime tests or live
agent, Ghostty, or status-line checks and does not claim their success.

## Provenance Summary

The decision-bearing outputs comprise three briefs, two campaign parents, and
one position. Supporting campaign artifacts are not separate commissioned
briefs.

| research_method | Decision-bearing outputs | Latest updated |
| --- | --- | --- |
| `/research` | 5 | 2026-08-20 |
| `/scout` | 1 | 2026-08-14 |
| Missing | 0 | — |

No refresh candidates arise under the configured tier/recency rule. Research
provenance was checked without reauditing historical research claims or reopening
settled decisions.
