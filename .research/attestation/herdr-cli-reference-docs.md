---
source_handle: herdr-cli-reference-docs
fetched: 2026-08-20
source_url: https://herdr.dev/docs/cli-reference/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The CLI reference defines the agent control commands and their state-sensitive behavior. It exposes read, key delivery, prompt, wait, attach, start, and explain operations. Prompt/wait results are tied to Herdr’s observed lifecycle classification; unknown explicitly means present but not confidently classified.

## Key passages

- [1] Lines 507-540: agent commands include list/get/read/send-keys/prompt/rename/focus/wait/attach/start/explain; prompt sends text plus Enter and waits for observed lifecycle change/settled status, while unknown does not mean successful work.
- [2] Lines 531-540: a blocked start returns `agent_not_ready`, prompt rejects an already-blocked target, done is unseen background idle, and explain reports active-manifest evidence and fallback details.

## Structural notes

- Official documentation page, “CLI reference,” fetched from the Herdr site on 2026-08-20.
