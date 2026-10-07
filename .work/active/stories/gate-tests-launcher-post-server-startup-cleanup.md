---
id: gate-tests-launcher-post-server-startup-cleanup
kind: story
stage: done
tags: [testing]
parent: null
depends_on: []
release_binding: null
gate_origin: tests
created: 2026-08-16
updated: 2026-08-16
---

# Cover managed-launch cleanup across post-server startup failures

## Priority

High

## Value evidence

Item: `epic-managed-codex-observation-supervised-launcher`

Contract / risk / regression / maintenance cost: The feature requires app-server, observer, focus watcher, and TUI cleanup exactly once for every startup/runtime failure (`.work/active/features/epic-managed-codex-observation-supervised-launcher.md:282`). Production has distinct connect, initialize, observer-start, and TUI-start failure points (`src/application/launch-managed-codex.ts:134`, `:135`, `:139`, `:150`) with cleanup at line 192, while `tests/application/launch-managed-codex.test.ts:112-192` does not cover those post-server startup failures.

## Gap type

complex-unit

## Suggested test

```typescript
test("managed launch cleans post-server startup failures exactly once", async () => { /* table: connect, initialize, observer, TUI failures; assert stop/close counts, error evidence, cleared launcher binding */ });
```

## Test location (suggested)

`tests/application/launch-managed-codex.test.ts`

## Implementation notes

Added a table-driven lifecycle regression covering connect, initialize,
observer-start, and remote-TUI-start failures after the app-server is up. Each
case asserts the exact child stop order/count, client close count, final
launcher-binding removal, and bounded launcher failure evidence. The observer
case uses the existing client seam and lets the real observer path fail rather
than bypassing cleanup with a direct mock.

## Verification

- `npx tsx --test --test-concurrency=1 tests/application/launch-managed-codex.test.ts`
- `npm run typecheck`
- Bounded inline review: all four failure points execute the production
  lifecycle/finalization path; no production source or cleanup behavior was
  changed.
