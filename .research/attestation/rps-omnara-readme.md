---
source_handle: rps-omnara-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/omnara-ai/omnara/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The current Omnara repository README describes an open-source managed agent platform (API, Postgres event log, stateless workers, and machines running an outbound-connecting daemon). Agents run Omnara's own agent loop on any model. Claude Code and Codex are named as separate agent harnesses and as MCP clients that can launch Omnara agents, not as sessions that Omnara mirrors to a phone. The README does not document a phone app, session rename, or a status glyph.

## Key passages

- [1] Intro: Omnara is an open-source managed agent platform; use the API to run AI agents on any model and any machine with tools, secrets, permissions and streaming; self-host under Apache 2.0 or use Omnara Cloud (app.omnara.com).
- [2] How it works, Machines bullet: each machine runs the `omnarad` daemon, which connects out to Omnara, so agents can run commands there without any inbound ports.
- [3] How it works, Postgres bullet: every step of every agent is saved there; that record is the agent's state, so any worker can pick an agent back up after a crash or restart.
- [4] Comparison table, row 'Agent loop': Omnara's, works with any model (contrasted with Anthropic's loop for Claude Managed Agents and Codex for OpenAI's Agents API).
- [5] 'Where Omnara fits' table: agent harnesses such as Claude Code, the Claude Agent SDK, Codex, OpenCode or Pi are described as 'One agent loop in a terminal or on one machine'; Omnara adds cloud agents that run as a service across machines and users.
- [6] 'Use Omnara from your coding agent': an MCP server at https://app.omnara.com/mcp lets Claude Code, Codex, Cursor or another OAuth-capable MCP client launch and manage Omnara agents; `claude mcp add --transport http omnara ...` and `codex mcp add omnara --url ...` are shown.
- [7] Self-host: Docker Compose quickstart; 'The local defaults are intentionally insecure' and a self-hosting guide is pointed to for production.
- [8] Approvals (Features / architecture API bullet): the REST API is used to launch agents, send messages, and answer approvals; each tool can run immediately, ask a person first, or be blocked (platform-enforced).
- [9] License section: Apache License 2.0.

## Structural notes

- README fetched raw from the default branch; the docs introduction page (docs.omnara.com/introduction) was also fetched and did not state whether Omnara mirrors a local Claude Code or Codex CLI session or has a mobile app.
- GitHub API reported the repository pushed_at 2026-10-26 and not archived.
- The README contains no description of a phone app, session rename, or glyph-in-name behavior; absence is not evidence of absence elsewhere in the docs.
