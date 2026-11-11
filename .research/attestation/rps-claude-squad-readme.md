---
source_handle: rps-claude-squad-readme
fetched: 2026-10-26
source_url: https://github.com/smtg-ai/claude-squad/blob/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Claude Squad is a Go terminal app that runs each agent session in its own tmux session and git worktree. It lists Claude Code, Codex, Gemini and Aider as runnable programs. The README documents no remote, mobile, status-glyph or rename behaviour.

## Key passages

- [1] Line 3: manages multiple Claude Code, Codex, Gemini and other local agents including Aider in separate workspaces.
- [2] Lines 47-50: prerequisites are tmux and gh.
- [3] Lines 83-87: Codex is launched with 'cs -p "codex"', Gemini with 'cs -p "gemini"'; the default program is claude and can be changed in config.
- [4] Lines 94-106: key menu: n new session, D kill, enter/o attach to reprompt, ctrl-q detach, s commit and push, c checkout (commits changes and pauses the session), r resume a paused session. No rename key is listed.
- [5] Lines 147-148: FAQ: a 'timed out waiting for tmux session' error is attributed to an out-of-date underlying program.
- [6] Lines 152-153: how it works: tmux for isolated terminal sessions per agent, git worktrees to isolate codebases per branch.

## Structural notes

Raw README.md fetched on 2026-10-26; line numbers refer to the raw file. Silence on remote, rename and status glyphs is a property of this document only.
