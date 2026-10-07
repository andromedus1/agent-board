---
id: epic-ghostty-project-surface-registration-naming
kind: feature
stage: done
tags: [integration, cli, state]
parent: epic-ghostty-project-surface
depends_on: [epic-ghostty-project-surface-applescript-adapter]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Focused Tab Registration and Naming

## Brief

Deliver the idempotent registration use case and `agent-name <label>` command.
Capture the focused Ghostty hierarchy, derive optional repository/branch context,
reuse the existing Board session for that terminal under the registry lock, and
persist a validated human-controlled label independently from machine status.

Registration must prevent duplicate rows under concurrent invocations, reject
unsafe names before external calls, and render the initial canonical title. It
does not infer Codex state or own global board output.

## Inherited design decisions

- Terminal ID is the registration dedupe key; label/repo/branch are presentation context.
- The store registry lock owns lookup/create serialization.

## Research and foundation references

- `.research/analysis/briefs/ghostty-registration-liveness.md` — stable identity capture.
- `docs/SPEC.md` — naming workflow and registration requirements.
- `docs/ARCHITECTURE.md` — register-session application service and command boundary.

## Design decisions

- **New standalone registrations use ordinary mode**: `agent-name` has no
  managed runtime evidence, so a new record begins `ordinary + idle + live`
  with inferred `registration` evidence. The managed launcher may later replace
  that observation; renaming an existing record never changes mode or state.
- **An omitted label means preserve-or-derive**: the public use case accepts an
  optional label so `agent-codex` can idempotently register without renaming.
  New unlabeled sessions derive the repository basename, then the terminal
  working-directory basename; the `agent-name` CLI itself still requires one
  explicit label.
- **Repository discovery is advisory**: bounded, shell-free Git probes enrich a
  new record when available. A missing executable, non-repository directory, or
  detached branch does not prevent registration and never changes an existing
  record's repository fields.
- **Persistence precedes title I/O**: the registration/rename mutation is the
  durable source of truth. The title is rendered from a fresh store read after
  the registry lock is released; a title failure is surfaced without rolling
  back the valid record, and later reconciliation can repair it.

## Architectural choice

Use one application use case behind a narrow registration-store extension and
structural terminal/repository ports, plus a small production composition root
for `agent-name`. The use case validates explicit input before external calls,
captures the focused terminal once, and serializes terminal-ID lookup/create
under the existing registry lock. This keeps registration policy out of the CLI
and Ghostty adapter while reusing the canonical record and projection directly.

Two alternatives were rejected. Putting lookup and record construction in the
CLI would make the managed launcher duplicate concurrency and naming policy.
Adding a registry index file would speed a tiny V1 scan but introduce another
atomic consistency surface before session counts justify it.

The trickiest unit is the locked find-or-create operation: terminal identity is
the only dedupe key, existing records must retain every field except an explicit
label, and two simultaneous first registrations must converge on one session.

## Implementation units

### Unit 1: Registration-facing ports

**File**: `src/domain/ports.ts`

```ts
export type FocusedTerminalContext = TerminalIdentity & {
  readonly workingDirectory?: string;
};

export interface RegistrationStore extends SessionStore {
  withRegistrationLock<T>(operation: () => Promise<T>): Promise<T>;
}

export interface RegistrationTerminalPort {
  current(): Promise<FocusedTerminalContext>;
  setTitle(identity: TerminalIdentity, title: string): Promise<void>;
}

export interface RepositoryContext {
  readonly repoPath?: string;
  readonly gitBranch?: string;
}

export interface RepositoryContextPort {
  discover(workingDirectory?: string): Promise<RepositoryContext>;
}
```

**Implementation notes**:

- These additions are structural: `JsonSessionStore` and `GhosttyClient`
  already provide the required methods and remain the concrete adapters.
- Do not add registry-index state or Ghostty-specific types to the application
  service.

**Acceptance criteria**:

- [ ] Registration can be tested with in-memory ports and no filesystem,
  Ghostty, or Git process.
- [ ] The registry lock is explicit in the dependency contract rather than
  reached through a concrete-store cast.

### Unit 2: Bounded repository context adapter

**File**: `src/integrations/git/repository-context.ts`

