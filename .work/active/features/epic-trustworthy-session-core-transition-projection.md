---
id: epic-trustworthy-session-core-transition-projection
kind: feature
stage: done
tags: [state]
parent: epic-trustworthy-session-core
depends_on: [epic-trustworthy-session-core-domain-contract, epic-trustworthy-session-core-atomic-store]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-16
---

# Transition and Projection Policy

## Brief

Implement application services that apply validated partial observations to the
latest session revision and derive the one canonical attention projection used
by Ghostty titles and board rows. Encode precedence for error, input-required,
completion-unread, working, idle, and diagnostic states plus freshness and clean
process-exit behavior.

Acceptance requires identical projections for identical records regardless of
caller, no false primary glyph for stale or ambiguous evidence, and transition
tests covering field ownership and acknowledgement boundaries.

## Inherited design decisions

- Projection is pure, diagnostic `?` is outside the five primary symbols, and
  process exit is observation evidence.

## Research and foundation references

- `docs/ARCHITECTURE.md` — Projection policy and application services.
- `docs/SPEC.md` — Projection precedence and acknowledgement requirements.
- `.research/analysis/campaigns/agent-board-prior-art/parent.md` — attention and evidence semantics.

## Design decisions

- Normalize adapters into a discriminated `AgentTransition`; adapter-native
  payloads never enter the store.
- A completion transition sets idle plus unread completion. Input-required is
  cleared only by an explicit input-resolved/native state transition, never by
  time or focus acknowledgement.
- Starting new work clears completion-unread because it is positive evidence of
  subsequent interaction; ordinary idle observations preserve attention.
- Clean process exit sets activity idle and process-exit evidence but does not
  invent stale/error health. Terminal reconciliation owns disconnection.
- Projection follows the specification's precedence. Non-visible terminals and
  ordinary-mode records project `? diagnostic` before health, attention, or
  activity; only managed mode can reach the five canonical glyphs. Within
  managed mode, stale diagnostics replace only otherwise-working/idle/unknown
  glyphs; explicit error and attention glyphs remain visible with diagnostic
  annotations.

## Architectural choice

Considered direct partial-record patches, a generic reducer with arbitrary
field updates, and a closed discriminated transition union. Partial patches are
small but allow illegal combinations and field-ownership drift. A generic
reducer only hides that weakness. A closed union is selected because each event
can encode its invariant and future adapters must deliberately map into it.

The trickiest unit is projection precedence across fresh/stale evidence and
terminal ambiguity. It stays pure and table-driven so title and board callers
cannot diverge.

## Implementation Units

### Unit 1: Normalized transition contract

**File**: `src/domain/transitions.ts`

```typescript
export type Evidence = {
  observedAt: string;
  evidenceKind: string;
  confidence: ConfidenceLevel;
  detail?: string;
};
export type AgentTransition =
  | ({ type: "working" } & Evidence)
  | ({ type: "idle" } & Evidence)
  | ({ type: "input-required" } & Evidence)
  | ({ type: "input-resolved" } & Evidence)
  | ({ type: "completed" } & Evidence)
  | ({ type: "error" } & Evidence)
  | ({ type: "process-exit"; exitCode: number | null } & Evidence);
export const AgentTransitionSchema: z.ZodType<AgentTransition>;
export function applyAgentTransition(
  current: Readonly<SessionRecord>,
  transition: AgentTransition,
): SessionRecord;
```

Validate evidence through shared schemas/registries. Preserve identity,
terminal, mode, native thread, launcher pid, schema, and revision. Map each
transition into only its owned activity/attention/health/evidence fields.

**Acceptance Criteria**:

- [ ] Invalid transition shapes fail before mutation.
- [ ] Completion, wait, error, new-work, idle, and clean-exit invariants are explicit and exhaustively tested.
- [ ] A transition cannot change identity or terminal state.

### Unit 2: Transition application service

**File**: `src/application/observe-agent.ts`

```typescript
export interface ObserveAgentCommand {
  sessionId: string;
  transition: AgentTransition;
}
export async function observeAgent(
  store: SessionStore,
  command: ObserveAgentCommand,
): Promise<SessionRecord>;
```

Parse the transition, call the store's latest-record mutation, and translate
only known domain failures. The store owns revision and concurrency; this
service never performs read-then-write outside one mutation.

**Acceptance Criteria**:

- [ ] Concurrent observers cannot bypass store serialization.
- [ ] Missing sessions and invalid transitions retain stable error codes.

### Unit 3: Completion acknowledgement

**File**: `src/application/acknowledge.ts`

```typescript
export type AcknowledgementSource = "explicit" | "ghostty-focus";
export async function acknowledgeCompletion(
  store: SessionStore,
  sessionId: string,
  source: AcknowledgementSource,
  observedAt: string,
): Promise<SessionRecord>;
```

Clear only `completion_unread`; preserve `input_required`. Record bounded Board
evidence for a real change. Read once to skip obvious no-ops, then re-check inside
the mutation. Clear only when the acknowledgement timestamp is at or after the
current completion observation so an older focus event cannot erase a concurrent
new completion. Do not let elapsed time call this service.

**Acceptance Criteria**:

- [ ] Explicit and reliable-focus acknowledgement clear unread completion.
- [ ] Input-required attention is never cleared by this service.

### Unit 4: Canonical projection

**File**: `src/domain/projection.ts`

