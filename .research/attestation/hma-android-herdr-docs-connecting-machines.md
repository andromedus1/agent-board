---
source_handle: hma-android-herdr-docs-connecting-machines
fetched: 2026-11-10
source_url: https://herdr.dev/docs/connecting-machines/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr documentation of saved SSH machines and reconnect behaviour.

## Key passages

- [1] "Reconnecting: Herdr retries automatically after a network interruption, sleep, or SSH failure. Repeated failures increase the delay up to two minutes"; SSH connections are checked for application-level activity and probed when quiet.
- [2] "The agent list includes connected machines, so you can see where work is running and which agent needs an answer."
- [3] "Authentication stays with OpenSSH." Herdr requests SSH compression to reduce screen-update traffic on limited connections.

## Structural notes

- Vendor documentation; concerns the Herdr client reconnecting to a remote server, not a phone SSH client. Mosh is not mentioned on this page.
