---
name: patterns
description: "Project code patterns and conventions. Auto-loads when implementing,
  designing, verifying, or reviewing code. Provides detailed pattern definitions
  with code examples."
user-invocable: false
allowed-tools: Read, Glob, Grep
---

# Project Patterns Reference

This skill contains detailed pattern documentation for this project.
See individual pattern files for full details with code examples.

Available patterns:
- [guarded-atomic-session-mutation.md](guarded-atomic-session-mutation.md) — Re-check stale-sensitive preconditions inside `SessionStore.mutate`, where the latest record is locked.
- [latest-durable-title-projection.md](latest-durable-title-projection.md) — Persist first and route title writes through `renderSessionTitle` so projection uses the latest record and verified evidence.
- [full-terminal-identity-guard.md](full-terminal-identity-guard.md) — Preserve and compare adapter, window, tab, and terminal IDs for focus-derived mutations and title writes.
- [bounded-shell-free-executable-adapter.md](bounded-shell-free-executable-adapter.md) — Invoke local tools through injected, shell-free argv requests with explicit time/output bounds and strict response parsing.
- [shared-capability-port-reuse.md](shared-capability-port-reuse.md) — Define shared external capabilities once in `domain/ports.ts` and compose those narrow ports in use-case dependencies.
- [port-overrideable-per-binary-composition-root.md](port-overrideable-per-binary-composition-root.md) — Give each installed binary one factory that wires production defaults behind narrow overrideable capabilities.
- [scenario-driven-packed-cli-harness.md](scenario-driven-packed-cli-harness.md) — Exercise installed bins in an isolated packed prefix using atomic scenarios and fake executable boundaries.
