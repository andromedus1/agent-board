---
source_handle: symmetry-codex-local-schema-0-148-0
fetched: 2026-08-20
source_path: .research/source-captures/symmetry-codex-cli-0.148.0/schema
provenance: source-direct
substrate_confidence: source-direct
---

# Generated local Codex app-server schema, CLI 0.148.0

## Structural metadata

- Source type: locally generated JSON Schema bundle.
- Generator: `codex app-server generate-json-schema --experimental`.
- Captured CLI version: 0.148.0; the companion probe is
  `.research/source-captures/symmetry-codex-cli-0.148.0/local-cli-probe.md`.
- Relevant files: `v2/ThreadResumeResponse.json`,
  `v2/ThreadStatusChangedNotification.json`, `v2/TurnStartParams.json`,
  `v2/TurnInterruptParams.json`, `v2/TurnCompletedNotification.json`,
  `v2/ThreadResumeParams.json`, and request schemas at the capture root.

## Paraphrased summary

The generated v2 schema represents thread state as `notLoaded`, `idle`,
`systemError`, or `active`; active threads carry an array of flags. The active
flag enum has exactly `waitingOnApproval` and `waitingOnUserInput` in this
capture. A turn's status enum is `completed`, `interrupted`, `failed`, or
`inProgress`. A failed turn may include a message, optional typed Codex error
information, and optional details.

Thread data includes an id, a session id shared by a session tree, status, an
optional direct-input capability, and persisted metadata. The capture defines
`thread/resume` as requiring a thread id, with documented paths for loading a
stored thread by id, history, or path and a stated preference for id. The
`turn/interrupt` parameters require both thread id and turn id. The generated
schema exposes started/completed item notifications as well as request schemas
for command approval, permissions approval, and tool user input.

No field named `unread` is present in the inspected generated thread, turn,
status, or active-flag schemas. The absence is a surface observation for this
specific generated schema, not a claim about every Codex client UI.

## Key passages and source-internal anchors

[1] `v2/ThreadResumeResponse.json`, definition `ThreadStatus`: the four status
  variants and the active-state `activeFlags` field.
[2] `v2/ThreadResumeResponse.json`, definition `ThreadActiveFlag`: enum members
  `waitingOnApproval` and `waitingOnUserInput`.
[3] `v2/ThreadResumeResponse.json`, definition `TurnStatus`: enum members
  `completed`, `interrupted`, `failed`, and `inProgress`.
[4] `v2/ThreadResumeResponse.json`, definition `Thread`: identifies `id`,
  `sessionId`, `status`, `canAcceptDirectInput`, and persisted-history fields.
[5] `v2/ThreadResumeParams.json`: describes resume by thread id, history, or path
  and says to prefer thread id; requires `threadId`.
[6] `v2/TurnStartParams.json`: requires `threadId` and input; supports turn-level
  policy and environment overrides.
[7] `v2/TurnInterruptParams.json`: requires `threadId` and `turnId`.
[8] `v2/TurnCompletedNotification.json`: carries the thread id and final turn.
[9] `v2/ErrorNotification.json` and `ServerNotification.json`, definition
  `CodexErrorInfo`: carry error, thread id, turn id, retry indication, and an
  optional forwarded `httpStatusCode` on relevant upstream-error variants.
[10] `v2/ItemStartedNotification.json` and `v2/ItemCompletedNotification.json`:
  carry item and thread/turn identifiers with lifecycle timestamps.
[11] `ExecCommandApprovalParams.json`, `PermissionsRequestApprovalParams.json`,
  and `ToolRequestUserInputParams.json`: define explicit acknowledgement or
  input request payloads, scoped with relevant ids.
[12] Inspected definitions in `v2/ThreadResumeResponse.json`,
  `v2/TurnCompletedNotification.json`, and
  `v2/ThreadStatusChangedNotification.json`: no field or enum member named
  `unread` appears in the thread, turn, status, or active-flag shapes.
