---
source_handle: hma-host-apple-deploy-filevault-intro
fetched: 2026-11-10
source_url: https://support.apple.com/guide/deployment/intro-to-filevault-dep82064ec40/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Deployment page "Intro to FileVault" (Published Date September 17, 2026). States that FileVault credentials are required during boot and that on Apple silicon with macOS 26 or later FileVault can be unlocked over ssh after a restart given Remote Login and a network connection.

## Key passages

- [1] Overview: "After a user turns on FileVault on a Mac, their credentials are required during the boot process. On a Mac with Apple silicon and with macOS 26 or later, FileVault can be unlocked over ssh after a restart if Remote Login is turned on and a network connection is available."
- [2] Overview: "On a Mac with Apple silicon and those with the Apple T2 Security Chip, all FileVault key handling occurs in the Secure Enclave. Encryption keys are never directly exposed to the CPU."
- [3] Network requirements: "Network connectivity for FileVault is necessary to unlock FileVault using SSH and in certain configurations using Platform Single Sign-on. See FileVault network requirements." (the linked section sits on the Platform SSO page; see hma-host-apple-psso-filevault-network)

## Structural notes

- Fetched as raw HTML and text-extracted; page body read in full.
- Does not state which account types can unlock over SSH, nor whether a GUI session starts after the unlock.
