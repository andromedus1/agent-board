---
source_handle: hma-android-wherdr-docs-networks
fetched: 2026-11-10
source_url: https://github.com/afloury/wherdr/blob/main/docs/networks.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

wherdr documentation of phone access over private networks.

## Key passages

- [1] Recommended: always-on server plus Tailscale, with private HTTPS published by tailscale serve; "wherdr enables that address by itself" by reading what tailscale serve publishes.
- [2] "Browsers only allow three things on https://: installing the app on the home screen (PWA) on iPhone and Android; push notifications; passkeys."
- [3] Warning: no public reverse proxy, ngrok, tailscale funnel or Cloudflare Tunnel without Cloudflare Access; use tailscale serve, which stays inside the tailnet.

## Structural notes

- Project documentation.
