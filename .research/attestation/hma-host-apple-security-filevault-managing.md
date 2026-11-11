---
source_handle: hma-host-apple-security-filevault-managing
fetched: 2026-11-10
source_url: https://support.apple.com/guide/security/sec8447f5049/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Security guide, "Managing FileVault in macOS" (Published Date January 28, 2026). Covers Secure Token, Bootstrap Token, institutional versus personal recovery keys, and a closing "Unlock FileVault using SSH" subsection.

## Key passages

- [1] Section "Unlock FileVault using SSH": "On a Mac with Apple silicon with macOS 26 or later, FileVault can be unlocked over SSH after a restart if Remote Login is turned on and a network connection is available."
- [2] Section "Institutional versus personal recovery keys": "on a Mac with Apple silicon, IRKs provide no functional value for two primary reasons: IRKs can't be used to access recoveryOS, and because target disk mode is no longer supported, the volume can't be unlocked by connecting it to another Mac." and "a personal recovery key (PRK) should be used."

## Structural notes

- The SSH-unlock subsection is a single sentence; no setup detail, account scope or network detail is given on this page.
