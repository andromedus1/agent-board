---
provenance: agent-synthesis
updated: 2026-08-14
---

# Codex lifecycle evidence and adapter boundaries

## Revisions note

- 2026-08-14 correction: replaced redirected snippet-only source chains for `notifications-activity` and `codex-micro-status` with reachable `learn.chatgpt.com` sources and rewrote those attestations from fetched page content; rewrote the opening comparative phrasing; narrowed the acquisition candidate to sources explicitly named by the app-server docs.
- 2026-08-14 topology clarification: added an app-server attachment-topology section grounded in official docs and the installed CLI help; revised the V1 recommendation to distinguish documented `codex --remote` client mode from an ordinary standalone Ghostty TUI.
- 2026-08-14 adversarial correction: numbered every Codex attestation passage explicitly, rewrote `pets-status` from fetched official page content, and repointed all specialist citations from bibliography-style ordinals to semantically supporting passage locators.

The fetched official docs document machine-readable Codex lifecycle state in app-server and its connected clients.[app-server-protocol]{1} App-server thread runtime status includes `notLoaded`, `idle`, `systemError`, and `active` with `activeFlags`.[app-server-protocol]{7} [codex-cli-local-app-server-schema]{2} The current local schema enumerates `waitingOnApproval` and `waitingOnUserInput` as the active flags, and turn status values `completed`, `interrupted`, `failed`, and `inProgress` separately from thread status.[codex-cli-local-app-server-schema]{1} [codex-cli-local-app-server-schema]{3} [app-server-protocol]{10}

Terminal Codex also exposes narrower lifecycle signals without app-server. The external `notify` program runs on `agent-turn-complete` and carries turn-complete context in environment variables.[config-advanced-notifications]{1} Built-in TUI notifications can emit for `agent-turn-complete` and `approval-requested`, and can be gated to unfocused or always-visible delivery.[config-advanced-notifications]{2} The config reference also shows that Codex owns the terminal title by default through `tui.terminal_title = ["spinner", "project"]`, and that `null` disables title updates.[config-reference-tui]{2}

Hooks give useful transition points but not a full state model. `PermissionRequest` runs when Codex is about to ask for approval.[hooks-lifecycle]{1} `Stop` runs after Codex stops processing a turn.[hooks-lifecycle]{2} `SessionEnd` runs when the session ends or after 30 minutes of idle time while the conversation is not open in any connected client.[hooks-lifecycle]{3} Hosted tools such as WebSearch do not use the local function-tool hook path, and the docs explicitly frame hooks as useful guardrails rather than a complete enforcement boundary.[hooks-lifecycle]{4} [hooks-lifecycle]{5}

Comparable first-party surfaces clarify where “finished/unread” lives today. Activity view groups chats into unread, running, and waiting-for-response buckets, and desktop notification settings separately control turn-completion alerts plus permission and question notifications.[notifications-activity]{2} [notifications-activity]{1} Pets for terminal Codex report the current CLI session with Running, Needs input, Ready, and Blocked states; they do not provide the desktop app’s multiple-chat activity tray; and they require `iTerm2 3.6` or later, Kitty graphics, or Sixel, with tmux and Zellij unsupported.[pets-status]{2} [pets-status]{3} Codex Micro makes the presentation semantics most explicit: its Agent Key status table includes Idle, Thinking, Complete, Requires input, and Error, and defines Complete as a chat that completed with an unread update.[codex-micro-status]{2}

The local terminal build in this engagement also exposes app-server tooling directly: `codex app-server` is present in the installed CLI help output with `daemon`, `proxy`, `generate-ts`, and `generate-json-schema`, and its listen modes include `stdio`, `unix`, and `ws`.[codex-cli-local-app-server-help]{1} [codex-cli-local-app-server-help]{2}

## App-server attachment topology

The current official docs and installed CLI document app-server as a server process that clients connect to, not as a probe that retroactively attaches to an already-running standalone local TUI. The documented terminal topology is: start app-server, then connect the Codex terminal UI with `codex --remote ...`.[app-server-protocol]{2} [codex-cli-local-remote-modes-help]{2} The installed CLI help also exposes `app-server` and `remote-control` as separate command families from the ordinary interactive command, with `--remote` explicitly described as connecting the TUI to an app-server endpoint.[codex-cli-local-remote-modes-help]{1} [codex-cli-local-remote-modes-help]{2}

