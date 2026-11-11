---
source_handle: hma-herdr-alternatives-currency
fetched: 2026-11-10
source_url: https://github.com/asheshgoplani/agent-deck
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Currency check of agent-deck and ccmux (epilande) against the 2026-10-26 README attestations. Both continue to release but their documented status mechanisms and remote stance are unchanged in the README passages compared.

## Key passages

- [1] agent-deck releases via `gh release list`: v1.16.38 (Latest) 2026-11-07, v1.16.37 2026-11-07, v1.16.36 2026-11-02, v1.16.35 2026-10-31; release notes bodies are install boilerplate only. Repository pushed 2026-11-10; README badge "Platform macOS | Linux | WSL".
- [2] agent-deck README (re-read): status table Running, Waiting, Idle, Error; "Without the hook, turn-level running/waiting status cannot converge reliably" for Codex (`agent-deck codex-hooks install`); pi: "Without the extension a pi session's status is read from the pane, which is slower and occasionally wrong"; "Remote sessions report coarse live status"; web mode "Binding a non-loopback address without [a token] is refused".
- [3] ccmux (epilande) releases: v1.4.6 (Latest) 2026-11-05, v1.4.5 2026-11-01, v1.4.4 2026-10-15; repository pushed 2026-11-09. README (re-read): `ccmux setup` installs hooks for Claude, Codex, Cursor, OpenCode, Pi, omp, Antigravity and Copilot for "authoritative session matching"; "ccmux tracks the sessions on the machine where it runs" so remote use means running everything on the remote and attaching over SSH; the daemon exposes `@ccmux_status` tmux options; states are idle, working, waiting.

## Structural notes

Read via `gh release list`, `gh api repos/.../releases/tags/...` and `gh api repos/.../readme` on 2026-11-10. Compared with rps-agent-deck-readme and rps-ccmux-readme only by re-reading the same README statements; commit-level diffs were not examined, so changes outside the compared passages are not excluded.
