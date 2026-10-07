---
name: agent-board-principles
description: Read this when a product or architecture tradeoff needs a decision heuristic rather than another feature request.
type: principles
kind: planning
status: draft
nav_priority: high
updated: 2026-08-14
summary: |
  Agent Board optimizes for calm, trustworthy attention routing with minimal workflow friction. These principles govern how evidence, labels, adapters, future surfaces, and semantic capabilities earn their place.
decisions:
  - Attention before control.
  - Truth before apparent precision.
  - Peripheral first, deliberate detail on demand.
  - One source of truth, many projections.
  - Human meaning and machine observation remain separate.
  - Narrow proof before platform breadth.
  - Local usefulness before connectivity.
  - Future surfaces earn entry through observed demand.
  - Semantic actions require semantic capabilities.
---

# Agent Board principles

## Attention before control

The primary loop is “show me where I am needed.” Navigation and actions are
valuable only after the attention signal is trustworthy.

## Truth before apparent precision

Never promote inference, staleness, process existence, or terminal output into a
native semantic state. Preserve evidence source, freshness, and confidence even
when the visible projection stays simple.

## Peripheral first, deliberate detail on demand

Tab titles should communicate through a stable position and a tiny vocabulary.
The `agents` board is where diagnostics and uncertainty become inspectable.
Interruptive notifications are earned only when passive awareness is insufficient.

## One source of truth, many projections

Titles, terminal boards, later software surfaces, and possible hardware all read
the same normalized session model. No renderer invents its own state machine.

## Human meaning and machine observation remain separate

The operator owns the project label. Adapters own observations. Session identity
joins them without allowing one to overwrite or impersonate the other.

## Narrow proof before platform breadth

Build one excellent macOS + Ghostty + Codex path before adding agents, terminals,
operating systems, control surfaces, or generalized orchestration.

## Local usefulness before connectivity

Core supervision must work offline with local state. A daemon, network protocol,
remote service, or cloud account must justify itself through a concrete consumer
or coordination need.

## Adapters describe capability, not aspiration

An adapter reports what it can observe or perform and how confidently. Cross-agent
normalization is a shared vocabulary, not a claim of feature parity.

## Future surfaces earn entry through observed demand

Preserve good options with explicit activation conditions. Do not turn old ideas
into inevitable phases. Hardware follows software learning; a GUI follows a
surface need; a daemon follows a concurrency or subscription need.

## Semantic actions require semantic capabilities

Focusing a known terminal is not the same as approving an agent action. Generic
keystrokes, guessed prompts, and ambiguous terminal routing never masquerade as
semantic approval, decline, or control.

## Prefer reversible learning

Choose the smallest experiment that can disprove a product or architecture
assumption. Clear title overrides on unregister, keep local formats versioned,
and defer irreversible hardware or protocol commitments until the attention loop
has real usage evidence.