```typescript
export type PrimaryGlyph = "○" | "●" | "✓" | "!" | "×";
export type ProjectionGlyph = PrimaryGlyph | "?";
export interface SessionProjection {
  glyph: ProjectionGlyph;
  status: "idle" | "working" | "finished" | "needs-input" | "error" | "diagnostic";
  label: string;
  title: string;
  diagnostics: readonly string[];
  confidence: ConfidenceLevel;
  observedAt: string;
}
export interface ProjectionOptions { now: Date; workingFreshForMs: number; }
export function projectSession(record: Readonly<SessionRecord>, options: ProjectionOptions): SessionProjection;
```

Precedence: non-visible terminal; ordinary mode; error; input required;
completion unread; fresh working; live idle; diagnostic. Add diagnostics for
stale health, non-visible/unknown terminal, unmanaged ordinary mode,
expired/future working evidence, inferred confidence, and detail without
changing the primary attention glyph once a session is managed. The exact title
is `<glyph> <projectLabel>` and contains no diagnostic suffix.

**Acceptance Criteria**:

- [ ] The five architecture examples project exactly.
- [ ] A visible ordinary-mode record projects `? diagnostic` with `session is not managed`, never `○ idle`.
- [ ] Stale working and unknown activity project `?`, never idle/error.
- [ ] Title and row callers receive one immutable projection object.
- [ ] Boundary timestamps and invalid projection options fail deterministically.

### Unit 5: Transition and projection tests

**Files**: `tests/domain/transitions.test.ts`, `tests/domain/projection.test.ts`, `tests/application/observe-agent.test.ts`, `tests/application/acknowledge.test.ts`

Use a small in-memory `SessionStore` fake implementing atomic mutation semantics.
Table-test every transition and projection precedence combination, including
attention plus stale diagnostics, clean exit while terminal remains visible,
focus acknowledgement, refusal to clear input-required, exact title strings,
working freshness boundary, future timestamps, and malformed input.

**Acceptance Criteria**:

- [ ] Tests prove board/title status cannot drift because both use one projection.
- [ ] Tests prove only native resolution clears input-required.

## Implementation Order

1. Transition union and reducer establish legal state changes.
2. Observe and acknowledgement services apply them through the store.
3. Pure projection encodes the user-visible policy.
4. Table-driven tests cover the state matrix and application seams.

## Testing

Use pure unit tests for reducers/projection and a deterministic in-memory store
for application services. Real filesystem concurrency is already covered by the
atomic-store feature and should not be duplicated here.

## Risks

- **Precedence ambiguity**: stale sessions with unread attention can either hide
  or retain the last attention signal. The locked spec orders attention before
  stale diagnostics, so retain the glyph and add diagnostics; reconciliation
  owns eventual expiry.
- **No-op acknowledgement revisions**: the current store mutation contract
  always increments. A pre-read avoids the usual no-op; the in-mutation
  timestamp/attention re-check protects a concurrent newer completion. A race
  that removes attention before mutation may still create a harmless revision.
- **Clock skew**: a materially future working observation is diagnostic rather
  than indefinitely fresh. Keep the tolerated skew explicit and tested.

## Child stories

None. Reducer, application services, and projection share one small state matrix;
one owner best preserves semantic coherence.

## Implementation notes

- Execution capability: GPT-5.6 Luna high, selected for state-machine and temporal correctness.
- Review weight: standard, from `.work/CONVENTIONS.md`.
- Files changed: `src/domain/transitions.ts`, `src/domain/projection.ts`, `src/application/observe-agent.ts`, `src/application/acknowledge.ts`, `tests/domain/transitions.test.ts`, `tests/domain/projection.test.ts`, `tests/application/observe-agent.test.ts`, and `tests/application/acknowledge.test.ts`.
- Simplification: the closed transition union reuses the canonical observation schema; the application services delegate all serialization and revision ownership to `SessionStore.mutate`.
- Discrepancies from design: initial implementation used the latest general agent-observation timestamp as a completion proxy. Review proved that an intervening idle observation could suppress a legitimate acknowledgement, so the canonical record now carries `completionObservedAt` only while completion is unread.
- Adjacent issues parked: none.
- Verification: `npm run typecheck` passed; `npm run build` passed; `npm test` passed (33 tests, 33 passed).

### Addendum (2026-08-16)

- Regression addressed: visible ordinary-mode sessions were still falling
  through to `○ idle` when they had only registration evidence. This let an
  `agent-name`-only tab or an otherwise unobserved session claim a canonical
  managed state.
- Contract correction: `projectSession` now appends `session is not managed`
  whenever `agent.mode === "ordinary"` and short-circuits projection to
  `? diagnostic` before health, attention, or activity precedence.
- Operator impact: `agent-name` remains the supported registration/naming
  surface, but it no longer implies live supervision. `agent-codex` is the
  managed launcher that attaches observation and unlocks the canonical
  `○ ● ✓ ! ×` states.

## Review (2026-08-14)

**Verdict**: Approve with comments

**Blockers**: none — fixed acknowledgement freshness against dedicated completion evidence
**Important**: none — nonzero or unknown process exit now produces explicit error health and diagnostic detail
**Nits**: none; exact-timestamp acknowledgement coverage was added during the fix
**Rejected**: none

**Notes**: Standard-weight cross-model review ran exactly one balanced pass
against `31857be`. The receiver confirmed that the general agent `observedAt`
could advance on an attention-preserving idle/process-exit event and therefore
was not a safe completion clock. The normalized record now stores
`completionObservedAt` only while unread completion exists, reducers maintain
that invariant, and acknowledgement compares against it. Process exit codes are
also no longer inert: zero remains clean, while nonzero or unknown exits become
error health with bounded detail. Foundation schemas were rolled forward and
the full suite passed 36/36 after fixes. Standard closure does not commission a
second independent pass.
