---
source_handle: hma-reboot-apple-security-boot-modes
fetched: 2026-11-10
source_url: https://support.apple.com/guide/security/boot-modes-sec10869885b/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Security guide "Boot modes for a Mac with Apple silicon" (Published Date May 13, 2022). Lists the physical key combinations for macOS, paired recoveryOS, fallback recoveryOS and safe mode.

## Key passages

- [1] Paired recoveryOS: "From a shutdown state, press and hold the power button." Fallback recoveryOS: "From a shutdown state, double-press and hold the power button." macOS: "From a shutdown state, press and release the power button."
- [2] Safe mode: "Boot into recoveryOS per the above, then hold Shift while selecting the startup volume."

## Structural notes

Fetched with curl on 2026-11-10. The page gives the physical entry method only; it does not describe authentication inside recoveryOS.
