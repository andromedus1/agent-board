---
source_handle: hma-android-moshi-docs-connections
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/connections
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of connection types and authentication.

## Key passages

- [1] Connection types: Auto, SSH, Mosh, ET or Osewa. "Auto is the default... Moshi picks a transport for you, trying mosh, then ET, then SSH."
- [2] "SSH forces a plain SSH terminal. Use this for hosts where UDP is blocked, where mosh is not installed." ET "survives network changes, sleep, and app kills — but it runs over TCP instead of UDP... ET is a Pro feature and is currently experimental."
- [3] "Moshi has no built-in VPN integration and does not need one. Any OS-level VPN — Tailscale, WireGuard, corporate VPN — works transparently."
- [4] Host key handling: first connection trusts the key presented unless paired by Easy Pair QR, which includes the host key fingerprint (moshi-hook 0.4.32 or later); a changed key stops the session with Host Key Changed.

## Structural notes

- Vendor documentation. VPN sentence is worded for an iOS device.
