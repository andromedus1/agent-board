---
id: epic-managed-codex-observation-lifecycle-adapter
kind: feature
stage: done
tags: [integration, state]
parent: epic-managed-codex-observation
depends_on: [epic-managed-codex-observation-app-server-client]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Codex Lifecycle Adapter

## Brief

Bind the dedicated remote TUI's root thread and map validated app-server status,
waiting flags, turn completion/failure, and close/error evidence into Agent
Board's normalized transition union. Apply observations through the atomic
application service and retain explicit evidence/confidence metadata.

Thread ambiguity, missing required fields, unknown required enums, or an
unsupported installed version must produce visible adapter failure. The adapter
does not own process spawning, Ghostty titles, or a second agent backend.

## Inherited design decisions

- Active/idle status is authoritative; unread completion remains Board-owned.
- Dedicated process scope narrows candidates, but ambiguity is never guessed through.

## Research and foundation references

- `.research/analysis/briefs/codex-detector-topology.md` — event semantics and observed limitations.
- `.research/attestation/codex-cli-managed-runtime-probe.md` — concurrent observer evidence.
- `docs/SPEC.md` — normalized state and confidence requirements.
- `docs/ARCHITECTURE.md` — observer/thread-binding algorithm.

## Design decisions

- **Subscribe before discovery**: create the notification stream before
  `thread/loaded/list` so a remote TUI thread created during discovery is queued
  rather than missed. Zero candidates waits for `thread/started` or refreshes
  discovery after a status event; multiple viable roots fail immediately.
- **Bind conservatively within the dedicated server**: reject explicit child
  threads and working-directory mismatches. One root with matching normalized
  cwd is authoritative binding evidence; one root whose optional cwd/parent
  metadata is absent may bind at corroborated confidence because the app-server
  process is dedicated. More than one viable root is always ambiguous.
- **Idle after active is a corroborated completion edge**: the runtime probe
  proved global active/idle but not delivery of detailed turn events to the
  second observer. An observed `active → idle` therefore sets unread completion
  at corroborated confidence; a later `turn/completed` upgrades it to
  authoritative outcome evidence.
- **Interruption is a first-class normalized transition**: extend the closed
  transition union with `interrupted`, which produces `idle + attention none +
  live`. Reusing ordinary `idle` would incorrectly preserve an already inferred
  completion-unread bit when the authoritative outcome arrives later.
- **Retryable errors do not become terminal errors**: a Codex `error`
  notification with `willRetry=true` remains diagnostic evidence within the
  active lifecycle; `willRetry=false`, `systemError`, failed turns, unexpected
  bound-thread closure, and protocol/binding failure produce visible error.
- **The adapter records then rethrows its own failure**: failures are applied as
  a bounded `error` transition when the session still exists, then propagated
  so the launcher can clean up. It never turns incompatible protocol evidence
  into idle or working.

## Architectural choice

Use a small pure mapper plus one stateful managed-observer application service.
The pure unit owns Codex-status/outcome semantics; the service owns root-thread
binding, ordered event context, atomic `observeAgent` calls, and failure
recording. This makes the difficult classification table directly testable
without teaching the generic app-server client about Board state.

Alternatives were rejected for specific reasons. Mapping inside the transport
would couple a reusable JSON-RPC boundary to session persistence. Letting the
launcher interpret raw notifications would mix process cleanup, thread identity,
and status policy in the riskiest module. A broad generated Codex adapter remains
unnecessary because V1 consumes only the already version-gated schemas.

The trickiest unit is binding across the discovery/start race while refusing
unrelated or child threads. It is designed first and exposes a bounded explicit
result rather than a best-effort thread ID.

## Implementation units

### Unit 1: Honest interruption transition

**Files**: `src/domain/transitions.ts`, `tests/domain/transitions.test.ts`,
`docs/SPEC.md`, `docs/ARCHITECTURE.md`

```ts
type AgentTransition =
  | /* existing transitions */
  | ({ type: "interrupted" } & Observation);
```

**Implementation notes**:

- `interrupted` sets activity `idle`, attention `none`, health `live`, and the
  supplied evidence. It clears any completion timestamp through the existing
  invariant-preserving helper.
- Update the foundation transition table in place; this is required behavior,
  not a compatibility version or shim.

**Acceptance criteria**:

- [x] Authoritative interruption clears an earlier corroborated completion and
  leaves the session idle/live.
- [x] The runtime parser rejects unknown or malformed interruption evidence.

### Unit 2: Root-thread binder

**File**: `src/integrations/codex/thread-binding.ts`

