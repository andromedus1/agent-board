---
source_handle: hma-core-moshi-herdr-page-recheck
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/herdr
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Targeted re-check of Moshi's Herdr docs page for any mention of herdr-core, `hc`, or OSC 7501.

## Key passages

- [1] A case-insensitive grep over the fetched HTML of https://getmoshi.app/docs/herdr for 'herdr-core', 'hc' as a word, and '7501' returned no matches.
- [2] The page text read in hma-android-moshi-docs-herdr states Moshi calls `herdr session list --json`, reads `$HERDR_ENV` and `$HERDR_SESSION`, and reattaches a Herdr session; these are Herdr TUI conventions (named sessions, session list), not herdr-core `hc` commands.

## Structural notes

Raw HTML fetched with curl on 2026-11-10 and grepped; this attests the absence of those strings in the page as served, not Moshi's behaviour with herdr-core. The identification of `herdr session list` as a TUI command is a reading by the lane, supported by hma-herdr-tui-session-state-docs for the session model (not re-read here).
