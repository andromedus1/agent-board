---
source_handle: hma-android-herdr-issue-3840
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/issues/3840
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

GitHub bug report about the Herdr Ctrl-B g navigator clipping on a phone over Mosh using Moshi, closed as stale without reproduction.

## Key passages

- [1] Title: "bug: Ctrl-B g navigator clips and crowds rows on mobile after 0.9.0 upgrade"; created 2026-09-09T16:02:30Z; closed 2026-10-28T19:47:35Z with stateReason NOT_PLANNED.
- [2] Environment: Herdr 0.9.0, macOS host, iPhone portrait, "terminal connection over Mosh (the app shown is Moshi)", 50 panes, long labels and some emoji.
- [3] Actual: long labels and metadata are not presented cleanly in the narrow panel; selected-row details and shortcut footer do not fit; deep tree indentation "leave[s] little room for meaningful pane names."
- [4] Close comment by kangal-bot: "We weren't able to reproduce this, and it hasn't had further reports or activity, so it may already be fixed or no longer relevant. Closing as stale."

## Structural notes

- Single user report on iOS; closure reason is staleness, not a fix.
