---
id: idea-doctor-title-action-probe
created: 2026-08-16
updated: 2026-08-16
tags: [integration]
---

Strengthen `agent-board doctor` so its readiness result can detect an unusable
targeted Ghostty `set_tab_title` path before the operator starts
`agent-codex`. During the first live installation, Doctor reported Ready while
the shipped AppleScript used an invalid action parameter and failed at launch.
Any future probe must avoid leaving a user's title changed and should preserve
Doctor's current non-destructive setup posture.
