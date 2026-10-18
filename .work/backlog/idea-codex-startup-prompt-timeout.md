---
id: idea-codex-startup-prompt-timeout
created: 2026-10-18
updated: 2026-10-18
tags: [bug, integration, cli]
---

The observer starts its 10-second root-thread binding deadline before the real
Codex TUI finishes interactive startup. During live verification of
`story-fix-codex-launch-directory`, installed Codex 0.160.1 with `-C src`
showed a Folder access trust prompt before creating a thread. Leaving that
prompt unanswered produced `Timed out binding Codex root thread` and forced
shutdown, even with the correct expected directory. The same risk applies to
other startup interactions that precede thread creation; those were not tested.

This is distinct from the saved-repository-directory mismatch. Preserve Codex's
ownership of trust decisions; do not automatically approve prompts to obtain a
thread. Revisit when the binding deadline should begin, or how observer
readiness can coexist with a user waiting at startup. The live probe did not
answer the trust prompt or change the operator's persisted trust settings.
