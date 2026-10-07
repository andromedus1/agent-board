---
description: Read this before defining Agent Board scope or architecture; it maps direct and adjacent prior art and resolves the first Ghostty/Codex integration choices.
type: landscape
kind: research
status: locked
updated: 2026-08-14
summary: |
  The landscape supports a narrow Ghostty-first attention board, a multidimensional internal state projected into five simple symbols, and machine-maintained Ghostty tab-title overrides. Codex state fidelity depends on a consequential launch-topology choice: partial side-channel observation of an ordinary TUI or a managed remote TUI backed by app-server.
key_findings:
  - The new Ghostty/Codex-first notes are a better V1 than the earlier daemon, tmux, multi-agent, simulated-device scope.
  - The five visible symbols should be derived from identity, activity, attention, health, and evidence rather than stored as canonical state.
  - Ghostty 1.3+ AppleScript IDs and targeted set_tab_title actions are more reliable than OSC title ownership.
  - With medium confidence, Codex app-server provides high-fidelity state while the fetched official material does not document retroactive attachment to an ordinary already-running TUI.
  - An unchanged Codex TUI exposes useful completion, approval, stop, and delayed-session-end signals but not a complete working/idle model.
  - A local atomic store is sufficient for the first proof; a daemon becomes justified by subscriptions, proactive notifications, or multiple live consumers.
  - Deferred daemon, adapters, focus, software surfaces, simulator, hardware, and remote aggregation should be preserved with evidence-based entry conditions.
research_method: /scout
provenance: agent-synthesis
---

# Agent Board prior-art landscape

## Executive position

The evolved Ghostty-first notes should supersede the old MVP hypothesis. They
test the same durable thesis—make human attention legible across concurrent
agents—through the operator's actual workflow rather than through a speculative
daemon, tmux transport, simulated hardware client, and two agent integrations.

Direct supervisors validate the need for a compact attention view, editable
project identity, completion/unread behavior, liveness handling, and eventual
focus navigation. ccmux, for example, renders a small project-oriented state
view while keeping process liveness and focus acknowledgement outside its three
visible state labels [ccmux-readme]{1} [ccmux-readme]{4}. Codirigent and another
agent-deck likewise distinguish completed-but-unread attention from an
acknowledged stopped session [codirigent-readme]{1}
[ashesh-agent-deck-tui]{1}.

{inferred: synthesis} These products support the proposed five-symbol interface,
but they do not support using those symbols as the complete stored state model.
A proportionate trustworthy design stores a few orthogonal facts and derives
the glyph shown in the tab and `agents` board.

## Prior-art map

### Direct supervisors

- ccmux offers a close terminal attention-router analogue: local discovery, a
  compact project/session view, diagnostics, notifications, and focus behavior
  [ccmux-readme]{3} [ccmux-readme]{5}. Its tmux dependency is an implementation
  choice Agent Board should not inherit.
- Codirigent and agent-deck-style TUIs demonstrate that “ready” or “waiting” is
  often completion plus acknowledgement state, not merely a process lifecycle
  value [codirigent-readme]{1} [ashesh-agent-deck-tui]{1}.
- Agent Island demonstrates a local companion that combines imperfect evidence
  conservatively and explicitly warns that activity records cannot prove task
  correctness or process health [agent-island-status-monitor]{1}
  [agent-island-status-monitor]{5}.
- AgentDeck demonstrates the later multi-consumer architecture: registration is
  separate from state pushes, adapters carry capabilities and evidence, and PTY
  output is not treated as lifecycle authority [agentdeck-protocol]{2}
  [agentdeck-architecture]{2} [agentdeck-architecture]{3}.

### First-party Codex surfaces

Codex itself already uses presentation states close to the proposed vocabulary.
Activity groups work into unread, running, and waiting categories; Codex Micro
defines completion as a completed task with an unread update
[notifications-activity]{2} [codex-micro-status]{2}. These are useful semantic
precedents, not reusable machine-state APIs.

The machine-readable app-server protocol exposes active/idle/error thread state,
approval and user-input flags in the installed schema, and explicit turn
outcomes [app-server-protocol]{7} [codex-cli-local-app-server-schema]{1}
[codex-cli-local-app-server-schema]{2}
[codex-cli-local-app-server-schema]{3}. The ordinary TUI exposes narrower
notification and hook events for completion, approval, stop, and delayed
session end [config-advanced-notifications]{1}
[config-advanced-notifications]{2} [hooks-lifecycle]{1}
[hooks-lifecycle]{2} [hooks-lifecycle]{3}.

