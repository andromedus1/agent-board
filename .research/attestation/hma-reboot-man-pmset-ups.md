---
source_handle: hma-reboot-man-pmset-ups
fetched: 2026-11-10
source_path: .research/source-captures/hma-host-man/pmset.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Second reading of the local pmset(1) manual page for the UPS section: how halt thresholds combine, how to turn them off, and the example commands. Complements hma-host-man-pmset.

## Key passages

- [1] "UPS-specific arguments are only valid following the -u option. UPS settings also have an on/off value. Use a -1 argument instead of percent or minutes to turn any of these settings off. If multiple halt conditions are specified, the system will halt on the first condition that occurs in a low power situation."
- [2] Synopsis line: "pmset -u [haltlevel percent] [haltafter minutes] [haltremain minutes]"; "-g ups displays UPS emergency thresholds."
- [3] Example: "For a system with an attached and supported UPS, this instructs the system to perform an emergency shutdown when UPS battery drains to below 25%, or when the UPS estimates it has less than 30 minutes remaining runtime." with command "pmset -u haltlevel 25 haltremain 30".
- [4] "Note: None of these settings are observed on a system with support for an internal battery, such as a laptop. UPS emergency shutdown settings are for desktop and server only."
- [5] "pmset must be run as root in order to modify any settings."

## Structural notes

Text read from the existing capture .research/source-captures/hma-host-man/pmset.txt on 2026-11-10. The man page says "attached and supported UPS" without defining supported, and does not say whether the shutdown notifies apps.
