---
source_handle: hma-android-moshi-docs-tailscale
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/tailscale
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of reaching hosts over Tailscale, current version. Compared with the earlier capture (rps-moshi-docs-tailscale) the substantive claims about Tailscale SSH, mosh and Mac sleep are unchanged; the page still describes Tailscale at the OS layer on iOS and has no Android-specific section.

## Key passages

- [1] "Moshi has no built-in Tailscale integration and doesn't need one — Tailscale runs at the OS layer on iOS, and Moshi treats your tailnet hosts as normal SSH or mosh targets."
- [2] Use the host's Tailscale IPv4, IPv6 or MagicDNS name; on macOS hosts turn on System Settings -> General -> Sharing -> Remote Login because "Tailscale connectivity alone is not enough".
- [3] "Tailscale SSH is not SSH over Tailscale": with tailscale up --ssh, "Tailscale grabs port 22 for every tailnet connection and authenticates with your Tailscale identity, bypassing the OS sshd and authorized_keys entirely"; key auth stalls about 60 seconds then reports a generic auth error. Fix: sudo tailscale set --ssh=false.
- [4] Tailscale SSH route: leave credentials empty; it needs an accept-mode ACL, "and mosh cannot bootstrap through Tailscale SSH because it is not real OpenSSH".
- [5] "Mosh works fine over Tailscale: the SSH bootstrap and the UDP session both ride the tunnel." If mosh fails but SSH works, "the usual cause is mosh-server missing from the non-interactive PATH, not Tailscale."
- [6] Mac sleep: sessions to a closed-lid Mac can become "Unreachable (auto-retrying)" because UDP traffic does not prevent macOS low-power sleep; Moshi sends a wake-up probe when starting a new mosh connection; keep the lid open or use Amphetamine / caffeinate.
- [7] "Tailscale occasionally prompts for device re-authentication (key expiry, ACL changes). On iOS this surfaces in the Tailscale app, not in Moshi."

## Structural notes

- Vendor documentation; page marked updated 3 months ago. Every Tailscale statement is iOS-worded; applying it to the Android Tailscale app is an inference.
