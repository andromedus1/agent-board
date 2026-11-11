---
source_handle: rps-tmux-webui-deck-doc
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/operonlab/tmux-webui/main/docs/deck.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Design doc of tmux-webui deck mode. Agent state is inferred server-side from the tmux pane (OSC title spinner glyphs, screen text rules) once per second; approve/deny and menu choices are sent as key presses; a menu parser turns numbered Claude Code menus into labeled buttons.

## Key passages

- [1] Pages: SESS page has 'one key per tmux session/window, LED = live pane state'; CTRL page 'approve / deny / interrupt / rewind / mode / arrows / enter', wired to `detectMenu` and `key` sends.
- [2] Context-aware panels: when Claude Code shows a numbered choice menu, `detectMenu` parses it and renders the options as big labeled buttons with a slide-to-confirm gate.
- [3] Permission-mode pills: tapping one sends the minimal number of Shift-Tab presses to cycle Claude Code to that mode.
- [4] How it reads pane state: backend classifies every agent pane once per second from rules; first rule is the OSC pane title - 'Claude sets the terminal title to <braille-spinner> while working and a star glyph while idle'.
- [5] Rules also include a text 'waiting' rule (a live permission question plus its numbered yes-line), an 'idle' rule (live input box), and a 'working' text fallback (`esc to interrupt`, spinner glyphs, thinking verbs in the bottom lines only).
- [6] The backend classifier is described as a port of another project's claude manifest 'itself a clean-room re-derivation of the herdr agent multiplexer's detection concepts'; output is debounced per pane (working to idle needs 3 consecutive confirmations).
- [7] Aggregate ordering is attention-first: waiting > working > idle > unknown.
- [8] Status strip is parsed verbatim from the focused pane's status bar (model, context percent, cost, permission mode).

## Structural notes

- Raw doc. Fetched 2026-10-26. The classifier is described for Claude Code; the doc names Claude-specific rules (OSC title glyphs, `esc to interrupt`). Codex-specific rules are not described in the read passages.
