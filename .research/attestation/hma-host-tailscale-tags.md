---
source_handle: hma-host-tailscale-tags
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1068/tags
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Tailscale KB "Tags" (Last validated Dec 4, 2025).

## Key passages

- [1] "Tailscale tags are how you authenticate and identify non-user devices, such as servers and ephemeral nodes."
- [2] "Applying a tag to a device removes any user-based authentication."
- [3] "Tags are defined in the tailnet policy file in the tagOwners section. Only designated tag owners can apply tags to devices".
- [4] "Devices with a tag-based identity can only SSH into other tagged devices; they cannot SSH into devices with a user-based identity."
- [5] "When you apply a tag to a device for the first time and authenticate it, the tagged device's key expiry is disabled by default."
- [6] "Do not use tags to: Annotate user devices. ... Authenticate end-user devices, such as laptops or mobile devices."

## Structural notes

- None.
