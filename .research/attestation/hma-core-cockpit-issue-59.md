---
source_handle: hma-core-cockpit-issue-59
fetched: 2026-11-10
source_url: https://github.com/NJordan72/cockpit/issues/59
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Third-party project (Cockpit) issue describing measured OSC 7501 behaviour of Codex 0.163.0 and Claude Code 2.1.319, and noting that Claude Code hooks carry detail OSC 7501 does not.

## Key passages

- [1] "Codex 0.163.0 also sends OSC 7501 Program Status reports, such as `state=idle:app=codex`, `state=working:app=codex`, and `state=clear` when it exits."
- [2] "In a run stopped at its folder-trust prompt, it sent none." and the author lists as unknown "What `blocked` and `done` carry in `msg` for an approval, a question, and a finished turn. This needs a captured real turn."
- [3] "Claude Code 2.1.319 answers the probe too (`state=idle:app=claude-code`). Claude Code panes should keep using hooks. The hooks report tool calls, files, plans, and subagents, and OSC 7501 has no fields for any of those."
- [4] Codex wrinkle: passing `-c tui.*` overrides "makes Codex run without its shared background server, so Cockpit's Codex sessions don't show up in `codex agents`."

## Structural notes

Read via `gh issue view 59 -R NJordan72/cockpit` on 2026-11-10 (open, created 2026-11-09). Third-party observations, one author.
