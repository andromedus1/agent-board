---
source_handle: hma-reboot-man-softwareupdate
fetched: 2026-11-10
source_path: .research/source-captures/hma-reboot/softwareupdate.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Local softwareupdate(8) manual page (macOS 26.6 machine). Lists --list, --install with --restart/--force, --stdinpass and --user (Apple silicon only), --download, --background and --schedule. It documents no command that turns automatic installation off.

## Key passages

- [1] SYNOPSIS: "softwareupdate --install [--recommended] [--all] [--os-only] [--safari-only] [item ...] [--restart [--force]] [--stdinpass] [--user]" and separate "softwareupdate --background" and "softwareupdate --schedule" lines.
- [2] DESCRIPTION: "softwareupdate requires admin authentication for all commands except --list."
- [3] -R | --restart: "Automatically restart if required to complete installation. If the user invoking this tool is logged in then macOS will attempt to quit all applications, logout, and restart. If the user is not logged in, macOS will trigger a forced reboot if necessary. If you wish to always perform a forced reboot, use --force."
- [4] --stdinpass: "Collect a password from stdin without interaction. Apple silicon only."
- [5] --user: "An owner user to authorize installation. Apple silicon only."
- [6] --download: "Each update specified by args is downloaded but not installed ... Updates downloaded with --download can be subsequently installed with --install, or through System Settings".
- [7] --background: "Trigger a background check with a forced scan."; --schedule: "Returns the per-machine automatic (background) check preference."
- [8] The SYNOPSIS and command list contain no verb for disabling automatic download or installation; the page footer is dated "September 11, 2012" although it documents Apple-silicon-only flags.

## Structural notes

Text captured with `man softwareupdate | col -b` on the local macOS 26.6 (Darwin 25.6.0) machine on 2026-11-10. The page does not say whether --stdinpass/--user perform an authenticated (FileVault key-preserving) restart; it says only that they authorise installation as an owner user.
