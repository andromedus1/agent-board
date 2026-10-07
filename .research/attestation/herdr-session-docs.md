---
source_handle: herdr-session-docs
fetched: 2026-08-20
source_url: https://herdr.dev/docs/session-state/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr distinguishes live detach/reattach from cold server recovery. A live server preserves the original processes and conversations. A server restart restores layout and cwd but not arbitrary processes; native agent conversation restoration only applies when a current official integration has supplied a session reference. The page lists the provider-specific resume commands for Claude Code and Codex.

## Key passages

- [1] Lines 61-67: detach/reattach preserves processes and conversations, whereas a server restart preserves layout and restores conversations only by native agent session restore.
- [2] Lines 72-84: normal detach leaves the server and its panes, shells, agents, servers, tests, and commands running; this is called the strongest persistence path.
- [3] Lines 89-107: after a server restart original pane processes are gone; snapshot restore brings back session shape/cwd, while optional pane history may contain secrets.
- [4] Lines 112-145: native restore requires a current official integration-reported session reference and maps Claude Code to `claude --resume <id>` and Codex to `codex resume <id>`.

## Structural notes

- Official documentation page, “Session state and restore,” fetched from the Herdr site on 2026-08-20.
