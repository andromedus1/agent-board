---
id: epic-mac-mini-agent-host-phase-1-core-host-access
kind: feature
stage: drafting
tags: [infrastructure, security]
parent: epic-mac-mini-agent-host
depends_on: []
release_binding: null
gate_origin: null
research_refs: [herdr-mac-mini-architecture]
created: 2026-11-10
updated: 2026-11-10
---

# Phase 1 — UPS, Mac mini with Herdr, laptop and phone access

## Brief

Bring the Mac mini up as the agent host, with FileVault on, a UPS, Tailscale,
Herdr TUI running Claude Code and Codex, and working access from the MacBook
(SSH, then `herdr`) and Android (Moshi with moshi-hook). Follow brief §5
Phase 1 steps 1–9:

1. Host baseline: FileVault on, recovery key off the Mini, admin + agent
   accounts, Remote Login for named users, "Start up when power is connected",
   no sleep.
2. UPS: Mini, router and modem on it; USB to the Mini; Energy > UPS Options or
   `pmset -u` thresholds.
3. Tailscale: open-source `tailscaled` as a system daemon, tagged, Tailscale
   SSH off, access limited to the operator's devices.
4. Reboot drill: power pull, LAN SSH unlock, tailnet up without GUI login; UPS
   shutdown plus power-return test; key-only sshd versus pre-boot unlock;
   `fdesetup supportsauthrestart`.
5. SSH hardening (key-only) once the drill passes.
6. Agents: Claude Code and Codex for the agent user, file-based credentials.
7. Herdr TUI with Claude/Codex integrations; server from SSH survives session
   close; workspace per project, tab per feature; resume after power pull;
   scripted-client resume test.
8. Android: Tailscale + Moshi (Pro), moshi-hook paired with `--store file`,
   E2EE on, `moshi-hook doctor`, PATH for `herdr` and mosh-server; push and
   approval round trip on cellular (adoption gate).
9. Update routine: automatic macOS and BSI installs off; weekly window from
   home via orderly restart; confirm resume after the first patch.

Accepted risk in Phase 1: a reboot while away leaves the Mini at the FileVault
prompt until someone unlocks it from the home LAN.

## Absorbed backlog ideas

- `idea-mac-mini-ups` — UPS with graceful shutdown (step 2, drill in step 4).
- `idea-host-update-routine` — update routine (step 9); `--handoff` not
  recommended; BSI off means fixes wait for the next window.
- `idea-filevault-decision-after-drill` — keep FileVault on unless the step 4
  drill shows remote unlock is unworkable; if so, prefer FileVault off with
  manual login (brief §7.2), never automatic login of the agent user.
- `idea-herdr-boot-autostart` — a boot-time daemon start is not worth adding
  now (same Background launchd context, attach still needed); the step 7
  scripted-client test decides whether it becomes useful in Phase 2.

## Simplification opportunity

None identified within this feature; Agent Board retirement is tracked at the
epic level.
