---
source_handle: symmetry-codex-config-advanced
fetched: 2026-08-20
source_url: https://learn.chatgpt.com/docs/config-file/config-advanced
provenance: source-direct
substrate_confidence: source-direct
---

# Advanced Configuration

## Structural metadata

- Publisher: OpenAI / ChatGPT Learn.
- Document type: official Codex configuration documentation.
- Subject: local notifications and history persistence.

## Paraphrased summary

The documented external `notify` hook is currently limited to an
`agent-turn-complete` event. Its payload commonly includes thread id, turn id,
working directory, input messages, and last assistant message. Built-in TUI
notifications can filter `agent-turn-complete` and `approval-requested`, and
can be emitted under unfocused-only or always conditions. Local history is
persisted under `CODEX_HOME` by default and can be disabled.

## Key passages and source-internal anchors

[1] Lines 1229-1274: names the external hook's current event coverage and the
  built-in TUI event filters/notification delivery modes.
[2] Lines 1275-1285: describes default local history persistence and disabling or
  limiting it.
[3] Lines 1361-1369: lists terminal notification configuration keys and defaults.
