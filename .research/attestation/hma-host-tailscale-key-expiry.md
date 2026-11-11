---
source_handle: hma-host-tailscale-key-expiry
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1028/key-expiry
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Tailscale KB "Key expiry" (Last validated Jan 5, 2026).

## Key passages

- [1] "By default, new domains are set with an expiry period of 180 days." and "If reauthentication does not occur, keys expire and connections to/from the given endpoint will stop working."
- [2] "You may want to disable key expiry on some devices, such as trusted servers, subnet routers, or remote IoT devices that are hard to reach." Disable via the Machines page in the admin console; "Disabling key expiry is available for all plans."
- [3] "Be aware that tailscale up --force-reauth might bring down the tailnet connection and thus should not be done remotely over SSH or RDP without an alternate means to log in if the connection is lost."
- [4] "When you apply a tag to a device for the first time and authenticate it, the tagged device will have key expiry disabled by default."

## Structural notes

- None.
