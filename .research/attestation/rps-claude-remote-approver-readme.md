---
source_handle: rps-claude-remote-approver-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/yuuichieguchi/claude-remote-approver/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

A third-party Claude Code hook that sends each permission prompt to a phone through ntfy and returns the tap as a hook decision. Uses Claude Code's PermissionRequest hook, so the approval is a structured allow/deny/ask decision, not a keystroke. Claude Code only; ntfy.sh by default, self-hosted ntfy supported.

## Key passages

- [1] Intro: sends each permission prompt as a push notification to your phone via ntfy.sh; you tap Approve or Deny and Claude Code continues, no terminal required.
- [2] Flow: a `PermissionRequest` hook receives JSON on stdin, posts to `ntfy.sh/<topic>` with Approve / Always Approve / Deny action buttons, and subscribes to `<topic>-response` over SSE; the tap is published to the response topic.
- [3] Question handling: for `AskUserQuestion` each option becomes an action button; if no response arrives before the timeout the hook falls back to the CLI prompt.
- [4] Always Approve: when Claude Code supplies `permission_suggestions`, the tool instructs Claude Code to add a permission rule to its settings.
- [5] Setup: generates a topic with 128 bits of entropy, writes config with mode 0600, registers under `hooks.PermissionRequest` in `~/.claude/settings.json`.
- [6] Config: `ntfyServer` can point to a self-hosted server; `timeout` default 120 seconds, `planTimeout` 300; authenticated topics are only for self-hosted ntfy.
- [7] How ntfy works: 'No account is required. Topics are identified by name only, which is why the generated topic contains 128 bits of randomness.'
- [8] License: MIT (WebFetch-processed page extract).

## Structural notes

- Raw README. The hook's stdout decision shape `{"behavior":"allow"}` / `deny` / `ask` appears in the WebFetch-processed extract of the repo page, not in lines read directly.
- Small project by a single maintainer; stars were reported in the single-digit hundreds or fewer by the page extract.
