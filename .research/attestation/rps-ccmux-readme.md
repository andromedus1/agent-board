---
source_handle: rps-ccmux-readme
fetched: 2026-10-26
source_url: https://github.com/epilande/ccmux/blob/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

ccmux is a daemon plus tmux UI that discovers agent sessions already running in tmux panes and publishes status through tmux user options that a user can place in window-status formats. It documents an SSH workflow where everything runs on the remote host, hooks for Claude Code and Codex, and an OSC-based notification backend for remote daemons. Gemini CLI is tracked by process detection and pattern matching.

## Key passages

- [1] Lines 12 and 30: runs agents in tmux; built-in support for Claude Code, Codex, Cursor, OpenCode, Pi, Antigravity, Copilot, Gemini CLI, plus custom agent definitions.
- [2] Line 28: ccmux discovers what is already running in tmux panes; users do not change how they launch agents.
- [3] Lines 246-256: the daemon publishes tmux options @ccmux_status and per-window @ccmux_mark; the user adds them to window-status-format, for example '#I:#W#{@ccmux_mark}'; a window's mark shows its most urgent state, waiting before unread; icons are configurable (dot, emoji, nerdfont, none) and the mark is unset on quiet windows.
- [4] Lines 396-401: a spawned window is named after the worktree or the agent, and that name pins tmux automatic-rename off for the window.
- [5] Lines 966-979: 'ccmux setup' installs hooks so sessions can be matched authoritatively to panes; hooks write PID marker files; Gemini CLI is tracked via process detection and terminal pattern matching and needs no setup.
- [6] Lines 980-1000: Claude Code uses native hooks in ~/.claude/settings.json (session start, session end, state notify on idle_prompt / permission_prompt); a Codex CLI hook section follows (line 989), with tool-approval detection requiring Codex 0.122 or newer.
- [7] Line 1185 (Remote / SSH): 'ccmux tracks the sessions on the machine where it runs, so for a remote devbox, run everything there ... and attach over SSH'; detection, hooks, picker and sidebar work at full fidelity because nothing crosses the SSH boundary.
- [8] Lines 1187-1199: desktop notifications do not follow automatically; an opt-in 'osc' backend writes a notification escape into the tmux pane so it rides the SSH terminal stream; it needs tmux allow-passthrough all, is informational only, and is supported by Ghostty, iTerm2 and WezTerm (OSC 9) and Kitty (OSC 99) but silently ignored by Apple Terminal and Alacritty.
- [9] Lines 1210-1223: the daemon merges three signals (JSONL log parsing, terminal pattern matching, hook PID marker files) into one session state; it serves a local HTTP API with SSE on port 2269; states are idle, working, waiting; liveness is checked to detect crashed sessions.

## Structural notes

Raw README.md fetched on 2026-10-26; line numbers refer to the raw file. This is a fresh attestation, not a reuse of ccmux-readme.
