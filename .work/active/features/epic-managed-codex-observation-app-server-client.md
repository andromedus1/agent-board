---
id: epic-managed-codex-observation-app-server-client
kind: feature
stage: done
tags: [integration]
parent: epic-managed-codex-observation
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-16
---

# Codex App-Server Client

## Brief

Implement the narrow local WebSocket/JSON-RPC client Agent Board needs: parse
the app-server's advertised ephemeral endpoint, connect and initialize, correlate
requests/responses, expose validated loaded-thread and lifecycle notifications,
and diagnose installed Codex/version/schema incompatibility.

The client must tolerate additive fields, bound messages and stderr context,
cancel pending requests on disconnect, and remain testable against captured
fixtures plus a fake WebSocket server. It does not choose a thread or mutate
session state.

## Inherited design decisions

- Loopback WebSocket is the verified concurrent-observer transport.
- The protocol is experimental and version-gated; failure never masquerades as native state.

## Research and foundation references

- `.research/analysis/briefs/codex-detector-topology.md` — topology and required event coverage.
- `.research/attestation/codex-cli-managed-runtime-probe.md` — observed endpoint and event fixtures.
- `docs/ARCHITECTURE.md` — protocol client and compatibility boundary.

## Design decisions

- Support the locally verified Codex `0.147.x` protocol family first. Newer or
  older versions fail compatibility until fixtures/live checks deliberately
  expand the range.
- Keep transport generic JSON-RPC, but export narrow Zod schemas only for
  initialize, loaded-thread discovery, thread status, waiting flags, turn
  outcome, and thread close/error shapes consumed by V1.
- Allow additive object fields and unknown notification methods at the transport
  layer. Required consumers parse their chosen method again with a strict-enough
  method schema and fail visibly on missing/changed semantics.
- Correlate requests by monotonically increasing integer IDs; bound request time,
  message size, endpoint parsing, pending requests, and buffered notifications.
- The client does not start Codex or run version commands. It parses version and
  readiness text supplied by the later supervised launcher, avoiding a shared
  process-runner dependency with the Ghostty epic.

## Architectural choice

Considered generated full protocol bindings, raw untyped messages, and a narrow
hand-curated client. Full bindings maximize coverage but couple V1 to a large
experimental surface and generator workflow. Raw JSON shifts protocol failures
into state logic. The narrow client is selected: generic envelope handling plus
runtime schemas for only the semantics Agent Board consumes.

The trickiest unit is connection shutdown: every pending request and notification
consumer must resolve or reject exactly once when the socket errors, closes,
times out, or is explicitly aborted.

## Implementation Units

### Unit 1: Endpoint and version compatibility

**Files**: `src/integrations/codex/endpoint.ts`, `src/integrations/codex/compatibility.ts`

```typescript
export interface AppServerEndpoint {
  websocketUrl: URL;
  readinessUrl?: URL;
  healthUrl?: URL;
}
export function parseAdvertisedEndpoint(output: string): AppServerEndpoint;
export function parseCodexVersion(output: string): string;
export interface CodexCompatibility { compatible: boolean; version?: string; reason?: string; }
export function checkCodexCompatibility(output: string): CodexCompatibility;
```

Accept loopback `ws://127.0.0.1:<ephemeral>`/`ws://localhost:<ephemeral>` only,
reject port zero after advertisement, duplicates/conflicts, credentials,
paths/query/hash, non-loopback hosts, and malformed URLs. Parse additive CLI
version output and accept only `0.147.x`.

**Acceptance Criteria**:

- [ ] Captured `:0` readiness output resolves to the advertised endpoint.
- [ ] Non-loopback or ambiguous endpoints fail before WebSocket creation.
- [ ] Unsupported versions include actionable reason without being inferred as compatible.

### Unit 2: Narrow protocol schemas

**File**: `src/integrations/codex/protocol.ts`

```typescript
export const JsonRpcResponseSchema: z.ZodType<JsonRpcResponse>;
export const JsonRpcNotificationSchema: z.ZodType<JsonRpcNotification>;
export const ThreadLoadedListResultSchema: z.ZodType<ThreadLoadedListResult>;
export const ThreadStatusChangedParamsSchema: z.ZodType<ThreadStatusChangedParams>;
export const TurnCompletedParamsSchema: z.ZodType<TurnCompletedParams>;
export function parseNotification(method: string, params: unknown): CodexNotification | null;
```

Represent statuses `notLoaded | idle | systemError | active`, active flags
`waitingOnApproval | waitingOnUserInput`, and turn statuses
`completed | interrupted | failed | inProgress`. Preserve relevant thread/turn
IDs, cwd/parent metadata when supplied, and bounded error detail. Unknown methods
return null; a known method with incompatible shape throws `ADAPTER_FAILURE`.

**Acceptance Criteria**:

- [ ] Captured runtime messages parse into stable typed values.
- [ ] Additive fields pass; missing required fields and unknown required enums fail.

### Unit 3: WebSocket JSON-RPC client

**Files**: `src/integrations/codex/websocket-port.ts`, `src/integrations/codex/client.ts`

