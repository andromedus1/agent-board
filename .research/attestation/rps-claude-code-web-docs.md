---
source_handle: rps-claude-code-web-docs
fetched: 2026-10-26
source_url: https://code.claude.com/docs/en/claude-code-on-the-web
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

Official page "Use Claude Code in the cloud". A cloud session runs on Anthropic-managed infrastructure (or an organization self-hosted environment) rather than on the user's machine and continues after the laptop closes. Sessions start from browser, the mobile Code tab, Desktop, `claude --cloud`, or scheduled tasks. The fetch returned page markdown through a tool extract; the text was read in full but no raw capture file was saved.

## Key passages

- [1] Intro: "The session keeps running after you close your laptop, and you can check on it or steer it from any device." Available on Pro, Max, Team plans and Enterprise premium or Chat + Claude Code seats; usage counts toward plan limits.
- [2] Start surfaces: browser (claude.ai/code), mobile Code tab, Desktop app environment selector, terminal `claude --cloud`, and cloud scheduled tasks.
- [3] Terminal handoff: `claude --cloud "<task>"` creates a new cloud session cloned from the GitHub remote at the current branch; each `--cloud` command is an independent parallel session. From the CLI, handoff is one-way: `--teleport` pulls a cloud session into the terminal, but an existing terminal session cannot be pushed to the cloud (Desktop can send a local session to the cloud).
- [4] Follow-ups: `claude -p "<message>" --cloud <session-id>` queues a message into a running cloud session from any logged-in machine and prints `Session ID` and a view URL; `--output-format json` returns `{ok, session_id, url}`.
- [5] Teleport: the terminal gets its own copy; "new work there stays local and doesn't appear in the cloud session"; teleport requires same claude.ai account, same repository, pushed branch, clean git state.
- [6] Sessions list in the claude.ai/code sidebar; sessions can be archived or deleted; `/rename`, `/model`, `/effort` work in cloud sessions by passing an argument; terminal-only commands such as `/plugin` and `/resume` do not.
- [7] Permission modes are chosen from a mode dropdown at task creation and while the session runs; a session idle on a question can still be answered up to environment expiry.
- [8] Environment expired: "Cloud sessions stop after a period of inactivity and the session's VM is reclaimed"; reopening provisions a fresh VM; conversation history is restored but background shell commands, subagents and session-scoped scheduled tasks are not. A session waiting on an MCP connector approval counts as inactive.
- [9] Limitations: shared rate limits with other Claude usage; repository cloning and PR creation require GitHub (GitHub Enterprise Server supported for Team/Enterprise); non-GitHub repos can be uploaded as a local bundle but cannot push back; organization IP allowlisting breaks Anthropic-hosted cloud sessions; not available via Bedrock/Vertex/third-party providers; Zero Data Retention and HIPAA configurations cannot use cloud sessions.
- [10] Self-hosted environments: sessions routed to an organization's self-hosted environment run on the organization's infrastructure.

## Structural notes

- Official Claude Code documentation page; one fetch, extract passed through the fetch tool.
