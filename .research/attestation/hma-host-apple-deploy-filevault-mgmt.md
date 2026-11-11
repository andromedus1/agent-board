---
source_handle: hma-host-apple-deploy-filevault-mgmt
fetched: 2026-11-10
source_url: https://support.apple.com/guide/deployment/dep0a2cb7686/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Deployment page "Manage FileVault with device management" (Published Date September 17, 2026). Covers FileVault enablement in Setup Assistant, deferred enablement, volume-owner and secure-token requirements, and personal recovery keys.

## Key passages

- [1] Overview: "Having a user be enabled to unlock FileVault requires that they have a secure token and, on a Mac with Apple silicon, that they be volume owners."
- [2] Enforce FileVault in Setup Assistant: "On a Mac with macOS 26.4 or later, FileVault is turned on during Setup Assistant by default."
- [3] Personal recovery keys: "A personal recovery key (PRK) can be used either in recoveryOS or to start up an encrypted Mac directly into macOS." and "For the user to start up directly into macOS, press Option-Shift-Return on the FileVault screen to reveal the entry field for the PRK".
- [4] Personal recovery keys: "There is only one PRK per encrypted volume".

## Structural notes

- Device-management oriented; applies to a personal Mac by analogy only.
