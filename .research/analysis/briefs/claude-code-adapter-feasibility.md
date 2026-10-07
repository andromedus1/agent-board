---
name: claude-code-adapter-feasibility
description: Read this before deciding whether or how to add Claude Code as Agent Board's second supervised adapter.
type: technical-brief
kind: research
status: locked
updated: 2026-08-20
summary: |
  {inferred: feasibility from documented primitives and current repository boundaries} A hook-based Claude Code adapter is feasible and should be materially smaller than the Codex managed-app-server adapter while preserving Claude's ordinary terminal UI. Native hooks cover session identity, permission and MCP input waits, normal completion, and API failures; prompt-start and user-interrupt edges require explicitly lower confidence until a live probe establishes a safe reconciliation rule.[claude-code-hooks]{3} [claude-code-hooks]{4} [claude-code-hooks]{5} [claude-code-hooks]{6} [claude-code-hooks]{7} [claude-code-hooks]{8}
key_findings:
  - "{inferred: recommended topology} Load a bundled hook plugin per managed Claude launch instead of modifying user settings.[claude-code-cli-reference]{3} [claude-code-hooks]{1}"
  - "PermissionRequest, Elicitation, Stop, and StopFailure provide native attention-relevant evidence.[claude-code-hooks]{5} [claude-code-hooks]{6} [claude-code-hooks]{7}"
  - "{inferred: Board state mapping} Treat UserPromptSubmit as corroborated working evidence, not an authoritative processing-start event.[claude-code-hooks]{4}"
  - "A user interrupt does not fire Stop, so stale-working recovery must remain visibly inferred.[claude-code-hooks]{8}"
  - "{inferred: topology consequence} The Agent SDK offers richer control but would no longer supervise the existing interactive Claude TUI, and normally requires API-key authentication for a third-party product.[claude-agent-sdk-streaming]{1} [claude-agent-sdk-overview]{2}"
research_method: /research
provenance: agent-synthesis
---

# Claude Code adapter feasibility

## Decision position

{inferred: feasibility from documented primitives} A Claude Code adapter is
feasible without recreating the Codex app-server
topology. The recommended first implementation is a managed `agent-claude`
launcher that starts Claude's ordinary interactive TUI with an Agent Board hook
plugin loaded only for that session. Claude documents both per-run plugin loading
and plugin-bundled hooks, so this design can avoid editing the operator's user or
project settings.[claude-code-cli-reference]{1}
[claude-code-cli-reference]{3} [claude-code-hooks]{1}

{inferred: comparison against current repository boundaries} This adapter should
be materially smaller than the Codex managed adapter. Most of Agent Board's
domain state, evidence/confidence model, session store, title projection,
attention ordering, board UI, and Ghostty control are provider-neutral. The new
surface is concentrated in a launcher, a bundled hook definition and handler, a
Claude event-to-domain translator, capability diagnostics, and scenario tests.
This relative assessment is an inference from the current repository boundaries
and documented Claude surface, not a calendar estimate.

## Evidence-to-state mapping

| Claude evidence | Board interpretation | Confidence |
| --- | --- | --- |
| `SessionStart` | `extends` Bind Claude `session_id`, cwd, transcript, and optional title to the Board session. | Native identity evidence.[claude-code-hooks]{3} |
| `UserPromptSubmit` | `{inferred: Board state mapping}` Transition toward working. | Corroborated, not authoritative: it fires before processing and another parallel hook can still block.[claude-code-hooks]{4} |
| `PermissionRequest` | `extends` Needs input for a permission decision. | Native event.[claude-code-hooks]{5} |
| `Elicitation` | `extends` Needs input for an MCP form or authentication dialog. | Native event.[claude-code-hooks]{5} |
| `Stop`, with no background work or scheduled wakeup | `extends` Completed/unread. | Native event.[claude-code-hooks]{6} |
| `Stop`, with background work or scheduled wakeup | `{inferred: Board state mapping}` Paused but not globally complete; retain working or a diagnostic intermediate state. | Native event plus adapter interpretation.[claude-code-hooks]{6} |
| `StopFailure` | `extends` Error with a provider-supplied category. | Native event.[claude-code-hooks]{7} |
| Process/session end | `{inferred: Board state mapping}` Idle/ended, or error when the launcher exits unsuccessfully. | Native process evidence combined with Board-owned interpretation. |
| User interrupt | `{inferred: recovery rule}` Reconcile out of working only with visibly inferred evidence. | Documented native gap: interrupted turns do not fire `Stop`.[claude-code-hooks]{8} |

The transcript path should remain supporting evidence, not the primary state
channel, because Claude documents that transcript persistence can lag the live
conversation.[claude-code-hooks]{10}

## Recommended topology

