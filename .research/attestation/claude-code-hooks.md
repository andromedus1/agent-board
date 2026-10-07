---
source_handle: claude-code-hooks
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/hooks
provenance: source-direct
substrate_confidence: source-direct
source_class: official-documentation
---

# Claude Code hooks reference

## Summary

Anthropic's hook reference documents lifecycle events available in the ordinary
Claude Code terminal application. The events expose stable session identity and
several attention-relevant transitions, but they do not form a complete native
state stream: prompt submission precedes processing, hooks at one event run in
parallel, and a user interrupt does not produce `Stop`.

## Key passages

1. Plugin hooks live in `hooks/hooks.json`, are enabled with the plugin, and
   merge with user and project hooks. A session may load a plugin for that run
   without changing persistent settings. (Sections “Where hooks live” and
   “Plugin hooks”.)
2. Command hooks can use exec form by supplying `args`; Claude Code then spawns
   the executable directly with an argument vector. Plugin path placeholders
   are also available to the child process. (Section “Exec form and shell
   form”.)
3. `SessionStart` fires for new, resumed, cleared, compacted, and forked
   sessions. Its input includes the Claude `session_id`, transcript path,
   working directory, source, and optional title/model information. (Section
   “SessionStart”.)
4. `UserPromptSubmit` fires before Claude processes the submitted prompt, and
   any matching hooks for an event run in parallel. The event therefore proves
   prompt submission, not that every hook allowed the turn to proceed or that
   model work has started. (Sections “UserPromptSubmit” and “Hook
   configuration”.)
5. `PermissionRequest` fires at the moment Claude Code is about to ask for
   permission, while `Elicitation` fires when an MCP server requests user input
   during a task. These provide native, immediate evidence for two forms of
   user-attention requirement. (Sections “PermissionRequest” and
   “Elicitation”.)
6. `Stop` fires when the main agent finishes responding. Its `background_tasks`
   and `session_crons` arrays distinguish a genuinely finished turn from a
   response paused while background work remains. (Section “Stop”.)
7. `StopFailure` fires instead of `Stop` when a turn ends on an API error and
   categorizes rate-limit, overload, authentication, billing, request, model,
   server, output-limit, and unknown failures. (Section “StopFailure”.)
8. `Stop` explicitly does not run when the stoppage is caused by a user
   interrupt. This leaves no documented hook that authoritatively closes a
   prompt-start transition after interruption. (Section “Stop”.)
9. Administrators may enable `allowManagedHooksOnly`, blocking user, project,
   local, and ordinary plugin hooks. Hooks can also be disabled by effective
   settings, subject to managed-policy precedence. (Sections “Where hooks live”
   and “Disable or remove hooks”.)
10. Hook input includes `session_id`, `transcript_path`, and `cwd`; the
    transcript is written asynchronously and may lag the in-memory conversation.
    (Section “Hook input and output”.)

## Structural metadata

Official Anthropic Claude Code reference documentation fetched on 2026-08-20.
The page describes current CLI hook behavior and includes version qualifiers for
newer fields.

## Substrate test

Source-direct product documentation. It is suitable for claims about the
documented hook contract, but not proof of runtime ordering on the locally
installed build; those claims still require a live integration probe.
