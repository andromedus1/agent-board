---
id: epic-swarm-attention-board-operator-controls
kind: feature
stage: done
tags: [cli, state]
parent: epic-swarm-attention-board
depends_on: [epic-swarm-attention-board-board-command]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Explicit Operator Controls

## Brief

Deliver `agent-board ack [session-id]` and `agent-board unregister
[session-id]` as the V1's narrow explicit control surface. With no argument, a
command resolves the currently focused registered Ghostty terminal; with an
argument, it accepts only the exact Board session ID. Ambiguous labels, display
order, and prefixes never select a destructive target.

Acknowledgement clears completion-unread only through the existing canonical
transition and reconciles title state without clearing input-required attention.
Unregister delegates to the existing recoverable operation, clearing a visible
or undo-hidden title override before record removal and retaining the record on
failure. This feature establishes an additive subcommand router for the later
`doctor` command, but does not implement diagnostics, focus navigation, generic
keystrokes, semantic agent actions, or automatic expiry.

## Epic context

- Parent epic: `epic-swarm-attention-board`
- Position in epic: write-capability consumer of the board command's output,
  target-display, and error conventions.

## Inherited design decisions

- Omitted targets mean the current registered Ghostty terminal; explicit targets
  are full session IDs only.
- Labels are presentation, never action identity.
- Mutating commands use terse human output in V1; structured automation is not
  yet an earned contract.
- The command router is a small explicit registry that can add `doctor` later.
- Disconnected records remain until explicit unregister; there is no auto-prune.

## Research briefs

- `.research/analysis/campaigns/agent-board-prior-art/parent.md` — Board-owned
  acknowledgement and capability-gated action constraints.
- `.research/analysis/briefs/ghostty-registration-liveness.md` — reliable focus
  identity and title clearing for visible/undo-hidden targets.

## Foundation references

- `docs/SPEC.md` — explicit acknowledgement fallback, unregister reversibility,
  and observation-only safety boundary.
- `docs/ARCHITECTURE.md` — `agent-board ack|unregister` command contracts and
  independent invocation topology.
- `docs/PRINCIPLES.md` — human/machine separation and semantic-action restraint.

## Design

### Target resolution

Add `src/application/resolve-session-target.ts` with one shared resolver used by
both mutations:

```ts
export interface FocusedTerminalPort {
  current(): Promise<FocusedTerminalContext>;
}

export async function resolveSessionTarget(
  store: SessionStore,
  terminal: FocusedTerminalPort,
  explicitSessionId?: string,
): Promise<SessionRecord>;
```

- A supplied target is an exact, non-empty session ID. Resolve it with
  `store.get`; do not inspect Ghostty, accept prefixes, or fall back to labels.
- With no target, capture the focused Ghostty identity once, load the validated
  store once, and match the complete adapter/window/tab/terminal tuple.
- Return `NOT_FOUND` when the explicit ID or focused identity is unregistered.
  Return `CONFLICT` if corrupt/pre-existing state contains more than one record
  for the focused identity. Do not choose by ordering.
- Adapter errors remain adapter errors. Target resolution must not translate a
  permission/automation failure into an absent session.

### Mutation use cases

Add `src/application/acknowledge-session.ts` as the command-level composition
around the existing canonical acknowledgement and reconciliation paths:

```ts
export interface AcknowledgeSessionResult {
  readonly record: SessionRecord;
  readonly titleRendered: boolean;
}

export async function acknowledgeSession(
  dependencies: AcknowledgeSessionDependencies,
  explicitSessionId?: string,
): Promise<AcknowledgeSessionResult>;
```

It resolves the target, calls `acknowledgeCompletion(..., "explicit", now)`,
then reconciles that exact session so the title catches up with durable state.
The domain transition remains authoritative: completion-unread clears, while
input-required and no-op states remain unchanged. A title action failure after
the durable acknowledgement returns `titleRendered: false`; it does not report
the acknowledgement as failed or roll state back. Store validation/mutation,
snapshot, and target-resolution failures remain visible failures.

Use the existing `unregisterSession` unchanged after target resolution. Its
clear-before-remove ordering is the safety contract: visible and undo-hidden
titles are cleared before deletion, missing tombstones are simply removed, and
snapshot/title failures retain the record for retry.

### CLI and composition

Add an explicit registry-based router in `src/cli/agent-board.ts`:

```text
agent-board ack [session-id]
agent-board unregister [session-id]
```

The parser accepts exactly one known subcommand and at most one non-empty
positional target. It rejects flags, extra operands, abbreviated commands, and
an empty target with usage on stderr and exit 2. Execution failures use the
shared `formatCliError` convention and exit 1. Success is deliberately terse:
ack prints `Acknowledged <session-id>.` (plus ` Title sync deferred.` when the
title repair failed); unregister prints `Unregistered <session-id>.` Both
messages use the resolved canonical full ID, including when target selection
came from focus.

Keep the router additive through a typed command map rather than a nested
conditional, so the operational-readiness epic can register `doctor` without
changing the two-command grammar. Do not add JSON output or generic command
forwarding.

