---
id: epic-operational-readiness
kind: epic
stage: done
tags: [cli, integration, prose]
parent: null
depends_on: [epic-ghostty-project-surface, epic-managed-codex-observation, epic-swarm-attention-board]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Operational Readiness

## Brief

Turn the assembled capabilities into a reliable local tool Andrew can install,
diagnose, exercise, and remove. This arc owns package entry points, the
`agent-board doctor` experience, hermetic end-to-end scenarios using fake Codex
and Ghostty boundaries, opt-in installed-tool integration checks, and concise
installation/usage/uninstall documentation.

It validates the complete vertical slice across multiple simulated sessions and
the supported local environment without mutating unrelated live tabs. It does
not introduce deployment infrastructure, a release process, a GUI, or deferred
product capabilities.

## Research briefs

- `.research/analysis/briefs/codex-detector-topology.md` — supplies version-gating and live integration constraints.
- `.research/analysis/briefs/ghostty-registration-liveness.md` — supplies Automation, configuration, and safe live-probe constraints.
- `.research/analysis/campaigns/agent-board-prior-art/parent.md` — grounds the smallest useful terminal-first release boundary.

## Foundation references

- `docs/SPEC.md` — installation, diagnostics, safety, responsiveness, and acceptance scenarios.
- `docs/ARCHITECTURE.md` — binaries, dependency policy, testing pyramid, and observability rules.
- `docs/PRINCIPLES.md` — low friction, reversibility, and proportional V1 rigor.

## Anticipated child features

Provisional seams are packaging and setup, actionable diagnostics, hermetic
end-to-end validation, and operator documentation.

<!-- The /epic-design pass will fill in real child feature specifics into a
## Decomposition section below this one. -->

## Design decisions

- **Three arcs**: actionable diagnosis, packaged hermetic proof, then operator
  documentation. Packaging belongs with the vertical-slice proof because the
  install artifact—not the source checkout—is the contract being exercised.
- **Doctor boundary**: one typed report aggregates Node/runtime, state-directory,
  Codex, and Ghostty checks. Human and versioned JSON projections share that
  report; errors make the command nonzero while warnings remain usable.
- **No live mutation**: ordinary doctor checks may create and remove a probe file
  only inside Agent Board's own state directory. They never rename tabs, launch
  Codex, change Ghostty config, or request semantic agent actions.
- **Hermetic executable seams**: end-to-end tests exercise packed installed bins
  with temporary state and deterministic fake Codex/Ghostty process boundaries.
  Production defaults remain unchanged; any executable override is explicit,
  test-scoped, shell-free, and validated.
- **Live checks stay opt-in**: installed-tool probes may verify current Codex
  protocol and a disposable Ghostty surface, but default CI and local tests do
  not touch existing user tabs.
- **Documentation last**: installation, first run, daily commands, diagnostics,
  limitations, and uninstall are written against verified package behavior, not
  anticipated commands.

## Decomposition

### Child features

- `epic-operational-readiness-doctor-command` — add the typed diagnostic report
  and `agent-board doctor [--json]`, reusing existing Codex/Ghostty probes and
  validating state-directory access — depends on: `[]`.
- `epic-operational-readiness-packaged-e2e` — pack/install the actual npm artifact
  into a temporary prefix and prove the multi-session V1 workflow through fake
  executable boundaries, plus bounded opt-in installed probes — depends on:
  `[epic-operational-readiness-doctor-command]`.
- `epic-operational-readiness-operator-guide` — publish concise install, setup,
  usage, troubleshooting, and uninstall guidance grounded in the verified bins
  and doctor output — depends on:
  `[epic-operational-readiness-doctor-command, epic-operational-readiness-packaged-e2e]`.

### Decomposition risks

- A doctor that merely repeats process errors without remediation is not useful;
  each failed check needs a stable code, severity, and concrete next action.
- Fake-boundary controls can accidentally become an unsafe production escape
  hatch. Keep them explicit, shell-free, and scoped to executable paths only.
- A packed-bin test that imports source modules proves the checkout, not the
  artifact. The main path must invoke installed commands from the temporary
  prefix and inspect only their public outputs/state.
- Documentation must not imply ordinary Codex mode parity, automatic config
  mutation, live-tab-safe integration tests, or capabilities preserved only in
  backlog.

## Completion boundary

The epic is ready for aggregate review when all four shipped bins operate from a
packed install, doctor provides actionable human and JSON results, the hermetic
multi-session scenarios cover the five attention outcomes and safe controls,
opt-in live probes are clearly isolated, and a new operator can install, use,
diagnose, and uninstall the tool from the written guide.

## Implementation notes

- Delivered all three child features: actionable doctor, packaged vertical-slice
  proof, and the operator guide.
- The npm artifact exposes `agent-name`, `agent-codex`, `agents`, and
  `agent-board` with source-free installed execution.
- Hermetic tests cover multi-session lifecycle, five attention outcomes,
  controls, diagnostics, failure, recovery, and owned-process cleanup.
- Opt-in tests isolate installed Codex schema checks and a disposable Ghostty
  window. Default tests do not touch live Agent Board sessions.
- The e2e review exposed and drained
  `story-fix-lock-contention-silent-exit` before epic closure.
- Verification: typecheck passes. The full suite passes at 159 tests with two
  explicit live-probe skips.

## Review (2026-08-14)

**Verdict**: Approve with one integration addition.

**Blockers**: none.

**Important addition**: the packed golden journey now proves automatic
focus-driven acknowledgement while the managed launcher runs. It then creates a
second completion and proves the exact-ID fallback through the installed
`agent-board` command.

**Nits adjudicated**: strengthened the termination journey so an empty board
cannot pass; removed a dead harness helper; documented the exact packed-tarball
install path. Kept strict installed-Codex stderr checking because the opt-in
probe is a compatibility alarm. Kept the real adapter's current diagnostic
shape rather than adding unreachable defensive behavior.

Standard review weight: one independent aggregate cross-model pass, receiver
changes, focused verification, and closure without re-review. The focused
golden and chaos journeys pass 4/4.