### Ghostty as the first terminal adapter

Ghostty 1.3 introduced an official macOS AppleScript object model with stable
window, tab, and terminal IDs, active-context lookup, focus/selection, and
targeted action execution [ghostty-applescript]{1} [ghostty-applescript]{3}
[ghostty-applescript]{4}. Its `set_tab_title` action is programmatically
updateable, takes precedence over terminal program titles, and can be cleared
to restore normal behavior [ghostty-actions-title]{1}
[ghostty-actions-title]{3}.

This disconfirms an OSC-only default. Ghostty accepts OSC 2, but its own zsh
integration also emits OSC 2 at prompt and command boundaries
[ghostty-osc2]{1} [ghostty-zsh-title]{1} [ghostty-zsh-title]{2}. {inferred:
sublation} The original note was right that a human-owned manual title cannot
leave a dynamic prefix to another writer; the stronger mechanism is for Agent
Board to own and continuously update the complete tab override itself.

## Recommended product model

### One small record, two projections

{inferred: synthesis} Store one versioned record per supervised agent session:

```text
identity
  board_session_id
  project_label                 # user-controlled presentation
  repo_path? + git_branch?
  adapter + native_session_id?
  ghostty_window_id + tab_id + terminal_id

activity
  unknown | idle | working

attention
  none | completion_unread | input_required

health
  live | stale | exited | error

observation
  observed_at
  evidence_kind                 # app-server | hook | notification | process
  confidence                    # authoritative | corroborated | inferred
  detail?
```

The visible state is a priority projection rather than another mutable field:

```text
health=error                           -> × error
attention=input_required               -> ! needs input
attention=completion_unread             -> ✓ finished / unread
activity=working and observation fresh -> ● working
activity=idle and health=live           -> ○ idle
stale/exited                            -> expire or show diagnostically, never idle
```

This retains one source of truth while letting the tab stay peripheral and
terse and the board show freshness, evidence, or stale diagnostics when useful.
Ilmari's machine-consumer snapshot similarly includes identity, revision, TTL,
observation time, warnings, and state, and requires consumers to reject stale
or incompatible observations [ilmari-readme]{1}.

### Explicit registration is a feature, not friction

`agent-name data-platform` should be the identity handshake. While the target
tab is focused, it records Agent Board's session ID, the human label, repo
context, and Ghostty's current window/tab/terminal IDs. Ghostty documents both
the active-context chain and stable object IDs [ghostty-applescript]{1}
[ghostty-applescript]{2}. Project name and path are context, not join keys;
concurrent sessions may share either.

The first proof should declare one supervised agent per Ghostty tab. Ghostty
supports multiple terminal surfaces in one tab, but one tab-title override is
shared at tab scope [ghostty-applescript]{1}. Supporting split aggregation now
would add ambiguity without serving the stated workflow.

### Machine-maintained title override

On every name or state change, render the complete value from the stored record
and target the registered terminal with Ghostty's `set_tab_title` action. Use
OSC 2 only as a lower-confidence compatibility adapter.

Setup must detect three conflicts:

1. Codex's TUI writes terminal titles by default; `tui.terminal_title = null`
   is its documented off switch [config-reference-tui]{2}.
2. Ghostty's global `title` setting suppresses terminal-driven titles and should
   be rejected or explained [ghostty-config-title]{1}.
3. Ghostty's bell title decoration can prepend a bell glyph, so fixed-position
   status requires disabling only the title bell feature
   [ghostty-config-title]{4}.

AppleScript enablement and macOS Automation permission are explicit installation
requirements, not silent fallback conditions [ghostty-applescript]{5}
[ghostty-config-title]{5}.

### Codex detector topology is the remaining product choice

{confidence: medium} The fetched official material does not document post-hoc
attachment from app-server into an already running ordinary Codex TUI. It
documents the inverse topology:
start app-server, then connect the TUI using `codex --remote`; stored-thread
read/resume is not attachment to another live process [app-server-protocol]{2}
[app-server-protocol]{5} [app-server-protocol]{6}
[codex-cli-local-remote-modes-help]{2}
[developer-commands-remote-control]{2}.

