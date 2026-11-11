---
source_handle: hma-reboot-apple-security-startup-policy
fetched: 2026-11-10
source_url: https://support.apple.com/guide/security/startup-disk-security-policy-control-sec7d92dc49f/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Security guide "Startup Disk security policy control for a Mac with Apple silicon" (Published Date February 18, 2021). Describes Full/Reduced/Permissive security and recoveryOS gating of security downgrades.

## Key passages

- [1] "If changing a security setting would significantly degrade security or make the system easier to compromise, users need to enter into recoveryOS by holding the power button (so that malware can’t initiate the signal, only a human with physical access can) to make the change. Because of this, an Apple-silicon based Mac also won’t require (or support) a firmware password—all critical changes are already gated by user authorization."
- [2] "Full Security is the default, and it behaves like iOS and iPadOS. ... macOS contacts the same Apple signing server used for iOS and iPadOS and requests a fresh, “personalized” signature" that includes the Exclusive Chip Identification (ECID).
- [3] "But a user that’s in possession of an administrator user name and password for the Mac can always choose the security policy that works best for their use cases."
- [4] "Full Security and Reduced Security can be set using Startup Security Utility from recoveryOS."

## Structural notes

Fetched with curl on 2026-11-10. The page is dated 2021; no later edition was read. It does not say what a person without admin credentials can do inside recoveryOS to the user data volume.
