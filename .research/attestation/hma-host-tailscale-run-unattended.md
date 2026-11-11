---
source_handle: hma-host-tailscale-run-unattended
fetched: 2026-11-10
source_url: https://tailscale.com/kb/1088/run-unattended
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Tailscale KB "Keep Tailscale running when I'm not logged in to my computer" (Last validated Sep 25, 2026). Per-OS statement of whether the client runs without a logged-in user.

## Key passages

- [1] "Unattended mode is only available on Windows."
- [2] "Linux: The Tailscale client runs as the system daemon tailscaled by default, so it remains available even when no users are logged in."
- [3] "macOS: The Tailscale client runs within the user login session. Running it as a standalone system daemon is not currently supported. You can track progress on GitHub issue #987."

## Structural notes

- The macOS line is stated without naming a variant; the variants page and the tailscaled wiki say the open-source variant runs before login. See Contradictions in the brief.
