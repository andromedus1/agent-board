---
source_handle: rps-tailscale-ssh-kb
fetched: 2026-10-26
source_url: https://tailscale.com/kb/1193/tailscale-ssh
source_path: .research/source-captures/rps-tailscale-ssh/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Tailscale knowledge-base page on Tailscale SSH: Tailscale takes over port 22 on the host for tailnet traffic and authenticates with tailnet identity. The Limitations section lists platform, daemon-restart and port constraints.

## Key passages

- [1] Overview: with Tailscale SSH "Tailscale takes over port 22" for traffic from the tailnet and uses Tailscale for authentication (line 571 context).
- [2] Limitations (Devices): connections only to devices on the Tailscale network; Tailscale SSH can run only on Linux devices and macOS open-source `tailscale` + `tailscaled` CLI version devices; "You can connect from any device running Tailscale, regardless of platform."
- [3] Limitations: "Restarting the Tailscale daemon (tailscaled), for example, by performing an upgrade, will stop any existing Tailscale SSH session."
- [4] Limitations (Ports): "Tailscale SSH assumes you use port 22 for SSH" and there is no way to configure a different port.
- [5] SSH session recording is documented as a separate Tailscale SSH feature.

## Structural notes

- The page does not mention mosh or mobile SSH clients.
