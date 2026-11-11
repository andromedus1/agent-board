---
source_handle: hma-android-termux-mosh-package
fetched: 2026-11-10
source_url: https://github.com/termux/termux-packages/blob/master/packages/mosh/build.sh
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Termux package recipe for mosh, and Termux app release metadata.

## Key passages

- [1] Package recipe: TERMUX_PKG_VERSION="1.4.0", description "Mobile shell that supports roaming and intelligent local echo", dependencies include openssh | dropbear.
- [2] termux-app latest GitHub release read via API: v0.118.3 published 2025-05-22.

## Structural notes

- Establishes that a mosh client package exists in Termux; no statement on Android background behaviour, notifications or agent features was read.
