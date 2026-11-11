---
source_handle: hma-reboot-herdr-issue-4926
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/issues/4926
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdrdev/herdr issue #4926 (CLOSED 2026-10-05, fixed in v0.9.4): a `herdr server` started from a launchd LaunchAgent froze while restoring a session.json, and the maintainer attributed the freeze to macOS privacy (TCC) access to ~/Documents. It is the only Herdr thread read that shows a LaunchAgent running `herdr server` with RunAtLoad and KeepAlive.

## Key passages

- [1] Body (reporter): "On macOS, with a LaunchAgent that runs `herdr server` (`RunAtLoad`, `KeepAlive = { SuccessfulExit = false; }`)" the launchd-started server restoring a session.json written by a shell-started server "never answers API requests"; "With the same session.json, the same binary started from a shell restores and answers at once."
- [2] Maintainer comment (ogulcancelik, 2026-10-05): "macos blocks herdr's access to ~/Documents when it's started by launchd, and the server froze waiting on that. workaround until the next release: allow herdr in privacy & security > files and folders. #4945 keeps the server responsive."
- [3] Bot comments: "Released in v0.9.4" (2026-10-13).

## Structural notes

Read with `gh issue view 4926 --json` on 2026-11-10 (capture herdr-issue-4926.json). The fix keeps the server responsive; it does not remove the need for a folder-access grant, and a grant is made in System Settings (a GUI action) per the maintainer workaround.
