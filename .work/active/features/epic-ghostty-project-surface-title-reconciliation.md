---
id: epic-ghostty-project-surface-title-reconciliation
kind: feature
stage: done
tags: [integration, state]
parent: epic-ghostty-project-surface
depends_on: [epic-ghostty-project-surface-applescript-adapter, epic-ghostty-project-surface-registration-naming]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Title and Presence Reconciliation

## Brief

Reconcile every registered Ghostty identity against the current application
hierarchy, classify visible/hidden/missing/unknown presence, update terminal
evidence without overwriting agent-owned fields, and set or clear the exact
canonical title only on a verified target. Repair drift during safe state writes
and board reads.

The feature must handle tab reorder, window movement, close, undo-close, and
unregister without using process liveness as a substitute for hierarchy. It does
not expire records by arbitrary time or focus another tab.

## Inherited design decisions

- Hidden/undoable and missing are distinct; both avoid false live-looking titles.
- Projection is consumed, never reimplemented, and the whole title is Board-owned.

## Research and foundation references

- `.research/analysis/briefs/ghostty-registration-liveness.md` — hierarchy/undo behavior.
- `docs/ARCHITECTURE.md` — reconciliation and title renderer modules.
- `docs/SPEC.md` — stale/dead session safety and title acceptance cases.

## Design decisions

- **One snapshot contains both visible ancestry and application-wide terminals**:
  extend the Ghostty adapter with one constant AppleScript response that marks
  visible window/tab/terminal rows and all enumerable terminal IDs. This is the
  minimum evidence needed to distinguish visible, undo-hidden, and missing
  without a process-liveness guess.
- **Terminal ID remains the relocation anchor**: a unique terminal found in the
  visible tree is `visible` even when its window/tab ancestry changed; update
  the stored ancestry to the current row. A terminal found only application-wide
  is `hidden`; an absent ID is `missing`; a failed/unusable snapshot is
  `unknown`.
- **Non-visible terminal evidence outranks the primary glyphs**: align the pure
  projection with the locked architecture so hidden, missing, or unknown
  terminals project `? diagnostic` before error/attention/activity. Attention
  remains stored and becomes visible again after a verified undo; it does not
  masquerade as current while the surface is disconnected.
- **Set titles only on a visible verified row**: reconciliation persists the
  terminal observation, re-reads the latest record, verifies the same terminal
  is still visible, and then renders through `projectSession`. Hidden, missing,
  and unknown sessions get no title write.
- **Unregister is clear-before-remove**: visible or application-enumerable hidden
  terminals are exact verified targets, so clear their override before removing
  the record. Missing terminals may be removed directly. Unknown presence fails
  without removal so the operator can retry rather than orphaning a title.
- **No automatic pruning in V1**: missing records remain inspectable diagnostic
  tombstones until explicit unregister. Time alone neither deletes state nor
  acknowledges attention.

## Architectural choice

Use a strict Ghostty snapshot extension, a pure presence classifier, and two
small application use cases: reconcile one/all sessions and unregister one
session. Reconciliation owns the sequence “snapshot → terminal-only mutation →
latest-record projection → targeted title,” so board reads and lifecycle
callbacks can share one policy without duplicating status or liveness logic.

Alternatives were rejected. PID/process probing cannot distinguish undo-hidden
tabs. N AppleScript queries per session introduce inconsistent snapshots and
scale poorly. Persisting a second title cache creates drift without enabling a
reliable read-back comparison, so verified titles are simply set idempotently.

The trickiest unit is the dual-view snapshot and classifier: it must refresh
safe ancestry after tab movement while preserving the hidden/missing distinction
demonstrated by the local Ghostty probe.

## Implementation units

### Unit 1: Structured Ghostty visibility snapshot

**Files**: `src/integrations/ghostty/scripts.ts`,
`src/integrations/ghostty/protocol.ts`, `src/integrations/ghostty/client.ts`

```ts
export interface GhosttySnapshot {
  readonly visible: readonly GhosttyHierarchyEntry[];
  readonly enumerableTerminalIds: readonly string[];
}

export function parseGhosttySnapshot(stdout: string): GhosttySnapshot;

export class GhosttyClient {
  // existing methods
  snapshot(): Promise<GhosttySnapshot>;
}
```

**Implementation notes**:

