---
source_handle: rps-tmux-resurrect
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/tmux-plugins/tmux-resurrect/master/README.md
source_path: .research/source-captures/rps-tmux-resurrect/capture.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of the tmux-resurrect plugin. It saves and restores the tmux environment (sessions, windows, panes, layouts, working directories, and a conservative allow-list of programs) across a system restart, bound to manual save/restore keys. It restores only a short default list of programs; other programs require configuration.

## Key passages

- [1] Intro: restores the tmux environment after system restart; "You lose all the running programs, working directories, pane layouts" on restart is the stated problem; the plugin's stated aim: "You should feel like you never quit tmux."
- [2] Key bindings: `prefix + Ctrl-s` saves, `prefix + Ctrl-r` restores.
- [3] About list: saves all sessions, windows, panes and their order; each pane's current working directory; exact pane layouts; active session/window/pane; grouped sessions; and "programs running within a pane" with details in a separate doc.
- [4] Docs section: "Only a conservative list of programs is restored by default: `vi vim nvim emacs man less more tail top htop irssi weechat mutt`"; a separate doc explains restoring additional programs.
- [5] Optional features: restoring pane contents is optional, as is vim/neovim session restore.
- [6] Docs section: hooks on save and restore are documented in a separate doc.
- [7] Requirements: tmux 1.9 or higher, bash; idempotent restore that does not recreate panes or windows that already exist.

## Structural notes

- README only; the linked docs (restoring programs, hooks, pane contents) were not fetched.
- The README's list of saved items does not mention window names, window options, or user options (`@`-prefixed); this is silence, not a documented exclusion.
