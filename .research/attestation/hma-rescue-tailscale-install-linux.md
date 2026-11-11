---
source_handle: hma-rescue-tailscale-install-linux
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1031/install-linux
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

Tailscale KB Linux install (Last validated Jan 5, 2026): install script covers Raspberry Pi OS; key expiry advice for Raspberry Pis.

## Key passages

- [1] "run the following command: `curl -fsSL https://tailscale.com/install.sh | sh`"; the script works on distributions including "Raspberry Pi OS".
- [2] Start with `sudo tailscale up`. For static binaries, "a service configuration is available in the `systemd/` subdirectory of the unpacked archive"; the extract found no explicit statement on systemd enablement for the script install.
- [3] "For devices that should remain continuously connected, such as servers, Raspberry Pis, media centers, smart home hubs, Docker hosts, and NAS devices, you can disable key expiry to avoid any unnecessary disruptions."

## Structural notes

- Fetched through a tool that returns a model-processed extract of the page, not raw page text; quotes are as returned.
