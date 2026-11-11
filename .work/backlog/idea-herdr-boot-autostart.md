---
id: idea-herdr-boot-autostart
created: 2026-11-10
updated: 2026-11-10
tags: [infrastructure]
---

Start the Herdr TUI server automatically at boot under the agent user (launchd
system service) and trigger agent resume without a human attaching.

- Herdr documents no boot start for macOS, and restored agents resume only
  "after a client attaches and provides terminal size and theme context".
- Idea: a launchd job that starts `herdr server`, plus a scripted one-off
  attach so Claude/Codex panes resume unattended. Undocumented; needs testing.
- Must work with FileVault on and no GUI login (SSH-started servers keep the
  caller's context; Keychain may be unavailable).

Grounding: `.research/analysis/campaigns/herdr-mac-mini-architecture/parent.md` (Mac mini + Herdr TUI + Tailscale + Moshi decision brief, reboot-resilience section).
