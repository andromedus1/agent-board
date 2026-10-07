---
id: idea-observer-failure-degradation
created: 2026-08-14
updated: 2026-08-14
tags: [integration]
---

Consider allowing a healthy managed Codex TUI to remain interactive when only
Agent Board's passive observer or protocol-classification path fails. The V1
launcher intentionally uses one truthful abort tree, so an observer failure is
visible and tears down the supervised TUI rather than continuing with misleading
state. Revisit a decoupled degraded-observation mode after real usage shows that
side-channel failures occur often enough to outweigh the simpler lifecycle and
strong state guarantee.