- Add one constant `SNAPSHOT_SCRIPT` that emits tagged tab-separated rows:
  `VISIBLE <window> <tab> <terminal>` while traversing the current hierarchy,
  followed by `ENUMERABLE <terminal>` from Ghostty's application-wide terminal
  collection. Dynamic values remain output data, never script source.
- Parse strict row widths/markers, reject empty/control-character IDs,
  duplicate visible terminal IDs, duplicate enumerable IDs, or a visible ID
  absent from the enumerable set. Bound execution with the existing client.
- Keep `hierarchy()` for existing diagnostics/tests only if it remains useful;
  do not add a second process abstraction.

**Acceptance criteria**:

- [ ] One adapter call returns current ancestry plus application-wide terminal
  membership and rejects contradictory snapshots.
- [ ] Fixtures cover exact visible, hidden-only, empty/missing, reordered, and
  moved-window rows without launching Ghostty.
- [ ] All scripts remain constant and all external execution shell-free.

### Unit 2: Reconciliation-facing port and pure classification

**Files**: `src/domain/ports.ts`, `src/application/reconcile-session.ts`

```ts
export interface TerminalSnapshot {
  readonly visible: readonly TerminalIdentity[];
  readonly enumerableTerminalIds: readonly string[];
}

export interface ReconciliationTerminalPort {
  snapshot(): Promise<TerminalSnapshot>;
  setTitle(identity: TerminalIdentity, title: string): Promise<void>;
  clearTitle(identity: TerminalIdentity): Promise<void>;
}

export function classifyTerminalPresence(
  registered: TerminalIdentity,
  snapshot: TerminalSnapshot,
  observedAt: string,
): TerminalObservation;
```

**Implementation notes**:

- A visible row with the registered terminal ID returns that row's current
  window/tab IDs and `visible`. No visible row plus enumerable membership is
  `hidden`; absence from both is `missing`.
- Reject duplicate/contradictory snapshots defensively even though the adapter
  parser already validates them. Preserve registered ancestry for hidden and
  missing diagnostics.
- Validate clock output and the produced terminal observation at the domain
  boundary.

**Acceptance criteria**:

- [ ] Reorder leaves identity stable, moved-window ancestry refreshes safely,
  hidden undo-close remains distinct from missing, and duplicate IDs fail.
- [ ] Classification is pure and independently testable.

### Unit 3: Session/all-session reconciliation and guarded rendering

**Files**: `src/application/reconcile-session.ts`,
`src/application/render-title.ts`, `src/domain/projection.ts`

```ts
export interface ReconcileDependencies {
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
}

export interface ReconcileResult {
  readonly record: SessionRecord;
  readonly titleRendered: boolean;
}

export function reconcileSession(
  dependencies: ReconcileDependencies,
  sessionId: string,
  snapshot?: TerminalSnapshot,
): Promise<ReconcileResult>;

export function reconcileSessions(
  dependencies: ReconcileDependencies,
): Promise<readonly ReconcileResult[]>;
```

**Implementation notes**:

- `reconcileSessions` obtains one snapshot, lists once, and applies that same
  evidence to all records. `reconcileSession` accepts a supplied snapshot for
  reuse or acquires one itself.
- Mutate only `terminal`; preserve identity and agent fields against concurrent
  rename/lifecycle writes. On snapshot failure, record `unknown` with fresh
  terminal evidence for each targeted record, emit no title action, and rethrow
  only for the single-session caller; the all-session result exposes the
  diagnostic records for board rendering.
- For visible results, re-read the latest record after mutation and render only
  if its terminal ID/presence still match the verified row. Make
  `renderSessionTitle` reject a non-visible record rather than writing through
  stale state.
- Change `projectSession` so any non-visible terminal projects `?` before the
  five primary states. Do not clear stored attention or agent error.
- If `setTitle` reports target-not-found after a visible snapshot, persist
  `terminal.presence=unknown` and surface the adapter failure; a later pass can
  repair it.

**Acceptance criteria**:

- [ ] A visible session receives exactly `projectSession(latest).title`; title
  format/precedence is never duplicated.
- [ ] Hidden/missing/unknown sessions receive no set-title action and project
  diagnostic regardless of stale agent working/attention state.
- [ ] One all-session pass uses one snapshot, preserves concurrent agent/label
  changes, and returns deterministic store order.
