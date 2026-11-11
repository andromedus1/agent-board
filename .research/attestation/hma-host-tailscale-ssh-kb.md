---
source_handle: hma-host-tailscale-ssh-kb
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1193/tailscale-ssh
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Tailscale KB page on Tailscale SSH (Last validated Jan 5, 2026). Includes a comparison of Tailscale SSH with regular SSH, access-control and check-mode behaviour, and Limitations. Independently re-fetched for this campaign.

## Key passages

- [1] Comparison table row "macOS": regular SSH "Available."; Tailscale SSH "Requires use of open source tailscaled variant."
- [2] Limitations: "You can currently use Tailscale SSH to connect to only Linux devices and macOS open source tailscale + tailscaled CLI version devices. You can connect from any device running Tailscale, regardless of platform."
- [3] Limitations: "Tailscale SSH assumes you use port 22 for SSH." and "At this time, there is no way to configure Tailscale SSH to use a different port."
- [4] Limitations: "Restarting the Tailscale daemon (tailscaled), for example, by performing an upgrade, will stop any existing Tailscale SSH session."
- [5] Access controls: "Access control policies determine which devices, and which users, are authorized for an SSH connection. Unlike with SSH keys which need to be purged, to remove a user's ability to SSH to a device, the access control policy can be updated to restrict a user's access."
- [6] Check mode: "Check mode is optional and not enabled by default." The default check period is 12 hours.
- [7] Default policy: "Tailscale SSH is configured with a default policy that lets the user access their own devices using check mode, as either root or non-root".

## Structural notes

- Supersedes nothing; rps-tailscale-ssh-kb (fetched 2026-10-26) was not cited because its captured passages are a subset of this re-fetch.
