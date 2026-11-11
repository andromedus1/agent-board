---
source_handle: hma-host-apple-psso-filevault-network
fetched: 2026-11-10
source_url: https://support.apple.com/guide/deployment/platform-sso-for-mac-dep7bbb05313/1/web/1
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Deployment page on Platform SSO for Mac (Published Date November 03, 2026). Contains a "FileVault network requirements" subsection scoped to Platform SSO features reaching an identity provider before FileVault unlock.

## Key passages

- [1] FileVault network requirements: "Platform SSO needs to be able to reach the IdP prior to FileVault unlock for the following features: Web-based authentication / Authenticated Guest Mode / Login policy"
- [2] FileVault network requirements: "Because macOS needs to establish connectivity before the data volume is available, you need to reach the IdP without a VPN, network relay, or 802.1X authentication."
- [3] Platform SSO and passkeys: "Passkeys are unavailable for use with FileVault unlock because the pre-boot environment doesn't have access to the necessary security and networking protocols."

## Structural notes

- Subsection is about Platform SSO, not SSH unlock. The Wi-Fi/Ethernet SSH-unlock network requirement that Apple's intro page points to was NOT found in this page text or any other fetched Apple page.
