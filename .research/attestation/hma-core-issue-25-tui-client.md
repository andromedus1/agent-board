---
source_handle: hma-core-issue-25-tui-client
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core/issues/25
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdr-core issue #25 (open; 2026-10-30, active to 2026-11-09): a request for a terminal UI client for herdr-core, documenting that core has no official TUI and an unofficial hc-tui exists. Establishes what a plain SSH terminal gets today.

## Key passages

- [1] Body: "herdr-core 'draws nothing', and the only UI with a sidebar is the native Herdr app. The existing Herdr TUI runs its own server and does not share agents with herdr-core."
- [2] Body: "Today that means either: staying on the old TUI (separate server, can't see core agents), or using only `hc ls` / `hc attach` / `hc read`, with no at-a-glance status sidebar."
- [3] Comment (hlidotbe, 2026-11-01): "With core, an SSH session gives me `hc ls`, `hc attach` and `hc read`: one terminal at a time, no list of agents and their states, no tabs or splits." and the app's "control socket ... is local, so nothing running on the box can drive a window either (herdr-app#43)."
- [4] Comment (followcat, 2026-11-08/09): an unofficial terminal UI for herdr-core, hc-tui v0.1.0 with prebuilt macOS arm64 binaries, `hc-tui --remote <box>` over SSH; "On official `hc`, agents show a status in the sidebar only if they report themselves (OSC 7501)"; "I haven't run the UI on a Mac yet"; reads the herdr-app document whose "shape isn't a promised contract yet (herdr-app#43)".
- [5] Whether a core-native TUI is planned: the body asks "Is a terminal client for core planned?"; no maintainer answer appears in the comments read.

## Structural notes

Read via `gh issue view 25 -R herdrdev/herdr-core` on 2026-11-10; about 10 of the comments were read (truncated to ~900 chars each). hc-tui itself was not fetched or run.
