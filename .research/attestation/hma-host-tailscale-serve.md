---
source_handle: hma-host-tailscale-serve
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1312/serve
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Tailscale KB "Tailscale Serve" (Last validated Jan 20, 2026). Limitations relevant to macOS.

## Key passages

- [1] Limitations: "Because of macOS app sandbox limitations, serving files and directories is limited to the open source variant of the Tailscale client for macOS."
- [2] Limitations: "Serving a file, directory, or Unix socket requires root. Forwarding a port does not require root." and "On Linux and on the open source variant of the Tailscale client for macOS, run the command with sudo."
- [3] "Tailscale Serve lets you route traffic from other devices on your Tailscale network ... to a local service running on your device." Funnel is the separate public-internet feature.

## Structural notes

- The page does not enumerate Serve support per macOS variant beyond the files/directories limit.
