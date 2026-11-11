---
source_handle: hma-core-issues-resume-recovery
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core/issues/13
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdr-core and herdr-app issues on reboot recovery: after a reboot kept terminals return as fresh shells; herdr-core has no native resume for Claude Code or Codex, and a maintainer says it waits for OSC 7501 to carry a resume reference. Users report missing the TUI's resume.

## Key passages

- [1] herdr-core #13 (closed 2026-10-27 as acknowledged; thread updated 2026-11-10): the reporter's table lists legacy Herdr "Full stop or machine reboot: Eligible agent sessions can resume from saved references" versus herdr-next "Kept terminals return as shells."
- [2] herdr-core #13, maintainer ogulcancelik (2026-10-27): "herdr-core only supports agent features through OSC 7501, so this waits until the protocol has a way for agents to report how to resume. When it does, we'll support it". Also: "in herdr 1 resume got flaky because we tracked every agent's own resume, new, fork and server behavior, and that mapping keeps breaking."
- [3] herdr-core #13 comment (zvictor, 2026-11-10): "I gave Herdr a try, had a power outage, and now I have no idea what agent sessions were on."
- [4] herdr-core #15 (open; 2026-10-29): "Discuss carrying a resume reference in OSC 7501"; proposal of an optional `resume` key. Comments from users describe user-space stopgaps: a Claude Code SessionStart hook writing the session id to terminal labels plus a shell rc block that runs `claude --resume <id>` in a recovered shell; mods named Revive and herdr-agent-resume.
- [5] herdr-core #15 comment (9pace, 2026-11-02): "I reboot my Mac often. coming from Herdr TUI resume after a reboot is the thing I miss most."
- [6] herdr-core #15 comment (paragbaxi, 2026-11-09; hc 0.1.14, Linux arm64): "Killing only the core process lost nothing: the holder kept the program running ... Killing the holder too brought the kept terminal back as a plain shell in its folder."
- [7] herdr-app #406 (open; updated 2026-11-11): "Reboot does not visibly restore spaces or resume supported agent sessions"; comment (lengbone, 2026-11-05; macOS, herdr-app 0.1.13, hc 0.1.18, Claude Code 2.1.318): "After a full OS reboot, all 7 tabs came back as fresh shells in their last folders (layout and tab names kept, as documented). Every Claude Code session that had been running was gone and was not resumed."
- [8] herdr-app #406 comment (z0nekill, 2026-11-11; Ubuntu, herdr-app 0.1.15, hc 0.1.20): after a forced power-off "the space/tab labels were intact, so the spaces and tabs showed up in the window as before. The Claude Code processes were gone and were not resumed."
- [9] herdr-core #15 body: "The spec (https://www.superlogical.com/rex/docs/build/program-status) says unknown keys must be ignored, and that this is how the protocol is extended. ... Core can't see such a key today."

## Structural notes

Read via `gh issue view` for herdr-core #13, #15 and herdr-app #406 on 2026-11-10 (bodies ~1300 chars, comments ~900 chars each, a subset of comments). Reports span Linux and macOS.
