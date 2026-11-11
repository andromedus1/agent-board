---
source_handle: hma-rescue-glinet-router-tailscale
fetched: 2026-11-10
source_url: https://docs.gl-inet.com/router/en/4/interface_guide/tailscale
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

GL.iNet router docs, Tailscale feature.

## Key passages

- [1] "If this option is enabled, resources on the device's LAN side can be accessed through the Tailscale virtual network." (Allow Remote Access LAN)
- [2] Routes require approval in the Tailscale admin console: "Edit route settings" then enable the subnet routes.
- [3] Available in "firmware v4.2"; "Some models, although running firmware v4.2 or higher, do not support Tailscale due to insufficient memory."
- [4] Not recommended with OpenVPN Client, WireGuard Client, GoodCloud Site to Site, ZeroTier, AstroWarp "as this may cause routing conflicts".

## Structural notes

- Fetched through a tool that returns a model-processed extract of the page, not raw page text; quotes are as returned.
