---
source_handle: ghostty-osc2
fetched: 2026-08-14
source_url: https://ghostty.org/docs/vt/osc/2
provenance: source-direct
substrate_confidence: source-direct
source_class: official-terminal-reference
---

# Ghostty OSC 2 title sequence

## Summary

Ghostty supports the standard terminal-program path for changing a window
title: an OSC 2 control sequence carrying a UTF-8 title.

## Key passages

1. Ghostty documents OSC 2 as `ESC ] 2 ; t ESC \`, changing the window title
   to `t`. (Sequence and description; lines 66–85.)
2. Ghostty interprets the title payload as UTF-8 unconditionally, unlike xterm's
   configurable legacy interpretation. (Encoding note; line 87.)

## Structural metadata

Official Ghostty VT reference for OSC 2, fetched 2026-08-14.