```ts
export interface ThreadBindingClient {
  loadedThreads(signal?: AbortSignal): Promise<ThreadLoadedListResult>;
  notifications(signal?: AbortSignal): AsyncIterable<CodexNotification>;
}

export interface BindCodexThreadOptions {
  readonly expectedWorkingDirectory?: string;
  readonly timeoutMs: number;
  readonly signal?: AbortSignal;
}

export interface BoundCodexThread {
  readonly threadId: string;
  readonly initialStatus: ThreadLoadedListResult["data"][number]["status"];
  readonly confidence: "authoritative" | "corroborated";
  readonly notifications: AsyncIterator<CodexNotification>;
}

export function bindCodexThread(
  client: ThreadBindingClient,
  options: BindCodexThreadOptions,
): Promise<BoundCodexThread>;
```

**Implementation notes**:

- Acquire one iterator from `notifications()` before the first loaded-thread
  request and return that same iterator so queued post-bind events are retained.
- Viable candidates exclude `parentThreadId` values that name a parent and cwd
  values that do not equal the normalized expected directory. Exact one-candidate
  selection is allowed; zero waits/refreshes until the bounded deadline; two or
  more throws `ADAPTER_FAILURE` with candidate count but no prompt content.
- `thread/started` carries enough metadata to evaluate directly. A status event
  for an unknown thread triggers one bounded loaded-list refresh. Abort, stream
  closure, and timeout fail explicitly and call `return()` on the iterator when
  available.

**Acceptance criteria**:

- [x] A thread starting between subscription and discovery is not lost.
- [x] Explicit children, cwd mismatches, foreign notifications, and multiple
  roots never become the binding.
- [x] A unique metadata-complete root binds authoritatively; a unique
  metadata-incomplete root binds only corroborated.
- [x] Timeout and abort release the iterator and return stable adapter failure.

### Unit 3: Pure Codex lifecycle mapper

**File**: `src/integrations/codex/lifecycle.ts`

```ts
export interface CodexLifecycleContext {
  readonly threadId: string;
  readonly previousStatus?: "notLoaded" | "idle" | "systemError" | "active";
  readonly waiting: boolean;
}

export interface CodexLifecycleMapping {
  readonly transition?: AgentTransition;
  readonly nextStatus?: CodexLifecycleContext["previousStatus"];
  readonly waiting: boolean;
}

export function mapInitialCodexStatus(
  status: ThreadLoadedListResult["data"][number]["status"],
  evidence: Observation,
): CodexLifecycleMapping;

export function mapCodexNotification(
  notification: CodexNotification,
  context: CodexLifecycleContext,
  observedAt: string,
): CodexLifecycleMapping;
```

**Implementation notes**:

- Ignore events for non-bound thread IDs. Active with either wait flag maps to
  `input-required`; active without flags maps to `input-resolved` when leaving a
  wait, otherwise `working`. Initial idle maps to ordinary `idle` without
  completion.
- Bound `active → idle` maps to `completed` with corroborated status-edge
  evidence. Authoritative completed/interrupted/failed turn outcomes map to the
  corresponding normalized transition. `turn/completed` carrying `inProgress`
  is protocol failure, not working evidence.
- `systemError`, non-retryable error, and unexpected bound-thread close map to
  error with bounded metadata-only detail. Retryable errors preserve lifecycle
  state without emitting a transition. Never retain prompt, response, or token
  content.

**Acceptance criteria**:

- [x] Working, both wait flags, wait resolution, inferred completion,
  authoritative completion, interruption, failed turn, system error, retryable
  error, close, and foreign-thread cases match the architecture table.
- [x] Known-but-contradictory method/status combinations throw visibly instead
  of inventing state.

### Unit 4: Managed observer application service

**File**: `src/application/observe-managed-codex.ts`

```ts
export interface ObserveManagedCodexDependencies {
  readonly client: ThreadBindingClient;
  readonly store: SessionStore;
  readonly clock: Clock;
  readonly bindTimeoutMs: number;
  readonly onRecord?: (record: SessionRecord) => Promise<void> | void;
}

export interface ObserveManagedCodexInput {
  readonly sessionId: string;
  readonly expectedWorkingDirectory?: string;
}

export function observeManagedCodex(
  dependencies: ObserveManagedCodexDependencies,
  input: ObserveManagedCodexInput,
  signal: AbortSignal,
): Promise<void>;
```

**Implementation notes**:

- Bind once, then atomically attach `nativeThreadId` and `mode: managed` only if
  the session has no conflicting native thread. A different existing binding is
  `CONFLICT`; never silently adopt it.
