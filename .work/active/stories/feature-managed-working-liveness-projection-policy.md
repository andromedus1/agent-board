---
id: feature-managed-working-liveness-projection-policy
kind: story
stage: done
tags: [state, integration]
parent: feature-managed-working-liveness
depends_on: [feature-managed-working-liveness-launcher-probe]
release_binding: null
gate_origin: null
created: 2026-08-16
updated: 2026-08-16
---

# Project long-running work from verified launcher liveness

Integrate the launcher probe into reconciliation and let a live managed launcher
authorize hours-old working evidence. Preserve the age threshold for unbound
records and convert a missing launcher into explicit stale diagnostic evidence
before title/board projection.

## Acceptance evidence

- The exact hours-long working regression remains `●` while its launcher lives.
- Missing launcher evidence becomes `?`, never idle, completion, or error.
- Existing state precedence and full packaged journeys remain green.

## Implementation evidence

- Reconciliation probes only managed, live, working records with a launcher
  binding. A live probe leaves agent evidence untouched; a missing or
  unprobeable launcher atomically records stale, corroborated local evidence
  while retaining the PID.
- Projection now lets a valid live managed launcher authorize hours-old
  working evidence while preserving future timestamps and freshness fallback
  for unbound records.
- Wired the explicit process adapter through `agents`, managed Codex launch,
  and acknowledgement composition roots; updated affected fixtures.
- Verification: focused projection/reconciliation/list/launch/control tests
  (37 passed), `npm run typecheck` (passed), and `git diff --check` (passed).
