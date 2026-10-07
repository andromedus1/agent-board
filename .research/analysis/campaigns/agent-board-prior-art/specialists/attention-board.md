---
title: Attention-board state models and evolution paths
provenance: agent-synthesis
updated: 2026-08-14
campaign: agent-board-prior-art
facet: attention-board
---

# Attention-board state models and evolution paths

## Executive finding

The proposed five symbols are sufficient as the first human-facing projection, but not as the canonical stored state. Direct supervisors routinely present three to six labels, yet their behavior depends on facts outside those labels: whether a stopped result has been acknowledged, whether the process is alive, how fresh the observation is, which signal produced it, and whether the integration can safely act. ccmux displays only idle/working/waiting while separately checking process liveness and clearing notifications on focus [ccmux-readme]{1} [ccmux-readme]{4}; Codirigent makes the focus-dependent unread result a separate `Ready` display state [codirigent-readme]{1}; another agent-deck explicitly defines waiting as stopped/unacknowledged and idle as stopped/acknowledged [ashesh-agent-deck-tui]{1}.

{inferred: convergence} Agent Board should therefore keep the visible contract exactly as simple as proposed while deriving it from small orthogonal fields. This is not an argument for a large state machine or daemon in V1; it is a guard against making `finished / unread` and `error / dead / stale` irreversible schema mistakes.

## Representative product patterns

### Direct terminal supervisors

ccmux addresses the attention-routing problem by discovering agent sessions, streaming a local state view, offering both interactive and JSON/diagnostic commands, and rendering a compact sidebar by project [ccmux-readme]{3} [ccmux-readme]{5}. Its architecture also shows a practical identity hierarchy: hook-written PID/TTY/session markers are authoritative; process-time correlation is a fallback; ambiguous matches are left unbound rather than guessed [ccmux-readme]{2}. That last behavior is more important to Agent Board than ccmux’s tmux transport: identity uncertainty should be visible, not silently resolved.

Codirigent’s `Ready` label is explicitly conditional on a completed response being in an *unfocused* session [codirigent-readme]{1}. The asheshgoplani agent-deck makes the same distinction through acknowledgement, including a manual “mark unread” action [ashesh-agent-deck-tui]{1} [ashesh-agent-deck-tui]{2}. {inferred: convergence} These products treat “finished” as an attention condition laid over a non-working session, not as a terminal lifecycle fact.

Ilmari documents a machine-consumer contract in which a versioned snapshot includes identity, observation time, revision, TTL, warnings, state, workspace, and Git facts, and consumers must reject stale or incompatible observations [ilmari-readme]{1}. It separately maps raw status to a consumer-facing state and suggested intent [ilmari-readme]{2}. {inferred: design transfer} A V1 file store can adopt the same principles—version, timestamp, freshness rule, stable identity, render-neutral fields—without adopting a socket, MCP server, or tmux.

### Local companions and evidence quality

Agent Island derives status from local records without a cloud account, but its engineering note says no single signal is reliable: file writes can be bookkeeping, transcript completion can be stale, and desktop activity can lag [agent-island-status-monitor]{1}. It expires completed-turn attention, suppresses startup-history alerts, filters archives/subagents/duplicates, and warns that transcript activity cannot prove task correctness or process health [agent-island-status-monitor]{3} [agent-island-status-monitor]{4} [agent-island-status-monitor]{5}. {inferred: design transfer} Agent Board needs an explicit observation timestamp and evidence descriptor even if the first Codex adapter eventually has an authoritative hook path.

AgentDeck supplies the richer future architecture. Its protocol separates registration metadata from state pushes [agentdeck-protocol]{2}; its adapter abstraction carries agent type, capabilities, and several evidence channels [agentdeck-architecture]{3}; and it states that PTY output is not lifecycle authority [agentdeck-architecture]{2}. These are useful boundary rules. Its multi-client daemon and hardware modules, however, solve a later distribution/control problem [agentdeck-protocol]{1} [agentdeck-architecture]{4}.

