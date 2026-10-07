---
source_handle: ghostty-actions-title
fetched: 2026-08-14
source_url: https://ghostty.org/docs/config/keybind/reference
provenance: source-direct
substrate_confidence: source-direct
source_class: official-reference
---

# Ghostty title actions

## Summary

Ghostty distinguishes terminal-surface titles from tab-title overrides. A tab
override wins over titles emitted by terminal programs and remains in force
across focus changes until explicitly cleared.

## Key passages

1. A title entered through `prompt_tab_title` overrides any title set by the
   terminal and persists across focus changes inside the tab. (Section
   `prompt_tab_title`; lines 305–307.)
2. `set_surface_title` changes the focused terminal surface title; an empty
   value resets that surface title. (Section `set_surface_title`; lines
   309–313.)
3. `set_tab_title` changes the focused tab title; an empty value clears the tab
   title override. (Section `set_tab_title`; lines 315–319.)

## Structural metadata

Official Ghostty keybinding-action reference, fetched 2026-08-14.
