---
source_handle: hma-core-codex-osc7501-issues
fetched: 2026-11-10
source_url: https://github.com/openai/codex/issues/58136
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Codex issue reports saying Codex CLI emits OSC 7501 on every state change when stdout is a tty, with the end-of-turn edge case where background terminals keep status at working. Reporter accounts.

## Key passages

- [1] openai/codex #58136 (open; 2026-10-29): "Codex emits OSC 7501 on every state change whenever stdout is a tty (#52725). Captured from 0.165.0 running under tmux": `state=idle:app=codex`, `state=working:app=codex`, `state=done:app=codex`.
- [2] #58136: "masking the terminal-detection environment variables doesn't help, since 7501 isn't gated on detecting a particular terminal." and notes #57612 disables 7501 when it detects VTE below 0.54.
- [3] openai/codex #60326 (closed; 2026-11-09): "an agent that starts a dev server as a background terminal during a turn keeps reporting `working` after the turn ends" for about five hours; the reporter ran herdr-core 0.1.19. State of the closure resolution not read.
- [4] openai/codex #60325 (open; 2026-11-09) title: "TUI stays busy (spinner + OSC 7501 "working") forever after parent turn completes, because stalled spawned subagents are never completed or closed" (title only read).

## Structural notes

Read via `gh issue view` and `gh search issues 7501 --repo openai/codex` on 2026-11-10; #58136 body read to ~1800 characters, #60326 body to ~1800, #60325 title only.
