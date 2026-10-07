---
source_handle: ghostty-applescript-source-v1-3-1
fetched: 2026-08-14
source_url: https://github.com/ghostty-org/ghostty/blob/332b2aefc6e72d363aa93ab6ecfc86eeeeb5ed28/macos/Sources/Features/AppleScript/AppDelegate%2BAppleScript.swift
provenance: source-direct
substrate_confidence: source-direct
source_class: official-source-code
---

# Ghostty 1.3.1 AppleScript enumeration implementation

## Summary

Ghostty 1.3.1 implements AppleScript terminal lookup over its collection of
currently alive GUI surfaces and supports re-identifying a terminal by its
stable terminal UUID.

## Key passages

1. The application-level `terminals` collection maps every item in
   `allSurfaceViews` to an AppleScript terminal wrapper. (Lines 86–95 at the
   1.3.1 commit.)
2. Unique-ID lookup resolves `terminal id "..."` against the UUID of each live
   surface. (Lines 97–111 at the 1.3.1 commit.)
3. `allSurfaceViews` is documented as discovering all currently alive terminal
   surfaces across normal and quick-terminal windows, then derives those
   surfaces from current terminal controllers' surface trees. (Lines 316–326
   at the 1.3.1 commit.)

## Structural metadata

Ghostty AppleScript implementation at the peeled `v1.3.1` commit
`332b2aefc6e72d363aa93ab6ecfc86eeeeb5ed28`, fetched 2026-08-14.