That leaves two honest first-adapter modes:

#### Ordinary-TUI mode

Keep the current `codex` startup unchanged and combine documented notifications
and hooks. This natively captures completion, approval, stop, and delayed session
end, but it cannot authoritatively distinguish continuous working from immediate
idle or every user-input wait [config-advanced-notifications]{1}
[config-advanced-notifications]{2} [hooks-lifecycle]{1}
[hooks-lifecycle]{2} [hooks-lifecycle]{3}.

This preserves the existing launch workflow. Its record must carry inferred
or partial confidence, and the UI must not claim native certainty.

#### Managed-TUI mode

Provide a small launch wrapper that starts a local app-server endpoint and then
connects the normal Codex terminal UI with `codex --remote`. This preserves the
Ghostty TUI surface while giving Agent Board the documented machine-readable
thread and turn state [app-server-protocol]{2} [app-server-protocol]{7}
[app-server-protocol]{10} [codex-cli-local-app-server-schema]{1}
[codex-cli-local-app-server-schema]{2}
[codex-cli-local-app-server-schema]{3}
[codex-cli-local-remote-modes-help]{2}.

This is the high-fidelity path. It changes the launch topology and inherits a
version-sensitive protocol contract, so it requires a focused prototype before
being called the default.

{inferred: recommendation} Prototype both paths, but treat managed-TUI mode as
the candidate supported V1 if reliable five-state behavior remains a success
criterion. Ordinary-TUI mode can remain a visibly lower-confidence adapter.

## Liveness, acknowledgement, and process shape

{inferred: synthesis} Reconcile stored Ghostty IDs against the live AppleScript hierarchy whenever
`agents` reads the store and whenever an adapter writes state. Process liveness
alone is insufficient because Ghostty undo-close can retain a hidden process
after its surface closes [ghostty-release-1-2]{1}. Missing surfaces should become
bounded disconnected tombstones, not errors or idle sessions.

{inferred: synthesis} Completion and unread are separate facts. A native turn-completed event sets
`completion_unread`; acknowledgement should be an explicit transition such as
the next user interaction or a later reliable focus signal, not elapsed-time
guessing. Direct supervisors clear attention on focus or model acknowledged and
unacknowledged stopped states separately [ccmux-readme]{4}
[ashesh-agent-deck-tui]{1}.

{inferred: synthesis} A resident `agent-boardd` is not required for the first proof. Atomic per-session
records or one atomically replaced local snapshot can support registration,
adapter writes, title rendering, and `agents` reads. A long-lived process earns
its place when the product needs proactive notifications with no command active,
subscriptions for multiple consumers, bidirectional control, or remote/hardware
clients [ccmux-readme]{3} [agentdeck-protocol]{1}.

## What survives from the old vision

The earlier brief contains good future options but poor V1 dependencies.
Preserve these as backlog ideas with entry conditions after `.work/` exists:

| Deferred option | Preserve because | Activate when |
| --- | --- | --- |
| Resident daemon/event hub | Enables subscriptions and several live clients. | Polling/atomic writes miss the immediacy target or a second live consumer exists. |
| Additional agent adapters | Vendor neutrality remains a product requirement. | The Codex adapter is trustworthy and a real second-agent workflow is selected. |
| Optional tmux adapter | Existing supervisors demonstrate mature discovery/focus patterns. | A tmux-using audience is intentionally supported; never a Ghostty V1 dependency. |
| Focus/jump | Ghostty has official terminal focus and tab-selection APIs [ghostty-applescript]{3}. | Registered identity is reliable and attention false positives are acceptable. |
| Notifications/menu bar/always-on-top view | Useful downstream projections of the same attention state. | Completion/input/error transitions and acknowledgement have been measured. |
| Capability-gated semantic actions | Native adapter capabilities can safely expose richer control [agentdeck-architecture]{3}. | A native semantic capability and unambiguous session binding both exist. |
| Simulated external surface | Can test a stable display/control protocol before hardware. | An external consumer contract has earned a place. |
| Physical display and controls | Ambient hardware remains a plausible expression of the control plane [agentdeck-architecture]{1}. | Software usage reveals which states and actions deserve physical persistence. |
| Remote aggregation | Registration protocols can carry host metadata [agentdeck-protocol]{2}. | Multi-machine demand is observed; local-only remains the default. |

