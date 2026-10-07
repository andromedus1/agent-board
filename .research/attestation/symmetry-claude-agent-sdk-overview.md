---
source_handle: symmetry-claude-agent-sdk-overview
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/agent-sdk/overview
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Agent SDK overview

Anthropic documents the Agent SDK as a Python and TypeScript library that runs
the Claude Code agent loop in the host process, distinct from the interactive
CLI and the direct API client SDK.

## Key passages and anchors

- [1] `overview.md:7-20` — the Agent SDK is for applications that want the agent
  loop without implementing it; its Python and TypeScript library runs in the
  host process, unlike the interactive CLI or an API client implementation.
- [2] `overview.md:24-43` — advertised SDK capabilities include tools, hooks,
  subagents, MCP, permissions, sessions, skills/memory, and plugins.
- [3] `overview.md:48-52` — third-party developers may not offer claude.ai login
  or rate limits in their products; use documented API-key authentication.
