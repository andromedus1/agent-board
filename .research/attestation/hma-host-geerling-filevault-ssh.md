---
source_handle: hma-host-geerling-filevault-ssh
fetched: 2026-11-10
source_url: https://www.jeffgeerling.com/blog/2025/you-can-finally-manage-macs-filevault-remotely-tahoe/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Practitioner blog post by Jeff Geerling on pre-boot SSH unlock of FileVault in macOS 26, with an update for 26.5. Practitioner source; hands-on observation by one operator, not a vendor statement.

## Key passages

- [1] "with macOS Tahoe, if you have 'Remote Access' enabled in your Sharing settings (this enables SSH access), you can now log in via SSH pre user login, then enter an Administrator's account password to 'unlock' the machine and complete the full boot."
- [2] "And at that point, you can either log in via normal SSH, or use tools like Screen Sharing."
- [3] "if my Mac was only connected to WiFi, I couldn't get connected pre-login. If I plugged it into Ethernet (wired networking), it worked fine."
- [4] "Update on WiFi: As of macOS 26.5, I was able to unlock the Mini over WiFi as well".
- [5] Context: "after working through installing NUT on a Pi for network UPS management, I discovered my Mac, once rebooted, would not allow remote access until I was physically present to type in my account password ... Because FileVault encryption means the Mac won't fully boot until you log in, physically, at the machine."

## Structural notes

- Author uses a WireGuard VPN at home; the post does not say how the pre-boot SSH was reached over the VPN or whether the VPN was up before unlock.
- Unlock credential is described as an Administrator account password; standard-user unlock is not tested.
