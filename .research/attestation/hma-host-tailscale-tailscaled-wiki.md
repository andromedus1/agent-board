---
source_handle: hma-host-tailscale-tailscaled-wiki
fetched: 2026-11-10
source_url: https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

GitHub wiki page "Tailscaled on macOS" (edited Aug 26, 2025 by Brad Fitzpatrick). Build and run instructions for the open-source tailscaled and its differences from the GUI variants.

## Key passages

- [1] "There are multiple ways to use Tailscale on macOS. The recommended way is to always install the Standalone variant". "This page is about how to use the open source, non-GUI tailscaled and tailscale binaries. This is only recommended for advanced users."
- [2] "sudo $HOME/go/bin/tailscaled install-system-daemon ... That copies the binary to /usr/local/bin and installs a plist in /Library/LaunchDaemons/com.tailscale.tailscaled.plist and starts com.tailscale.tailscaled."
- [3] Comparison to GUI version: "tailscaled can run at system boot before any user has logged in (e.g. letting you VNC to your computer after a power outage)".
- [4] "tailscaled on macOS is less tested." and "MagicDNS works, but you need to set 100.100.100.100 as your DNS server yourself. It doesn't change your DNS config."
- [5] Homebrew: "brew install --formula tailscale; sudo brew services start tailscale; sudo tailscale up".

## Structural notes

- The wiki is a maintainer-edited GitHub page, not the KB.
