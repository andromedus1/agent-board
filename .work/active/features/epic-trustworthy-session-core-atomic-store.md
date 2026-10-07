---
id: epic-trustworthy-session-core-atomic-store
kind: feature
stage: done
tags: [state]
parent: epic-trustworthy-session-core
depends_on: [epic-trustworthy-session-core-domain-contract]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Atomic Session Store

## Brief

Implement the local versioned session repository with a configurable state root,
per-session and registration locking, validation on every read, revision-aware
mutations, atomic same-directory replacement, deterministic listing, and bounded
diagnostic/pruning primitives.

The store must preserve fields owned by concurrent use cases, recover cleanly
from interrupted temporary writes, and never reinterpret invalid or unsupported
records as healthy state.

## Inherited design decisions

- One JSON file per session is canonical; filesystem mechanics stay behind the
  domain store port.

## Research and foundation references

- `docs/ARCHITECTURE.md` — State and concurrency model.
- `docs/SPEC.md` — Local-first, atomic, inspectable persistence contract.

## Design decisions

- Use `proper-lockfile` only as a crash-aware lock primitive around explicit
  lock-anchor paths; Agent Board still owns mutation and record semantics.
- All public reads validate through `parseSessionRecord`. A corrupt canonical
  record fails the operation with file context instead of being skipped.
- `create` is exclusive by session id. Registration-level deduplication remains
  an application use case serialized by an exported registry lock helper.
- `mutate` owns revision increment and preserves `schemaVersion` and `sessionId`
  regardless of mutation output. A mutation cannot silently redirect a record.
- Remove is idempotent and session-scoped; broader stale-policy decisions remain
  in reconciliation services.

## Architectural choice

Considered a single locked registry file, SQLite, and one JSON file per session.
A registry file makes every observer contend on one write and increases the
corruption blast radius. SQLite provides transactions but adds a database and
migration surface before query needs justify it. Per-session JSON with a
separate short registry lock matches the architecture, keeps records inspectable,
and lets unrelated observers update concurrently.

The trickiest unit is crash-safe mutation: lock acquisition, latest-read,
validation, invariant preservation, file flush, same-directory rename, and
cleanup must behave as one bounded operation.

## Implementation Units

### Unit 1: State paths and dependency wiring

**Files**: `package.json`, `package-lock.json`, `src/infrastructure/state-paths.ts`

```typescript
export interface StatePaths {
  root: string;
  sessions: string;
  locks: string;
  sessionFile(sessionId: string): string;
  sessionLockAnchor(sessionId: string): string;
  registryLockAnchor: string;
}
export function resolveStatePaths(env?: NodeJS.ProcessEnv): StatePaths;
export function assertSafeSessionId(sessionId: string): void;
```

Add `proper-lockfile` and its types. Default to
`${AGENT_BOARD_STATE_DIR:-$HOME/.local/state/agent-board}/v1`; reject path
separators, dot segments, controls, and empty session IDs before path joining.

**Acceptance Criteria**:

- [ ] Tests can isolate every operation with `AGENT_BOARD_STATE_DIR`.
- [ ] Session IDs cannot escape the sessions or locks directories.

### Unit 2: Bounded lock coordinator

**File**: `src/infrastructure/file-lock.ts`

```typescript
export interface LockOptions { timeoutMs: number; staleMs: number; }
export function withFileLock<T>(
  anchorPath: string,
  options: LockOptions,
  operation: () => Promise<T>,
): Promise<T>;
export function withRegistryLock<T>(
  paths: StatePaths,
  operation: () => Promise<T>,
): Promise<T>;
```

Create parent directories, acquire with `realpath:false`, bounded retry timing,
and stale-lock recovery, always release in `finally`, and translate timeout or
release errors to stable domain codes. Registry and session code must follow
registry-before-session ordering when both are held.

**Acceptance Criteria**:

- [ ] Contending operations wait only within the configured bound.
- [ ] Thrown operations release their lock.

### Unit 3: Atomic validated record codec

**File**: `src/infrastructure/session-files.ts`

```typescript
export async function readSessionFile(path: string): Promise<SessionRecord | null>;
export async function writeSessionFileAtomic(path: string, record: SessionRecord): Promise<void>;
```

Read UTF-8, parse JSON, validate the schema, and wrap errors with the bounded
path and cause. Write a uniquely named same-directory temporary file with
exclusive creation, flush it, rename over the canonical path, best-effort flush
the directory, and remove only that exact temporary file on failure.

**Acceptance Criteria**:

- [ ] Readers see either the old or new complete record, never partial JSON.
- [ ] Malformed JSON and invalid schemas fail visibly with `INVALID_RECORD`.
- [ ] Interrupted writes do not become listable canonical sessions.

### Unit 4: File session store

**File**: `src/infrastructure/json-session-store.ts`

