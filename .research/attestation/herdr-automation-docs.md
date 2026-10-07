---
source_handle: herdr-automation-docs
fetched: 2026-08-20
source_url: https://herdr.dev/docs/agent-automation/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr’s automation model separates layout creation, raw pane I/O, and lifecycle-aware agent control. A recognized agent is the current process in a pane, not a persistent pane property. The documentation’s recipes use a Codex agent through the common control surface and separately use pane/output waits for ordinary processes.

## Key passages

- [1] Lines 54-66: Herdr distinguishes layout, pane, and agent primitives; an agent is the recognized process running in a pane.
- [2] Lines 89-99: agent commands are for lifecycle-aware control; supported kinds include Claude and Codex, and `agent start` waits for the expected recognized agent.
- [3] Lines 142-205: the recipes start and prompt a Codex helper, wait for its blocked state, inspect its output, and send a named key; ordinary processes use pane control and output waits.

## Structural notes

- Official documentation page, “Agent automation,” fetched from the Herdr site on 2026-08-20.
