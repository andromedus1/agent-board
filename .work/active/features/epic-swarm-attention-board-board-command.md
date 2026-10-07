---
id: epic-swarm-attention-board-board-command
kind: feature
stage: done
tags: [cli, state]
parent: epic-swarm-attention-board
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-16
---

# Swarm Board Command

## Brief

Deliver `agents`, the persistent terminal view over every registered session.
One application query reconciles the current Ghostty hierarchy, attempts safe
title repair, projects each latest canonical record through the existing shared
policy, and returns stable row data for compact human and versioned JSON output.

The board must make uncertainty inspectable without bloating tab titles. It
preserves canonical projection diagnostics for terminal presence, unmanaged
ordinary mode, stale observations, inferred evidence, and adapter detail, then
adds a visible-but-unsynchronized title or corroborated-evidence note only when
the board layer owns that distinction; one Ghostty target failure
must not erase unrelated rows. It does not mutate attention, remove records,
launch agents, add a daemon, or navigate to a tab.

## Epic context

- Parent epic: `epic-swarm-attention-board`
- Position in epic: read-only foundation; operator controls depend on its stable
  row, output, and error conventions.

## Inherited design decisions

- Sort by label, creation time, and session ID; add short-ID display only for
  duplicate labels.
- Reconcile synchronously from one Ghostty snapshot and degrade adapter failures
  per row, while invalid persisted records fail visibly.
- Surface visible `titleRendered: false` as an explicit synchronization
  diagnostic.
- Provide compact human output plus a versioned JSON envelope; no graphical UI.
- Preserve disconnected records until explicit unregister; never auto-prune in V1.

## Research briefs

- `.research/analysis/campaigns/agent-board-prior-art/parent.md` — attention-board
  projection, diagnostics, liveness, and daemon deferral.
- `.research/analysis/briefs/ghostty-registration-liveness.md` — hierarchy-aware
  visibility and undo-close evidence.
- `.research/analysis/briefs/codex-detector-topology.md` — lifecycle evidence and
  confidence boundaries consumed by rows.

## Foundation references

- `docs/VISION.md` — shared terminal board outcome.
- `docs/SPEC.md` — persistent-board examples, diagnostic annotations, and stale
  session behavior.
- `docs/ARCHITECTURE.md` — independent `agents` command, projection policy,
  diagnostics, and JSON output.

<!-- The /feature-design pass fills interfaces, implementation units, and tests. -->

## Design decisions

- **Partial failure boundary**: schema/store validation remains fail-fast for the
  whole command. Ghostty snapshot/action failures use the reconciliation result
  already persisted for each record and become row diagnostics.
- **Duplicate labels**: keep ordinary rows identical to the product sample. Only
  colliding labels receive a bracketed, shortest-unique session-ID prefix (at
  least eight characters) for visual disambiguation; JSON always carries the
  full ID.
- **Confidence detail**: `projectSession` owns canonical projection
  diagnostics, including unmanaged ordinary mode and inferred evidence. Board
  rows preserve those diagnostics verbatim and add only
  `evidence is corroborated`; titles continue to use only the canonical compact
  glyph plus label. `agentMode` and `confidence` remain explicit row/JSON
  fields.
- **Empty state**: a valid empty store renders the board heading plus `No
  registered agents.` and does not require a Ghostty snapshot.

## Architectural choice

Use an application query that converts canonical reconciliation results into an
immutable `BoardRow` read model, followed by pure human/JSON renderers and a thin
CLI/composition root. This keeps Ghostty and filesystem behavior behind existing
ports while making ordering, diagnostics, and output contracts testable without
processes or a terminal.

Two alternatives were rejected. Rendering directly inside the CLI would couple
state truth, AppleScript failure behavior, and string layout. Persisting a
materialized board snapshot would create a second source of truth and require a
daemon or invalidation policy the first proof has not earned.

The trickiest unit is row construction: it must preserve fail-fast canonical
validation, retain per-record repair evidence, preserve shared projection
diagnostics, add only the board-owned title-sync/corroborated annotations,
disambiguate duplicate labels, and sort independently of changing state.

## Implementation Units

### Unit 1: Board row query and projection

**File**: `src/application/list-sessions.ts`

```ts
export interface BoardRow {
  readonly sessionId: string;
  readonly label: string;
  readonly displayLabel: string;
  readonly glyph: ProjectionGlyph;
  readonly status: ProjectionStatus;
  readonly diagnostics: readonly string[];
  readonly confidence: ConfidenceLevel;
  readonly agentMode: AgentMode;
  readonly observedAt: string;
  readonly titleRendered: boolean;
}

export interface ListSessionsDependencies extends ReconcileDependencies {}

export function buildBoardRows(
  results: readonly ReconcileResult[],
  options: ProjectionOptions,
): readonly BoardRow[];

export function listSessions(
  dependencies: ListSessionsDependencies,
): Promise<readonly BoardRow[]>;
```

