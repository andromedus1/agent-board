---
source_handle: hma-host-tailscale-macos-variants
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1065/macos-variants
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Tailscale KB "Three ways to run Tailscale on macOS" (Last validated Jan 5, 2026). Recommends the Standalone variant, and gives a comparison table of App Store, Standalone and open-source tailscaled variants.

## Key passages

- [1] "We recommend downloading and installing the Standalone variant Tailscale app directly from our package server, as this variant offers more features, is not subject to limitations imposed on apps distributed through the App Store, and provides more control over the deployment of updates."
- [2] Open source tailscaled variant: "tailscaled on macOS is only recommended for unattended installs managed by experienced macOS system administrators."
- [3] Comparison table, "Run before login": App Store "no; sandboxed"; Standalone "no"; tailscaled "yes".
- [4] Comparison table, "Can be a Tailscale SSH server": App Store "no"; Standalone "no"; tailscaled "yes". "Can be a Tailscale SSH client": yes for all three.
- [5] Comparison table, "Auto-updates": App Store "yes; managed by the App Store"; Standalone "yes; managed in-app (Sparkle)"; tailscaled "no".
- [6] Comparison table, "Funnel": App Store "no"; Standalone "no"; tailscaled "yes". "Keychain used": App Store "user"; Standalone "none; files on disk"; tailscaled "none; files on disk". "Requires Apple ID": App Store "yes".
- [7] "Do not install the Mac App Store variant and the Standalone variant on the same machine."
- [8] Standalone variant: system extensions "run with root privileges but remain within a sandbox".

## Structural notes

- The table has no row for Serve; Serve limitations are in hma-host-tailscale-serve.
- The table row "Run before login: no" for Standalone is a bare cell; the page does not explain the mechanism.
