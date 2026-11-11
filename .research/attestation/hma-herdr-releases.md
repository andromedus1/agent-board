---
source_handle: hma-herdr-releases
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/releases
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

GitHub release metadata and notes for herdrdev/herdr (the TUI repository) via `gh`. Latest stable is v0.9.5 (2026-10-14), a hotfix for v0.9.4 (2026-10-13). v0.9.4 fixed macOS restart session saving and the server-exit-on-resource-exhaustion defect, and v0.9.5 reverted Codex turn hooks so Codex state is screen-derived again. Master has continued with macOS and remote fixes through 2026-10-29.

## Key passages

- [1] `gh release list -R herdrdev/herdr` (2026-11-10): v0.9.5 "Latest" published 2026-10-14T16:07:28Z; v0.9.4 2026-10-13T15:41:22Z; v0.9.3 2026-09-29; preview builds also published (2026-10-14, 2026-10-12). No stable release after v0.9.5 at fetch. `gh repo view` shows repository description "the runtime your coding agents live on", pushed 2026-11-07T12:32:55Z.
- [2] v0.9.5 release body: "Codex sessions no longer start with a 'clamping Interrupt hook timeout' warning. Herdr no longer installs Codex turn hooks, and Codex status comes from screen detection again. Run `herdr integration install codex` to update. (#5246, #5278)"; also "Claude Code questions show as blocked in named sessions (#4573, #5192)" and a fix for prefix shortcuts under macOS input methods and Ghostty `text:` keybinds (#5255).
- [3] v0.9.4 release body, Fixed: "Restarting a Mac or shutting down Windows keeps your agents' sessions. Herdr saves before the system starts closing apps, so agents come back where they were. (#4414, #5013, #5057, #5092 ...)"; "Session saves are written to disk before they replace the old file, so a crash or power cut can't leave an unreadable save (#5150)"; "The server keeps running when the machine runs out of processes or threads, instead of taking every pane down with it. (#3324, #4958)"; "Sidebar width, collapsed groups and agent sorting on remote machines survive reconnects."
- [4] v0.9.4 release body, Changed: "On Linux and macOS, closing the shell that started Herdr no longer stops the server. Scripts that stopped Herdr with SIGHUP should use `herdr server stop` or SIGTERM."
- [5] v0.9.4 release body, Fixed: "On macOS, `pane run` and `agent start` refuse commands too long for a shell that is still starting, instead of silently cutting them off (#4950, #4988)"; "Codex reports finished turns through its integration when started with `--no-daemon`" (preceding the v0.9.5 revert).
- [6] Master commit log (`gh api repos/herdrdev/herdr/commits`), titles only: 2026-10-15 "fix: keep the macos server running when its terminal quits (#5236)"; 2026-10-23 "fix: keep the saved layout when panes die during host shutdown (#5510)" and "keep a slow server's socket instead of treating a connect timeout as stale (#5511)"; 2026-10-26 "make the remote ready marker work under tcsh login shells (#5519)"; 2026-10-28 "ci: close stale issues without outside engagement monthly". These fixes sit on master and, absent a later stable tag, are not in v0.9.5.

## Structural notes

Read with `gh release list`, `gh api repos/herdrdev/herdr/releases/tags/{v0.9.4,latest}` and `gh api repos/herdrdev/herdr/commits` on 2026-11-10. The Herdr desktop app and herdr-core live in separate repositories (herdrdev/herdr-app, herdrdev/herdr-core) with their own versioning (herdr-app 0.1.x per the Shepherdr README); they were not release-surveyed here.
