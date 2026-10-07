# Shared Capability Port Reuse

Application modules import shared external capabilities from `domain/ports.ts`
instead of redeclaring equivalent interfaces.

## Rationale

Shared ports such as `FocusedTerminalPort`, `ReconciliationTerminalPort`, and
`LauncherLivenessPort` are defined once at `src/domain/ports.ts:43` and reused
across application and composition modules. This keeps semantic capability
changes synchronized while allowing use cases to request only what they need.

## Examples

### Focused target resolution

**File**: `src/application/resolve-session-target.ts:29`

```ts
export async function resolveSessionTarget(
  store: SessionStore,
  terminal: FocusedTerminalPort,
  explicitSessionId?: string,
): Promise<SessionRecord> {
```

### Completion focus watcher

**File**: `src/application/watch-completion-focus.ts:5`

```ts
export interface CompletionFocusWatcherDependencies {
  readonly store: SessionStore;
  readonly terminal: FocusedTerminalPort;
  readonly clock: Clock;
  readonly pollIntervalMs: number;
  readonly sleep?: (milliseconds: number, signal: AbortSignal) => Promise<void>;
  readonly onRecord?: (record: SessionRecord) => Promise<void> | void;
}
```

### Explicit acknowledgement composes shared capabilities

**File**: `src/application/acknowledge-session.ts:8`

```ts
export interface AcknowledgeSessionDependencies {
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort & FocusedTerminalPort;
  readonly launcher: LauncherLivenessPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
}
```

## When to Use

- Two or more use cases share the same external capability and semantics.
- Composition roots need to combine several small capabilities.
- A concrete adapter implements multiple shared ports.

## When NOT to Use

- A callback is private to one orchestration.
- The shape is an adapter-specific protocol client with no shared application
  meaning.
- A pure internal function needs no external boundary.

## Common Violations

- Redeclaring an interface identical to an existing domain port.
- Depending on a broad terminal surface when only focus or title capability is
  needed.
- Importing a concrete adapter into application dependency types.