## Recommended minimal state contract

{inferred: synthesis} Store one record per observed agent session with four layers:

```text
identity
  board_session_id
  adapter + native_session_id?
  terminal_session_id?
  project_label              # user-controlled
  repo_path? + git_branch?

activity
  idle | working

attention
  none | completion_unread | input_required

health
  live | stale | exited | error

observation
  observed_at
  evidence_kind              # native-event | hook | transcript | process | terminal
  confidence                 # authoritative | corroborated | inferred
  detail?                    # adapter-owned reason, bounded for display
```

The visible symbol remains a priority projection:

```text
health=error                         -> × error
attention=input_required             -> ! needs input
attention=completion_unread           -> ✓ finished / unread
activity=working and observation fresh -> ● working
activity=idle and health=live         -> ○ idle
health=stale|exited                    -> hide, expire, or mark disconnected
```

{inferred: design choice} `stale` and `exited` should not automatically become `error`. Agent Island explicitly treats stale/silent evidence as a hint rather than a diagnosis [agent-island-status-monitor]{5}, while AgentDeck has a separate disconnected lifecycle state [agentdeck-protocol]{3} [agentdeck-protocol]{4}. The V1 board may omit expired sessions by default and offer a terse stale annotation during a grace window; the foundation specification should settle that presentation as a product-taste decision.

The record should also carry a schema version and atomic-update discipline. A plain local file or small directory of per-session records can satisfy V1; Ilmari’s TTL/revision contract demonstrates why readers need freshness and compatibility metadata even with a local state interface [ilmari-readme]{1}. A resident daemon becomes justified only when a later consumer needs live subscriptions, aggregation, or bidirectional control.

## Identity, registration, and acknowledgement

{inferred: synthesis} Identity should be layered rather than overloaded:

- `board_session_id` is Agent Board’s stable key for one registered terminal-agent instance.
- `project_label` is editable presentation and never an identity key.
- `repo_path` and branch are discoverable context; neither uniquely identifies a concurrent session.
- `native_session_id` and terminal metadata are adapter bindings whose absence or ambiguity must be reportable.

ccmux’s refusal to guess when same-project processes cannot be reliably paired supports this conservative binding rule [ccmux-readme]{2}. AgentDeck’s registration separates session ID from project name and host metadata [agentdeck-protocol]{2}.

{inferred: synthesis} Acknowledgement should be an explicit transition caused by returning focus to the relevant tab/session, naming/registration startup policy, or a small manual command—not inferred merely from elapsed time. Elapsed time should expire stale alerts, but it is not evidence that the operator read a result. ccmux clears a notification when its pane gains focus [ccmux-readme]{4}, and the two “waiting versus idle” implementations define the distinction in acknowledgement terms [codirigent-readme]{1} [ashesh-agent-deck-tui]{1}.

## What to preserve from the old vision

The following should be preserved as named deferred options, not as V1 dependencies:

