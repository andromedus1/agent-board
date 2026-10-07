---
description: Read this only for the historical pre-Scout Agent Board concept and the broader ideas that were later narrowed.
type: north-star
kind: historical
status: superseded
updated: 2026-08-14
superseded_by: docs/VISION.md
supersession_note: |
  Superseded by the 2026-08-14 Ghostty/Codex-first foundation set. Retained because its trust, capability, adapter, and future hardware observations remain useful historical input and preserved future options.
summary: |
  Historical checkpoint for the earlier daemon, tmux, multi-agent, simulated-device, and premium-hardware concept. Current product truth lives in VISION, SPEC, ARCHITECTURE, PRINCIPLES, and the verified Scout landscape.
---

# Agent-Board concept checkpoint

> Historical checkpoint, superseded by `docs/VISION.md`. This file preserves the
> broader option space and review findings; it is not current product scope.

## Product thesis

Developers increasingly supervise several coding agents across terminal panes,
projects, applications, and providers. Repeatedly polling every session creates
cognitive overhead and makes the user the scheduler.

Agent-Board should make attention legible. At a glance, a user should understand
which sessions are working, waiting for input, awaiting approval, complete, or
failed. Activating a session control should focus the correct pane or application
and expose only actions the integration can perform safely.

The physical device is one expression of this control plane, not the entire
product. The durable product value is reliable lifecycle normalization,
attention routing, navigation, and safe action semantics.

## Reviewed product shape

The complete direction combines:

- a premium wireless desktop device;
- a local daemon (`agent-boardd`);
- native agent adapters and a generic process fallback;
- terminal and application navigation;
- a configuration and diagnostics interface; and
- an open device/software protocol.

The eventual device may have six to eight RGB session keys, command controls, a
rotary encoder, a compact display, BLE, optional low-latency wireless, USB-C,
and a rechargeable battery. These are hypotheses, not locked requirements.

## Key review findings

### Attention routing is the wedge

The product succeeds by reducing supervision cost, not typing cost. The core
interaction is “show me where I am needed and take me there.” Macro-pad features
are secondary unless they support that loop.

### Trustworthy state is the hard problem

Process existence is not agent state. A wrapper can observe process lifecycle,
tmux position, output activity, and exit status, but it cannot safely infer
semantic states such as “approval requested” without a native event source.

The model should keep at least these dimensions distinct:

- lifecycle state: starting, working, waiting, complete, failed, disconnected;
- attention state: none, unread, input needed, approval needed, urgent;
- activity: idle, generating, tool execution, user interaction;
- confidence/source: native, protocol, terminal-derived, process-derived;
- capabilities: focus, interrupt, send input, approve, decline, restart, inspect.

### Safety is a capability contract

Focusing a pane and interrupting a process are broadly implementable. Approval,
decline, context compaction, model selection, and reasoning changes are semantic
actions and require adapter support. The UI and device must never offer a native
semantic action when only a generic keystroke is available.

### Vendor neutrality needs a narrow first proof

The architecture should admit multiple agents and terminals, but the first proof
should optimize for one coherent path: macOS + tmux + Codex/Claude, with Ghostty
as the initial terminal experience. Generic wrappers provide degraded coverage,
not feature parity.

### Hardware should follow software learning

A simulated six-key client can validate mapping, state transitions, unread
behavior, focus, interruption, reconnects, and control semantics without locking
radio, battery, PCB, switch, display, or enclosure choices prematurely.

## MVP hypothesis

The first end-to-end software prototype should include:

1. `agent-boardd` with local registration and event transport;
2. an Agent-Board CLI for inspection and diagnostics;
3. a normalized multidimensional session model;
4. tmux target registration and focus;
5. one native Codex adapter and one native Claude adapter;
6. a generic wrapped-process adapter with visibly lower confidence/capability;
7. a simulated six-key client;
8. focus, interrupt, unread/acknowledge, disconnect, and failure behavior; and
9. a minimal local configuration/diagnostics UI.

Launch/restart, diff/log/repository shortcuts, semantic approval, alternative
terminals, radio hardware, and industrial design should be added only when their
requirements are grounded and the core loop is reliable.

## Success criterion

A user can supervise several Codex and Claude sessions, immediately identify the
session with the highest-value attention request, press one control to reach it,
and trust that displayed state and available actions accurately reflect the
integration's evidence and capability.

## Questions for the next discovery arc

- Which current products and open-source tools already address agent attention,
  terminal session control, or programmable desktop surfaces?
- What native lifecycle/event interfaces do current Codex and Claude CLIs expose?
- Which state transitions can be observed reliably through wrappers, tmux, or
  terminal protocols, and how should confidence degrade?
- Is tmux the correct first navigation substrate, or should the daemon define a
  terminal/application locator abstraction immediately?
- What latency, battery-life, reconnect, pairing, and security targets would make
  a premium wireless device credible?
- Which display/key configuration best supports six to eight concurrent sessions
  without turning the device into a miniature dashboard?
- Who is the initial buyer, what workflow intensity justifies dedicated hardware,
  and what price/quality bar does “premium” imply?
- Which protocol and local security boundaries are required before adapters may
  expose semantic actions?

## Historical next entrypoint

The prescribed ideation and Scout engagement have now run. Follow the canonical
foundation set and `docs/research-plan.md`; use this checkpoint only to recover
the provenance of deferred product options.
