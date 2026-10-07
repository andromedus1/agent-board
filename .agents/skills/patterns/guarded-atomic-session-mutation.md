# Guarded Atomic Session Mutation

When a write depends on earlier state or external evidence, re-check the
precondition inside `SessionStore.mutate` against the latest locked record.

## Rationale

`JsonSessionStore.mutate` reloads the current record under the session lock
before invoking the mutation callback (`src/infrastructure/json-session-store.ts:101`).
Guarding inside that callback prevents stale reads, delayed UI responses, and
external probes from overwriting a newer transition.

## Examples

### Completion acknowledgement rejects stale evidence

**File**: `src/application/acknowledge.ts:41`

```ts
return store.mutate(sessionId, (latest) => {
  if (
    latest.agent.attention !== "completion_unread" ||
    latest.agent.completionObservedAt === undefined ||
    timestamp(observedAt) < timestamp(latest.agent.completionObservedAt)
  ) {
    return latest;
  }
```

### Rename revalidates the captured terminal

**File**: `src/application/prompt-rename-session.ts:52`

```ts
const renamed = await dependencies.store.mutate(target.sessionId, (current) => {
  if (!sameIdentity(current, expectedIdentity)) {
    throw new AgentBoardError(
      "CONFLICT",
      `Session ${target.sessionId} no longer matches the focused Ghostty terminal`,
    );
  }
  return {
    ...current,
    identity: { ...current.identity, projectLabel },
  };
});
```

### Launcher liveness only stales the probed binding

**File**: `src/application/reconcile-session.ts:172`

```ts
const stale = await dependencies.store.mutate(record.sessionId, (current) => {
  if (!hasManagedWorkingLauncher(current) ||
      current.agent.launcherPid !== record.agent.launcherPid) {
    return current;
  }
  return {
    ...current,
    agent: {
      ...current.agent,
      health: "stale",
      observedAt,
      evidenceKind: "agent-board.launcher-liveness",
      confidence: "corroborated",
      detail: "Managed launcher process is no longer running",
    },
  };
});
```

## When to Use

- A mutation follows a prior read, focus capture, process probe, or asynchronous
  prompt.
- The operation must preserve a newer lifecycle transition or binding.
- Returning the unchanged latest record is a valid stale-operation outcome.

## When NOT to Use

- A new record is created under the registry lock.
- The operation is read-only.
- The mutation owns an unconditional field replacement with no stale
  precondition.

## Common Violations

- Checking state before `mutate` but not inside its callback.
- Replacing a whole nested object from a stale snapshot.
- Treating an external probe as authority for a different current PID, thread,
  or terminal.
