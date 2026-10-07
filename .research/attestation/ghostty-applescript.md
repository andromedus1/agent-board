---
source_handle: ghostty-applescript
fetched: 2026-08-14
source_url: https://ghostty.org/docs/features/applescript
provenance: source-direct
substrate_confidence: source-direct
source_class: official-documentation
---

# Ghostty AppleScript documentation

## Summary

Ghostty 1.3.0 and later expose a macOS AppleScript object model for windows,
tabs, and terminal surfaces. The API includes stable object IDs, enumeration,
focus and selection operations, and a generic way to execute Ghostty binding
actions against a selected terminal.

## Key passages

1. AppleScript support was introduced in Ghostty 1.3.0. Ghostty exposes an
   `application -> windows -> tabs -> terminals` hierarchy; windows, tabs, and
   terminals each have an `id`, while terminals also expose title and working
   directory. (Sections “Overview” and “Object Model”; lines 46–81.)
2. `front window`, `selected tab`, and `focused terminal` provide a direct path
   to the active terminal, while terminal collections can be queried by working
   directory or title. (Section “Object Query Examples”; lines 81–105.)
3. The API can focus a terminal, activate a window, select a tab, and close a
   terminal, tab, or window. (Section “Focus, Selection, and Lifecycle”; lines
   116–124.)
4. `perform action` executes a Ghostty action string against a terminal, and
   those strings use the same action names as keybindings. (Section “Input and
   Actions”; lines 125–136.)
5. AppleScript support is enabled by default, can be disabled with
   `macos-applescript = false`, and is protected by macOS Automation (TCC)
   permission. (Section “Security”; lines 160–167.)

## Structural metadata

Official Ghostty feature documentation, fetched 2026-08-14. The page names the
bundled `Ghostty.sdef` as the scripting dictionary's source of truth.
