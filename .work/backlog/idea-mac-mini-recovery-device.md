---
id: idea-mac-mini-recovery-device
created: 2026-11-10
updated: 2026-11-10
tags: [infrastructure, security]
---

Deferred Phase 2 of `epic-mac-mini-agent-host` (operator direction,
2026-11-10). Re-scope under that epic once Phase 1
(`epic-mac-mini-agent-host-phase-1-core-host-access`) is done and lived-in; the
Pi-versus-KVM choice depends on the Phase 1 reboot-drill results.

# Phase 2 — recovery device

## Brief

Add a recovery device on the home LAN so the FileVault-locked Mac mini can be
unlocked and recovered while the operator is away, with outage alerts. Follow
brief §5 Phase 2 steps 10–14 and the §7.3 decision table:

10. Choose a Raspberry Pi relay or a KVM-over-IP box using the Phase 1 drill
    results. If pre-boot SSH unlock over the LAN is reliable, a Pi relay covers
    the main need; if not, a KVM becomes the main path, bought with a return
    window and tested at the FileVault screen first. PiKVM may serve both roles
    (unverified).
11. Deploy on the UPS, wired, tagged in Tailscale, access limited to the
    operator's devices; watchdog and alerts (ntfy, Healthchecks) where the device
    can run them.
12. Optional smart plug for powering on a hung Mini.
13. Drill from away: power pull, alert, unlock through the device, attach,
    confirm resume.
14. Live with Model A before adding wherdr, a display-metadata reporter or
    Herdr Projects.

If the Phase 1 scripted-client test shows an attach triggers Herdr resume, the
watchdog can also start the Herdr server and attach after unlock.

## Original capture

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

## Simplification opportunity

None identified.
