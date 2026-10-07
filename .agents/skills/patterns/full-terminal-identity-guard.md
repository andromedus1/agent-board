# Full Terminal Identity Guard

Focus-derived targeting and title writes guard the complete
adapter/window/tab/terminal identity across asynchronous gaps.

## Rationale

A terminal ID is adapter binding data, while focus and ancestry evidence include
the full tuple. Comparing all four fields prevents a delayed prompt,
reconciliation result, or title action from being applied to a replaced or
moved registration.

## Examples

### Focus resolution matches the complete identity

**File**: `src/application/resolve-session-target.ts:43`

```ts
const focused = await terminal.focused();
if (focused === null) {
  throw new AgentBoardError(
    "NOT_FOUND",
    "Ghostty is not frontmost; pass an exact session id or focus the target tab",
  );
}
const records = await store.list();
const matches = records.filter(
  (record) => sameIdentity(recordIdentity(record), focused),
);
```

### Native rename captures and rechecks identity

**File**: `src/application/prompt-rename-session.ts:44`

```ts
// Resolve before the dialog appears: the native prompt becomes frontmost and
// therefore cannot be used as evidence for which Ghostty tab was selected.
const target = await resolveSessionTarget(dependencies.store, dependencies.terminal);
const expectedIdentity = terminalIdentity(target);
const requestedLabel = await dependencies.prompt.prompt(target.identity.projectLabel);

const renamed = await dependencies.store.mutate(target.sessionId, (current) => {
  if (!sameIdentity(current, expectedIdentity)) {
    throw new AgentBoardError("CONFLICT", "Session no longer matches the focused terminal");
  }
  return { ...current, identity: { ...current.identity, projectLabel } };
});
```

### Title rendering refuses an identity race

**File**: `src/application/render-title.ts:33`

```ts
if (options.expectedIdentity !== undefined &&
    (record.terminal.adapter !== options.expectedIdentity.adapter ||
     record.terminal.windowId !== options.expectedIdentity.windowId ||
     record.terminal.tabId !== options.expectedIdentity.tabId ||
     record.terminal.terminalId !== options.expectedIdentity.terminalId)) {
  throw new AgentBoardError(
    "CONFLICT",
    `Session ${sessionId} no longer matches the verified Ghostty terminal`,
  );
}
```

## When to Use

- Target selection comes from current focus.
- A prompt or external call separates target capture from mutation.
- A validated snapshot authorizes a title write.

## When NOT to Use

- Looking up the Board-owned primary key by exact session ID.
- Classifying application-wide presence where terminal ID is the protocol
  lookup key.
- Non-targeted diagnostics.

## Common Violations

- Comparing only `terminalId` before a focus-derived mutation or title write.
- Re-querying focus after a dialog has become frontmost.
- Using whichever terminal is currently focused when an earlier identity
  authorized the action.