```ts
export interface GitRepositoryContextOptions {
  runner?: ProcessRunner;
  timeoutMs?: number;
  maxOutputBytes?: number;
}

export class GitRepositoryContext implements RepositoryContextPort {
  constructor(options?: GitRepositoryContextOptions);
  discover(workingDirectory?: string): Promise<RepositoryContext>;
}
```

**Implementation notes**:

- Use the existing `ProcessRunner` with `git -C <directory> rev-parse
  --show-toplevel` and `git -C <directory> symbolic-ref --quiet --short HEAD`;
  pass argv directly and never invoke a shell.
- Normalize one trailing line break and accept only non-empty, single-line
  outputs. Return `{}` when the directory is absent, Git is unavailable, or the
  directory is not a repository. A detached HEAD preserves `repoPath` and omits
  `gitBranch`.

**Acceptance criteria**:

- [ ] Paths containing spaces or shell metacharacters remain one argv value.
- [ ] Non-repository and detached-HEAD results degrade without blocking
  registration.
- [ ] Timeout and output bounds use the shared process boundary.

### Unit 3: Idempotent registration and canonical title render

**Files**: `src/application/register-session.ts`,
`src/application/render-title.ts`

```ts
export interface RegisterSessionInput {
  readonly projectLabel?: string;
}

export interface RegisterSessionResult {
  readonly record: SessionRecord;
  readonly created: boolean;
}

export interface RegisterSessionDependencies {
  readonly store: RegistrationStore;
  readonly terminal: RegistrationTerminalPort;
  readonly repositories: RepositoryContextPort;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly workingFreshForMs: number;
}

export function registerSession(
  dependencies: RegisterSessionDependencies,
  input?: RegisterSessionInput,
): Promise<RegisterSessionResult>;

export function renderSessionTitle(
  dependencies: {
    store: SessionStore;
    terminal: Pick<RegistrationTerminalPort, "setTitle">;
    clock: Clock;
    workingFreshForMs: number;
  },
  sessionId: string,
): Promise<SessionRecord>;
```

**Implementation notes**:

- Validate an explicit label with `parseProjectLabel` before terminal or Git
  I/O. Capture `terminal.current()` exactly once and discover context outside
  the registry lock.
- Inside `withRegistrationLock`, list records and match the captured
  `terminalId`. Zero matches creates a validated revision-zero record; one match
  mutates only `identity.projectLabel` when a label was supplied; multiple
  matches fail visibly with `CONFLICT`.
- Derive a missing new label from the discovered repository basename, then the
  working-directory basename. If neither yields a valid label, use `agent-board`
  as a deterministic last resort.
- The new record stores terminal presence `visible` and uses the same clock
  sample for creation, terminal, and initial inferred agent evidence.
- After releasing the registry lock, `renderSessionTitle` reads the latest
  complete record, calls `projectSession`, and targets its stored terminal
  identity. It throws `NOT_FOUND` for a disappeared record and propagates typed
  title failures.

**Acceptance criteria**:

- [ ] Re-registering one terminal returns the same session ID and never creates
  a duplicate, including concurrent calls through distinct store instances.
- [ ] Explicit rename changes only `identity.projectLabel` and normal store
  revision metadata.
- [ ] Two terminals may share a label or repository while retaining distinct
  Board identities.
- [ ] Invalid labels cause zero terminal, Git, store, or title calls.
- [ ] The successful command writes exactly `projectSession(latest).title` to
  the stored terminal identity.
- [ ] A title failure leaves the created or renamed record readable and reports
  the failure to the caller.

### Unit 4: `agent-name` command and production wiring

**Files**: `src/cli/agent-name.ts`, `src/composition/create-agent-name.ts`,
`package.json`

```ts
export interface AgentNameCommandDependencies {
  register(input: RegisterSessionInput): Promise<RegisterSessionResult>;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
}

export function runAgentName(
  argv: readonly string[],
  dependencies: AgentNameCommandDependencies,
): Promise<number>;

export function createAgentNameCommand(): AgentNameCommandDependencies;
```

**Implementation notes**:

- Require exactly one positional label, allow ordinary Unicode and spaces when
  the shell supplies them as one argument, and print one terse success line.
