---
source_handle: symmetry-codex-developer-commands
fetched: 2026-08-20
source_url: https://learn.chatgpt.com/docs/developer-commands?surface=cli
provenance: source-direct
substrate_confidence: source-direct
---

# Developer commands

## Structural metadata

- Publisher: OpenAI / ChatGPT Learn.
- Document type: official Codex CLI reference.
- Subject: interactive and non-interactive session resume and session fork.

## Paraphrased summary

The interactive `codex resume` command continues a session by id or resumes the
most recent chat. Its most-recent selection is current-working-directory scoped
unless `--all` is supplied. It accepts normal Codex global flags, and can include
non-interactive sessions in the selection set. The CLI may prompt for a working
directory when the saved directory differs, unless a configuration choice or
explicit `--cd` resolves it.

The CLI's `codex exec resume` is a separate non-interactive resume facility. A
fork creates a new chat from a prior interactive session rather than continuing
the old chat.

## Key passages and source-internal anchors

[1] Lines 2403-2422: documents `codex exec resume`, id/last selection, current-
  directory behavior, cross-directory `--all`, and optional follow-up input.
[2] Lines 2865-2922: documents interactive `codex resume`, working-directory
  selection rules, and `--all`, `--include-non-interactive`, `--last`, and
  session-id behavior.
[3] Lines 2923-2969: documents interactive session fork behavior.
[4] Lines 3598-3603: says the TUI `/resume` flow reloads the selected chat's
  transcript and keeps original history intact.
