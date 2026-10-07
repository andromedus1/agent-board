---
source_handle: symmetry-claude-plugins-reference
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/plugins-reference
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Code plugins reference

Plugins package optional Claude Code runtime components. Their scope and
workspace-trust treatment determine whether a particular plugin capability is
available in a session.

## Key passages and anchors

- [1] `plugins-reference.md:13-15, 76-80, 148-181` — plugins can package skills,
  agents, hooks, and MCP servers; enabled plugin MCP servers start and appear
  as standard tools.
- [2] `plugins-reference.md:343-354, 375-383` — plugin scope is user, project,
  local, or managed. A project plugin needs workspace trust and has additional
  restrictions, while managed plugins are read-only / update-only.