**Implementation Notes**:

- Call `reconcileSessions` once. Add its missing empty-store fast path so the
  canonical list read returns immediately without an AppleScript snapshot; do
  not introduce a second preflight store read and registration race.
- Project every reconciled latest record with `projectSession`; never duplicate
  glyph/status precedence.
- Add `title is not synchronized` only when presence is visible and
  `titleRendered` is false. Hidden/missing/unknown already carry their truthful
  terminal diagnostic.
- Preserve `projectSession` diagnostics exactly, including `session is not
  managed`, inferred evidence, terminal presence, stale/future evidence,
  unknown activity, stale health, and adapter detail. Add only the board-owned
  `title is not synchronized` note; add `evidence is corroborated` only when
  it is not already present. Keep `agentMode` and `confidence` as row/JSON
  fields.
- Group exact labels, compute a shortest unique session-ID prefix of at least
  eight characters for collisions, then sort by raw label, `createdAt`, and full
  session ID. State/glyph changes never affect position.
- Freeze rows, diagnostic arrays, and the returned array.

**Acceptance Criteria**:

- [x] Every row's glyph/status derives from the same `projectSession` policy used
  by tab titles.
- [x] Visible title-repair failure, canonical projection diagnostics, and
  corroborated evidence remain distinguishable.
- [x] Duplicate labels are visually distinct; unique-label rows remain uncluttered.
- [x] Ordering is stable across state transitions, and an empty store performs no
  terminal call.

### Unit 2: Stable terminal and JSON rendering

**File**: `src/cli/output.ts`

```ts
export interface BoardEnvelope {
  readonly schemaVersion: 1;
  readonly sessions: readonly BoardRow[];
}

export function renderBoard(rows: readonly BoardRow[]): string;
export function renderBoardJson(rows: readonly BoardRow[]): string;
export function formatCliError(error: unknown): string;
```

**Implementation Notes**:

- Human output begins `AGENT BOARD`, pads the longest `displayLabel` in the
  current result, renders user-facing status labels (`needs input`, not internal
  enum spelling), and appends diagnostics in a terse bracketed suffix.
- Empty output is `AGENT BOARD\n\nNo registered agents.\n`.
- JSON is one newline-terminated object with `schemaVersion: 1` and the immutable
  rows. Use `JSON.stringify`; never hand-escape user labels or diagnostics.
- Keep output free of repo paths, prompt content, environment values, and tokens.

**Acceptance Criteria**:

- [x] The five primary examples render exactly and diagnostics remain readable
  without changing the glyph/label prefix.
- [x] Labels containing spaces, quotes, or Unicode are safe in both formats.
- [x] JSON preserves full session IDs, evidence fields, and title-sync state in a
  versioned envelope.

### Unit 3: `agents` command boundary

**File**: `src/cli/agents.ts`

```ts
export interface AgentsCommandDependencies {
  readonly list: () => Promise<readonly BoardRow[]>;
  readonly stdout: Pick<NodeJS.WriteStream, "write">;
  readonly stderr: Pick<NodeJS.WriteStream, "write">;
}

export function runAgents(
  argv: readonly string[],
  dependencies: AgentsCommandDependencies,
): Promise<number>;

export function main(argv?: readonly string[]): Promise<number>;
```

**Implementation Notes**:

- Accept only no arguments or one `--json`; invalid grammar prints
  `Usage: agents [--json]` and returns 2 before querying.
- Query exactly once, route normal output to stdout, and print stable typed
  diagnostics without stacks to stderr with exit 1.

**Acceptance Criteria**:

- [x] Human and JSON modes call the same list operation and differ only in
  rendering.
- [x] Invalid arguments and query failures have deterministic exit/output
  behavior without a real store or Ghostty process.

### Unit 4: Production composition and package entry point

**Files**: `src/composition/create-agents.ts`, `package.json`

```ts
export interface AgentsCommand {
  readonly list: () => Promise<readonly BoardRow[]>;
}

export interface AgentsCompositionOptions {
  readonly store?: SessionStore;
  readonly terminal?: ReconciliationTerminalPort;
  readonly workingFreshForMs?: number;
}

export function createAgentsCommand(
  options?: AgentsCompositionOptions,
): AgentsCommand;
```

**Implementation Notes**:

- Reuse one `JsonSessionStore`, `GhosttyClient`, real clock, and the same default
  working freshness used by launcher/title composition.
- Add `"agents": "dist/cli/agents.js"` to npm `bin`; add no framework or daemon.

**Acceptance Criteria**:

- [x] The built package exposes an executable `dist/cli/agents.js` and injected
  composition tests remain hermetic.

## Implementation Order

1. Board row query/projection — establishes the shared read model and hardest
   correctness boundary.