Add `src/composition/create-agent-board.ts` to instantiate one
`JsonSessionStore`, one `GhosttyClient`, and a real clock, and expose two narrow
operations returning their resolved results. Add the `agent-board` bin to
`package.json`; keep parsing and process exit behavior in the CLI module.

### Implementation units

1. `resolve-session-target.ts` — exact-ID/current-terminal identity selection.
2. `acknowledge-session.ts` — explicit acknowledgement plus best-effort title
   convergence.
3. `create-agent-board.ts` — shared dependency composition for both controls.
4. `agent-board.ts` and package bin — registry router, usage, output, exit codes.
5. Focused unit/CLI tests and integrated build verification.

No child stories are needed: these units form one small capability stride and
share the same target-resolution and command contract.

## Test strategy

- Resolver tests cover exact full ID without a Ghostty call; unknown ID;
  focused identity success; unregistered focus; duplicate identity conflict;
  and propagation of Ghostty/store failures.
- Acknowledgement tests cover unread completion, input-required no-op, stale
  acknowledgement protection through the canonical transition, successful
  title reconciliation, and a post-commit title failure reported as
  `titleRendered: false` without losing the acknowledgement.
- Router tests use injected operations and streams to pin both command forms,
  focused-target success output, explicit-ID pass-through, deferred-title text,
  unregister output, unknown/extra/flag usage errors, and formatted execution
  failures.
- Existing unregister tests remain the contract for visible, undo-hidden,
  missing, and retain-on-failure behavior; add a composition-level assertion
  only if needed to prove the router delegates the resolved full ID.
- Run typecheck, build, the focused tests, then the uncontended full suite. Verify
  `dist/cli/agent-board.js` exists and the package bin points to it.

## Risks and boundaries

- Acknowledgement is intentionally asymmetric: durable state wins over title
  repair. The board will continue surfacing title-sync diagnostics until a later
  reconciliation succeeds.
- Unregister is intentionally stricter because deleting the record before a
  title clear would strand a machine-owned override.
- Current focus is an identity lookup, not semantic approval of agent behavior.
  No keypresses or agent-native actions are introduced.
- Full IDs are less convenient than labels for explicit targeting, but prevent
  destructive ambiguity; future clickable/focus controls may provide a safer
  ergonomic layer.

## Acceptance criteria

- `agent-board ack [session-id]` clears only completion-unread through the
  canonical transition, targets exact IDs or the focused registered terminal,
  and reports deferred title repair truthfully.
- `agent-board unregister [session-id]` uses the same target rules and preserves
  clear-before-remove recoverability.
- Labels, prefixes, display order, and unknown flags never select a target.
- The router has an additive command-registry seam for `doctor`, with no generic
  command execution surface.
- Typecheck, build, focused tests, and the full suite pass; the built bin is
  present.

## Review plan

Review weight is standard: one independent feature pass, receiver
adjudication/fixes, green verification, and closure without re-review.

## Implementation notes

- Execution capability: GPT-5.6 high; cohesive single-owner feature with shared
  target-resolution and mutation contracts.
- Review weight: standard, from the feature design and autopilot policy; stop at
  review for the independent feature pass.
- Files changed: `src/application/resolve-session-target.ts`,
  `src/application/acknowledge-session.ts`,
  `src/application/unregister-agent-session.ts`,
  `src/composition/create-agent-board.ts`, `src/cli/agent-board.ts`,
  `package.json`, `tests/application/operator-controls.test.ts`, and
  `tests/cli/agent-board.test.ts`.
- Tests added: resolver identity/ambiguity/error tests, acknowledgement
  transition and title-convergence tests, and injected CLI grammar/output/error
  tests.
- Simplification: both controls share one exact-ID/focused-identity resolver;
  the router uses a typed command registry and delegates unregister's existing
  clear-before-remove operation without duplicating it.
- Discrepancies from design: none.
- Adjacent issues parked: none.
- Verification: focused operator-control and CLI tests pass (12 tests); typecheck
  and build pass; `dist/cli/agent-board.js` is emitted; uncontended full suite
  passes (135 tests).

## Review (2026-08-14)

**Verdict**: Approve with fixes

**Blockers**: none.

**Important fixes**:

- No-argument controls now require authoritative frontmost Ghostty focus rather
  than merely selecting Ghostty's internally active tab while another app is in
  front. Explicit full IDs remain available from any invocation context.
- The router now owns executable command definitions instead of a decorative
  identity map plus a hard-coded dispatch conditional, preserving a real seam
  for `doctor`.
- Reconciliation exposes a typed title-write failure. Acknowledgement degrades
  only that failure; store/snapshot/conflict errors remain visible. A regression
  test proves failed diagnostic persistence cannot be mislabeled as deferred
  title sync.
- Added direct coverage for focused resolution through unregister and its
  clear-before-remove result.

**Nits adjudicated**: shared the focused-terminal port in the domain boundary;
kept local timestamp/identity helpers because further extraction would exceed
their small use-site cost; retained existing error-code, help, and idempotent
success conventions for sibling-CLI consistency. Corrected the implementation
note's original focused-test count.

**Notes**: Standard weight, one cross-model feature review continued once to
collect its report after the reviewer's test wait returned early. Receiver
adjudication applied the four material findings and verified typecheck, build,
and the uncontended full suite at 138/138 passing. No re-review required.
