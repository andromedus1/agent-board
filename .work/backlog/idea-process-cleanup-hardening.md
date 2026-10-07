---
id: idea-process-cleanup-hardening
created: 2026-08-15
updated: 2026-08-15
tags: [integration]
---

Harden process cleanup beyond the approved V1 boundary in two related cases:

- `NodeProcessRunner` currently sends `SIGTERM` when a bounded Ghostty, Git, or
  configured executable exceeds its time or output limit. Add a bounded exit
  wait and `SIGKILL` escalation so an unresponsive utility cannot outlive the
  command indefinitely.
- An uncatchable managed-launcher death such as `SIGKILL` can orphan its detached
  Codex app-server and leave stale launcher evidence. Revisit recovery through a
  later reconciliation owner, startup sweep, or resident supervisor only after
  selecting an ownership model that does not turn V1 into a daemon implicitly.

Keep all cleanup PID-scoped or process-group-scoped. Never use machine-wide
process discovery or broad kill behavior.
