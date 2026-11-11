---
source_handle: hma-reboot-local-ups-plumbing
fetched: 2026-11-10
source_path: .research/source-captures/hma-reboot/upsshutdown.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Local read-only inspection of macOS UPS plumbing on the operator laptop (macOS 26.6): the /usr/libexec/upsshutdown script and the com.apple.ioupsd launchd plist. Shows the emergency-shutdown command and the HID usage pages that launch the UPS daemon.

## Key passages

- [1] /usr/libexec/upsshutdown (shell script): logs `MSG="Shutting down due to power loss!"` with `logger -i -p daemon.emerg -t UPS`; with argument WaitForUPS it runs `shutdown -hu now "${MSG}"` under the comment "Wait for UPS to take the system down abruptly and unexpectedly."; otherwise it runs `shutdown -h now "${MSG}"` under the comment "Gently shutdown the system immediately."
- [2] /System/Library/LaunchDaemons/com.apple.ioupsd.plist (`plutil -p`, capture ioupsd-plist.txt): Program "/usr/libexec/ioupsd"; LaunchEvents com.apple.iokit.matching entry "HIDDevice attached" with IOProviderClass IOHIDDevice and DeviceUsagePage values 132 and 133 (and DeviceUsage 6 / 20 pairs); an "SMCAccessory attached" entry matching IOPMPowerSource with property AccessoryDetails.
- [3] shutdown(8) (local man page): "The shutdown utility provides an automated shutdown procedure for super-users to nicely notify users when the system is shutting down"; "-h The system is halted and powered off at the specified time."; "-o If one of the -h or -r options are specified, shutdown will execute halt(8) or reboot(8) instead of sending a signal to launchd(8)."

## Structural notes

Read with `cat /usr/libexec/upsshutdown`, `plutil -p` and `man shutdown` on the operator laptop (not the Mac mini). The scripts are Apple-shipped but undocumented; nothing here shows which path ioupsd takes on a desktop, and `pmset -g ups` showed no UPS on this machine. That plain `shutdown -h now` (without -o) signals launchd and so allows normal app termination is from the shutdown(8) text above, not from an Apple UPS statement.