- Map the bound thread's initial status, then consume the returned iterator in
  order. Apply each emitted transition through `observeAgent`; call `onRecord`
  only after a committed mutation so the launcher may render without coupling
  this feature to Ghostty.
- Validate every `clock.now()` result through `toISOString`; use evidence kinds
  that name the Codex method/status and the mapper-selected confidence.
- On binding, stream, protocol, or mutation failure, best-effort record one
  bounded adapter `error` transition at corroborated confidence, then rethrow
  the original failure. Do not overwrite a missing session or mask the original
  error with error-reporting failure.
- Normal abort ends observation without synthesizing an error; the launcher
  owns process-exit classification.

**Acceptance criteria**:

- [x] Only the bound root can mutate the session, and binding metadata persists
  before lifecycle events.
- [x] Ordered observations use atomic store mutation and call the post-commit
  callback with the exact committed record.
- [x] Ambiguity/protocol failure becomes visible session error and is rethrown;
  deliberate abort does not.
- [x] Concurrent rename or terminal reconciliation fields survive every Codex
  observation.

## Implementation order

1. Add and document the interruption transition.
2. Implement the subscription-before-discovery root binder.
3. Implement the pure lifecycle mapping table.
4. Compose binding, atomic observation, failure recording, and callback in the
   managed observer service.

The boundary is cohesive and one worker should own it; no child stories are
needed.

## Simplification

- Reuse the app-server client's narrow schemas and iterator; do not add a second
  event bus, transport wrapper, or generated protocol model.
- Reuse `observeAgent` and the canonical transition reducer; do not mutate
  activity/attention/health directly in the adapter.
- Keep only the minimal state required to interpret an ordered active/idle/wait
  edge. Do not retain histories or task content.

## Testing

- Pure mapping table tests protect semantic classification, especially the
  corroborated idle edge and late authoritative interruption regression.
- Binder tests use a scripted fake client/iterator to protect discovery/start
  races, ambiguity refusal, cwd/parent filtering, timeout, abort, and cleanup.
- Application tests use an in-memory `SessionStore` to protect binding ownership,
  foreign-thread isolation, committed callback ordering, error visibility, and
  preservation of concurrent non-agent fields.
- Default tests use captured typed messages only; no Codex process or network
  connection is started, and transport lifecycle tests remain in the client
  feature.

## Risks

- **Detailed turn events may not reach the observer**: active-to-idle remains an
  explicitly corroborated completion path, never falsely authoritative.
- **Metadata may be incomplete**: dedicated process scope permits one
  corroborated candidate but never resolves multiple candidates by timing or
  array order.
- **Late outcome correction**: the new interruption transition is required so
  an authoritative event can retract earlier completion attention without
  abusing unrelated state transitions.
- **Abort versus failure**: only the caller-provided signal distinguishes
  intentional shutdown; all other unexpected stream endings fail visible.

## Implementation Notes

- Added the closed `interrupted` normalized transition. It clears completion
  attention while preserving session identity and terminal fields.
- Implemented subscription-before-discovery root binding with normalized cwd
  and explicit-child filtering, conservative corroborated fallback, bounded
  refresh, and iterator cleanup on timeout/abort.
- Implemented pure lifecycle mapping for active/waiting/idle edges, detailed
  turn outcomes, retryable errors, system errors, close evidence, and foreign
  thread isolation. Prompt/response/error text is not persisted.
- Implemented the managed observer service. It persists the native binding
  before observations, routes transitions through `observeAgent`, calls the
  post-commit callback, and records then rethrows unexpected adapter failures
  while treating deliberate abort as clean shutdown.
- Added hermetic unit/application tests for binding races, ambiguity and
  cleanup, lifecycle semantics, late interruption correction, callback
  ordering, binding ownership, failure visibility, and abort behavior.
- Verification: `npm run typecheck`, `npm run build`, and `npm test` (82 tests)
  all pass.

## Review (2026-08-14)

Standard-weight review used one fresh-context cross-model pass with Claude
Sonnet. The mapper, ambiguity refusal, atomic ownership, and failure semantics
were approved, but the reviewer reproduced one material shutdown bug: after a
successful bind, caller abort was unlinked from the real notification iterator,
which has no `return()` method. The pass also found overconfident binding when
cwd had not actually been compared to an expected directory.

Receiver adjudication kept the caller's abort link for the full observation
lifetime behind an always-present wrapper iterator, tightened authoritative
confidence to an explicit root plus verified cwd match, and added regressions
for the production-shaped no-return iterator and missing expectations/metadata.
Typecheck, build, focused tests, and the serialized full suite passed. Per
standard policy, the feature closes after this one pass and verified fixes
without re-review.
