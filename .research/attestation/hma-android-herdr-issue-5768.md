---
source_handle: hma-android-herdr-issue-5768
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/issues/5768
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Open GitHub bug report that Herdr always sends 24-bit colour SGR to the outer terminal, making the UI unreadable in clients that cannot parse it, naming Termius over Mosh.

## Key passages

- [1] Title: "Herdr always sends 24-bit color to the outer terminal; UI is unreadable on clients that can't parse it (Mosh/Termius, Apple Terminal)"; state OPEN, created 2026-11-02T17:44:54Z.
- [2] Current behavior: "Termius on iOS over Mosh shows flat, default-colored text with no theme, while the same Herdr over Termius SSH renders correctly." The reporter attributes this to Mosh gaining 24-bit colour only in 1.4.0 while Termius's library advertises 1.3.0+ compatibility.
- [3] Expected: Herdr should send 256-colour or 16-colour SGR to such clients, "the way tmux does", and since a Mosh login shell does not see the client's COLORTERM, "there should also be a way to set the color depth by hand."

## Structural notes

- Reporter's environment is iOS Termius; the report is evidence of a Herdr-over-Mosh rendering risk for clients with older Mosh libraries, not an Android measurement.
