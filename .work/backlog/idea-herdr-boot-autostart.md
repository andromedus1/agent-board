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

Verification note (brief §7.1): a boot-time daemon start is probably not worth
it on its own, because SSH and daemon starts both land in the Background launchd
context and agents still resume only after a client attaches. It becomes useful
if a scripted attach is shown to trigger resume; the rescue device's watchdog
could then start the server and attach after unlock.
