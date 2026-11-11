---
source_handle: rps-abduco
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/martanne/abduco/master/README.md
source_path: .research/source-captures/rps-abduco/capture.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of abduco, a session attach/detach tool that runs programs independently of their controlling terminal; pairs with dvtm and is positioned as simpler than tmux or screen. The README lists release news through 2016.

## Key passages

- [1] Intro: abduco "allows programs to be run independently from their controlling terminal"; programs can be detached and later reattached; with dvtm it is described as a simpler alternative to tmux or screen.
- [2] Intro: described as similar to dtach but an independent implementation that is "actively maintained" (the README's own claim); News list ends at abduco-0.6, released 24.03.2016.
- [3] Quickstart: `abduco -c name command` creates a session; detach key `CTRL-\` changeable with `-e`; running `abduco` lists sessions with `*` for connected client and `+` for terminated session; `abduco -a name` reattaches.

## Structural notes

- No statement on reboot survival, window titles, or status. The "actively maintained" claim is the README's own and was not independently checked.
