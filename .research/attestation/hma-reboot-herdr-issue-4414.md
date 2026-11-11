---
source_handle: hma-reboot-herdr-issue-4414
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/issues/4414
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdrdev/herdr issue #4414 (CLOSED 2026-10-11, fixed in v0.9.4; labels p1, macos, sessions): after a macOS reboot, Herdr restored pane layouts but lost native agent session references because macOS terminated agent processes at logout before Herdr saved.

## Key passages

- [1] Body (reporter, 0.9.1): "After rebooting my Mac, Herdr restored 12 workspace layouts but resumed only three OMP conversations." with logs: "macOS logout manager attempts to terminate OMP processes", then "Herdr detects their disappearance", then "Herdr saves session.json".
- [2] Comment Centinel-ing (2026-09-23, Herdr 0.8.2, Pi, macOS): "Every Pi process exits in the host shutdown signal burst, ~20 s before `persist.save`, while Claude survives until Herdr tears the panes down. The next start resumed only the Claude panes; every Pi pane came back as a bare shell." The log excerpt shows the final snapshot ("persist.save <- final snapshot, no Pi refs") and "pane=2 shell exits (Claude killed by teardown, AFTER the save)".
- [3] Comment AntiD2ta (2026-10-05, 0.9.3 stable, Pi, macOS): "After reboot, workspace/tab/pane layouts returned and Claude conversations resumed, but Pi panes returned as shells."
- [4] Fix comment (minatoaquaMK2, 2026-10-08): "Pi/OMP shutdown hooks now confirm the selected session and report TERM/HUP interruption within a bounded deadline. Herdr keeps that recovery reference separately from live agent state."; "This is graceful-shutdown recovery, so a hard kill that cannot run the native shutdown hook remains outside this path." Bot comment: "Released in v0.9.4".

## Structural notes

Read with `gh issue view 4414 --json` on 2026-11-10 (capture herdr-issue-4414.json; the Centinel-ing comment was read in full from the JSON capture). The issue concerns Pi and OMP; the reports that Claude panes resumed are incidental user observations, not a maintainer test matrix.