The protocol docs also distinguish stored-thread access from the currently loaded in-memory thread set. `thread/read` reads a stored thread without resuming or loading it into memory, `thread/resume` continues a stored thread by id, and `thread/loaded/list` returns the thread IDs currently loaded in memory.[app-server-protocol]{5} [app-server-protocol]{6} This allows reading or resuming persisted CLI-originated threads, but it does not document attaching app-server to an unrelated local `codex` process that was started normally in Ghostty.{confidence: medium}

The remote-control docs point the same way. `codex remote-control start` starts the local app-server daemon with remote control enabled for managed remote-control clients and SSH remote workflows, and those commands are not a replacement for `codex app-server --listen` when building a local protocol client.[developer-commands-remote-control]{2} {inferred: convergence} Across the fetched docs and local help, the documented ownership model is “app-server-managed backend with connected clients,” not “attach app-server to an existing ordinary TUI after startup.”[app-server-protocol]{2} [app-server-protocol]{6} [codex-cli-local-remote-modes-help]{1} [codex-cli-local-remote-modes-help]{2} [developer-commands-remote-control]{2}

## State mapping for Agent Board V1

| Desired state | Native Codex mechanism(s) | What is reliable vs missing |
| --- | --- | --- |
| Working | app-server thread `active`; turn `inProgress`; pets `Running`; Micro `Thinking`.[app-server-protocol]{7} [codex-cli-local-app-server-schema]{2} [codex-cli-local-app-server-schema]{3} [pets-status]{1} [pets-status]{2} [codex-micro-status]{2} | Native if you use app-server or a first-party presentation surface. No documented terminal hook or notification dedicated to “working”. |
| Needs input / approval | TUI `approval-requested`; hook `PermissionRequest`; app-server `waitingOnApproval` and `waitingOnUserInput`; pets `Needs input`; Micro `Requires input`.[config-advanced-notifications]{2} [hooks-lifecycle]{1} [codex-cli-local-app-server-schema]{1} [pets-status]{1} [pets-status]{2} [codex-micro-status]{2} | Native and reliable. App-server is the cleanest machine-readable path. |
| Finished / unread | `notify` and TUI `agent-turn-complete`; app-server `turn/completed`; Activity `Unread`; pets `Ready`; Micro `Complete` = completed with unread update.[config-advanced-notifications]{1} [config-advanced-notifications]{2} [app-server-protocol]{10} [notifications-activity]{2} [pets-status]{1} [pets-status]{2} [codex-micro-status]{2} | Completion is native. “Unread” is native only in first-party presentation layers; it is not a documented app-server thread state or terminal hook. |
| Idle | app-server thread `idle`; hook `SessionEnd` after 30 minutes idle and not open in any connected client; Micro `Idle`.[app-server-protocol]{7} [codex-cli-local-app-server-schema]{2} [hooks-lifecycle]{3} [codex-micro-status]{2} | `idle` is native in app-server. `SessionEnd` is a delayed terminal/session-end signal, not a general immediate idle transition. |
| Error | app-server thread `systemError`; turn `failed` with error payload; pets `Blocked`; Micro `Error`.[app-server-protocol]{7} [app-server-protocol]{10} [codex-cli-local-app-server-schema]{2} [codex-cli-local-app-server-schema]{3} [pets-status]{1} [pets-status]{2} [codex-micro-status]{2} | Native and reliable for app-server. Terminal-only surfaces collapse multiple failure causes into presentation states. |

## Native vs inferred

- Native and directly machine-readable:
  - app-server thread status and turn lifecycle, including approval-related active flags in the local generated schema.[app-server-protocol]{7} [app-server-protocol]{10} [codex-cli-local-app-server-schema]{1} [codex-cli-local-app-server-schema]{2} [codex-cli-local-app-server-schema]{3}
  - TUI notification events `agent-turn-complete` and `approval-requested`.[config-advanced-notifications]{2} [config-reference-tui]{1}
  - hook events `PermissionRequest`, `Stop`, and `SessionEnd`.[hooks-lifecycle]{1} [hooks-lifecycle]{2} [hooks-lifecycle]{3}
  - Codex-owned terminal title updates via `tui.terminal_title`.[config-reference-tui]{2}

- Native but presentation-layer or terminal-capability dependent:
  - Activity unread/running/waiting groupings.[notifications-activity]{2}
  - Pets status indicators and their terminal-support constraints.[pets-status]{1} [pets-status]{2} [pets-status]{3}
  - Codex Micro’s higher-level status vocabulary, including “completed with unread update”.[codex-micro-status]{2}

