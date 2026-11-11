---
id: idea-lan-rescue-device
created: 2026-11-10
updated: 2026-11-10
tags: [infrastructure]
---

Add a small always-on "rescue device" on the home LAN so the FileVault-locked
Mac mini can be recovered remotely after a reboot or power loss.

- Problem: with FileVault on, the Mini waits at pre-boot after any restart;
  macOS 26 allows SSH unlock, but Tailscale on the Mini is not running yet, so
  the unlock must come from the LAN.
- Idea: a Raspberry Pi (or similar) running Tailscale, used as an SSH jump host
  to the Mini's LAN address for manual unlock (no subnet router, no stored
  password), plus a watchdog that alerts the phone when the Mini is down or
  waiting for unlock.
- Options to weigh: KVM-over-IP (PiKVM/JetKVM) for a screen and keyboard at
  pre-boot; smart plug for remote power-cycling a hung Mini; router-based
  Tailscale as the foothold instead of a Pi.

Grounding: `.research/analysis/campaigns/herdr-mac-mini-architecture/parent.md` (Mac mini + Herdr TUI + Tailscale + Moshi decision brief, reboot-resilience section).
