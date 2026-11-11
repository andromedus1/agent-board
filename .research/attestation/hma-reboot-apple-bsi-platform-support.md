---
source_handle: hma-reboot-apple-bsi-platform-support
fetched: 2026-11-10
source_url: https://support.apple.com/guide/platform-support/sup114938211/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Support page "Background Security Improvements support" (Published Date October 22, 2025). States the restart requirement, default-on behaviour, the user switch, removal, and the fact that these updates ignore the managed software update delay.

## Key passages

- [1] "Background Security Improvements that involve the operating system require the device to restart. For a Mac, the applied operating system content may be made available to Safari and its associated processes with just a relaunch of those processes, though a restart is required to make this content broadly available to the rest of the operating system."
- [2] "Background Security Improvements also don’t adhere to the managed software update delay; however, because they apply only to the latest minor operating system version, if that minor operating system update is delayed, the Background Security Improvement is also effectively delayed. If necessary, the user can also remove Background Security Improvements."
- [3] "By default, a device automatically applies Background Security Improvements. If necessary, a prompt appears asking to restart the device."
- [4] "If the user chooses to turn off this setting or not to apply Background Security Improvements when they’re available, the device receives relevant fixes or mitigations when they’re included in a subsequent software update. When device management is used to manage software updates, it can also manage Background Security Improvements."
- [5] "Organizations can define whether Background Security Improvements are automatically applied and specify whether users are allowed to remove them after they’ve been applied."
- [6] "On Mac: Choose Apple menu > System Settings, click Privacy & Security in the sidebar, click Background Security Improvements, then make sure that Automatically Install is turned on."
- [7] "When you remove a Background Security Improvement, you remove all Background Security Improvements that have been applied since the last software update." Mac removal path: "click the Info button next to the version number, click Remove and Restart".

## Structural notes

Fetched with curl and HTML-to-text extraction on 2026-11-10. The page text says "If necessary, a prompt appears asking to restart the device"; it does not say whether the prompt is skipped on an unattended Mac.
