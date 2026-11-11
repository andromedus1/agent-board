---
source_handle: hma-reboot-local-softwareupdate-state
fetched: 2026-11-10
source_path: .research/source-captures/hma-reboot/softwareupdate-prefs-local.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Read-only local command output from the operator laptop (Mac17,3, macOS 26.6, FileVault On; not the Mac mini): `softwareupdate --schedule`, `fdesetup supportsauthrestart`, `fdesetup status` and the Software Update preference keys. Shows the preference key names behind the Automatic Updates toggles and that supportsauthrestart returned true on one Apple-silicon Mac.

## Key passages

- [1] `softwareupdate --schedule` printed "Automatic checking for updates is turned on".
- [2] `defaults read /Library/Preferences/com.apple.SoftwareUpdate` (filtered) showed AutomaticDownload = 1; AutomaticallyInstallMacOSUpdates = 1; ConfigDataInstall = 1; CriticalUpdateInstall = 1.
- [3] `fdesetup supportsauthrestart` printed "true" on hw.model Mac17,3 running macOS 26.6 (ProductVersion 26.6, BuildVersion 25G72); `fdesetup status` printed "FileVault is On."

## Structural notes

Commands were read-only and needed no sudo. The machine is the operator laptop, not the Mac mini, so values are examples of key names and of one supportsauthrestart result; Apple does not document the mapping from these keys to specific System Settings toggles in any fetched page. Capture in the source_path file (softwareupdate-prefs-local.txt) holds only the preference keys; supportsauthrestart.txt holds the authrestart/model lines.
