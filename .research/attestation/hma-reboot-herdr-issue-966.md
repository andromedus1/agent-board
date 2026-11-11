---
source_handle: hma-reboot-herdr-issue-966
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/issues/966
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdrdev/herdr issue #966 (CLOSED 2026-07-06): panes run in a Background launchd session when the long-lived server was not started from a GUI terminal, so keychain-backed CLIs fail. The maintainer recommended starting the server from a GUI terminal or a per-user LaunchAgent in gui/$UID.

## Key passages

- [1] Body (reporter): inside herdr panes `launchctl managername` prints `Background` (a plain terminal prints `Aqua`) and `security show-keychain-info ~/Library/Keychains/login.keychain-db` fails with "User interaction is not allowed."
- [2] Comment kunchenguid (2026-07-06, herdr 0.7.1, macOS 26.5, M4 Pro mac mini): "once a server is in a Background session it self-perpetuates, because restarting it from inside one of its own panes inherits Background again."
- [3] Maintainer comment (ogulcancelik, 2026-07-06): "if the long-lived `herdr server` is started from a `Background` launchd context, panes inherit that context, and keychain-backed tools can fail." and "the practical fix is to start the server from a gui terminal or from a per-user launchagent in `gui/$UID`".
- [4] Bot comment: "Released in v0.9.0" (2026-09-07), the release that added the troubleshooting guidance recorded in hma-herdr-tui-troubleshooting-docs.

## Structural notes

Read with `gh issue view 966 --json` on 2026-11-10 (comment bodies truncated to the cited sentences). The maintainer calls this expected macOS behaviour; it is not a defect with a code fix, only documented.
