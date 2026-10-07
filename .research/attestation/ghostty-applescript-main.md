---
source_handle: ghostty-applescript-main
fetched: 2026-08-14
source_url: https://github.com/ghostty-org/ghostty/blob/16833f5e5f58589c3d6ba876a73eb0c5f550231d/macos/Ghostty.sdef
provenance: source-direct
substrate_confidence: source-direct
source_class: official-source-code
---

# Ghostty main-branch AppleScript dictionary

## Summary

Ghostty's post-1.3.1 main branch extends the AppleScript terminal entity with
foreground PID and TTY properties. These properties are not part of the 1.3.1
stable dictionary and therefore are forward-looking rather than a V1 baseline.

## Key passages

1. The terminal entity defines read-only stable ID, title, and working
   directory properties. (Lines 88–92 at commit
   `16833f5e5f58589c3d6ba876a73eb0c5f550231d`.)
2. The same entity adds read-only `pid`, described as the foreground process
   PID, and `tty`, described as the terminal device path. (Lines 93–94 at that
   commit.)
3. Repository history attributes the PID/TTY addition to commit
   `9a9002202b` (`macos: add pid and tty properties to AppleScript terminal
   class`) after the 1.3.1 release commit.

## Structural metadata

Official Ghostty main-branch scripting dictionary at commit
`16833f5e5f58589c3d6ba876a73eb0c5f550231d`, fetched 2026-08-14. Comparison
against the `v1.3.1` dictionary confirmed that PID and TTY are absent there.
