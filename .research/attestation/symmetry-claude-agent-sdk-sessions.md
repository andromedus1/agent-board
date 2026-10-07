---
source_handle: symmetry-claude-agent-sdk-sessions
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/agent-sdk/sessions
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Agent SDK sessions

The SDK automatically persists conversation state, not filesystem state. It
offers continuation of the newest session, resume by a captured session ID,
and forking into a separate history.

## Key passages and anchors

- [1] `sessions.md:7-20` — a session holds prompt, tool calls/results, and
  responses; it is written to disk and does not snapshot filesystem changes.
- [2] `sessions.md:22-46` — `continue` finds the latest session in the current
  directory, `resume` uses a caller-managed ID, and `fork` preserves the
  original history while creating a distinct session.
- [3] `sessions.md:49-89` — Python and TypeScript have different automatic
  continuation interfaces; a result message exposes the session ID even for
  an error result, subject to no-result connection/process failures.
- [4] `sessions.md:100-166` — SDK resume by ID restores conversation context;
  direct session files are local-machine state unless copied/mirrored through
  an external SessionStore adapter.
