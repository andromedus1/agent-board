---
source_handle: rps-moshi-docs-tailscale
fetched: 2026-10-26
source_url: https://getmoshi.app/docs/tailscale
source_path: .research/source-captures/rps-moshi-tailscale/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation page on reaching hosts over Tailscale. It states that SSH and mosh over a tailnet behave as on a LAN, and that Tailscale SSH (the Tailscale-managed SSH server) interferes with key-based pairing and cannot bootstrap mosh.

## Key passages

- [1] Intro: Moshi has no built-in Tailscale integration; Tailscale runs at the OS layer on iOS; tailnet hosts are treated as normal SSH or mosh targets; no public IP needed.
- [2] Setup: use the host's Tailscale IPv4/IPv6 or MagicDNS name, not the LAN IP; on macOS hosts, Remote Login (System Settings -> General -> Sharing) must be on because tailnet connectivity alone is not enough.
- [3] "Tailscale SSH is not SSH over Tailscale": with Tailscale SSH on, it "grabs port 22 for every tailnet connection" and bypasses OS sshd and authorized_keys; key authentication then stalls about 60 seconds and reports a generic auth error.
- [4] Pick one path: disable with `sudo tailscale set --ssh=false` for key auth; or leave credentials empty and rely on an accept-mode ACL (not check-mode); and "mosh cannot bootstrap through Tailscale SSH because it is not real OpenSSH".
- [5] "Mosh over Tailscale": "Mosh works fine over Tailscale: the SSH bootstrap and the UDP session both ride the tunnel."
- [6] "Mac sleep with Tailscale": sessions to a closed-lid Mac can become "Unreachable (auto-retrying)" after a few minutes idle because "UDP traffic does not prevent macOS from entering low-power sleep when the lid is closed — even with pmset tweaks"; Moshi sends a wake-up probe when starting a new mosh connection; to keep sessions live the page suggests keeping the lid open or using Amphetamine / caffeinate to block sleep entirely.
- [7] Tailscale device re-auth (key expiry, ACL changes) is surfaced in the Tailscale iOS app, not in Moshi.

## Structural notes

- Vendor documentation describing the vendor's pairing flow; the claim about mosh bootstrap through Tailscale SSH is the vendor's and was not independently tested here.
