---
id: epic-mac-mini-agent-host
kind: epic
stage: drafting
tags: [infrastructure]
parent: null
depends_on: []
release_binding: null
gate_origin: null
research_refs: [herdr-mac-mini-architecture]
created: 2026-11-10
updated: 2026-11-10
---

# Mac mini agent host

## Brief

Stand up an always-on Apple-silicon Mac mini (macOS 26, at home, wired) as the
persistent host for Claude Code and Codex sessions in Herdr TUI, reached over
Tailscale from the MacBook Air and an Android phone (Moshi). Deliver it in two
phases: Phase 1 is the working host with a UPS and laptop/phone access; Phase 2
adds a recovery device so a FileVault-locked Mini can be recovered while away.

Grounding: `.research/analysis/campaigns/herdr-mac-mini-architecture/parent.md` (decision brief; §5 implementation sequence, §7 reboot
resilience). Model A (persistent interactive sessions) is the target; Model B
orchestration (Herdr Projects) waits until Model A is proven.

## Strategic decisions

- **Phasing**: Phase 1 core host + UPS + access; Phase 2 recovery device —
  operator direction, 2026-11-10.
- **Tracking**: one epic with two features; Phase 2 depends on Phase 1.
- **UPS**: committed for Phase 1.
- **Recovery device**: Raspberry Pi relay or KVM-over-IP, decided at the start of
  Phase 2 from Phase 1 drill results (brief §7.3 decision table).
- **Agent Board foundation docs**: deferred. Reconsider at retirement; at minimum
  update the docs then to state Agent Board is retired and what it migrated to.
  No Agent Board code is removed as part of this epic.

## Children

- `epic-mac-mini-agent-host-phase-1-core-host-access`
- `epic-mac-mini-agent-host-phase-2-recovery-device` (depends on Phase 1)

## Simplification opportunity

Once Phase 1 works, Agent Board's Ghostty title surface, managed launchers and
observation adapters become candidates for retirement (brief §2); this epic
does not remove them.
