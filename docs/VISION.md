---
name: agent-board-vision
description: Read this to understand why Agent Board exists, who it serves first, and what product outcome matters.
type: north-star
kind: planning
status: draft
nav_priority: high
updated: 2026-08-20
summary: |
  Agent Board is a local attention router for one operator supervising several Codex and Claude terminal agents. Its current product slice makes trustworthy provider-qualified state visible through common Ghostty title and terminal-board glyphs without requiring tmux, a GUI, or hardware.
decisions:
  - Attention routing, not faster input or agent control, is the product wedge.
  - The first user and workflow are Andrew supervising Codex and Claude sessions in Ghostty tabs on macOS.
  - The first proof is tab titles plus a terminal board backed by one local state model.
  - State confidence and liveness remain visible rather than being collapsed into confident-looking labels.
  - The software control plane must prove value before GUI, remote, or hardware surfaces are commissioned.
  - Vendor neutrality is proven through Codex and Claude adapters that share outcome semantics without pretending their evidence is identical.
  - Semantic actions require native capabilities and are outside the first proof.
---

# Agent Board vision

## Product thesis

Developers increasingly supervise several coding agents at once. In a terminal
workflow, the expensive part is not sending another command; it is repeatedly
visiting every session to discover whether the agent is working, waiting for the
operator, finished, or failed.

Agent Board should make that attention state legible at a glance. The first
product is a lightweight local control plane for Andrew's current workflow:
Codex or Claude running in one Ghostty tab per project on macOS.

The durable product value is trustworthy lifecycle normalization and attention
routing. A tab title, terminal board, menu-bar view, or physical device is a
projection of that value rather than the product's source of truth.

## First user

The first user is a technically sophisticated individual operator who:

- runs several Codex and Claude terminal agents concurrently;
- organizes Ghostty around one project/agent per tab;
- wants to preserve normal terminal scrolling and provider-native interaction;
- values immediate peripheral awareness over a feature-rich dashboard; and
- expects a common attention vocabulary without hidden differences in evidence
  quality or available actions.

The supported environment is macOS and Ghostty with Codex and Claude managed
through provider-specific adapters. The architecture should admit later
terminals and agents without pretending they are already supported.

## Concrete success scenario

Andrew opens several Ghostty project tabs and starts Codex or Claude work in each. Without
cycling through the tabs, he can see labels such as:

```text
● data-platform
! acquisition
✓ agent-board
○ legacy-engine
× reporting
```

The `agents` command renders the same sessions from the same local state. Within
one glance, Andrew knows which session needs attention and why. The labels change
quickly enough to feel connected to the agent's actual transitions, stale or
uncertain observations never masquerade as native truth, and closing a session
does not leave a permanently misleading board entry.

## Minimalist proof and maximalist horizon

The current software proof contains only:

- explicit registration and naming of the current Ghostty tab/session;
- trustworthy managed Codex and Claude adapter paths;
- machine-maintained `<status> <project-name>` Ghostty tab titles;
- a persistent local `agents` board using the same state;
- acknowledgement and stale/dead-session behavior; and
- installation, setup diagnostics, and usage documentation.

The maximalist horizon remains valuable but is not a roadmap commitment. It may
eventually include focus navigation, notifications, richer software surfaces,
additional agent and terminal adapters, capability-gated actions, remote
aggregation, a simulated external client, and physical ambient controls.

Each future surface must be earned by observed use of the software proof. In
particular, hardware should express proven attention states and interactions;
it should not determine them in advance.

## Explicit non-goals for the first proof

- tmux or another terminal multiplexer dependency;
- a third agent adapter before the Codex/Claude contract is proven in use;
- generic process scraping presented as authoritative semantic state;
- terminal macros, approval buttons, or arbitrary keystroke control;
- click-to-focus or automatic session navigation;
- notifications, menu-bar, always-on-top, or full GUI surfaces;
- a networked or multi-client daemon unless a measured requirement demands it;
- remote or multi-machine aggregation;
- simulated or physical hardware; and
- a generalized orchestration or workflow engine.

## What would make the project fail

Agent Board fails if it adds another surface that must itself be polled, reports
confident but wrong state, makes starting an agent meaningfully harder, allows
human labels and machine status to overwrite one another, or lets future device
ambition expand the first proof beyond the attention loop.
