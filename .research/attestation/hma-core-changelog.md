---
source_handle: hma-core-changelog
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core/blob/main/CHANGELOG.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdr-core changelog entries 0.1.16 through 0.1.20. It shows a release roughly every two to three days (Oct 31 to Nov 10 2026), and a run of macOS-specific fixes for how the core is hosted (separate Herdr Core.app, launchd start, logout/login terminals, Dock background entry).

## Key passages

- [1] Release dates: 0.1.16 on 2026-10-31, 0.1.17 on 2026-11-02, 0.1.18 on 2026-11-04, 0.1.19 on 2026-11-07, 0.1.20 on 2026-11-10 (section headings).
- [2] 0.1.20 Fixed: "On macOS, the core starts separately from the Herdr app, also right after login or a reboot. Before, it often ended up running inside the app then, so force quitting Herdr ended those terminals."
- [3] 0.1.20 Fixed: "On macOS, terminals opened after you log out and back in work again: they find your user, ssh works, and they use the new login's ssh agent. Terminals from before the logout keep running. (#210)"
- [4] 0.1.20 Fixed: "On macOS, quitting an app you started from a terminal no longer leaves a 'running in background' entry that ends every terminal when you stop it." with the caveat "Terminals opened before this update keep the old behavior until you close them" (#140).
- [5] 0.1.18 New: "On macOS, the core is now its own app, Herdr Core." macOS asks once for local network and once for microphone access.
- [6] 0.1.17 Fixed: "On macOS, quitting Herdr no longer stops your agents, even when Herdr isn't allowed to run in the background. The core now runs apart from the app." and "The macOS core is signed with Herdr's Developer ID, so permissions you give it stay across updates."
- [7] 0.1.19 New: "Updates and `hc server restart` keep the environment the core started with."; "Stopping and starting the core takes a fresh environment."
- [8] 0.1.20 New: `hc server restart --fresh` takes the current shell's environment for new terminals "without ending running programs".

## Structural notes

Fetched with `gh api repos/herdrdev/herdr-core/contents/CHANGELOG.md`. Only 0.1.16 to 0.1.20 were read; earlier entries not read.
