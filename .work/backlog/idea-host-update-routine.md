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
- Upgrade Herdr with `herdr update --handoff` (experimental live handoff that
  keeps panes running).
- Open question: whether macOS 26 Background Security Improvements can be
  deferred or force restarts.

Grounding: `.research/analysis/campaigns/herdr-mac-mini-architecture/parent.md` (Mac mini + Herdr TUI + Tailscale + Moshi decision brief, reboot-resilience section).
