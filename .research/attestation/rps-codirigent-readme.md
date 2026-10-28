---
source_handle: rps-codirigent-readme
fetched: 2026-10-26
source_url: https://github.com/oso95/Codirigent/blob/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Codirigent is a desktop (Windows and macOS) tmux-style workspace for Claude Code, Codex and Gemini, labelled early alpha. It shows per-session status via hooks with a fallback detector and resumes prior Claude and Codex sessions. No remote, SSH or mobile access is documented.

## Key passages

- [1] Lines 12 and 70: badge and note label the project alpha / 'Early alpha - expect rough edges'.
- [2] Lines 33-46: runs Claude Code, Codex and Gemini side by side, each with a status indicator: idle, working, attention (waiting for input or permission), ready.
- [3] Lines 62: 'Session resume': detects and resumes previous Claude Code and Codex sessions automatically.
- [4] Lines 84-94: hooks (codirigent-hook) are auto-installed into Claude Code, Codex and Gemini configs to track status in real time; if hooks are unavailable, 'Codirigent falls back to its reader/detector path, which is less precise'.
- [5] Lines 72-80 and 115: download as .msi (Windows) or .dmg (macOS); 'Linux support is not yet complete'.

## Structural notes

Raw README.md fetched on 2026-10-26; line numbers refer to the raw file.
