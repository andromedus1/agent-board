---
source_handle: hma-rescue-pikvm-tailscale
fetched: 2026-11-10
source_url: https://docs.pikvm.org/tailscale/
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

PiKVM handbook Tailscale page.

## Key passages

- [1] Setup: update OS via `pikvm-update`, install the Tailscale client package and enable the service, run `tailscale up`, reboot to verify.
- [2] "You likely want to disable key expiry!"
- [3] "Do not update Tailscale if you don't have access to PiKVM without VPN".
- [4] Let's Encrypt certificates "are not installed or renewed automatically"; with `tailscale serve`, renewed certificates exist only in RAM.

## Structural notes

- Fetched through a tool that returns a model-processed extract of the page, not raw page text; quotes are as returned.
