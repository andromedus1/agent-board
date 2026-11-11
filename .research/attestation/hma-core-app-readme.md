---
source_handle: hma-core-app-readme
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-app
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README and recent changelog of the Herdr desktop app (herdr-app, Apache-2.0, Rust, created 2026-10-16, tags up to v0.1.15). It documents spaces/tabs/panes, the agents sidebar with working/blocked/done/idle, remote machines over SSH, and behaviour after reboot.

## Key passages

- [1] "Herdr is a desktop app for terminals and coding agents. Keep work in spaces, see which agents need you, and leave terminals running when you close the window."
- [2] Install: macOS Apple Silicon via `curl -fsSL https://releases.herdr.dev/app/install.sh | sh`, Herdr.dmg, or `brew install --cask herdr-app`; the installer "also install[s] herdr-core if it is missing". "Linux needs a desktop session and a working Vulkan driver."
- [3] Labels: "A space holds work on one machine, usually in one repo. Each space has tabs." "An unnamed space follows its first terminal's folder. Name a space or tab when you want a label that stays."
- [4] Agents sidebar: Agents that report status show as Working (still busy), Blocked (waiting for you), Done (finished while you were looking elsewhere), Idle (not working, or a finished agent you have looked at).
- [5] "The window arranges terminals. The core runs them. Closing the window leaves them running; closing a pane or tab ends its terminals. After a reboot or core crash, kept panes get fresh shells in their last folders, not their old programs."
- [6] Remote: "Add an SSH machine from Settings -> Machines ... Spaces on that machine run their terminals there, not on your computer." "Each machine keeps its spaces, tabs and splits in its core. Connected screens share that structure and the live terminals, but keep their own focus and zoom." "Remote work keeps running when your local window closes or your laptop sleeps, as long as the remote machine and core stay up."
- [7] "Usage telemetry is on by default in releases. Turn it off in Settings -> Privacy." "Mods are trusted code, not sandboxed extensions."
- [8] Changelog 0.1.15 (2026-11-10): "On macOS, reopen older terminals once. Terminals opened before herdr-core 0.1.20 can still end when Herdr quits, and this update quits Herdr once." and "Coming back to a terminal that another device (your phone) resized takes its size back when you click it or switch to its tab or space".
- [9] Repository metadata via gh api: 2666 stars, Apache-2.0, pushed 2026-11-10; no p0/p1 labels defined (labels: bug, enhancement, documentation, question, ...).

## Structural notes

Fetched with `gh api repos/herdrdev/herdr-app/readme` and `.../contents/CHANGELOG.md` (first ~60 lines read). The app is a GUI; this lane did not establish whether it can run without a logged-in GUI session on the Mac mini.
