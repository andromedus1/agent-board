---
id: gate-patterns-pending
kind: story
stage: done
tags: [patterns]
parent: null
depends_on: []
release_binding: null
gate_origin: patterns
created: 2026-08-16
updated: 2026-08-16
---

# Patterns extracted for --pending

## New patterns codified

- `guarded-atomic-session-mutation` — Re-check stale-sensitive preconditions inside the locked session mutation.
- `latest-durable-title-projection` — Persist before rendering a title from the latest durable record.
- `full-terminal-identity-guard` — Guard focus-derived work with the complete terminal identity.
- `bounded-shell-free-executable-adapter` — Run local tools through bounded, shell-free, injected process requests.
- `shared-capability-port-reuse` — Reuse narrow shared domain ports across application modules.
- `port-overrideable-per-binary-composition-root` — Wire each installed binary behind narrow overrideable capabilities.
- `scenario-driven-packed-cli-harness` — Exercise installed binaries with isolated scenario-controlled fakes.

## Inconsistencies flagged

- `gate-patterns-inconsistency-launcher-focused-terminal-port` — `launch-managed-codex` redeclares the shared focus capability.
- `gate-patterns-inconsistency-codex-terminal-override` — the Codex composition root constrains a terminal override to `GhosttyClient`.
- `gate-patterns-inconsistency-codex-process-override` — the Codex composition root constrains a process override to `CodexProcessHost`.

## Pattern files written

- `.agents/skills/patterns/guarded-atomic-session-mutation.md`
- `.agents/skills/patterns/latest-durable-title-projection.md`
- `.agents/skills/patterns/full-terminal-identity-guard.md`
- `.agents/skills/patterns/bounded-shell-free-executable-adapter.md`
- `.agents/skills/patterns/shared-capability-port-reuse.md`
- `.agents/skills/patterns/port-overrideable-per-binary-composition-root.md`
- `.agents/skills/patterns/scenario-driven-packed-cli-harness.md`
- `.agents/skills/patterns/SKILL.md` (generated index)
- `.agents/rules/patterns.md` (generated hook-loaded digest)

No Claude compatibility mirror was written because `.claude/skills/` does not
exist in this repository.
