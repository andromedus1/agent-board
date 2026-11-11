---
source_handle: rps-claude-local-cli-help-2-1-285
fetched: 2026-10-26
source_path: .research/source-captures/rps-local-cli-help/help.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Filtered local `claude --help` output from Claude Code 2.1.285 on the operator's machine (read-only; grep-filtered for remote, cloud, teleport and name lines). A `claude remote-control --help` invocation did not return and was not captured.

## Key passages

- [1] Version line: `2.1.285 (Claude Code)`.
- [2] `--remote-control [name]`: "Start an interactive session with Remote Control enabled (optionally named)"; `--remote-control-session-name-prefix <prefix>`: prefix for auto-generated names, default hostname.
- [3] `--cloud [description|session_id|url]`: create a cloud session with the description or attach to an existing one; `--environment <environment_id>`: create a cloud session that runs on a given self-hosted environment.
- [4] `--teleport [session]`: resume a teleport session; `-n, --name <name>`: set a display name for the session.

## Structural notes

- Local CLI capture; confirms flags named in the official docs are present in the installed binary.
