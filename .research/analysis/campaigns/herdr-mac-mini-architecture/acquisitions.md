---
campaign: herdr-mac-mini-architecture
authored: 2026-11-10
provenance: agent-synthesis
---

# Acquisition candidates

No candidate blocks a cited claim. All entries are enriching and grounded by a
fetched source that names them. Promotion into the work-side
`research-acquisition-queue` remains operator-confirmed.

## Apple FileVault network requirements for SSH unlock

- **Source:** Apple Platform Deployment, "FileVault network requirements" section referenced from the FileVault introduction
- **Class:** primary-doc
- **Web availability:** web page not located; the link resolves to Platform SSO text
- **Urgency:** enriching
- **Grounded-by:** `hma-host-apple-deploy-filevault-intro`
- **Completes:** Ethernet/Wi-Fi/802.1X conditions for pre-boot SSH unlock; whether any VPN path can reach pre-boot sshd

## moshi-hook installer source

- **Source:** `rjyo/moshi` Homebrew tap and `moshi-hook` binary
- **Class:** primary-doc
- **Web availability:** partial (tap public; source repository not confirmed)
- **Urgency:** enriching
- **Grounded-by:** `hma-android-moshi-docs-hooks`
- **Completes:** which Claude Code and Codex hook events `moshi-hook install` writes; whether any approval path uses structured PermissionRequest decisions

## Program Status Protocol (OSC 7501) specification

- **Source:** Program Status Protocol spec page named in herdr-core issue discussion
- **Class:** primary-doc
- **Web availability:** public web page (not fetched)
- **Urgency:** enriching
- **Grounded-by:** `hma-core-issues-resume-recovery`
- **Completes:** full 7501 state and kind set, extension rules, whether a resume reference is planned, whether agents emit `error`

## Operator device and host tests (not sources)

These gaps cannot be closed from the web and are recorded for the operator's
Phase 1–4 trials rather than the acquisition queue: Moshi Android push timing
and approval round trip on cellular; Herdr mobile app closed-app behaviour;
pre-boot SSH unlock with a key-only `sshd_config`; `fdesetup supportsauthrestart`
on the Mini; Herdr TUI behaviour after reboot before a client attaches; #5749
with laptop and phone on separate versus shared tabs.
