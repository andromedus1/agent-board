---
provenance: agent-synthesis
updated: 2026-08-20
facet: codex-current-surface
verification_rigor: full
scope_authority: mixed
---

# Codex current lifecycle and control surface

## Finding

Codex app-server supplies a native, streamable lifecycle and acknowledgement
surface. {inferred: adapter sufficiency from the documented protocol contract}
It is sufficient for a provider adapter to represent active work, an explicit
approval wait, an explicit user-input wait, completion, interruption, and
failure. Its native identity unit is a thread plus turn; the thread belongs to a
session tree. The supported remote-terminal topology is an app-server listener
with a Codex TUI attached through `--remote`. The locally inspected 0.148.0 CLI
labels app-server and remote-control experimental, so each adapter installation
must capability-detect the generated protocol rather than relying on a fixed
version-independent promise. [symmetry-codex-app-server]{1}
[symmetry-codex-app-server]{2} [symmetry-codex-local-cli-probe-0-148-0]{2}
[symmetry-codex-local-schema-0-148-0]{1}

## Native lifecycle signals

{extends: adapter interpretation of the source-attested lifecycle}

| Adapter concern | Native Codex surface | Boundary on interpretation |
| --- | --- | --- |
| Active / idle | `thread/status/changed` reports `active`, `idle`, `notLoaded`, or `systemError`; active carries `activeFlags`. [symmetry-codex-app-server]{6} [symmetry-codex-local-schema-0-148-0]{1} | `idle` is a native runtime category, not a proof that the historical session has ended. |
| Waiting for approval | `active` plus `waitingOnApproval`; approval requests carry `threadId` and `turnId`. [symmetry-codex-app-server]{6} [symmetry-codex-app-server]{12} [symmetry-codex-local-schema-0-148-0]{2} | Render a request-specific approval state, not a general input prompt. |
| Waiting for user input | The 0.148.0 generated active-flag enum contains `waitingOnUserInput`; `item/tool/requestUserInput` is an explicit request/response flow. [symmetry-codex-local-schema-0-148-0]{2} [symmetry-codex-app-server]{12} | The flag is contract-attested but was not observed in a live turn in this pass. {confidence: contract-only} |
| Work completed | Turn status contains `completed`; item lifecycle has `item/completed`; the external `notify` hook currently exposes `agent-turn-complete`. [symmetry-codex-local-schema-0-148-0]{3} [symmetry-codex-local-schema-0-148-0]{10} [symmetry-codex-config-advanced]{1} | Completion is turn-scoped. It does not establish a provider-native unread state. |
| Failed | A failed turn emits `error` then completes with `failed`; error data can carry typed cause information and an upstream HTTP status. [symmetry-codex-app-server]{11} [symmetry-codex-local-schema-0-148-0]{9} | Preserve the failure and error evidence rather than reducing it to generic inactivity. |
| Interrupted | `turn/interrupt` takes thread and turn IDs and results in terminal `interrupted` status. [symmetry-codex-app-server]{9} [symmetry-codex-local-schema-0-148-0]{7} | Interruption is distinct from completion and failure. |
| Process / loaded-session end | `thread/closed` follows app-server unloading after the last subscription's inactivity grace period, alongside `notLoaded`. [symmetry-codex-app-server]{7} | This is an app-server residency/subscription event, not an assertion that an operating-system process or durable session ended. |
| Session identity and resumption | Record `thread.id` for `thread/resume`; record `thread.sessionId` as the session-tree identity. A resumed stored thread can receive later turns, and resume alone does not advance `updatedAt`. [symmetry-codex-app-server]{4} [symmetry-codex-local-schema-0-148-0]{5} | A reconnect/resume must not be displayed as new work merely because it rehydrates a thread. |

The generated 0.148.0 schema exposes no `unread` field in the inspected thread,
turn, runtime-status, or active-flag definitions. Therefore an unread badge can
only be adapter-owned presentation state derived from observed messages or local
acknowledgement, never represented as a native Codex state. {inferred: absence
from the generated app-server surface} [symmetry-codex-local-schema-0-148-0]{12}

## Attention, input, and acknowledgement

An adapter can add user input by starting a turn, or can steer an active turn
only when its expected turn id matches. `turn/steer` fails without an active
turn. The local schema additionally has a nullable `canAcceptDirectInput`
thread field, so availability should be discovered from the loaded thread
rather than assumed. [symmetry-codex-app-server]{8}
[symmetry-codex-local-schema-0-148-0]{4}

