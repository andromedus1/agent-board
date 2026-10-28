---
source_handle: rps-blink-tailscale-mosh
fetched: 2026-10-26
source_url: https://docs.blink.sh/integrations/tailscale+mosh
source_path: .research/source-captures/rps-blink-tailscale-mosh/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Blink Shell documentation walkthrough for pairing Blink with Tailscale and upgrading from SSH to Mosh. The documented path enables Tailscale SSH on the host, connects with ssh using tailnet identity, then runs `mosh --install-static` to have Blink install mosh-server without root.

## Key passages

- [1] Step 2 (host): "advertise SSH by running `tailscale up --ssh`."
- [2] Configure Blink, Step 1: `ssh username@<hostname>`; "no authentication was required, as Tailscale is automatically using your tailnet identity".
- [3] Configure Blink, Step 2: run `mosh --install-static <username>@hostname`; "Blink will automatically request permission to install mosh-server on your host"; afterwards `mosh <username>@hostname`.
- [4] Intro: Blink can install Mosh automatically for many platforms "no root access necessary".
- [5] Closing: the page claims one can keep a Mosh connection through changing networks "all the way" (home WiFi to another country).

## Structural notes

- Page footer shows 2025 copyright; document date otherwise unstated.
- The page documents a Tailscale SSH + mosh path; compare the Moshi documentation statement on the same combination (rps-moshi-docs-tailscale).
