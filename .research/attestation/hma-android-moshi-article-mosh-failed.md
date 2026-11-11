---
source_handle: hma-android-moshi-article-mosh-failed
fetched: 2026-11-10
source_url: https://getmoshi.app/articles/fix-mosh-connection-failed
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi team article (dated February 22, 2026) on mosh connection failures: Tailscale SSH, UDP ports, mosh-server path, locale, shell startup output, version mismatch and NAT.

## Key passages

- [1] Claim: "Tailscale SSH isn't real OpenSSH, so Mosh can't bootstrap through it. Install OpenSSH alongside Tailscale and everything works."
- [2] Claimed fix: "You don't need to disable Tailscale SSH — you can keep using it for passwordless, keyless SSH connections. Just make sure OpenSSH is also running on the server... Both can coexist." On macOS: System Settings -> General -> Sharing -> Remote Login.
- [3] "Mosh uses UDP ports 60000-61000"; "If you're using Tailscale or another VPN, UDP traffic flows through the tunnel automatically — no port rules needed."
- [4] "mosh-server needs a UTF-8 native locale to run"; shell startup files that print output before the connect line break the handshake and should be guarded with an interactive-shell check.
- [5] Carrier-grade NAT can rewrite UDP source ports; "The fix: use a VPN like Tailscale to bypass NAT entirely. This is the recommended setup for mobile connections anyway."

## Structural notes

- Vendor article; the coexistence claim differs from the vendor docs page hma-android-moshi-docs-tailscale, which says Tailscale SSH takes port 22 for every tailnet connection.
