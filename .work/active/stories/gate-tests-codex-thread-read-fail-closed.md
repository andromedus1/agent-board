---
id: gate-tests-codex-thread-read-fail-closed
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

# Cover malformed and mismatched loaded-thread repair responses

## Priority

High

## Value evidence

Item: `story-fix-codex-loaded-thread-schema`

Contract / risk / regression / maintenance cost: The hydrated repair requires malformed loaded-list/thread-read responses to fail closed (`3719113:.work/active/stories/story-fix-codex-loaded-thread-schema.md:47`), and production rejects a returned thread ID that differs from the request (`src/integrations/codex/client.ts:205`). Schema tests reject malformed values (`tests/integrations/codex/protocol.test.ts:35`), while the client path covers only successful matching enrichment (`tests/integrations/codex/client.test.ts:39`).

## Gap type

bug-regression

## Suggested test

```typescript
test("loadedThreads fails closed on malformed and mismatched thread/read", async () => { /* return malformed metadata and then a different id; assert method-specific ADAPTER_FAILURE and no result */ });
```

## Test location (suggested)

`tests/integrations/codex/client.test.ts`

## Implementation notes

Added loopback app-server contract coverage for both loaded-thread repair
failure modes: malformed `thread/loaded/list` metadata is rejected at the
method boundary, and a `thread/read` response with a different ID is rejected
before any hydrated result is returned. Both cases assert the typed
`ADAPTER_FAILURE` and close the client in fixture teardown.

## Verification

- `npx tsx --test --test-concurrency=1 tests/integrations/codex/client.test.ts`
- `npm run typecheck`
- Bounded inline review: the test uses the existing in-process WebSocket seam,
  asserts method-specific failure evidence, and does not weaken production
  validation or add a dependency.
