---
source_handle: rps-tmux-webui-remote-doc
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/operonlab/tmux-webui/main/docs/remote-access.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Remote access doc of tmux-webui: no built-in tunnel; loopback by default; LAN mode with a warning that no authentication exists; Tailscale and Cloudflare Tunnel patterns.

## Key passages

- [1] 'tmux-webui ships with no built-in tunnel. By default the server binds to 127.0.0.1.'
- [2] LAN mode: binds 0.0.0.0:9527, prints a QR code; warning: 'There is no authentication. Anyone on the same LAN can drive your tmux.'
- [3] Tailscale: bind to the tailscale IP so only tailnet nodes reach it, WireGuard-encrypted.
- [4] Cloudflare Tunnel: public trycloudflare.com URL; for permanent setups put the tunnel behind Cloudflare Access.

## Structural notes

- Contradicts the README's 'behind a token gate' wording for --lan; both are first-party and were fetched the same day.
