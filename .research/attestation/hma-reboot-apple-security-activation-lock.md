---
source_handle: hma-reboot-apple-security-activation-lock
fetched: 2026-11-10
source_url: https://support.apple.com/guide/security/activation-lock-security-sec0f8dfd030/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Security guide "Activation Lock security" (Published Date December 19, 2024). Describes how Activation Lock works on a Mac with Apple silicon through the LocalPolicy and activation certificate.

## Key passages

- [1] "Activation Lock helps to prevent unauthorized users from reactivating an iPad, iPhone, Mac, Apple Vision Pro, and Apple Watch if it’s lost or stolen. It remains enabled even if the device is erased."
- [2] "On an unsupervised Mac, Activation Lock is enabled automatically when the user signs in with their Apple Account and turns on Find My."
- [3] "On a Mac with Apple silicon, the Low-Level Bootloader (LLB) verifies that a valid LocalPolicy for the device exists ... The LLB boots to recoveryOS if: There is no LocalPolicy for the current macOS ... recoveryOS detects that the Mac isn’t activated and contacts the activation server to get an activation certificate."
- [4] "If the device is locked using Activation Lock while in recoveryOS, Activation Lock can be unlocked by: The credentials of the personal Apple Account used to enable Activation Lock; The previously used device password of the local user who enabled Activation Lock; The bypass code escrowed by the device management service".
- [5] "Note: The LLB won’t allow booting of macOS unless a valid LocalPolicy is present."

## Structural notes

Fetched with curl on 2026-11-10. Activation Lock applies to reactivation after erase; the page does not claim it protects data on a Mac that still boots macOS normally.
