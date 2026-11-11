---
source_handle: hma-rescue-tailscale-acl-syntax
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1337/acl-syntax
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

Tailscale tailnet policy file syntax reference (Last validated Apr 8, 2026): destination syntax, hosts, autoApprovers, grants.

## Key passages

- [1] Destinations use `<host>:<ports>`; the host can be a Tailscale IP, a CIDR range such as "192.168.1.0/24", or a named host alias from the hosts section; "192.0.2.5:22" specifies port 22 on that IP address.
- [2] "The `hosts` section lets you define a human-friendly name for an IP address or CIDR range." Example maps "example-host-1" to "198.51.100.100".
- [3] "The `autoApprovers` section of the tailnet policy file defines the list of users who can do specific actions without further approval from the admin console." Example: routes "192.0.2.0/24": ["group:engineering", "alice@example.com"].
- [4] Grants provide more flexibility than traditional ACLs; both support port-specific destinations such as "192.0.2.5:22", and grants add application-layer control.

## Structural notes

- Fetched through a tool that returns a model-processed extract of the page, not raw page text; quotes are as returned.
