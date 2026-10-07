---
id: gate-cruft-agent-codex-unused-command-type-import
kind: story
stage: done
tags: [cleanup]
parent: null
depends_on: []
release_binding: null
gate_origin: cruft
created: 2026-08-16
updated: 2026-08-16
---

# Remove the unused AgentCodexCommand type import

## Confidence

High

## Category

unused import

## Location

`src/cli/agent-codex.ts:4`

## Evidence

```typescript
import { createAgentCodexCommand, type AgentCodexCommand } from "../composition/create-agent-codex.js";
```

TypeScript reports TS6133 because `AgentCodexCommand` has no use beyond this import.

## Removal

Remove the `AgentCodexCommand` type specifier while retaining `createAgentCodexCommand`.

## Implementation notes

- Execution capability: GPT-5.6 Sol inherited implementation worker; direct-read mechanical cleanup with no behavior risk.
- Review weight: standard, from the caller and project conventions; bounded inline standalone-story review.
- Files changed: `src/cli/agent-codex.ts` and this item.
- Tests added/removed: none; the public CLI behavior is unchanged.
- Simplification: removed the unused `AgentCodexCommand` type import.
- Discrepancies from design: none.
- Adjacent issues parked: none.

## Verification

- `npx tsx --test --test-concurrency=1 tests/cli/agent-codex.test.ts` passes.

## Bounded inline review

The diff removes only the unused type specifier, retains the command factory,
and leaves runtime imports and behavior unchanged. No blocker found.