- Inferred or unresolved:
  - Treating “finished/unread” as a native terminal/app-server state. The fetched protocol sources expose completion, but not a user-acknowledgment flag.[app-server-protocol]{10} [codex-cli-local-app-server-schema]{3}
  - Treating hooks alone as a full lifecycle stream. The docs explicitly narrow their coverage.[hooks-lifecycle]{4} [hooks-lifecycle]{5}
  - Assuming terminal-pet compatibility in Ghostty. The fetched pet docs name iTerm2 / Kitty-graphics / Sixel requirements and do not name Ghostty.[pets-status]{3}

## What changes the V1 detector architecture

- If Andrew wants unchanged ordinary Codex inside Ghostty, do not assume app-server can attach afterward. The fetched docs only document starting app-server first and connecting the TUI with `codex --remote`, plus reading or resuming stored threads by id; they do not document retroactive attachment to an already-running standalone TUI.{confidence: medium} [app-server-protocol]{2} [app-server-protocol]{5} [app-server-protocol]{6} [codex-cli-local-remote-modes-help]{2} [developer-commands-remote-control]{2}
- For a non-invasive native detector on an ordinary local Ghostty TUI, prefer the documented notification and hook surfaces: `notify` / TUI `agent-turn-complete` for completion, TUI `approval-requested` and hook `PermissionRequest` for needs-input, hook `Stop` for turn end, and hook `SessionEnd` for terminal/session-end idle after 30 minutes without an open client.[config-advanced-notifications]{1} [config-advanced-notifications]{2} [hooks-lifecycle]{1} [hooks-lifecycle]{2} [hooks-lifecycle]{3} {confidence: medium} This covers approval/completion/end-state transitions better than it covers continuous “working” or immediate idle.
- If V1 needs high-fidelity machine state, use a deliberate wrapper that launches Codex in the documented client mode against app-server (`codex --remote unix://...` or another documented endpoint) rather than trying to observe a normal standalone TUI from the side.[app-server-protocol]{2} [codex-cli-local-remote-modes-help]{2} This preserves the Codex terminal UI surface but changes the startup topology.
- Keep “unread” as Board-owned derived state unless the product intentionally reuses a first-party presentation surface. Native protocol evidence supports “turn completed”; it does not support a terminal/app-server unread bit.[app-server-protocol]{10} [codex-cli-local-app-server-schema]{3} [notifications-activity]{2} [codex-micro-status]{2}
- Coordinate or disable Codex’s own terminal title writer before claiming Ghostty tab-title ownership. The default title already includes Codex-managed `spinner` and `project` items, and `null` is the documented off switch.[config-reference-tui]{2}
- Even in the ordinary-TUI topology, use TUI notifications and hooks as a partial detector rather than a full runtime-state API. They are good for toast delivery and approval interception, but they do not expose the full runtime state space.[config-advanced-notifications]{2} [hooks-lifecycle]{4} [hooks-lifecycle]{5}
- Favor same-host `stdio` or Unix-socket app-server connectivity for a local control plane. The documented transports include `stdio`, `unix`, and `ws`, while the remote WebSocket path remains experimental and unsupported for production workloads.[codex-cli-local-app-server-help]{2} [app-server-protocol]{3}
- Do not plan around terminal pets as the primary supervision substrate. They only mirror the current CLI session and have explicit terminal capability limits.[pets-status]{2} [pets-status]{3}

## Disconfirming analysis

I looked for a native terminal/app-server state that explicitly means “completed and unread” and did not find one in the fetched protocol docs or the local generated schema. The nearest native protocol signal is turn completion; unread semantics appear in first-party presentation surfaces such as Activity, terminal pets, and Codex Micro instead.[app-server-protocol]{10} [codex-cli-local-app-server-schema]{3} [notifications-activity]{2} [pets-status]{1} [codex-micro-status]{2}

I also looked for a hook or notification that cleanly marks the start of “working” or an immediate transition into generic idle. The fetched hook docs expose `PermissionRequest`, `Stop`, and delayed `SessionEnd`, while notification docs expose only completion and approval-requested events.[hooks-lifecycle]{1} [hooks-lifecycle]{2} [hooks-lifecycle]{3} [config-advanced-notifications]{2} That evidence argues against a hook-only detector.

