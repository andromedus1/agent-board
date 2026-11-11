---
source_handle: hma-rescue-tailscale-subnets-detail
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1019/subnets
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

Tailscale KB 'Subnet routers' (Last validated Sep 29, 2026): advertising routes, Linux IP forwarding, route approval, autoApprovers, access rules by CIDR, SNAT.

## Key passages

- [1] "run `tailscale set` with the `--advertise-routes` flag. It accepts a comma-separated list of subnet routes." Examples use CIDR notation such as 192.0.2.0/24; the page has no explicit /32 single-host example (extract said so).
- [2] "If the device is authenticated by a user who can advertise the specified route in [`autoApprovers`], the subnet router's routes will automatically be approved."
- [3] Access rules match destination CIDR blocks, e.g. members of group:dev accessing "192.0.2.0/24, 198.51.100.0/24 and 2001:db8::/32" through grant rules with src and dst.
- [4] "You can disable SNAT by using the `--snat-subnet-routes=false` flag (Linux only)" to preserve original source IP addresses.
- [5] "IP forwarding is required to use a Linux device as a subnet router. This kernel setting lets the system forward network packets between interfaces." Example: `echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf`.
- [6] Routes must be approved in the admin console Machines section unless autoApprovers is configured; this is "a separate mechanism" from access control rules.
- [7] "Devices behind subnet routers don't count toward your pricing plan's device limit."

## Structural notes

- Fetched through a tool that returns a model-processed extract of the page, not raw page text; quotes are as returned.
