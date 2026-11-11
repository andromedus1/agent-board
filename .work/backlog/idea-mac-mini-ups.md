---
id: idea-mac-mini-ups
created: 2026-11-10
updated: 2026-11-10
tags: [infrastructure]
---

Add a UPS to the always-on Mac mini agent host so short outages are ridden
through and long ones end in a graceful macOS shutdown instead of a power cut.

- Why: Herdr saves sessions before an orderly macOS restart, but a power cut
  restores from a snapshot up to 15 minutes old; agent processes die either way
  and resume only through native resume.
- Use macOS's built-in UPS shutdown thresholds (`pmset -u` haltlevel /
  haltafter / haltremain) and keep "Start up when power is connected" so the
  Mini restarts when power returns.
- The UPS should also power the LAN rescue device and network gear (see
  `idea-lan-rescue-device`) so remote unlock still works after an outage.

Grounding: `.research/analysis/campaigns/herdr-mac-mini-architecture/parent.md` (Mac mini + Herdr TUI + Tailscale + Moshi decision brief, reboot-resilience section).
