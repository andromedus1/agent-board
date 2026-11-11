---
id: idea-filevault-decision-after-drill
created: 2026-11-10
updated: 2026-11-10
tags: [infrastructure, security]
---

Decide FileVault on vs off for the Mac mini host only after running the
power-pull reboot drill.

- Default: FileVault on, unlock over SSH from the LAN (or via the rescue device).
- Fallback if remote unlock proves painful: FileVault off with automatic login
  off, so boot completes and `tailscaled` and boot-time services return
  unattended while desktop login still needs a password. This is a real
  security reduction (mainly against theft of the Mac); verify exactly what it
  exposes on Apple silicon before choosing it.

Grounding: `.research/analysis/campaigns/herdr-mac-mini-architecture/parent.md` (Mac mini + Herdr TUI + Tailscale + Moshi decision brief, reboot-resilience section).