| Deferred option | Evidence-backed value | Entry condition |
|---|---|---|
| Resident daemon/event hub | One source can stream state to several software and hardware surfaces; ccmux uses local HTTP/SSE [ccmux-readme]{3}, while AgentDeck uses a single multi-client hub [agentdeck-protocol]{1}. | Add when polling/atomic files no longer meet immediacy, or when two independent long-lived consumers need subscriptions. |
| Multiple agent adapters | Existing supervisors normalize many CLIs [ccmux-readme]{5}; AgentDeck models type, capabilities, and unified adapter events [agentdeck-architecture]{3}. | Keep the V1 Codex implementation behind a narrow adapter contract; add a second adapter only after the Codex slice is trustworthy. |
| tmux compatibility adapter | tmux products demonstrate discovery, focus, preview, and action-queue patterns [ccmux-readme]{5} [ilmari-readme]{2}. | Optional future integration for users who already choose tmux; never a core runtime dependency for the Ghostty workflow. |
| Focus/navigation | Direct supervisors reduce attention cost by switching to the selected session [ccmux-readme]{5}; Ilmari exposes suggested next intent without giving its MCP surface control tools [ilmari-readme]{2} [ilmari-readme]{3}. | Add only after terminal identity/focus targeting is reliable; keep observation and action capabilities separate. |
| Notifications | ccmux documents notifications for waiting and finished transitions, actions on some waiting notifications, and clearing a notification when its session gains focus [ccmux-readme]{4}. | Add after false-positive and acknowledgement behavior is measured in terminal V1. |
| Menu-bar/always-on-top views | {inferred: deferred option} Preserve these as possible later display surfaces without treating the sampled notification evidence as validation. | Consider only after the terminal board proves that a persistent secondary surface would reduce attention cost. |
| Capability-gated semantic controls | AgentDeck gates actions using adapter capabilities [agentdeck-architecture]{3}; ccmux documents that its controls are mapped keystrokes and suppresses them when routing is ambiguous [ccmux-readme]{4}. | Require a native semantic capability and exact session binding; never label generic keystrokes as semantic approval. |
| Simulated device / surface emulator | AgentDeck keeps renderers downstream of one daemon/state source across many physical and software surfaces [agentdeck-protocol]{1}. | Reintroduce as a protocol/rendering test client only when an external display contract exists. |
| Hardware displays and controls | AgentDeck demonstrates that one state hub can drive Stream Deck, mobile, e-ink, ESP32, and LED surfaces [agentdeck-architecture]{1} [agentdeck-architecture]{4}. | Start only after the software control plane proves which states and interactions deserve persistent physical affordances. |
| Remote aggregation | AgentDeck’s registration and state channel carries host and explicit remote-attach metadata [agentdeck-protocol]{2}. | Defer until multi-machine demand is observed; preserve local-only as the default. |

{inferred: prioritization} The backlog should preserve the product options and their entry conditions, not preserve old implementation commitments. In particular, “tmux supervisor,” “daemon,” and “hardware controller” should not be phrased as inevitable phases.

## Smallest migration implication

{inferred: synthesis} The first implementation path supported by this facet is:

1. Define a versioned session record with separated identity, activity, attention, health, and observation evidence.
2. Implement registration and human label updates independently of Codex observation.
3. Implement one Codex adapter that reports ranked evidence without pretending inferred state is native.
4. Atomically publish the record to a local store; render both the complete Ghostty title and the `agents` list from that record.
5. Implement acknowledgement and stale-session expiry before adding notifications.
6. Measure missed/false transitions in daily use; introduce a daemon only if real-time multi-consumer requirements emerge.

This preserves the new Ghostty/Codex-first product proof while keeping the old vision’s scalable boundaries available.

## Disconfirming analysis

A direct counterexample to the multidimensional internal model is ccmux: it publicly defines only three core session states and still provides a useful multi-agent dashboard [ccmux-readme]{1}. AgentDeck also uses a six-state lifecycle machine rather than four independent axes [agentdeck-protocol]{3}. This shows that a flat enum can work when one process owns all transitions and its auxiliary data remains private.

That evidence does not support exposing every axis in V1. It does support keeping the *implementation* small. The contrary evidence was tested against acknowledgement and liveness behavior: ccmux separately clears notifications on focus and checks process liveness [ccmux-readme]{1} [ccmux-readme]{4], while Codirigent and asheshgoplani agent-deck encode unread/acknowledged state in their labels [codirigent-readme]{1} [ashesh-agent-deck-tui]{1}. {inferred: qualification} A compact record with orthogonal fields is warranted; a generalized workflow engine is not.

Evidence favoring an immediate daemon is that both ccmux and AgentDeck use one to provide reactive state across clients [ccmux-readme]{3} [agentdeck-protocol]{1}. The disconfirming source is Agent Island, which computes a useful status companion locally from files within the app [agent-island-status-monitor]{1}. {inferred: qualification} A daemon is an available scaling pattern, not evidence of a V1 requirement.

