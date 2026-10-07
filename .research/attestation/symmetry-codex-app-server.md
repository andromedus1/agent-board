---
source_handle: symmetry-codex-app-server
fetched: 2026-08-20
source_url: https://learn.chatgpt.com/docs/app-server
provenance: source-direct
substrate_confidence: source-direct
---

# Codex App Server

## Structural metadata

- Publisher: OpenAI / ChatGPT Learn.
- Document type: official product and protocol documentation.
- Subject: Codex app-server transport, thread/turn/item lifecycle, remote TUI,
  resumability, events, errors, approvals, and user-input requests.

## Paraphrased summary

The app-server is Codex's rich-client integration interface. Its stated use cases
include authentication, conversation history, approvals, and streamed agent
events. It represents a conversation as a thread, user work as turns, and
incremental inputs/outputs as items. A client initializes a connection, starts
or resumes a thread, starts or steers a turn, and continues reading server
notifications.

The server exposes a remote TUI topology: an app-server listener can run on one
machine and the Codex terminal UI can connect to it. The document requires
WebSocket authentication and TLS for a non-local connection and permits plain
WebSocket only on localhost or through SSH port forwarding.

Thread state is observable through `thread/status/changed`; documented runtime
states are `notLoaded`, `idle`, `systemError`, and `active` with active flags.
The documented example of the latter carries `waitingOnApproval`. A thread that
is merely read from storage is not loaded or subscribed. If the final subscriber
leaves and the inactivity grace period expires, the server unloads it, reports
`notLoaded`, and emits `thread/closed`.

Turns start `inProgress`, can receive same-turn input via `turn/steer`, and can
be interrupted with `turn/interrupt`; a successful interruption ends the turn
with status `interrupted`. A failed turn emits an `error` event and ends with
status `failed`, including an error message and optional typed Codex error
information. Item lifecycle notifications provide started and completed events.

The approval protocol is request/response, not a generic keystroke signal:
command and file-change requests carry thread and turn identifiers; the client
chooses a documented decision; `serverRequest/resolved` confirms resolution; and
the associated item completes with a terminal item status. Tool user-input
requests likewise resolve through an explicit client response or are cleared by
turn start, turn completion, or turn interruption.

A stored session is resumed by recorded `thread.id`; root threads use their own
thread id as `sessionId`, and forked threads retain the root session id. The
documentation says clients should read `thread.sessionId`, not derive it from a
thread id. `thread/resume` alone does not update the stored thread's timestamp;
starting a turn does.

## Key passages and source-internal anchors

[1] Lines 770-786: calls app-server the rich-client interface and names
  authentication, conversation history, approvals, and streamed agent events;
  recommends the SDK for CI/job automation; describes remote TUI connection to
  an app-server listener and security requirements for non-local WebSocket use.
[2] Lines 891-902: defines thread, turn, and item; specifies initialization,
  start/resume, turn start/steer, event streaming, and terminal turn completion.
[3] Lines 943-968: states that experimental methods/fields require opt-in and
  describes `thread/start` and `thread/resume`.
[4] Lines 1114-1159: documents persisted logs, `thread.sessionId`, resume-by-id,
  and the fact that resume itself does not update `updatedAt`.
[5] Lines 1224-1232: distinguishes `thread/read` from resume and lists runtime
  status variants.
[6] Lines 1312-1321: specifies `thread/status/changed` and gives an active state
  with `waitingOnApproval`.
[7] Lines 1329-1346: ties `thread/closed` to subscription/inactivity unloading and
  a preceding `notLoaded` transition.
[8] Lines 1454-1505: shows `turn/start` returning an `inProgress` turn and
  documents same-turn steering and its active-turn constraint.
[9] Lines 1517-1522: documents `turn/interrupt` and terminal `interrupted`.
[10] Lines 1674-1684: lists the lifecycle and resolution notifications a resumed or
  started thread client must consume.
[11] Lines 1742-1755: specifies the error event and a terminal failed turn.
[12] Lines 1756-1812: specifies command/file approvals, `serverRequest/resolved`,
  terminal item statuses, clearing/resolution of `tool/requestUserInput`, scoped
  permission acknowledgements, MCP elicitation responses, and side-effecting
  app-tool approval through user input.
