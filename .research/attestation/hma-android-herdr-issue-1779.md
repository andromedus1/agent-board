---
source_handle: hma-android-herdr-issue-1779
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/issues/1779
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

GitHub issue requesting optional mosh transport for herdr --remote, closed as not planned by a bot over issue-template compliance, with no maintainer decision on mosh itself.

## Key passages

- [1] Title: "Feature: support mosh transport for herdr --remote (survive sleep / roaming)"; state CLOSED, stateReason NOT_PLANNED, created 2026-07-23T08:38:31Z, closed 2026-07-23T08:38:38Z.
- [2] Body: "Today --remote is a thin local client over SSH (with keepalive + ControlMaster)... Remote Herdr server / panes survive (good), but the thin-client attach dies with SSH and must be restarted manually." It notes that people already run Herdr inside mosh sessions ("mosh host -- herdr").
- [3] Closing comment by kangal-bot, seven seconds after creation: "this issue does not appear to use the full bug report template. herdr issues are only for reproducible bugs and maintainer-created or maintainer-converted work items... feature requests, ideas, questions... belong in discussions".

## Structural notes

- The closure is a template/process closure, not a technical rejection. The bot's links name the repository owner as ogulcancelik while the issue lives at herdrdev/herdr.
