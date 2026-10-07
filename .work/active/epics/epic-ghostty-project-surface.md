---
id: epic-ghostty-project-surface
kind: epic
stage: done
tags: [integration, cli]
parent: null
depends_on: [epic-trustworthy-session-core]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Ghostty Project Surface

## Brief

Make a Ghostty tab a stable, nameable Agent Board session and keep its complete
title synchronized with the canonical projection. This arc owns discovery of
the focused Ghostty window/tab/terminal hierarchy, registration and rename,
targeted `set_tab_title`, configuration diagnostics, and hierarchy-aware
presence reconciliation across reorder, movement, close, and undo-close.

It must transport untrusted project labels safely across the AppleScript
boundary and degrade visibly when Ghostty version, permissions, or title config
are incompatible. It does not infer Codex lifecycle state or render the global
board.

## Research briefs

- `.research/analysis/briefs/ghostty-registration-liveness.md` — validates stable IDs, targeted title actions, and hidden undo-close behavior.
- `.research/analysis/campaigns/agent-board-prior-art/parent.md` — compares title mechanisms and establishes AppleScript as primary.

## Foundation references

- `docs/SPEC.md` — registration, rename, title ownership, liveness, and safety requirements.
- `docs/ARCHITECTURE.md` — Ghostty adapter, script transport, session identity, and reconciliation rules.

## Anticipated child features

Provisional seams are the validated AppleScript adapter, idempotent registration
and naming, and hierarchy-aware title/liveness reconciliation.

<!-- The /epic-design pass will fill in real child feature specifics into a
## Decomposition section below this one. -->

## Design decisions

- Require Ghostty 1.3+ AppleScript support for V1; OSC is not a silent fallback.
- Invoke constant AppleScript programs with positional arguments. Project labels
  and IDs never enter generated script source.
- Registration captures the active Ghostty window/tab/terminal hierarchy once
  and deduplicates by terminal ID under the registry lock.
- Presence is derived by re-enumerating the current hierarchy: current tree is
  visible, app-enumerable outside the tree is hidden/undoable, and absence is
  missing. PID alone is not liveness.
- Title write/clear targets the registered tab and reconciles identity before
  action. A mismatch becomes a diagnostic, never a best-guess write.

## Pre-mortem

- Automation permission or an incompatible Ghostty config could make commands
  appear broken. The adapter feature returns typed diagnostics with remediation.
- Re-registering the same terminal could create duplicate board rows. The naming
  feature performs the lookup/create decision inside one registry lock.
- Close/undo could leave a live process but no visible tab. The reconciliation
  feature treats hierarchy placement and enumerability separately.

## Decomposition

1. `epic-ghostty-project-surface-applescript-adapter` — safe scripts, hierarchy
   parsing, targeted title actions, version/config diagnostics. `depends_on: []`.
2. `epic-ghostty-project-surface-registration-naming` — idempotent focused-tab
   registration, repo context, and `agent-name`. Depends on the adapter.
3. `epic-ghostty-project-surface-title-reconciliation` — presence classification,
   canonical title rendering/clearing, and stale-safe repair. Depends on both.

## Child features reviewed and complete

- `epic-ghostty-project-surface-applescript-adapter` — done after safe argv,
  configuration/error hardening, and standard cross-model review.
- `epic-ghostty-project-surface-registration-naming` — done after locked
  terminal-ID deduplication, advisory repository discovery, CLI wiring, and a
  corrected package build root.
- `epic-ghostty-project-surface-title-reconciliation` — done after dual-view
  hierarchy evidence, diagnostic projection, canonical title repair, and
  recoverable unregister review.

Aggregate verification passes typecheck, build, and the serialized 95-test
suite. The completed arc exposes explicit registration/naming, strict Ghostty
diagnostics and scripting, hierarchy-aware visibility, canonical title parity,
and safe unregister without a multiplexer or resident process.

## Review (2026-08-14)

Standard-weight aggregate review used one fresh-context cross-model pass with
Claude Sonnet in an isolated worktree. It verified the complete scripting,
registration, liveness, title, diagnostic, packaging, and unregister flow with
95/95 committed tests and found no blockers.

One non-blocking integration observation was accepted as a downstream board
design input: a resilient bulk pass can report `titleRendered: false` without a
durable Ghostty error field, so the board must surface that result instead of
silently assuming title parity. The note now lives on the board epic. A cosmetic
duplicate throw branch was simplified. The epic closes after this single pass
without re-review, per standard policy.
