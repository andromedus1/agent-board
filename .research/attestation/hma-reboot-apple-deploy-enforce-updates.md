---
source_handle: hma-reboot-apple-deploy-enforce-updates
fetched: 2026-11-10
source_url: https://support.apple.com/guide/deployment/install-and-enforce-software-updates-depd30715cbb/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Deployment page "Install and enforce software updates for Apple devices" (Published Date September 24, 2025). Describes MDM-only controls: time-based deferrals (supervised devices), automatic update installation choices, and enforcement that overrides deferrals and a disabled BSI switch.

## Key passages

- [1] "Supervised devices can be prevented from offering OTA software updates to users or trigger an automatic update until a specified period of time has passed since they were made publicly available by Apple."; custom deferral "from 1 to 90 days".
- [2] "On devices with iOS 18, iPadOS 18, macOS 14, tvOS 18.4, or later, organizations can manage the automatic software update behavior on supervised devices."
- [3] "Background Security Improvements don’t adhere to the managed software update deferral. Because they apply only to the latest minor operating system version, if that update is deferred, the Background Security Improvement is also effectively deferred."
- [4] "Organizations can enforce specific software updates at a chosen time regardless of configured deferrals or if the automatic installation of Background Security Improvements is turned off."
- [5] Enforced-update behaviour on Mac: "macOS force quits all open apps (regardless of whether any documents are open and unsaved) and performs a restart if necessary"; "On a Mac with Apple silicon, the Mac uses a bootstrap token (if one is available) to authorize the update or the Mac prompts the user for their credentials".
- [6] "Organizations can change the default behavior to require authorization by a local administrator to install a software update."
- [7] "For Mac computers, there’s an additional setting with the same three configuration options for security updates, which include updates for XProtect, Gatekeeper, and system data files." (the three options: let the user choose, off, on).

## Structural notes

Fetched with curl on 2026-11-10. The page is written for device-management services; it does not say which controls are reachable on an unmanaged personal Mac except by omission, so the "needs MDM" reading is the page's scope, not an explicit Apple statement.
