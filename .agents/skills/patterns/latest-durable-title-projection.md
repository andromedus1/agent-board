# Latest-Durable Title Projection

Persist state first, then render Ghostty titles through `renderSessionTitle`,
which reloads and projects the latest durable record.

## Rationale

Title state is secondary to the session record. The shared renderer reloads by
session ID before applying `projectSession` (`src/application/render-title.ts:26`),
preventing concurrent lifecycle updates from being overwritten by a stale title
derived from a mutation return value.

## Examples

### Shared latest-record renderer

**File**: `src/application/render-title.ts:20`

```ts
/** Render a title from the latest durable record, after registration locking. */
export async function renderSessionTitle(
  dependencies: RenderTitleDependencies,
  sessionId: string,
  options: RenderTitleOptions = {},
): Promise<SessionRecord> {
  const record = await dependencies.store.get(sessionId);
  if (record === null) {
    throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);
  }

  const projection = projectSession(record, {
    now: dependencies.clock.now(),
    workingFreshForMs: dependencies.workingFreshForMs,
  });
  await dependencies.terminal.setTitle(identity, projection.title);
  return record;
}
```

### Registration persists before projection

**File**: `src/application/register-session.ts:150`

```ts
// Persistence is authoritative. This fresh read also means a concurrent
// lifecycle update cannot be overwritten by a stale title projection.
const record = await renderSessionTitle(
  dependencies,
  outcome.record.sessionId,
);
return { record, created: outcome.created };
```

### Reconciliation passes verified projection evidence

**File**: `src/application/reconcile-session.ts:248`

```ts
const rendered = await renderSessionTitle({
  ...dependencies,
  terminal: {
    setTitle: async (identity, title) => {
      try {
        await dependencies.terminal.setTitle(identity, title);
      } catch (error) {
        throw new TitleRenderFailure(error);
      }
    },
  },
}, launcherReconciled.sessionId, {
  expectedIdentity: visible,
  ...(launcherReconciliation.verifiedLauncherPid === undefined
    ? {}
    : { verifiedLauncherPid: launcherReconciliation.verifiedLauncherPid }),
});
```

## When to Use

- A state change can alter the canonical tab title.
- Reconciliation repairs a visible title.
- Current identity or launcher evidence must accompany projection.

## When NOT to Use

- Rendering board rows, which has no title side effect.
- Clearing a title during unregister.
- A terminal is hidden, missing, or unknown.

## Common Violations

- Formatting glyphs or titles independently in a use case or CLI.
- Rendering directly from a stale mutation result.
- Writing a title before durable mutation succeeds.
- Omitting available terminal-identity or launcher-liveness evidence.