Preserve the option and its activation evidence, not an inevitable roadmap phase.

## Smallest migration path

There is no code to migrate. The repository contains only the old concept brief
and README, so migration is a correction of canonical intent:

1. Create foundation documents from the Ghostty-first direction and this Scout.
2. Mark the old project brief historical and point it to the new foundation set;
   retain its useful review findings and deferred ideas.
3. Define the normalized record and five-symbol projection at contract level,
   leaving implementation technology open.
4. Run one focused pre-architecture prototype comparing ordinary-TUI side-channel
   coverage with managed `codex --remote` app-server coverage.
5. Prototype Ghostty registration/title/liveness against the installed 1.3+
   application, including the undo-close enumeration edge.
6. Settle the detector topology as a product-taste decision, then firm detailed
   architecture and bootstrap `.work/`.

## Disconfirming analysis

The new notes initially assumed OSC ownership and a reliably detectable five-state
Codex model. Official Ghostty evidence does not support OSC exclusivity, while the
fetched Codex evidence does not support non-invasive full-fidelity observation of an arbitrary
already-running TUI [ghostty-zsh-title]{1} [app-server-protocol]{2}
[app-server-protocol]{5} [app-server-protocol]{6}
[codex-cli-local-remote-modes-help]{2}. The direction survives because targeted
Ghostty overrides and a managed remote TUI provide narrower mechanisms; the
assumptions do not survive unchanged.

The old brief argued for a daemon, tmux, and multiple clients early. Agent Island
demonstrates useful local status synthesis without a multi-client daemon
[agent-island-status-monitor]{1}, and Ghostty now exposes direct stable tab
identity and focus [ghostty-applescript]{1} [ghostty-applescript]{3}. Those
findings remove the architectural necessity of tmux and a daemon from V1.

A flat state enum remains a plausible implementation counterexample: ccmux
presents only three main session states and is useful [ccmux-readme]{1}. But it
still handles liveness and focus acknowledgement separately
[ccmux-readme]{4}. {inferred: qualification} The evidence supports a small record
with orthogonal facts, not a generalized workflow engine.

## Contradictions

### High fidelity versus unchanged startup — incommensurable

- App-server supplies the state fidelity the proposed five symbols need
  [app-server-protocol]{7} [app-server-protocol]{10}
  [codex-cli-local-app-server-schema]{1}
  [codex-cli-local-app-server-schema]{2}
  [codex-cli-local-app-server-schema]{3}.
- The fetched official material documents starting app-server first and connecting the
  TUI; it does not document retroactive attachment to an ordinary running TUI
  [app-server-protocol]{2} [codex-cli-local-remote-modes-help]{2}.

These are different integration modes. Foundation docs should not claim both
unchanged startup and authoritative five-state observation without a prototype.

### Minimal state versus truthful state — tension

- Direct tools successfully present three to six labels [ccmux-readme]{1}
  [agentdeck-protocol]{3} [agent-island-status-monitor]{2}.
- Their implementation behavior still depends on acknowledgement, liveness,
  freshness, evidence, or capabilities outside the labels
  [ccmux-readme]{4} [ilmari-readme]{1} [agentdeck-architecture]{3}.

The five glyphs remain the interface; the small orthogonal record is their
truthful substrate.

### Daemon now versus daemon later — tension

- ccmux and AgentDeck use resident hubs for reactive multi-client behavior
  [ccmux-readme]{3} [agentdeck-protocol]{1}.
- Agent Island demonstrates a useful local status companion without making a
  networked hub the product boundary [agent-island-status-monitor]{1}.

The difference follows consumer count and proactivity requirements. Neither
supports adding a daemon before those requirements exist.

## Revisit if

- OpenAI documents app-server attachment to an already-running standalone TUI.
- Codex adds working-start, immediate-idle, general-input, or unread state to
  ordinary TUI hooks/notifications.
- Ghostty ships foreground PID/TTY properties in a stable AppleScript dictionary.
- A prototype shows `codex --remote` materially degrades the current terminal UX.
- More than one supervised agent per Ghostty tab becomes a real requirement.
- Notifications or an external display become necessary while no command is
  active, justifying a resident event hub.
