---
source_handle: hma-reboot-man-fdesetup-authrestart
fetched: 2026-11-10
source_path: .research/source-captures/hma-host-man/fdesetup.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Second reading of the local fdesetup(8) manual page (macOS 26 machine) for the authrestart passages not recorded in hma-host-man-fdesetup: root and password requirement, the -delayminutes and -inputplist options, and the supportsauthrestart caveat.

## Key passages

- [1] "fdesetup must be run as root and itself prompts for a password to unlock the FileVault root volume."
- [2] "Once authrestart is authenticated, it launches shutdown(8) and, upon successful unlock, the unlock key will be removed."
- [3] "The supportsauthrestart command will check the system to see if it supports the authrestart command option, however you should note that even if this returns true, FileVault must still be enabled for authrestart to work."
- [4] Verb authrestart: "authrestart [-inputplist] [-delayminutes number_of_minutes_to_delay] [-verbose] If FileVault is enabled on the current volume, it restarts the system, bypassing the initial unlock. The optional -delayminutes option can be used to delay the restart command for a set number of minutes. A value of 0 represents 'immediately', and a value of -1 represents 'never'. The command may not work on all systems."
- [5] Verb supportsauthrestart: "Returns the string \"true\" if the system supports the authenticated restart option. Note that even if true is returned, this does not necessarily mean that authrestart will work since it requires that FileVault be enabled."

## Structural notes

Text read from the existing capture .research/source-captures/hma-host-man/fdesetup.txt on 2026-11-10 (via `col -b`); the man page does not mention Apple silicon, macOS 26, or software update.