- Map known `AgentBoardError` codes to actionable stderr without stack traces;
  unexpected errors remain nonzero and concise. Export the handler for tests and
  keep the executable entry thin.
- Add the `agent-name` npm bin pointing at `dist/cli/agent-name.js`. Production
  composition uses `JsonSessionStore`, `GhosttyClient`, `GitRepositoryContext`,
  `randomUUID`, and the real clock.

**Acceptance criteria**:

- [ ] Missing or extra labels return usage failure without invoking the use
  case.
- [ ] Success and typed failures return stable exit codes and streams.
- [ ] The built package exposes an executable `agent-name` entry point.

## Implementation order

1. Add the structural registration and repository context ports.
2. Implement and test bounded Git discovery.
3. Implement the locked registration and latest-record title renderer with
   application-level concurrency and ownership tests.
4. Wire and test the CLI, add the package binary, then run the full suite.

This is one cohesive implementation stride, so no child stories are warranted.

## Simplification

- Reuse the existing `ProcessRunner`, canonical record parser, registry lock,
  and projection; do not add a second subprocess helper, title formatter,
  registration index, or CLI framework.
- Keep `renderSessionTitle` as the one reusable application seam for the later
  reconciliation feature instead of formatting an initial title inside the
  command.
- No existing tests or behavior are obsolete in this area.

## Testing

- Application interface tests use in-memory ports plus real temporary
  `JsonSessionStore` instances for the demonstrated duplicate-registration
  race. They protect dedupe identity, field ownership, validation-before-I/O,
  latest-record projection, and durable-record behavior after title failure.
- Git adapter tests use a fake `ProcessRunner` to protect argv safety and
  graceful non-repository/detached behavior; no test shells out to the user's
  Git repository.
- CLI tests inject the register function and output streams to protect argument
  handling and stable operator-facing failures without launching Ghostty.
- Do not duplicate canonical label, store-lock, projection-precedence, or
  `ProcessRunner` tests already owned by the core and adapter features.

## Risks

- **Focus can change after capture**: registration intentionally binds the one
  explicit focused-context snapshot. Later hierarchy reconciliation will detect
  movement or disappearance; the use case must not silently re-query and bind a
  different tab.
- **Store/title cannot be one transaction**: durable state remains authoritative
  and title failure is visible. The next feature's repair path is the bounded
  fallback.

## Implementation notes

- Execution capability: high — one cohesive application/integration/CLI stride
  implemented within the settled ownership boundaries.
- Files changed: registration-facing domain ports; bounded shell-free Git
  context adapter; registration and canonical title application services;
  `agent-name` CLI/composition; package bin; and focused application, Git, and
  CLI tests.
- Registration validates explicit labels before all external calls, captures
  Ghostty focus once, performs advisory Git discovery outside the registry
  lock, and serializes terminal-ID find-or-create under the existing lock.
- Existing records retain repository/branch/terminal/agent fields; explicit
  labels alone mutate identity (with normal store revision metadata). Durable
  state is written before title I/O, and title failures remain visible without
  rollback.
- Verification: `npm run typecheck`, `npm run build`, and all focused tests
  passed. The full `npm test` command was attempted; this shared multi-worker
  harness stalled in pre-existing Codex/Ghostty test workers after the core and
  registration tests completed, so the focused suite was rerun independently
  with all eight new tests green.
- Discrepancies from design: none.
- Adjacent issues parked: none.

## Review (2026-08-14)

Standard-weight review used one fresh-context cross-model pass with Claude
Sonnet. Registration, locking, rename ownership, Git discovery, durable title
failure, and the eight focused tests were approved. The reviewer found one
material packaging blocker: TypeScript's build root emitted
`dist/src/cli/agent-name.js` while the npm binary correctly targeted the intended
`dist/cli/agent-name.js` surface.

Receiver adjudication fixed the build root at `src`, preserving test-inclusive
typechecking through the existing override. Typecheck, build, focused tests, and
the emitted binary path were then verified. Per standard policy, the feature
closes after this single pass and verified fix without re-review.
- **Repository paths may be unusual**: all values remain argv data and label
  derivation passes through the canonical label parser.
