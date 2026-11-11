---
source_handle: hma-reboot-apple-ups-help
fetched: 2026-11-10
source_url: https://support.apple.com/guide/mac-help/set-mac-shuts-a-ups-mchlp2987/mac
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Mac User Guide page "Set when your Mac shuts down while using a UPS". The only fetched Apple user-facing UPS text; it describes Energy settings UPS Options and says nothing about graceful application handling or restart on power return.

## Key passages

- [1] "Reduce the risk of losing data during a power outage by using an uninterruptible power supply (UPS). In the event of a power failure, a UPS provides power to your Mac for a period of time."
- [2] "Some UPS devices run until their batteries are expended and then shut down. With other UPS devices, you can connect the device to the computer’s USB port and set options for it using Energy settings."
- [3] Steps: "On your Mac desktop computer, choose Apple menu > System Settings, then click Energy in the sidebar. ... Click UPS Options. Select one or more options to determine when to shut down after a power outage. Then use the slider to specify the time or battery level at which the Mac desktop computer shuts down."
- [4] "If you choose more than one option, the Mac desktop computer shuts down when the first condition is met."

## Structural notes

Fetched with curl on 2026-11-10. The page does not name the UPS interface class (HID power device), supported UPS models, or what "shuts down" does to running apps.
