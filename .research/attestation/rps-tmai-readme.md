---
source_handle: rps-tmai-readme
fetched: 2026-10-26
source_url: https://github.com/trust-delta/tmai/blob/main/README.en.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

tmai is a hub repo for a Producer-agent workbench with an HTTP/SSE engine (source private), a React WebUI with a mobile remote, and a ratatui dashboard. Agent detection is hook-driven for Claude Code. It describes an always-on supervisor. Its README does not document Codex coverage or glyphs in names.

## Key passages

- [1] Line 20: the repository hosts the UI clients, wire contract and installer; the engine source stays private in tmai-core.
- [2] Line 36 and 141: the design includes 'an always-on substrate - a supervisor that outlives episodic sessions' and an idle-gated synthesis when the user is away.
- [3] Line 63: tmai is both the exoskeleton the Producer runs on and the console the operator observes through (WebUI, TUI, mobile remote).
- [4] Lines 107-125 (Quick start): 'tmai init' registers Claude Code hook receivers in ~/.claude/settings.json; tmai serves the bundled WebUI automatically at a printed URL; supported platforms are Linux x86_64/aarch64 and macOS arm64.
- [5] Line 129: the engine provides hook-based agent detection reporting attention: started, halted, completed or null, 'driven by Claude Code hooks - no polling'.
- [6] Line 130: the React WebUI offers an agent list, live xterm preview, prompt/approve and a 'mobile remote with AskUserQuestion support'.
- [7] Line 144: the earlier auto-approve, cron scheduling and automatic CI-event handling features were removed across v3.0.0-v3.x.

## Structural notes

Raw README.en.md fetched on 2026-10-26; line numbers refer to the raw file. The default README.md is in Japanese; the English file was used.
