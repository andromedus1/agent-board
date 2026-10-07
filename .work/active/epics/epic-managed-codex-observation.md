---
id: epic-managed-codex-observation
kind: epic
stage: done
tags: [integration, cli]
parent: null
depends_on: [epic-trustworthy-session-core]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Managed Codex Observation

## Brief

Deliver the trustworthy Codex V1 adapter and `agent-codex` workflow. One
launcher per supervised tab starts an ephemeral loopback app-server, initializes
a concurrent observer, runs the normal remote TUI on the terminal, binds the
correct thread, maps validated runtime events into normalized state, and performs
bounded child cleanup.

This arc owns experimental-protocol version gating, observer confidence,
thread-binding ambiguity, failure diagnostics, and process supervision. It does
not own Ghostty scripting or duplicate the state/projection policy. Ordinary
Codex remains explicitly lower confidence and may be diagnosed without being
presented as equivalent lifecycle coverage.

## Research briefs

- `.research/analysis/briefs/codex-detector-topology.md` — selects managed app-server plus remote TUI and records lifecycle coverage and risks.
- `.research/attestation/codex-cli-managed-runtime-probe.md` — validates concurrent observation and ephemeral loopback endpoint behavior on the installed Codex.
- `.research/analysis/campaigns/agent-board-prior-art/parent.md` — grounds native versus inferred state and unread completion semantics.

## Foundation references

- `docs/SPEC.md` — Codex integration, confidence, error, and observation-only requirements.
- `docs/ARCHITECTURE.md` — managed launcher topology, protocol boundary, process rules, and compatibility policy.

## Anticipated child features

Provisional seams are the narrow app-server protocol client, normalized Codex
observer, and supervised managed-launch workflow with visible degradation.

<!-- The /epic-design pass will fill in real child feature specifics into a
## Decomposition section below this one. -->

## Design decisions

- Treat app-server as an experimental external boundary: initialize explicitly,
  validate only required methods/events, allow additive fields, and fail visibly
  on missing semantics.
- Bind loopback WebSocket port `0`, parse the advertised endpoint, and never
  expose or persist it beyond the launcher lifetime.
- Bind one observer to one remote-TUI root thread using dedicated process scope,
  loaded-thread events, cwd, and parent metadata; ambiguity is diagnostic.
- Global `thread/status/changed` is authoritative for working/idle. Waiting flags
  and turn outcome/error events map through the closed transition union.
- The launcher owns bounded readiness, TUI/app-server process cleanup, signals,
  and exit classification. Terminal bytes flow directly between Ghostty and
  `codex --remote`.

## Pre-mortem

- Codex protocol drift could silently misclassify work. Runtime schemas and a
  version compatibility gate live in the protocol feature.
- Observer thread selection could attach to a child or unrelated thread. The
  lifecycle feature refuses ambiguity instead of guessing.
- Failed startup or terminal hangup could leak app-server processes. The launcher
  feature owns one abort tree and bounded cleanup tests.

## Decomposition

1. `epic-managed-codex-observation-app-server-client` — readiness discovery,
   JSON-RPC transport, initialization, narrow schemas, and compatibility checks.
   `depends_on: []`.
2. `epic-managed-codex-observation-lifecycle-adapter` — thread binding and
   Codex-event to normalized-transition mapping. Depends on the client.
3. `epic-managed-codex-observation-supervised-launcher` — `agent-codex` process
   topology, remote TUI handoff, signal/exit handling, and visible degradation.
   Depends on both.

## Child features reviewed and complete (2026-08-14)

- The app-server client provides bounded loopback connection, correlated JSON-RPC,
  validated narrow schemas, backpressure limits, and strict 0.147.x compatibility.
- The lifecycle adapter subscribes before discovery, refuses ambiguous root-thread
  binding, maps native state through the normalized transition boundary, and
  preserves abort cleanup for production-shaped streams.
- The supervised launcher composes registration, observer-before-TUI startup,
  direct terminal I/O, focus acknowledgement, canonical reconciliation, first-
  outcome state ownership, and bounded process cleanup behind `agent-codex`.
- Every child feature completed one standard independent review pass and green
  integrated verification. The aggregate Codex capability is ready for epic review.

## Review (2026-08-14)

**Verdict**: Approve with comments

**Blockers**: none
**Important**: `idea-observer-failure-degradation` — preserve the option to keep
a healthy interactive TUI alive when only the passive observer fails, if real
usage shows the V1 single-abort-tree tradeoff is too disruptive.
**Nits**: Removed an unused type-only compatibility re-export from the launcher.
**Rejected**: Missing `agents`/`agent-board` bins are sibling-epic scope, not a
Codex capability gap; rejecting bare `--` is an already-reviewed topology-safety
decision.

**Notes**: Standard weight, one cross-model aggregate pass. End-to-end review
confirmed subscription/binding cancellation, normalized state mutation,
confidence semantics, title reconciliation, version/endpoint gating, process
cleanup, and CLI composition across all three child features. The review's own
full-suite attempt was confounded by concurrent test processes, so closure uses
the subsequent uncontended implementation-owner run: typecheck and build green,
`npm test` 121/121 passing, and the built `agent-codex` entry present.
