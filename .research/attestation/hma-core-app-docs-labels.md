---
source_handle: hma-core-app-docs-labels
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-app/blob/main/docs/labels.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdr-app doc defining shared state stored in herdr-core terminal labels (seen turn, pinned), which the desktop app, phone app and a terminal UI share. It also defines how an agent is shown as needs-you, working, done or idle.

## Key passages

- [1] "Herdr clients (the desktop app, the phone app, a terminal UI) share two things through herdr-core terminal labels: which agents a person has seen, and which are pinned."
- [2] "Labels live on the terminal, so this state ends with it."
- [3] Display rule: "`blocked` or `error`: needs you. `working`: working. Otherwise (`idle`, `done`, ...): done when `turn > herdr.seen`, else idle."
- [4] "`herdr.pinned=1`: pinned ... Pinned agents go first, in the client's usual order."
- [5] "Labels suit small values that change at human speed. Use the `herdr.` prefix. Bigger or app-wide state belongs in documents (`doc.get`, `doc.set`)".

## Structural notes

Fetched with `gh api repos/herdrdev/herdr-app/contents/docs/labels.md`, first ~80 lines (whole file as printed). The mapping shows error and blocked both fall into 'needs you' in client display.
