---
id: epic-operational-readiness-operator-guide
kind: feature
stage: done
tags: [prose]
parent: epic-operational-readiness
depends_on: [epic-operational-readiness-doctor-command, epic-operational-readiness-packaged-e2e]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Operator Guide

## Brief

Write the concise, verified path from checkout or packed install to the daily
Ghostty workflow: prerequisites, install, doctor, name/register, managed Codex
launch, board inspection, acknowledgement, unregister, troubleshooting, and
uninstall. Explain the five symbols, confidence/liveness diagnostics, state
location, reversibility, and current managed-mode limitations.

Literal commands come before optional aliases or keybindings. The guide must not
claim automatic config changes, ordinary-mode parity, GUI/hardware features, or
live-test safety beyond what the completed implementation proves.

## Epic context

- Parent: `epic-operational-readiness`.
- Final arc; depends on the verified doctor and packed workflow.

## Foundation references

- `README.md` — primary landing path.
- `docs/SPEC.md` and `docs/ARCHITECTURE.md` — supported contract.
- Completed feature items and CLI fixtures — authoritative command behavior.

<!-- The /prose-author pass writes the guide against completed behavior. -->

## Outline

Target `README.md` as the single operator landing page. Cover prerequisites,
Ghostty configuration, checkout installation, readiness checks, the first
managed session, daily commands, status semantics, diagnostics, limitations,
tests, uninstall, and project navigation. Use verified literal commands and
keep optional customization separate from the required path.

## Implementation notes

- Execution capability: GPT-5.6 inline prose lane. The verified commands and
  completed runtime contracts supplied the required grounding.
- Deliverable: rewrote `README.md` as the operator landing page.
- Verification: checked command grammar against all four CLI entry points,
  state paths against production composition, Ghostty remediation against the
  diagnostic adapter, and npm unlink syntax against the installed npm help.
- Scope: documented only managed Codex, one agent per Ghostty tab, local state,
  and current controls. Deferred adapters, GUI, remote, and hardware remain
  backlog options.
- Adjacent issues parked: none.

## Review (2026-08-14)

**Verdict**: Approve with one accuracy fix.

**Blockers**: none.

**Important fix**: scoped automatic focus acknowledgement to the lifetime of
the managed launcher. After that process exits, the guide now directs the
operator to explicit acknowledgement.

**Nits adjudicated**: clarified that warnings do not block managed operation;
made rename instructions require a focused registered tab; retained the safer
instruction to remove a global title setting; retained npm as an explicit tool
requirement for readers who use alternate Node installations.

Standard review weight: one independent cross-model pass, receiver edits, and
closure without re-review.
