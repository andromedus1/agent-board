---
id: research-handoff-codex-claude-symmetric-support-2
kind: feature
stage: done
tags: [integration, cli, state]
parent: epic-codex-claude-symmetric-support
depends_on: [research-handoff-codex-claude-symmetric-support-1]
release_binding: null
gate_origin: null
research_origin: codex-claude-symmetric-support
created: 2026-08-20
updated: 2026-08-20
---

# Managed agent-claude launcher and lifecycle adapter

## Finding

Add an installed `agent-claude` command that launches the ordinary interactive
Claude CLI with a bundled, per-run Agent Board plugin/hook integration. Translate
session identity, prompt submission, permission requests, MCP elicitation,
normal completion, API failure, and session end into guarded normalized session
mutations.

The adapter is observation-first. A Board-side failure must not block Claude,
generic terminal keys must not be presented as semantic approval, and working
start plus interruption recovery remain visibly lower-confidence until runtime
validation establishes safe reconciliation.

## Simplification opportunity

Reuse the current registration, guarded mutation, title rendering, focus
acknowledgement, process hosting, and composition patterns. Keep only Claude
event parsing, mapping, compatibility, plugin assets, and launch argv
provider-specific.

## Research grounding

**Source**: `.research/analysis/campaigns/codex-claude-symmetric-support/parent.md`
(slug: `codex-claude-symmetric-support`)

Claude's hook/plugin route provides the smallest topology that preserves its
ordinary TUI while producing the lifecycle evidence required for common glyphs.

## Design

### Architectural choice

Launch the installed `claude` executable directly with inherited terminal I/O,
an Agent Board session environment variable, and `--plugin-dir` pointing at a
read-only plugin shipped in the npm package. The plugin uses Claude's exec-form
hook contract (`node`, explicit argv, no shell) to call a private built JS hook
entrypoint. That entrypoint validates bounded stdin JSON, maps native events to
the shared transition reducer, binds Claude's native session ID under the
session lock, renders the latest title, and always exits zero after reporting a
Board-side diagnostic so observation can never control Claude.

The selected events are `SessionStart`, `UserPromptSubmit`,
`PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`,
`Elicitation`, `ElicitationResult`, `Stop`, `StopFailure`, and `SessionEnd`.
`Stop` with background tasks remains working; an ordinary stop resolves any
wait then records completion. There is no fabricated interrupt event: an
unresolved Claude working observation expires to `?` under feature 1's shared
capability rule.

The Agent SDK and transcript polling are rejected because they replace the
ordinary TUI or infer semantics. User/project settings mutation is rejected in
favor of per-run plugin scope.

### Implementation units

1. `assets/claude-plugin/`: minimal manifest plus `hooks/hooks.json`, using
   `${CLAUDE_PLUGIN_ROOT}` and exec-form argv to the packaged hook module.
2. `src/integrations/claude/lifecycle.ts`: strict common envelope parsing,
   event-specific bounded parsing, and pure mapping to zero or more normalized
   transitions without retaining prompt/tool content.
3. `src/application/observe-claude-hook.ts`: guarded provider/session/native-ID
   mutation, ordered transitions, and latest-record title reconciliation.
4. `src/integrations/claude/process.ts` and
   `src/application/launch-managed-claude.ts`: shell-free interactive spawn,
   managed registration, launcher PID ownership, clean/failure/termination
   outcomes, and focus acknowledgement watcher.
5. `src/composition/create-agent-claude.ts`, `src/cli/agent-claude.ts`, private
   hook CLI, and `package.json`: one overrideable composition root and installed
   `agent-claude` binary; reuse the existing terminal-mode/signal contract.

### Testing and acceptance

- Lifecycle fixtures cover every selected event, native ID binding, background
  work, unknown events, malformed/oversized input, and no prompt-content leak.
- Application tests prove atomic provider/terminal/native-ID guards, ordered
  wait resolution plus completion, latest-title projection, and fail-open hook
  behavior.
- Launcher/CLI tests prove exact forwarded argv, plugin injection, inherited
  TTY, signal cleanup, process outcomes, and no semantic control output.
- `npm pack` contains the plugin manifest, hook config, private handler, and
  installed `agent-claude` bin.

No child stories are needed; the adapter is cohesive under one provider-owned
boundary and one shared mutation path.

## Implementation notes

- Added the installed `agent-claude` composition/CLI and a shell-free inherited
  TTY process boundary with per-run plugin injection.
- Added an npm-packed observation-only plugin and private fail-open hook entry
  point covering session, prompt, permission, tool, elicitation, stop/failure,
  background-work, and session-end evidence without retaining native contents.
- Native Claude session binding and transitions occur under one store mutation;
  title writes flow through reconciliation and latest durable projection.
- Launch waits for bounded native hook evidence and degrades visibly when the
  plugin never reports; compaction, scheduled work, session end, and native-ID
  rebinding preserve the normalized state contract.
- Claude 2.1.226 validates the plugin cleanly; typecheck/build, focused adapter
  tests, and the serialized 231-test suite pass.

## Review (2026-08-20)

Standard-weight review used the shared fresh-context Claude Opus pass. It found
one material false-idle window before the first hook and important lifecycle
edges around session end, scheduled work, compaction rebinding, and routine hook
latency.

Receiver fixes added a bounded hook-readiness gate with explicit stale
diagnostics, a normalized session-ended transition, authoritative SessionStart
rebinding except for compaction, correct cron/background distinctions, and a
fast path that avoids redundant Ghostty work for routine tool hooks. The process
shutdown timer is now unreferenced and cleared. Focused regressions and the full
suite pass; the feature closes without re-review under standard policy.
