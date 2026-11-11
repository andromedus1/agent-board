---
id: idea-host-update-routine
created: 2026-11-10
updated: 2026-11-10
tags: [infrastructure]
---

Define a controlled update routine for the Mac mini agent host so updates do
not trigger surprise reboots that strand sessions at the FileVault unlock.

- Turn off automatic macOS update installs; update on a chosen schedule.
- For planned restarts use `fdesetup authrestart` (check support with
  `fdesetup supportsauthrestart`).
- Upgrade Herdr by stopping the server deliberately and letting native resume
  rebuild; the brief's verification found `herdr update --handoff` is
  experimental with open macOS issues (cleared session ids, lost permission
  attribution), so it is not recommended routinely.
- Background Security Improvements: turn off "Automatically Install"; OS-level
  ones require a restart, and with the switch off fixes wait for the next update.
  Deferral timers need MDM.

Grounding: `.research/analysis/campaigns/herdr-mac-mini-architecture/parent.md` (Mac mini + Herdr TUI + Tailscale + Moshi decision brief, reboot-resilience section).
