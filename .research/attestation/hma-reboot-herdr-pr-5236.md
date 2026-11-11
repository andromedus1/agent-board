---
source_handle: hma-reboot-herdr-pr-5236
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/pull/5236
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdrdev/herdr PR #5236 "fix: keep the macos server running when its terminal quits" (MERGED 2026-10-15 to master; in no stable tag at the v0.9.5 fetch per hma-herdr-releases). Describes how an automatically started macOS server is now launched, and which starts keep the old behaviour.

## Key passages

- [1] PR body: "On macOS, a Herdr server started from a terminal tab stayed inside that terminal app's launchd job and resource coalition, even after `setsid`. Quitting the terminal ... removed that job and killed the server outright with every pane; only the saved layout came back as fresh shells."
- [2] PR body: "The autostarted server now goes through launchd: it is submitted as a one-shot job in the user's GUI domain (own coalition, never restarted), and the job process immediately forks the real server and exits".
- [3] PR body: "Starts over SSH, or commands launchd cannot carry byte-for-byte, keep the old direct spawn."

## Structural notes

Read with `gh pr view 5236 --json` on 2026-11-10 (capture herdr-pr-5236.json). The merge is on master after v0.9.5 (2026-10-14), so whether it ships in the next stable tag was not verifiable on 2026-11-10; hma-herdr-releases lists it among master fixes.