- [ ] A target disappearing between snapshot and write stops looking visible
  and fails explicitly.

### Unit 4: Recoverable unregister use case

**File**: `src/application/unregister-session.ts`

```ts
export function unregisterSession(
  dependencies: Pick<ReconcileDependencies, "store" | "terminal" | "clock">,
  sessionId: string,
): Promise<void>;
```

**Implementation notes**:

- Load and validate the record, acquire a current snapshot, and classify the
  exact registered terminal. For visible or hidden, call `clearTitle` before
  `store.remove`; for missing, remove directly; for unknown/snapshot failure,
  fail without removal.
- If clear fails, retain the record so explicit unregister is retryable. Treat a
  concurrent missing record as stable `NOT_FOUND`; do not remove another
  session by label or repository.

**Acceptance criteria**:

- [ ] Visible and undo-hidden unregister clear the exact terminal override then
  remove one record.
- [ ] Missing unregister removes the tombstone without an impossible title
  action.
- [ ] Snapshot/clear failure preserves the record and reports a typed error.

## Implementation order

1. Add and test the dual-view Ghostty snapshot/parser.
2. Add the reconciliation port and pure presence classifier.
3. Align diagnostic projection and implement one/all reconciliation with
   guarded title repair.
4. Implement clear-before-remove unregister and run the full suite.

The work is cohesive around one snapshot contract; no child stories are needed.

## Simplification

- Reuse the canonical record, atomic store mutation, projection, clock, and
  Ghostty process boundary; add no PID probe, cache, daemon, or title mirror.
- Keep one all-session snapshot rather than per-record external queries.
- Retain `hierarchy()` only while diagnostics or tests consume it; remove it if
  the snapshot fully supersedes every caller during implementation.

## Testing

- Protocol tests protect the structured dual-view snapshot and contradiction
  rejection using literal output fixtures.
- Pure classifier/projection tests protect move/reorder/undo/missing semantics
  and the regression that disconnected attention cannot keep a primary glyph.
- Application tests use an in-memory or temporary real store plus fake terminal
  port to protect one-snapshot fanout, terminal-only mutation ownership,
  latest-record title parity, target-disappearance behavior, and unregister
  recovery.
- No default test opens, renames, focuses, or closes a real Ghostty surface.
  Installed move/undo behavior remains an opt-in integration check.

## Implementation notes
- Execution capability: GPT-5.6 Luna high; cohesive integration feature with race-sensitive title/liveness behavior.
- Review weight: standard, inherited from the managed autopilot caller.
- Files changed: `src/integrations/ghostty/{scripts,protocol,client}.ts`, `src/domain/{ports,projection}.ts`, `src/application/{reconcile-session,render-title,unregister-session}.ts`, and focused protocol/domain/application tests.
- Tests added/removed: dual-view parser/client fixtures; pure visible/hidden/missing classification; one-snapshot fanout; diagnostic precedence; snapshot/title race demotion; clear-before-remove unregister recovery.
- Simplification: reused the existing shell-free process boundary, atomic session mutation, canonical projection, and terminal-ID title action; no liveness probes, title cache, or pruning path added.
- Discrepancies from design: none.
- Adjacent issues parked: none.

## Risks

- **Ghostty's application-wide enumeration may include undo-hidden terminals**:
  this is the researched behavior the snapshot intentionally preserves; strict
  tagged rows make changes fail visibly.
- **Snapshot-to-action race**: title failure demotes presence to unknown rather
  than preserving a false visible state.
- **Moved ancestry**: terminal ID is empirically stable and unique; current
  window/tab IDs are refreshed only from one unique visible row.
- **Hidden title clearing**: the target is application-enumerable and exact, but
  installed validation remains prudent. Failure retains the record and makes
  unregister retryable.

## Review (2026-08-14)

Standard-weight review used one fresh-context cross-model pass with Claude
Sonnet. It approved the dual-view snapshot, movement/undo classification,
terminal-only mutation, diagnostic precedence, one-snapshot fanout, guarded
title repair, and clear-before-remove recovery with no material findings.

Receiver adjudication accepted two small cleanup proposals: remove an
unreachable unknown-classification branch and add the explicit undo-hidden
unregister acceptance test. Typecheck, build, focused tests, and the serialized
full suite passed. Per standard policy, the feature closes after this one pass
and verified cleanup without re-review.