Evidence favoring terminal-output inference is compatibility: Ilmari says capture can improve classification for adapters that need terminal text [ilmari-readme]{4}. The contrary evidence is that the same capture can expose sensitive content [ilmari-readme]{4}, AgentDeck says PTY output is not lifecycle authority [agentdeck-architecture]{2}, and Agent Island documents ambiguity even among local semantic records [agent-island-status-monitor]{1}. {inferred: qualification} Terminal parsing may be a bounded fallback with an explicit inferred confidence, never the silent canonical truth.

## Contradictions

### State-model granularity — tension

- ccmux presents idle, working, and waiting as the session state vocabulary [ccmux-readme]{1}.
- AgentDeck models disconnected, idle, processing, and three distinct awaiting states [agentdeck-protocol]{3} [agentdeck-protocol]{4}.
- Agent Island models idle, working, your turn, stalled, authentication required, and rate limited [agent-island-status-monitor]{2}.
- Codirigent models idle, working, attention, and an unfocused completed response as ready [codirigent-readme]{1}.

These vocabularies serve different product projections and are not evidence for one universal enum. {inferred: resolution} Agent Board can preserve a five-symbol UI while normalizing only the dimensions needed to derive it.

### Lifecycle authority — tension

- AgentDeck assigns lifecycle authority to hooks and uses terminal observation only for affordances hooks cannot see [agentdeck-architecture]{2} [agentdeck-protocol]{3}.
- Agent Island says its available local signals are individually insufficient and combines them conservatively [agent-island-status-monitor]{1}.

The difference may reflect distinct provider interfaces rather than a factual disagreement. {incommensurable: adapter evidence availability} Agent Board should rank evidence per adapter instead of declaring one acquisition mechanism universally authoritative.

### Control semantics — tension

- ccmux offers notification actions but states that these send mapped keystrokes; it withholds actions when pane-to-dialog routing is ambiguous [ccmux-readme]{4}.
- AgentDeck exposes adapter capabilities and gates commands according to them [agentdeck-architecture]{3}.

For Agent Board’s fixed guardrail, the first pattern is useful evidence about risk, while the second is the safer future boundary: display-only unless an adapter exposes a trustworthy semantic action.

## Source-grounded acquisition candidates

- `puritysb/AgentDeck` `shared/src/states.ts`: the fetched protocol calls it the single source of truth for the six-state transition table [agentdeck-protocol]{3}. Acquire if transition precedence or recovery rules become architecture-load-bearing.
- `epilande/ccmux` `docs/architecture.md` and `docs/agent-adapters.md`: the fetched README names these as the deeper sources for detection cascades, binding, hooks, and provider-owned files [ccmux-readme]{2}. Acquire before specifying a cross-agent adapter contract.
- Agent Island’s linked seven-state taxonomy and open-source scanner/state tests: the fetched engineering article identifies them as its evidence rules and implementation substrate [agent-island-status-monitor]{2} [agent-island-status-monitor]{5}. Acquire if stale thresholds, startup suppression, or Codex transcript inference enter V1.
- AgentDeck’s wire-compatibility contract: the fetched protocol identifies it as mandatory reading before changing the multi-client protocol [agentdeck-protocol]{1}. Acquire only if a daemon or external display protocol is promoted from backlog.

## Revisit if

- A future Codex interface supplies a stable event stream covering session start/end, work start/end, approval/input requests, and failure; evidence confidence may collapse to a simpler native path.
- Ghostty exposes reliable tab identity and focus events; acknowledgement and click-to-focus can become native rather than inferred.
- User testing shows `finished` and `needs input` do not need independent acknowledgement behavior.
- More than one long-lived consumer needs live updates, or atomic file reads fail the immediacy target; reconsider a resident daemon or local socket.
- A second agent adapter is approved; validate that the normalized fields represent actual shared semantics rather than Codex-shaped names.
- Hardware or remote aggregation is promoted; acquire the deferred protocol sources and revisit authentication, compatibility, discovery, and capability negotiation.
