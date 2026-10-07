---
source_handle: symmetry-claude-sessions
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/sessions
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Code CLI sessions

The CLI persists conversations continuously in local JSONL transcripts. The
interactive CLI can continue its latest session, use a picker, or resume a
named / identified session; it restores some but not all runtime launch state.

## Key passages and anchors

- [1] `sessions.md:9-27` — sessions are saved local conversations; `--continue`,
  `--resume`, named resume, and `/resume` provide distinct entry points, and
  an ID can resolve across local projects under stated uniqueness conditions.
- [2] `sessions.md:29-43` — resume restores history, model subject to availability,
  agent subject to its definition being found, and permission mode with named
  exceptions; it restores active goals and unexpired scheduled tasks but not
  background Bash/monitor tasks. Launch-only plugin, MCP, settings, fallback,
  and added-directory flags must be supplied again.
- [3] `sessions.md:79-106` — a user-set name is a resume handle; unconfigured
  sessions have a default display name and a generated title, neither of which
  is a resume handle. Live-name collisions may be changed to a variant.
- [4] `sessions.md:176-205` — scripts can use print-mode structured output, an
  explicit resumed print invocation, hooks, or the Agent SDK. Transcript JSONL
  is an internal, version-changing format and should not be parsed as a stable
  integration contract.
