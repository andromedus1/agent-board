---
source_handle: hma-host-man-fdesetup
fetched: 2026-11-10
source_path: .research/source-captures/hma-host-man/fdesetup.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Local fdesetup(8) manual page. Documents authrestart, which restarts a FileVault-enabled system without unlock at the next boot, and the reduced protection it entails.

## Key passages

- [1] DESCRIPTION: "On supported hardware, fdesetup allows restart of a FileVault-enabled system without requiring unlock during the subsequent boot using the authrestart command. WARNING: FileVault protections are reduced during authenticated restarts."
- [2] DESCRIPTION: "fdesetup deliberately stores at least one additional copy of a permanent FDE (full disk encryption) unlock key in both system memory and (on supported systems) the System Management Controller (SMC)." and "Use pmset destroyfvkeyonstandby to prevent saving the key across standby modes."
- [3] DESCRIPTION: "Once authrestart is authenticated, it launches shutdown(8) and, upon successful unlock, the unlock key will be removed."
- [4] VERBS authrestart: "If FileVault is enabled on the current volume, it restarts the system, bypassing the initial unlock. ... The command may not work on all systems."
- [5] DESCRIPTION: "The supportsauthrestart command will check the system to see if it supports the authrestart command option".

## Structural notes

- Text captured from the local macOS 26 (Darwin 25.6.0) machine on 2026-11-10 into the source_path file.
- The man page does not say whether authrestart is effective on macOS 26 Apple silicon desktops; it says only "may not work on all systems".
