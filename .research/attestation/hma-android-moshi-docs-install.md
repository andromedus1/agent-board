---
source_handle: hma-android-moshi-docs-install
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/install
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation page on installing the app and preparing a host. It states platform requirements including Android, the Homebrew installation of moshi-hook and mosh on macOS, and the mosh UDP port guidance.

## Key passages

- [1] Requirements: "iOS or iPadOS 17 or newer, or Android 10 or newer."; a host you can SSH into; network access from the device to the host with "Tailscale, a VPN, LAN DNS, public DNS, and bastion hosts can all work"; "mosh-server on the host if you want mosh transport"; "tmux on the host if you want durable workspaces".
- [2] "Install Moshi from the App Store on iOS / iPadOS, or from Google Play on Android." The fastest first-host setup is Easy Pair: install moshi-hook on the host, run one setup command, scan the QR from Moshi.
- [3] macOS host packages: brew tap rjyo/moshi, brew trust rjyo/moshi, brew install moshi-hook, then brew install mosh tmux.
- [4] Networking: "Plain SSH uses TCP, usually port 22. Mosh uses SSH to start the session, then switches to UDP. If you force mosh or your firewall is strict, open the mosh UDP range on the host" (example ufw allow 60000:61000/udp).

## Structural notes

- Vendor documentation; page marked updated 1 month ago on the page. Herdr is not named on this page.
