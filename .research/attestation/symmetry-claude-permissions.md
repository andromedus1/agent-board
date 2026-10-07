---
source_handle: symmetry-claude-permissions
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/permissions
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Code permission policy surface

Claude Code applies permission rules across configuration scopes. Managed
settings outrank lower scopes, including command-line flags, and can restrict
the sources from which customization may load.

## Key passages and anchors

- [1] `permissions.md:91-100` — manual mode has different approval requirements
  by tool type, including modifications, shell execution, web fetch/search,
  MCP, and subagents.
- [2] `permissions.md:534-542` — `strictPluginOnlyCustomization` can restrict
  skills, agents, hooks, and MCP to plugin or managed sources; managed rules
  are not overridden by lower-scope configuration or command-line allow flags.
