---
source_handle: rps-herdr-how-to-work-docs
fetched: 2026-10-26
source_url: https://herdr.dev/docs/how-to-work/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr's usage guide names three paths: local, plain SSH then run herdr on the host (tmux-style), and herdr --remote from a local terminal. It has an explicit phone section: no mobile app or web dashboard; any SSH client works and the TUI adapts to narrow screens.

## Key passages

- [1] Lines 4-5: Herdr is a background session server plus one or more terminal clients; panes keep running in the server, and clients attach, detach and render the session.
- [2] Lines 24-25: with plain SSH, the shell, Herdr server, agents and panes all run on the remote machine; detach with ctrl+b q, disconnect, SSH back and run herdr again. The page recommends this path for users on a phone or tablet SSH client.
- [3] Lines 28-33: under 'Work from your phone', it says "Herdr works on your phone without a mobile app or web dashboard", requires any SSH client, opens the same persistent session, says the TUI adapts to narrow screens, and states that on iPhone apps like moshi work well.
- [4] Lines 41-42: with herdr --remote the remote server keeps panes running and the local Herdr draws the UI; SSHing first and running herdr on the server cannot read the local desktop clipboard.
- [5] Line 53: path selection summary: herdr for local; ssh then herdr for tmux-like behaviour or phone SSH clients; herdr --remote <host> for a local UI on one remote session; herdr machine add for Local plus several SSH machines in one window.

## Structural notes

Official documentation page 'How to work with Herdr', converted from raw HTML to text; line numbers refer to the extracted text of the main content area.
