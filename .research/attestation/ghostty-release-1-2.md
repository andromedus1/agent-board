---
source_handle: ghostty-release-1-2
fetched: 2026-08-14
source_url: https://ghostty.org/docs/install/release-notes/1-2-0
provenance: source-direct
substrate_confidence: source-direct
source_class: official-release-notes
---

# Ghostty 1.2 release notes

## Summary

Ghostty 1.2 introduced macOS automation and an undo model in which recently
closed terminal processes remain alive but hidden for a short period.

## Key passages

1. Closing a terminal, tab, or window is undoable because Ghostty keeps the
   terminal running but hidden for a configured timeout; the prose describes a
   five-second default, while the full changelog on the same page describes a
   ten-second default. (Section “macOS: Undo/Redo Close”; lines 233–243; full
   changelog lines 453–455.)
2. Ghostty 1.2 integrated with Apple Shortcuts but explicitly said this did not
   replace the project's future cross-platform scripting API. (Section
   “macOS: Apple Shortcuts”; lines 244–251.)

## Structural metadata

Official Ghostty 1.2.0 release notes, fetched 2026-08-14. The page contains an
internal discrepancy about the default undo retention interval; the operative
fact for this research is that a closed surface can remain as a live process
for a bounded interval.
