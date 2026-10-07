---
id: epic-swarm-attention-board
kind: epic
stage: done
tags: [cli, state]
parent: null
depends_on: [epic-ghostty-project-surface, epic-managed-codex-observation]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Swarm Attention Board

## Brief

Deliver the end-to-end operator experience for supervising several registered
tabs. The `agents` command reads and reconciles the shared store, renders compact
status rows with evidence diagnostics, and keeps title and board projections
consistent. Completion attention clears through reliably observed Ghostty focus
or an explicit acknowledgement command; input-required state clears only from
agent evidence.

This arc also owns safe unregister and stale-session presentation so dead or
hidden sessions never masquerade as live work. It remains a terminal control
plane: focus navigation, notifications, GUI, semantic actions, and hardware are
outside this epic.

## Research briefs

- `.research/analysis/campaigns/agent-board-prior-art/parent.md` — grounds attention routing, unread completion, liveness diagnostics, and deferred controls.
- `.research/analysis/briefs/ghostty-registration-liveness.md` — establishes focus and visibility evidence constraints.
- `.research/analysis/briefs/codex-detector-topology.md` — defines the available lifecycle evidence and completion boundaries.

## Foundation references

- `docs/VISION.md` — at-a-glance supervision outcome.
- `docs/SPEC.md` — board rendering, acknowledgement, expiry, and acceptance scenarios.
- `docs/ARCHITECTURE.md` — independent commands, reconciliation, and shared projection flow.

## Design decisions

- **Capability shape**: use two child features: one read/reconcile/render board
  and one explicit-control router. A single feature would mix read-only UX with
  destructive targeting risk; three features would turn the small shared CLI
  contract into an undersized coordination layer.
- **Ordering**: human rows sort by project label, then creation time, then stable
  session ID. State changes never reorder the board. Duplicate labels gain a
  short session-ID disambiguator only where needed.
- **Control target**: omitted `ack`/`unregister` targets the currently focused
  registered Ghostty terminal, matching the one-tab workflow. An explicit target
  is an exact full session ID; labels and row numbers never become identity.
- **Reconciliation**: `agents` performs one synchronous Ghostty snapshot per
  invocation and best-effort per-record title repair. Boundary-invalid store data
  fails visibly; terminal/action failures degrade the affected row with explicit
  diagnostics rather than hiding the rest of the swarm.
- **Retention**: V1 never deletes disconnected tombstones automatically.
  Non-visible terminal presence immediately forces the diagnostic projection,
  satisfying truthful liveness; removal remains explicit and recoverable through
  `unregister` until real usage supports a retention duration.
- **Output contracts**: `agents` owns compact human output and a versioned JSON
  envelope. Mutating control commands remain human-oriented in V1; structured
  automation for controls is not required by the first proof.
- **Router growth**: `agent-board` uses a small explicit subcommand registry so
  operational readiness can add `doctor` without replacing the ack/unregister
  parsing contract.

## UI alignment

HTML screen mockups are intentionally skipped. This epic's net-new interface is
a terminal table and command grammar, so exact human-output and JSON fixtures are
the appropriate alignment artifacts; a browser mock would invent a graphical
surface that V1 explicitly excludes.

## Other agent review

- **Mode**: one cross-model advisory pass during autopilot epic design.
- **Accepted**: make target syntax/defaults explicit; disambiguate duplicate
  labels without treating labels as identity; define reconciliation degradation;
  surface `titleRendered: false`; preserve an additive seam for later `doctor`.
- **Rejected/deferred**: a third shared-contract feature is disproportionate for
  two small consumers; automatic pruning and structured mutating-command output
  remain unearned V1 complexity.

## Decomposition

Split by operator capability and risk. The read-only board feature establishes
the shared row/output conventions and proves projection parity. The control
feature then consumes those conventions while adding carefully targeted writes.

### Child features

- `epic-swarm-attention-board-board-command` — reconcile and render the shared
  swarm through `agents`, including human/JSON diagnostics and title-repair
  visibility — depends on: `[]`.
- `epic-swarm-attention-board-operator-controls` — add exact-target/current-tab
  acknowledgement and safe unregister through the extensible `agent-board`
  router — depends on: `[epic-swarm-attention-board-board-command]`.

### Decomposition risks

- Per-record repair failures could be mistaken for synchronized titles unless
  visible `titleRendered: false` results become row diagnostics.
- Duplicate labels could make rows indistinguishable; conditional short IDs must
  disambiguate display without promoting labels to identity.
- A broad catch could either hide invalid persisted data or crash on one Ghostty
  failure; feature design must preserve the validated-store versus adapter-failure
  boundary.
- The later operational epic must be able to append `doctor` without refactoring
  a hard-coded two-command router.

## Inherited implementation evidence

- Bulk Ghostty reconciliation returns `titleRendered: false` for a per-session
  title action or permission failure so the rest of the board can still render.
  Board design must surface that transient repair failure as an operator-facing
  diagnostic rather than treating a stored `presence: visible` record as proof
  that its title is synchronized.

## Child features reviewed and complete (2026-08-14)

- The board command performs one shared reconciliation snapshot, uses the
  canonical projection policy, preserves stable label-first ordering, and
  exposes liveness, confidence, mode, and title-sync diagnostics in compact
  human and versioned JSON output.
- Operator controls resolve only exact full IDs or an authoritatively frontmost
  registered Ghostty terminal. Completion acknowledgement and unregister retain
  their distinct durable-state/title-cleanup failure semantics.
- The package exposes `agents` and `agent-board` through symlink-safe executable
  entry points. User-visible labels and evidence details are terminal-safe.
- Both child features completed one standard independent review pass and green
  integrated verification. The assembled attention-board capability is ready
  for aggregate epic review.

## Review (2026-08-14)

**Verdict**: Approve

**Blockers**: none.

**Important follow-ups parked**:

- `idea-board-snapshot-failure-cause` — retain the command-wide Ghostty snapshot
  cause alongside truthful per-row unknown presence.
- `idea-ack-committed-reconciliation-message` — distinguish committed
  acknowledgement from subsequent reconciliation failure in operator output.

Both are message-contract refinements. The implemented degradation behavior,
state transitions, and safety boundaries are correct and meet this epic's V1
scope, so they do not block closure.

**Nits adjudicated**: retained eager per-read title repair until measured
latency warrants a dirty check; retained idempotent acknowledgement output,
validated-UUID target grammar, and the acknowledged terminal-cell-width limit.
Other defensive annotations are harmless and do not justify churn.

**Notes**: Standard weight, one independent cross-model aggregate pass. The
review verified shared projection parity, error/liveness degradation,
frontmost/exact target safety, acknowledgement/unregister interaction, installed
bin behavior, and the full epic acceptance boundary. The receiver accepted both
non-blocking message gaps into backlog and closed without re-review on the
existing uncontended 138/138 verification.
