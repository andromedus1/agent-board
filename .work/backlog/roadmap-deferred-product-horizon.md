---
id: roadmap-deferred-product-horizon
created: 2026-08-14
updated: 2026-08-14
tags: []
---

# Deferred product horizon

Preserve the useful ambitions from the earlier Agent Board vision without
expanding the terminal V1. The current foundation and prior-art landscape remain
the source context: `docs/SPEC.md`, `docs/ARCHITECTURE.md`, and
`.research/analysis/campaigns/agent-board-prior-art/parent.md`.

Possible later arcs:

- a resident daemon or event hub when subscriptions, proactive notifications,
  or multiple simultaneous consumers justify it;
- additional agent adapters, beginning with a specific Claude or other-agent
  workflow once Codex establishes the normalized contract;
- an optional tmux adapter for users who want it, without making tmux part of
  Andrew's Ghostty-first workflow;
- focus/jump navigation from the board to a registered Ghostty tab;
- macOS notifications, a menu-bar surface, or an always-on-top dashboard after
  terminal V1 supplies trustworthy attention and acknowledgement data;
- richer activity/current-task metadata and a hotkey-oriented rename flow;
- capability-gated semantic controls that never translate generic keystrokes
  into approval or other high-consequence actions;
- a simulated external client and stable protocol when a second live consumer
  exists;
- a physical ambient display or controls, including hardware inspired by status
  LEDs, only after software usage validates the need before PCB, battery, radio,
  or enclosure commitments; and
- remote or multi-machine aggregation after local-first single-machine behavior
  is proven and a concrete distributed use case exists.

These are preserved options, not a binding roadmap. Promote and scope an arc
only when its stated entry condition is met and it would change a current
product decision.
