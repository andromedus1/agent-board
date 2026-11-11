---
source_handle: hma-host-man-pmset
fetched: 2026-11-10
source_path: .research/source-captures/hma-host-man/pmset.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Local pmset(1) manual page. Documents sleep, disksleep, womp, autorestart, ttyskeepawake, destroyfvkeyonstandby and UPS halt thresholds.

## Key passages

- [1] "sleep - system sleep timer (value in minutes, or 0 to disable)"; "disksleep - disk spindown timer ... (value in minutes, or 0 to disable)".
- [2] "womp - wake on ethernet magic packet (value = 0/1). Same as \"Wake for network access\" in System Settings."
- [3] "autorestart - automatic restart on power loss (value = 0/1)"; "autorestartatconnect - automatic restart on power connect (value = 0/1)".
- [4] "ttyskeepawake - prevent idle system sleep when any tty (e.g. remote login session) is 'active'. A tty is 'inactive' only when its idle time exceeds the system sleep timer."
- [5] "destroyfvkeyonstandby - Destroy File Vault Key when going to standby mode. By default File vault keys are retained even when system goes to standby. If the keys are destroyed, user will be prompted to enter the password while coming out of standby mode."
- [6] UPS SPECIFIC ARGUMENTS (only valid after -u): "haltlevel - when draining UPS battery, battery level at which to trigger an emergency shutdown (value in %)"; "haltafter ... (value in minutes, or 0 to disable)"; "haltremain ... (value in minutes, or 0 to disable)".
- [7] UPS note: "UPS emergency shutdown settings are for desktop and server only."
- [8] "-g ps / batt displays status of batteries and UPSs."

## Structural notes

- Text captured from the local macOS 26 (Darwin 25.6.0) machine on 2026-11-10 into the source_path file.
- The man page text is generic across Macs; it does not say which keys Apple silicon Mac mini honours, and does not describe the USB HID UPS mechanism.