`agent-claude` should compose the existing provider-neutral application ports,
assign a Board session identity, and exec the installed `claude` binary with a
bundled plugin via `--plugin-dir`. The plugin's `hooks/hooks.json` should invoke a
small installed handler in exec form so arguments are passed without shell
re-parsing.[claude-code-cli-reference]{3} [claude-code-hooks]{1}
[claude-code-hooks]{2}

The handler should accept hook JSON on stdin, validate a narrow versioned-by-code
event union, and submit guarded session mutations through the same durable store
boundary used by Codex. Hook callbacks must be observation-only: success should
produce no Claude-facing context, and a Board failure must not block or alter the
agent's work.

The operator doctor should prove that the installed Claude version accepts the
plugin, the expected hooks fire, and policy has not disabled them. Managed
environments can block ordinary plugin hooks, so the adapter must expose degraded
capability rather than presenting stale or inferred status as native.
[claude-code-hooks]{9}

## Prototype gates before implementation

A disposable PTY probe should record the locally installed Claude build's event
ordering for:

- a normal prompt and response;
- a permission prompt and its resolution;
- an `AskUserQuestion` or MCP elicitation;
- an API failure;
- a user interrupt while Claude is working; and
- a response that leaves background work in flight.

The probe should also verify that a per-run plugin can call the installed handler
with a stable Board identity, remains fast, does not modify persistent Claude
settings, and leaves the normal terminal experience intact. The relevant
lifecycle event surfaces are documented, but their end-to-end ordering and Board
integration are not. Interruption recovery and background-task settlement are
the two load-bearing unknowns.[claude-code-hooks]{4}
[claude-code-hooks]{5} [claude-code-hooks]{6} [claude-code-hooks]{7}
[claude-code-hooks]{8}

## Alternatives

The Claude Agent SDK has the richer lifecycle surface. Its persistent streaming
mode supports interruption, permission requests, session management, queued
messages, and real-time feedback.[claude-agent-sdk-streaming]{1}
[claude-agent-sdk-streaming]{2} `{inferred: topology consequence}` It is not the
preferred first adapter because Agent Board would become the interactive client
instead of supervising the existing `claude` TUI. It also changes the
authentication proposition:
Anthropic directs unapproved third-party products to API-key authentication
rather than claude.ai login and rate limits.[claude-agent-sdk-overview]{1}
[claude-agent-sdk-overview]{2}

A transcript-only monitor is easier to prototype but should not be the primary
adapter. Transcript writes can lag, and inferred state would need visibly lower
confidence.[claude-code-hooks]{10} The CLI's stream-JSON hook events are also not
a shortcut for the ordinary TUI because they require print-mode output.
[claude-code-cli-reference]{1} [claude-code-cli-reference]{2}

`claude agents --json` is a useful disconfirming surface: it proves Claude has a
scriptable native view for background sessions. The documentation scopes it to
background agents, however, so it does not establish an equivalent status API
for ordinary interactive sessions.[claude-code-cli-reference]{5}

## Disconfirming analysis

A material case against the hook design is that it cannot deliver the same
authoritative active/idle pairing observed in the managed Codex app-server path.
`UserPromptSubmit` is early, parallel policy hooks may block afterward, and a
user interrupt has no closing `Stop` event.[claude-code-hooks]{4}
[claude-code-hooks]{8} If the live probe cannot bound stale-working recovery
without parsing terminal output or pretending that delayed transcript evidence
is native, the honest product should ship Claude in a degraded-confidence mode
or defer it.

A separate material concern is operational variability.
Enterprise policy can disable the plugin hook surface, and background work can
make a normal `Stop` event mean paused rather than globally finished.
[claude-code-hooks]{6} [claude-code-hooks]{9} Both conditions need visible
capability reporting and tests, not optimistic fallback.

## Contradictions

There is no source contradiction about the documented lifecycle events.
Anthropic's hook contract preserves the ordinary interactive CLI surface but has
no `Stop` event for user interruption.[claude-code-cli-reference]{1}
[claude-code-hooks]{8} Anthropic's SDK contract provides interruption control,
while its third-party authentication guidance points to API keys rather than
claude.ai login and rate limits.[claude-agent-sdk-streaming]{1}
[claude-agent-sdk-overview]{2}

{inferred: tension between the two documented surfaces} Using the SDK would make
Agent Board the interactive client rather than a supervisor of the existing
`claude` TUI. The recommended hook design therefore favors interface continuity
and honest confidence metadata over nominal state parity.

## Revisit when

Re-run this decision if Claude adds a supported all-session status API, a native
turn-start/interrupt hook pair, or a third-party SDK authentication path that
preserves the user's normal Claude subscription experience. Also re-engage if
the disposable runtime probe contradicts the documented event sequence on the
minimum supported Claude version.