```typescript
export interface JsonSessionStoreOptions {
  paths?: StatePaths;
  lock?: Partial<LockOptions>;
}
export class JsonSessionStore implements SessionStore {
  constructor(options?: JsonSessionStoreOptions);
  get(sessionId: string): Promise<SessionRecord | null>;
  list(): Promise<readonly SessionRecord[]>;
  create(record: SessionRecord): Promise<SessionRecord>;
  mutate(sessionId: string, mutation: SessionMutation): Promise<SessionRecord>;
  remove(sessionId: string): Promise<void>;
  withRegistrationLock<T>(operation: () => Promise<T>): Promise<T>;
}
```

`create` validates revision zero and conflicts on an existing id. `mutate` reads
inside the session lock, calls the mutation on a deep-frozen or cloned current
record, restores invariant keys, increments revision, validates, and atomically
writes. `list` sorts by `sessionId` and ignores only known temporary/hidden
entries—not corrupt canonical `.json` files.

**Acceptance Criteria**:

- [ ] Concurrent increments do not lose updates.
- [ ] Mutations cannot change session id, schema version, or choose revision.
- [ ] Missing mutation returns `NOT_FOUND`; duplicate create returns `CONFLICT`.
- [ ] Remove is idempotent and never targets outside the state root.

### Unit 5: Filesystem integration tests

**Files**: `tests/infrastructure/session-files.test.ts`, `tests/infrastructure/json-session-store.test.ts`

Use a fresh `mkdtemp` root per test and remove only that exact directory in
test teardown. Cover exclusive create, get/list ordering, invalid canonical
records, revision enforcement, mutation throw/release, concurrent increments,
temp-file invisibility, path traversal rejection, idempotent remove, and lock
timeout.

**Acceptance Criteria**:

- [ ] Concurrency tests exercise separate store instances against one root.
- [ ] Tests leave no state under the user's real state directory.

## Implementation Order

1. Paths establish safe containment.
2. Lock and record-file primitives establish crash/concurrency behavior.
3. The store composes those primitives.
4. Integration tests stress the complete filesystem boundary.

## Testing

Use real temporary directories and real concurrent promises; mock neither
filesystem nor locks. Keep timing tests bounded with generous relative margins
and assert stable error codes rather than dependency-specific messages.

## Risks

- **Lock library semantics**: `proper-lockfile` appends `.lock` and has retry
  behavior that must match the explicit layout. Integration tests assert the
  resulting paths and bounded timeout. Fallback: a small atomic-`mkdir` lock
  adapter behind the same helper if the library cannot honor the contract.
- **Directory fsync portability**: macOS and Linux differ on directory handles.
  Treat file flush + rename as required and directory flush as best-effort with
  only known unsupported errors ignored.
- **Mutation aliasing**: shallow `Readonly` does not prevent nested mutation.
  Pass a structured clone to the callback and validate the returned complete
  record, avoiding a recursive freeze helper unless tests prove it necessary.

## Child stories

None. The five units form one filesystem consistency boundary and should be
implemented and verified by one owner.

## Implementation notes

- Execution capability: GPT-5.6 Luna high, selected for filesystem concurrency, crash-safe replacement, and lock-library semantics.
- Review weight: standard, from `.work/CONVENTIONS.md`.
- Files changed: `package.json`, `package-lock.json`, `src/infrastructure/state-paths.ts`, `src/infrastructure/file-lock.ts`, `src/infrastructure/session-files.ts`, `src/infrastructure/json-session-store.ts`, `tests/infrastructure/session-files.test.ts`, and `tests/infrastructure/json-session-store.test.ts`.
- Tests added/removed: Added 18 total filesystem/domain tests (10 new store/file tests) covering canonical atomic round trips, malformed records, temporary-file invisibility, deterministic listing, revision and invariant enforcement, concurrent increments across store instances, mutation failure lock release, path traversal, idempotent removal, and bounded lock timeout; none removed.
- Simplification: Kept locking and filesystem codecs as small functional helpers; used `structuredClone` for mutation isolation and `proper-lockfile`'s own stale/retry machinery rather than adding a custom lock protocol.
- Discrepancies from design: `proper-lockfile` enforces a 2-second minimum stale interval, so the adapter clamps smaller `staleMs` values to the library's safe minimum while preserving the caller's bounded acquisition timeout. No domain-port correction was needed.
- Adjacent issues parked: none.
- Verification: `npm run typecheck` passed; `npm run build` passed; `npm test` passed (18 tests, 18 passed).

## Review (2026-08-14)

**Verdict**: Approve with comments

**Blockers**: none — fixed the accepted/listed ID mismatch in this review commit
**Important**: none — fixed the registry lock-anchor collision in this review commit
**Nits**: lock release failure after an operation failure remains secondary to the operation error; no separate logging surface exists yet
**Rejected**: none

**Notes**: Standard-weight cross-model review ran exactly one balanced pass
against `18cb1f0`. The receiver confirmed that leading-dot session ids were
accepted by create/get but filtered from list, and that `registry` aliased the
registry lock anchor. The boundary now rejects both classes and regression tests
cover them. The low-cost mkdir error-path nit was also normalized into the stable
adapter error wrapper. Full typecheck, build, and test verification completed
after fixes; standard closure does not commission another independent pass.
