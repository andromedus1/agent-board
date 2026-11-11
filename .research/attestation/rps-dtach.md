---
source_handle: rps-dtach
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/crigler/dtach/master/README
source_path: .research/source-captures/rps-dtach/capture.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of dtach, which emulates screen's detach feature only: a program runs protected from the controlling terminal and its raw output stream is passed through with no terminal-emulation layer.

## Key passages

- [1] Section 1: dtach lets a program execute "in an environment that is protected from the controlling terminal", so it is not affected by the terminal being disconnected.
- [2] Section 1: dtach has no terminal emulation layer and passes the raw output stream to attached terminals; the only input it processes is the detach character and suspend key.
- [3] Section 1: it does not support multiple terminals or terminal emulation, the features of screen it deliberately omits.
- [4] Section 2: sessions are represented by Unix-domain sockets stored in the filesystem, named by the user.

## Structural notes

- No statement on reboot, titles, or status.