2. Pure human/JSON rendering — fixes the terminal contract against that model.
3. CLI grammar — adds exit and stream behavior around the pure surfaces.
4. Composition/bin — wires only already-tested units.

No child stories are spawned: the four units are tightly coupled around one
small read model and fit one implementation stride.

## Testing

### Unit tests: `tests/application/list-sessions.test.ts`

- Use canonical records and `ReconcileResult` fixtures to test projection parity,
  title-sync diagnostics, preserved projection diagnostics, corroborated
  annotation, duplicate prefix extension, frozen results, and stable
  label/creation/ID ordering.
- Exercise `listSessions` with fake store/terminal ports to prove one snapshot for
  many records and per-record degradation. Extend reconciliation tests to prove
  no snapshot for empty state.

### Unit tests: `tests/cli/output.test.ts`

- Snapshot exact five-state human output, empty output, aligned diagnostics,
  duplicate-label display, and Unicode/JSON escaping.

### Unit tests: `tests/cli/agents.test.ts`

- Cover no-arg/`--json`, invalid grammar before list, one query per invocation,
  typed and unknown failures, stream separation, and exit codes.

### Integration verification

- Run typecheck, build, and the full serialized suite; assert npm's `agents` bin
  target exists after build. No live Ghostty or Codex process is required.

## Risks

- **Partial failure becomes silence**: `titleRendered: false` or adapter detail
  could be discarded while rows still look healthy. **Fallback**: construct rows
  only from `ReconcileResult` and contract-test every degradation class.
- **Display ambiguity**: duplicate labels or prefixes could collide. **Fallback**:
  extend prefixes until unique within the exact-label group, falling back to the
  full ID.
- **Unicode alignment**: `String.padEnd` counts code units, not terminal cells.
  V1 optimizes for ordinary project labels and remains truthful if columns are
  imperfect; add a width dependency only after observed need.
- **Read latency**: title repair is synchronous and bounded per Ghostty action.
  V1 favors immediate shared-store truth and no daemon; if measured multi-tab
  latency becomes disruptive, retain rendering from reconciled results and move
  repair scheduling behind the same query contract later.

## Implementation notes

- Execution capability: GPT-5.6 Luna high, selected for the cross-module query, rendering, CLI, and composition boundary.
- Review weight: standard, from `.work/CONVENTIONS.md`; implementation stops at `stage: review` for the parent orchestrator.
- Files changed: `src/application/list-sessions.ts`, `src/application/reconcile-session.ts`, `src/cli/output.ts`, `src/cli/agents.ts`, `src/composition/create-agents.ts`, `package.json`, `tests/application/list-sessions.test.ts`, `tests/cli/output.test.ts`, and `tests/cli/agents.test.ts`.
- Tests added/removed: Added hermetic projection/reconciliation, renderer, and CLI contract tests covering shared projection precedence, title synchronization diagnostics, preserved projection diagnostics, corroborated-evidence annotation, duplicate-label prefixes, frozen rows, empty-store no-snapshot behavior, escaping, grammar, stream separation, typed failures, and exit codes; none removed.
- Simplification: Added the empty-store fast path to `reconcileSessions`, avoiding a Ghostty snapshot when there are no canonical records and keeping one reconciliation snapshot for non-empty boards.
- Discrepancies from design: None.
- Addendum (2026-08-16): The shipped board-layer contract was narrower than this
  feature originally described. `projectSession` is the sole owner of
  unmanaged ordinary-mode, inferred-evidence, terminal-presence, stale/future,
  unknown-activity, stale-health, and adapter-detail diagnostics. The board row
  layer preserves those diagnostics and adds only `title is not synchronized`
  for visible repair failure plus `evidence is corroborated`.
- Adjacent issues parked: none.
- Verification: `npm run typecheck` passed; `npm run build` passed and produced `dist/cli/agents.js`; full serialized `npm test` passed.

## Review (2026-08-14)

**Verdict**: Approve with fixes

**Blockers fixed**: npm-installed bin invocation could silently skip `main()`
through symlink/realpath or URL-escaping differences. Added executable shebangs
and one realpath-aware `isMain` boundary shared by all existing bins, with a
symlink and space-containing-path regression test.

**Important fixes**: terminal-unsafe control characters are now rejected from
observation detail before diagnostics reach a TTY; exact five-state human output
and unknown CLI failures now have durable tests.

**Nits rejected/deferred**: kept the explicit corroborated-evidence annotation,
RFC3339 timestamp ordering, test-file placement, and UUID-prefix behavior because
they are correct under the validated domain contract and changing them would add
churn without material V1 risk. Terminal-cell width remains an acknowledged V1
display limitation.

**Notes**: Standard weight, one independent cross-model feature pass. Receiver
adjudication accepted the concrete installed-command and terminal-safety risks,
applied the bounded fixes across the shared CLI boundary, and verified typecheck,
build, and the uncontended full suite at 135/135 passing. No re-review required.
