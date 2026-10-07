---
source_handle: ghostty-local-runtime-probe
fetched: 2026-08-14
source_path: .research/source-captures/ghostty-1.3.1/applescript-runtime-probe.txt
provenance: source-direct
substrate_confidence: source-direct
source_class: local-experiment
---

## Summary

The local Ghostty 1.3.1 experiment verified AppleScript enumeration, stable IDs,
targeted title set/update/clear, and the close/undo behavior that keeps a hidden
surface enumerable and restores it with the same IDs.

## Key passages

- [1] G1 records successful enumeration and current-machine Automation access.
- [2] G2 records successful targeted title updates and clear with unchanged
  window, tab, and terminal IDs.
- [3] G2 records that closing the temporary window removed its terminal from
  application-wide enumeration.
- [4] G3 records that a closed tab's terminal remained enumerable during the
  undo window and that undo restored the original tab and terminal IDs.
- [5] G4 records the absence of conflicting explicit Ghostty title config and
  the presence of Codex's default title-writer condition.
- [6] Limits records that reordering, window movement, and live bell decoration
  were not exercised.

## Structural notes

- All AppleScript mutations targeted temporary objects captured by stable ID.
- Temporary probe windows and tabs were closed after testing.

## Scope and gaps

This attests behavior for the installed Ghostty 1.3.1 build on the current Mac.
It does not establish behavior on older releases or prove that every enumerable
surface is visible.
