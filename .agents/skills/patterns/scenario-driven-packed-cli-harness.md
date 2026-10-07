# Scenario-Driven Packed CLI Harness

Packaged end-to-end tests run installed binaries against scenario-controlled
fake executables in an isolated temporary prefix.

## Rationale

`createPackageHarness` packs and installs the distributable, isolates state,
redirects executable configuration to fakes, tracks owned processes, and cleans
the contained temporary root (`tests/e2e/support/package-harness.ts:104`). Seven
tests across four packaged suites reuse it.

## Examples

### Golden multi-command lifecycle

**File**: `tests/e2e/packaged-golden.test.ts:7`

```ts
test("packed golden journeys preserve board/title parity and independent session identity", async () => {
  const harness = await createPackageHarness({
    ghostty: {
      terminals: {
        "term-two": {
          windowId: "window-two",
          tabId: "tab-two",
          terminalId: "term-two",
          workingDirectory: "/tmp/second-project",
        },
      },
    },
  });
  try {
    const result = await harness.run("agent-name", ["data-platform"], { stdinIsTTY: true });
```

### Retryable failure through scenario mutation

**File**: `tests/e2e/packaged-failure.test.ts:57`

```ts
test("failed title clear retains a record for a healthy retry", async () => {
  const harness = await createPackageHarness();
  try {
    let result = await harness.run("agent-name", ["clear-me"], { stdinIsTTY: true });
    await harness.writeScenario((value) => ({
      ...value,
      ghostty: { ...value.ghostty, titleActionFails: true },
    }));
    result = await harness.run("agent-board", ["unregister", sessionId]);
    assert.equal(result.code, 1);
  } finally {
    await harness.close();
  }
});
```

### Owned-process chaos journey

**File**: `tests/e2e/packaged-chaos.test.ts:17`

```ts
test("killing the owned app-server projects bounded error evidence without corrupting state", async () => {
  const harness = await createPackageHarness({ codex: { status: "working" } });
  const launcher = harness.start("agent-codex");
  try {
    await waitForBoardRow(harness, (row) => row.glyph === "●");
    await harness.writeScenario((value) => ({
      ...value,
      codex: { ...value.codex, killServer: true },
    }));
    const failed = await waitForBoardRow(harness, (row) => row.glyph === "×", 3_000);
    assert.equal(failed.status, "error");
  } finally {
    if (launcher.child.exitCode === null) launcher.child.kill("SIGTERM");
    await harness.close();
  }
});
```

## When to Use

- A contract spans packaged bins, persistent state, and executable adapters.
- Packaging contents or installed entry points are part of acceptance.
- Lifecycle convergence or failure recovery must be tested across processes.

## When NOT to Use

- Pure domain transitions or projection tables.
- A single application use case can be tested with fake ports.
- Live installed compatibility probes, which remain opt-in and separately
  bounded.

## Common Violations

- Importing source modules instead of invoking installed bins.
- Touching the operator's real state or executables.
- Using fixed sleeps instead of scenario/board convergence helpers.
- Omitting `finally` cleanup for the harness or owned children.
