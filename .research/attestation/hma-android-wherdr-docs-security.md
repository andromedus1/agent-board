---
source_handle: hma-android-wherdr-docs-security
fetched: 2026-11-10
source_url: https://github.com/afloury/wherdr/blob/main/docs/security.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

wherdr security documentation.

## Key passages

- [1] "wherdr drives Herdr, so it can run anything as your user." It listens on 127.0.0.1 only; reach it from other devices only through a private network.
- [2] "Without a passkey, anyone who can reach the address can control your agents: every device on your tailnet, and every user of your tailnet if you share it."
- [3] Passkey lock is optional; once registered the API and WebSockets require an unlocked session; lifetime options 1 day to 1 year, default 7 days.

## Structural notes

- Project documentation.
