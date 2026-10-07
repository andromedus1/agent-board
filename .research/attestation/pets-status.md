---
source_handle: pets-status
fetched: 2026-08-14
source_url: https://learn.chatgpt.com/docs/pets
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The pets page documents a first-party status surface that spans desktop, web, and terminal contexts. For terminal Codex specifically, it says a terminal pet reports activity for the current CLI session, uses the states Running, Needs input, Ready, and Blocked, does not provide the desktop app’s multiple-chat activity tray, and requires compatible terminal graphics support.

## Key passages

- [1] Lines 781-790: the pet status table defines Running as actively working, Needs input as needing approval/answer/decision, Ready as completed with unread activity, and Blocked as failed or system error; the activity ordering prioritizes needs input, then blocked, ready, and running.
- [2] Lines 814-822: in an interactive Codex CLI session, a terminal pet reports activity for the current CLI session and uses Running, Needs input, Ready, and Blocked states, but it does not provide the desktop app’s multiple-chat activity tray.
- [3] Lines 822-823: terminal pets require iTerm2 3.6 or later or a terminal with Kitty graphics or Sixel support, and they are unavailable inside tmux and Zellij.

## Structural notes

- Relevant page: Pets.
- This source is useful for status semantics and terminal-surface limitations.