I also looked for a documented way for `codex app-server` to attach to an already-running ordinary interactive local TUI after startup. The fetched sources document the inverse topology—start app-server first, then connect the TUI with `--remote`—plus stored-thread read/resume APIs, but I did not find an official post-hoc attachment flow for a standalone Ghostty session.{confidence: medium} [app-server-protocol]{2} [app-server-protocol]{5} [app-server-protocol]{6} [codex-cli-local-remote-modes-help]{2} [developer-commands-remote-control]{2}

## Contradictions

- `app-server-protocol` shows approval-waiting as an example active state, while the local generated schema adds a second explicit active flag, `waitingOnUserInput`.[app-server-protocol]{7} [codex-cli-local-app-server-schema]{1} This is a `qualifies` relationship, not a contradiction: the local version-specific schema is narrower and more concrete than the prose example.
- No fetched source directly contradicts the others on lifecycle categories. The main difference is layer: protocol sources describe machine-readable state, while notifications, pets, and Codex Micro describe presentation semantics.[app-server-protocol]{7} [app-server-protocol]{10} [codex-cli-local-app-server-schema]{1} [codex-cli-local-app-server-schema]{2} [codex-cli-local-app-server-schema]{3} [notifications-activity]{2} [pets-status]{1} [pets-status]{2} [codex-micro-status]{2}
- The app-server docs describe `codex --remote` client attachment to an app-server endpoint, while the hook/notification docs describe side-channel signals from an ordinary local TUI.[app-server-protocol]{2} [config-advanced-notifications]{1} [config-advanced-notifications]{2} [hooks-lifecycle]{1} [hooks-lifecycle]{2} [hooks-lifecycle]{3} This is an `{incommensurable: integration-topology}` difference in integration topology, not a contradiction.

## Revisit if

- the installed CLI build changes or OpenAI revises the generated schema surface.[codex-cli-local-app-server-schema]{1} [codex-cli-local-app-server-schema]{2} [codex-cli-local-app-server-schema]{3} [codex-cli-local-app-server-help]{1}
- app-server’s experimental/unsupported WebSocket status changes, since that would affect whether a resident local daemon is necessary or whether a looser client topology becomes viable.[app-server-protocol]{3}
- OpenAI documents a supported attach-after-start flow from app-server into an already-running standalone local TUI, since that would materially change whether Agent Board can supervise normal Ghostty Codex sessions without a wrapper.{confidence: medium} [app-server-protocol]{2} [app-server-protocol]{5} [app-server-protocol]{6} [codex-cli-local-remote-modes-help]{2} [developer-commands-remote-control]{2}
- OpenAI adds unread/acknowledgment state to app-server or terminal hooks, since that would remove a major derived-state burden from Agent Board.[app-server-protocol]{10} [codex-cli-local-app-server-schema]{3}
- Ghostty support for pets becomes explicitly documented, since that could add a native terminal-surface fallback for current-session status display.[pets-status]{3}

## Acquisition candidates

- The version-specific generated JSON schemas and TypeScript bindings named by the app-server docs, because the app-server page explicitly points to generated bindings and JSON schemas as the current wire contract. Acquire these if Agent Board uses a long-lived client or must diff protocol changes across releases.[app-server-protocol]{4}

## Sources

1. `app-server-protocol` — Codex app-server docs (`https://learn.chatgpt.com/docs/app-server`)
2. `codex-cli-local-app-server-schema` — local generated app-server notification schema (`.research/source-captures/codex-cli-0.147.0/schema/ServerNotification.json`)
3. `config-advanced-notifications` — Codex advanced config, notifications (`https://learn.chatgpt.com/docs/config-file/config-advanced`)
4. `config-reference-tui` — Codex config reference, `tui` keys (`https://learn.chatgpt.com/docs/config-file/config-reference`)
5. `hooks-lifecycle` — Codex hooks docs (`https://learn.chatgpt.com/docs/hooks`)
6. `notifications-activity` — Codex notifications/activity docs (`https://learn.chatgpt.com/docs/notifications`)
7. `pets-status` — Codex pets docs (`https://learn.chatgpt.com/docs/pets`)
8. `codex-micro-status` — Codex Micro docs (`https://learn.chatgpt.com/docs/features/codex-micro`)
9. `codex-cli-local-app-server-help` — local app-server help capture (`.research/source-captures/codex-cli-0.147.0/app-server-help.txt`)
10. `codex-cli-local-remote-modes-help` — local top-level CLI help capture (`.research/source-captures/codex-cli-0.147.0/help.txt`)
11. `developer-commands-remote-control` — Codex developer commands docs (`https://learn.chatgpt.com/docs/developer-commands`)