Approval acknowledgement must use the specific server-initiated request and its
allowed decision. The documented sequence pairs a pending item with an approval
request, client decision, `serverRequest/resolved`, and a terminal item status;
user-input requests have the same explicit resolution/cleanup signal. Generic
terminal keystrokes do not attest any approval action. [symmetry-codex-app-server]{12}

For attention routing, the built-in TUI can notify on `agent-turn-complete` and
`approval-requested`, while the external `notify` hook currently supports only
`agent-turn-complete`. A listener requiring native waiting and detailed failure
signals must consume the app-server event stream, not infer those signals from
the external notification hook. {inferred: coverage comparison}
[symmetry-codex-config-advanced]{1} [symmetry-codex-app-server]{10}

## Launch, transport, and capability scope

The documented remote-terminal topology starts app-server on a listener and
connects `codex --remote`; remote endpoint forms include WebSocket and Unix
socket forms. Non-local WebSocket deployments require authentication and TLS,
and plain WebSocket is limited to localhost or SSH port-forwarding in the
documentation. [symmetry-codex-app-server]{1}
[symmetry-codex-local-cli-probe-0-148-0]{4}

The local executable exposes managed daemon and remote-control entry points,
including pairing, but this pass did not enable remote control, start a daemon,
or pair a client. Those operations remain provider-topology validation work,
not currently observed lifecycle evidence. {confidence: command-surface-only}
[symmetry-codex-local-cli-probe-0-148-0]{5}

Experimental methods and fields require an explicit app-server capability opt-in
and are rejected without it. The local CLI also provides schema generation.
Treat generated-schema inspection plus connection initialization as an
installation-time capability gate before enabling features such as paginated
history or any experimental method. [symmetry-codex-app-server]{3}
[symmetry-codex-local-cli-probe-0-148-0]{2}

## Validation boundary

This pass performed a read-only local CLI/version/help probe and generated the
local 0.148.0 app-server schema. It did not create a thread or exercise a live
agent turn, so these claims are protocol-contract evidence rather than an
end-to-end observation of a particular account, model, terminal, or remote
daemon.

Before relying on this surface for runtime behavior, validate against the
installed build with one controlled thread that observes: transition to `active`;
an approval request and `waitingOnApproval`; a user-input request and
`waitingOnUserInput`; successful `turn/interrupt`; failed-turn error payload;
completed turn; `thread/read` without load; `thread/resume`; unsubscribe grace
unload; and a remote-TUI attach. These are acceptance checks, not assertions
that this pass has already run them. {confidence: validation-needed}

## Disconfirming analysis

- The official protocol's `thread/closed` behavior was checked against the
  generated status union. It is preceded by a `notLoaded` transition after
  unsubscribe/inactivity, which disconfirms treating it as a general agent- or
  OS-process-exit signal. [symmetry-codex-app-server]{7}
  [symmetry-codex-local-schema-0-148-0]{1}
- The official notification documentation was checked against the app-server
  lifecycle stream. The external hook's present coverage is only
  `agent-turn-complete`, whereas app-server emits lifecycle, status, item, and
  server-request resolution events. This disconfirms a notification-hook-only
  implementation of approval/input/failure attention. [symmetry-codex-config-advanced]{1}
  [symmetry-codex-app-server]{10}
- The generated 0.148.0 surface was checked for an unread field across its
  inspected thread, turn, status, and flag definitions. It contains none, so a
  native unread claim is held out of scope. [symmetry-codex-local-schema-0-148-0]{12}
- The official documentation gives a concrete `waitingOnApproval` event, while
  the local schema supplies `waitingOnUserInput` as an additional enum member.
  They qualify rather than contradict: the latter is protocol shape evidence
  awaiting a controlled live observation. [symmetry-codex-app-server]{6}
  [symmetry-codex-local-schema-0-148-0]{2}

## Contradictions

No incompatible source positions were found. The official app-server document
and the locally generated 0.148.0 schema agree on the lifecycle taxonomy they
both expose; the schema adds the exact `waitingOnUserInput` enum member where
the documentation's status example illustrates only `waitingOnApproval`.
This is a `qualifies` relationship, not evidence of a conflict.

## Revisit if

- The installed Codex CLI/app-server version changes, or a generated schema
  changes its thread status, active flags, turn status, request/response, or
  resume definitions.
- The app-server experimental/stable boundary or supported remote transport
  changes.
- Live validation shows a documented signal has different timing, cleanup, or
  resumption behavior under the target account, model, terminal, or daemon.
- The product requires provider-native unread semantics, process-exit detection,
  or remote-control behavior beyond the app-server event contract.
