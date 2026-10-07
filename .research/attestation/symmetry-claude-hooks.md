---
source_handle: symmetry-claude-hooks
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/hooks
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Code hooks reference

The official hooks reference describes lifecycle hooks configured in settings
or plugins. `SessionStart` and `SessionEnd` are once-per-session; `UserPromptSubmit`,
`Stop`, and `StopFailure` are once-per-turn; tool hooks surround individual
tool calls. Hook input includes common identifiers such as `session_id`,
`transcript_path`, and `cwd`.

## Key passages and anchors

- [1] `hooks.md:19-23, 35-67, 1283-1296` — cadence and events:
  UserPromptSubmit, PermissionRequest, PermissionDenied, PostToolUseFailure,
  Stop, StopFailure, Elicitation, ElicitationResult, and SessionEnd;
  UserPromptSubmit runs when the user submits a prompt, before Claude processes
  it.
- [2] `hooks.md:1789-1854` — PermissionRequest is emitted before an interactive
  approval; its input exposes tool name/input and optional “always allow”
  suggestions. A hook can return allow or deny (with optional revised input),
  and a deny can interrupt the agent.
- [3] `hooks.md:2384-2485` — Stop runs after a main-agent response but not after a
  user interrupt; API errors use StopFailure instead. Stop input includes the
  last assistant text plus `background_tasks` and `session_crons`; a Stop hook
  can block continuation, with a consecutive-block safeguard.
- [4] `hooks.md:2486-2539` — StopFailure supplies an error category, optional
  details, and rendered error text. Its output cannot control the agent.
- [5] `hooks.md:2957-2994` — SessionEnd carries a limited reason vocabulary
  (`clear`, `resume`, `logout`, `prompt_input_exit`, `other`) and cannot block
  termination.
- [6] `hooks.md:2995-3067` — Elicitation is an MCP-server request for user input;
  hooks receive server, message, mode, and requested schema / URL and can
  accept, decline, or cancel programmatically. ElicitationResult follows a
  user response before it reaches the server.