```typescript
export interface AppServerClientOptions {
  requestTimeoutMs?: number;
  maxMessageBytes?: number;
  maxBufferedNotifications?: number;
  webSocketFactory?: WebSocketFactory;
}
export class AppServerClient {
  static connect(endpoint: AppServerEndpoint, options?: AppServerClientOptions): Promise<AppServerClient>;
  initialize(clientInfo: { name: string; version: string }): Promise<void>;
  request<T>(method: string, params: unknown, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T>;
  loadedThreads(signal?: AbortSignal): Promise<ThreadLoadedListResult>;
  notifications(signal?: AbortSignal): AsyncIterable<CodexNotification>;
  close(): Promise<void>;
}
```

Add runtime `ws` and types. Factory injection prevents production transport from
leaking into tests. Reject duplicate/unknown response IDs, protocol errors,
oversized/binary messages, use-before-initialize, bounded buffer overflow, and
disconnect with typed errors. Explicit close is idempotent.

**Acceptance Criteria**:

- [ ] Concurrent requests resolve only their own IDs and time out independently.
- [ ] Socket close/error/abort releases pending requests and iterators.
- [ ] Notifications preserve arrival order within the bounded queue.

### Unit 4: Fixtures and client integration tests

**Files**: `tests/fixtures/codex/app-server.jsonl`, `tests/integrations/codex/endpoint.test.ts`, `tests/integrations/codex/protocol.test.ts`, `tests/integrations/codex/client.test.ts`

Curate only bounded non-sensitive lines from the local runtime capture. Use a
fake factory or in-process loopback `ws` server for initialization, correlated
requests, notifications, protocol error, timeout, abort, overflow, and close.
Cover version range and endpoint security separately.

**Acceptance Criteria**:

- [ ] Default tests start no Codex process and make no non-loopback connection.
- [ ] Fixture changes are reviewed as protocol-contract changes, not regenerated blindly.

## Implementation Order

1. Endpoint/version and method schemas.
2. WebSocket port and lifecycle-safe client.
3. Captured fixtures and integration tests.

## Testing

Use actual `ws` message semantics with an in-process loopback server where that
protects lifecycle behavior; use direct schema fixtures for protocol mapping.
No live Codex dependency in the default suite.

## Risks

- **Experimental drift**: the exact compatible family is deliberately narrow.
  `agent-board doctor` will later report the mismatch and the installed live
  integration can justify expanding it.
- **Notification availability**: the concurrent observer is proven for global
  thread status, while detailed turn notifications may remain connection-scoped.
  The client exposes what arrives; lifecycle mapping must not assume every method.
- **Backpressure**: a slow observer cannot grow memory without bound. Overflow is
  an adapter failure requiring reconciliation, not silent event loss.

## Child stories

None. Endpoint, schemas, transport, and fixtures are one wire-compatibility
boundary best owned and reviewed together.

## Implementation notes

- Execution capability: GPT-5.6 Luna high; protocol and transport work is
  security-sensitive but bounded to one adapter boundary.
- Review weight: standard, from project convention; implementation stops at
  `stage: review` for the orchestrator's independent feature review.
- Files changed: `src/integrations/codex/{endpoint,compatibility,protocol,websocket-port,client}.ts`,
  `tests/fixtures/codex/app-server.jsonl`,
  `tests/integrations/codex/{endpoint,protocol,client}.test.ts`,
  `package.json`, and `package-lock.json`.
- Tests added/removed: endpoint security and version-gating tests; captured
  protocol parsing/schema tests; loopback `ws` tests for concurrent request
  correlation, timeout, abort, ordered notifications, disconnect, and bounded
  message handling. The test command now explicitly discovers nested test
  files.
- Production message bound: the default `maxMessageBytes` is now 8 MiB after a
  disposable installed Codex 0.147.0 app-server + remote-TUI probe measured
  legitimate ignored `app/list/updated` notifications at 3,692,503–3,700,435
  bytes. The limit remains bounded; caller-supplied lower limits and rejection
  behavior remain intact. The regression sends a 4 MiB unknown notification,
  then proves the following request completes.
- Simplification: kept a generic JSON-RPC envelope and a narrow set of
  method-specific schemas rather than introducing generated protocol bindings
  or a second transport abstraction.
- Discrepancies from design: the options type includes `maxPendingRequests` so
  the pending-request bound is explicit and testable; otherwise none.
- Adjacent issues parked: none.

## Review (2026-08-14)

Standard-weight review used one fresh-context cross-model pass with Claude
Sonnet. It found no blockers and confirmed the endpoint, version, and protocol
contracts against the captured/generated Codex evidence. Receiver adjudication
accepted three important hardening findings: completed-request abort listeners
were not removed, the notification-overflow test did not exercise overflow, and
a late timed-out response could close unrelated work. All were corrected.

The same focused fix removed handshake listeners after connection, made async
request failure consistently promise-based, and added binary-message coverage.
Post-fix typecheck, build, focused client tests, and the full suite passed. Per
standard policy, the feature closes after this single review pass and verified
fix set without re-review.
