---
source_handle: hma-android-moshi-docs-hook-settings
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/hook-settings
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of persistent moshi-hook settings.

## Key passages

- [1] "suppress-push-without-mux on — Makes pushes silent for agents running outside tmux, Herdr, or another multiplexer."
- [2] "suppress-nested-agent-push off — Drops events from agents launched by another agent, including their approvals."
- [3] "The app talks to the daemon over your SSH connection, never through Moshi's servers." Settings changes that need a restart wait "once no approval, prompt, or update is in progress."
- [4] Auto-update: since 0.4.34 the daemon checks every 6 hours and installs releases, restarting "once no approval is pending".

## Structural notes

- Vendor documentation; page marked updated 5 days ago.
