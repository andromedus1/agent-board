---
provenance: agent-synthesis
updated: 2026-08-20
facet: claude-current-surface
---

# Claude Code current lifecycle and control surface

## Position

Claude Code can support provider-neutral observation of session start, submitted
work, permission-needed attention, ordinary turn completion, API failure, MCP
elicitation, and session end **when an operator installs a hook integration**.
Those events carry a session ID and transcript path, and Stop additionally
carries the final assistant message plus currently registered background tasks
and scheduled wakeups. `[symmetry-claude-hooks]{1} [symmetry-claude-hooks]{2}
[symmetry-claude-hooks]{3} [symmetry-claude-hooks]{4}
[symmetry-claude-hooks]{5} [symmetry-claude-hooks]{6}`

The ordinary CLI remains an interactive terminal application: it owns prompt
entry, permission dialogs, `Esc` / `Ctrl+C` interruption, mode switching, and
backgrounding. A user may queue a message while a turn runs instead of
interrupting; `Esc` redirects the turn and sends queued work. The provider's
own task checklist and the background-task view are separate.
`[symmetry-claude-interactive-mode]{1} [symmetry-claude-interactive-mode]{2}
[symmetry-claude-interactive-mode]{3} [symmetry-claude-interactive-mode]{4}`

An external supervisor can promise **attention routing and visibly qualified
state**, not an unqualified external control plane for a stock interactive
Claude terminal. In particular, generic terminal keystrokes cannot be
represented as approval. A board can direct the operator to Claude's native
dialog, or use an explicitly installed and version-validated hook/SDK
integration whose decision flow is recorded as such. `{inferred: the CLI
interaction and the programmatic decision surfaces are separately documented}`
`[symmetry-claude-interactive-mode]{1} [symmetry-claude-hooks]{2}
[symmetry-claude-agent-sdk-user-input]{3}`

## Lifecycle and attention/input contract

{extends: supervisor interpretation of source-attested Claude behavior}

| Surface | Source-attested Claude behavior | Honest supervisor treatment |
| --- | --- | --- |
| Work begins | `UserPromptSubmit` fires before Claude processes a submitted prompt; CLI messages can be queued during a running turn. `[symmetry-claude-hooks]{1} [symmetry-claude-interactive-mode]{3}` | Show “submitted / working” only from a configured hook or a directly observed terminal session; do not treat a queued message as processed work. |
| Permission need | `PermissionRequest` fires when Claude is about to ask, includes tool name/input and suggestions, and hooks can allow/deny; normal approval requirements vary by permission mode and policy. `[symmetry-claude-hooks]{2} [symmetry-claude-permissions]{1} [symmetry-claude-permissions]{2}` | Alert as a specific permission-required state. Native terminal approval stays native unless the configured integration returns an explicit, auditable decision. |
| Clarifying input | Agent SDK uses `canUseTool` for `AskUserQuestion`; it pauses until the host answers. The host returns the model-provided question and selected answers; subagents cannot use AskUserQuestion. `[symmetry-claude-agent-sdk-user-input]{1} [symmetry-claude-agent-sdk-user-input]{4} [symmetry-claude-agent-sdk-user-input]{5}` | On an SDK-owned session, display an input-needed card with the question schema and return an explicit response. On ordinary CLI, hold this capability pending a live hook/TUI validation. |
| MCP elicitation | `Elicitation` represents an MCP server asking for user input and can be programmatically accepted/declined/cancelled by a hook; `ElicitationResult` follows a user response. `[symmetry-claude-hooks]{6}` | Distinguish server elicitation from Claude permission and from AskUserQuestion. Never flatten them into one “approve” action. |
| Normal turn end | `Stop` occurs when the main agent finishes, provides final assistant text and background/scheduled task arrays, and may be blocked by a hook. `[symmetry-claude-hooks]{3}` | Project a completed-turn state, but keep separate “session has background work” and “session idle.” |
| Error end | API-error end uses `StopFailure`, not `Stop`; it provides typed error information but does not accept decision control. `[symmetry-claude-hooks]{3} [symmetry-claude-hooks]{4}` | Show failure with provider evidence and a manual recovery route; do not announce a completed turn. |
| User interrupt | `Esc` or `Ctrl+C` interrupts a running operation; the Stop hook explicitly does not run for user-interrupt stoppage. `[symmetry-claude-interactive-mode]{1} [symmetry-claude-hooks]{3}` | Treat interruption as an observed control event only when the adapter has direct evidence; absence of Stop is not proof of a successful completion. |
| Session termination | SessionEnd fires with a limited reason vocabulary and is notification/cleanup-only. `[symmetry-claude-hooks]{5}` | Mark terminal/session ended with the reported reason and no claim that in-flight external work was resolved. |

## Session identity, resumption, and launch topology

The CLI persists conversation transcripts locally and supports latest-session
continuation, picker/named/session-ID resume, and session branch/fork. Resume
restores conversation and selected session settings but not background Bash or
monitor tasks, and CLI transcript JSONL is explicitly an internal changing
format rather than a stable integration contract. `[symmetry-claude-sessions]{1}
[symmetry-claude-sessions]{2} [symmetry-claude-sessions]{3}
[symmetry-claude-sessions]{4}`

The installed local build is Claude Code `2.1.226`; its help exposes interactive
launch, `-p` non-interactive execution, session ID/name/resume/fork flags,
background agents, Remote Control, and stream-JSON only on the print-mode
route. `[symmetry-claude-local-cli-2.1.226]{1}
[symmetry-claude-local-cli-2.1.226]{2}
[symmetry-claude-local-cli-2.1.226]{3}
[symmetry-claude-local-cli-2.1.226]{4}
[symmetry-claude-local-cli-2.1.226]{5}` Capability use must still be
gated by an installed-build probe because a local-version observation is not a
claim about future surfaces. `{inferred: local-version probe boundary}`
`[symmetry-claude-local-cli-2.1.226]{1}`

Remote Control is a distinct, provider-owned bridge: it exposes a local Claude
process to claude.ai/code or mobile while retaining the local filesystem, MCP,
tools, and terminal interaction. Server mode has its own session spawning and
capacity model, and it is unavailable under named third-party-provider routes
or a non-Anthropic API base URL. `[symmetry-claude-remote-control]{1}
[symmetry-claude-remote-control]{2} [symmetry-claude-remote-control]{3}` It can
be a manual “open Claude's remote session” target, but this evidence does not
establish an external supervisor as a Remote Control client. `{inferred: documentation
describes Claude web/mobile clients rather than a third-party client contract}`
`[symmetry-claude-remote-control]{1} [symmetry-claude-remote-control]{3}`

`{inferred: topology fit}` The Agent SDK is the appropriate topology when the application itself owns the
agent process: it runs Claude Code's agent loop in a Python or TypeScript host;
the host receives lifecycle messages and owns session handling. Its official
overview says third-party products cannot offer claude.ai login or rate limits;
they must use documented API-key authentication.
`[symmetry-claude-agent-sdk-overview]{1}
[symmetry-claude-agent-sdk-overview]{3}
[symmetry-claude-agent-sdk-sessions]{4}`

## Policy, plugins, and ordinary-TUI preservation

Plugin/hook/MCP availability is policy-sensitive: managed settings outrank
lower scopes and may require plugin-only customization; plugin components are
scoped user/project/local/managed, with project content subject to workspace
trust and additional constraints. `[symmetry-claude-permissions]{2}
[symmetry-claude-plugins-reference]{1} [symmetry-claude-plugins-reference]{2}`
Thus a Claude adapter must report detected version, authentication/topology,
policy/feature availability, and whether its evidence is hook-, SDK-,
Remote-Control-, or terminal-derived instead of assuming those extensions are
permitted. `{inferred: policy precedence and component scope make availability
environment-dependent}` `[symmetry-claude-permissions]{2}
[symmetry-claude-plugins-reference]{2}`

No stable source here authorizes parsing or driving the ordinary terminal
transcript as a semantic control API. The documented programmatic routes are
hooks, print-mode stream output, and the Agent SDK, while the CLI transcript
format is expressly unstable. `{inferred: documented integration surfaces and
transcript warning}` `[symmetry-claude-sessions]{4}
[symmetry-claude-local-cli-2.1.226]{5}`
Preserve the terminal by leaving normal keyboard/dialog handling with Claude;
only an opt-in validated adapter should add out-of-band evidence and named
actions.

## Disconfirming analysis

- For the claim that Stop can represent ordinary completion, the hook reference
  was checked for user interruption and API-error paths. It says user
  interruption skips Stop and API errors use StopFailure, so Stop alone cannot
  be an unconditional completion signal. `[symmetry-claude-hooks]{3}
  [symmetry-claude-hooks]{4}`
- For a candidate external-approval claim, the sources were checked for both
  native terminal and SDK decision paths. The terminal owns its dialogs,
  whereas SDK callbacks/hooks are the documented programmatic decision paths;
  this supports a capability-qualified integration rather than generic
  keystroke approval. `[symmetry-claude-interactive-mode]{1}
  [symmetry-claude-agent-sdk-user-input]{3} [symmetry-claude-hooks]{2}`
- For “resume means work survives,” session documentation was checked for
  background work. It explicitly excludes background Bash and monitor tasks
  from restore, so restored conversation identity must not be reported as
  restored execution. `[symmetry-claude-sessions]{2}`
- For a third-party remote-control topology, Remote Control documentation was
  checked against Agent SDK guidance. The former names Anthropic's web/mobile
  clients, while the latter requires third-party product hosts to use API-key
  authentication; no fetched source describes a supported external Remote
  Control client protocol. `{inferred: absence across these source scopes}`
  `[symmetry-claude-remote-control]{1} [symmetry-claude-remote-control]{3}
  [symmetry-claude-agent-sdk-overview]{3}`

## Contradictions

No source-direct contradiction was found.

- The hooks reference says Elicitation hooks may answer an MCP request
  programmatically, whereas the Agent SDK guide says `canUseTool` handles
  ordinary tool permissions and AskUserQuestion. These name different request
  mechanisms rather than incompatible claims. `[symmetry-claude-hooks]{6}`
  `[symmetry-claude-agent-sdk-user-input]{2}
  [symmetry-claude-agent-sdk-user-input]{4}`
- The CLI sessions reference documents local transcript persistence and warns
  the JSONL format is internal; the SDK sessions reference additionally permits
  externally mirrored storage through a SessionStore adapter. These apply to
  different topologies. `[symmetry-claude-sessions]{4}`
  `[symmetry-claude-agent-sdk-sessions]{4}`

## Revisit if

- A Claude Code release changes hook event/input/decision schemas, CLI session
  persistence or remote-control eligibility, or enables a documented external
  Remote Control control contract.
- An adapter adds a hook or SDK bridge: run a live lifecycle probe
  covering prompt start, PermissionRequest, AskUserQuestion, Elicitation,
  Stop, StopFailure, user interrupt, background tasks, and SessionEnd before
  enabling each projected state/action.
- Managed policy, plugin availability, selected provider/auth method, or the
  installed Claude Code version changes.

## References

1. `[symmetry-claude-hooks]` — `.research/attestation/symmetry-claude-hooks.md`
2. `[symmetry-claude-interactive-mode]` — `.research/attestation/symmetry-claude-interactive-mode.md`
3. `[symmetry-claude-agent-sdk-user-input]` — `.research/attestation/symmetry-claude-agent-sdk-user-input.md`
4. `[symmetry-claude-permissions]` — `.research/attestation/symmetry-claude-permissions.md`
5. `[symmetry-claude-plugins-reference]` — `.research/attestation/symmetry-claude-plugins-reference.md`
6. `[symmetry-claude-sessions]` — `.research/attestation/symmetry-claude-sessions.md`
7. `[symmetry-claude-local-cli-2.1.226]` — `.research/attestation/symmetry-claude-local-cli-2.1.226.md`
8. `[symmetry-claude-remote-control]` — `.research/attestation/symmetry-claude-remote-control.md`
9. `[symmetry-claude-agent-sdk-overview]` — `.research/attestation/symmetry-claude-agent-sdk-overview.md`
10. `[symmetry-claude-agent-sdk-sessions]` — `.research/attestation/symmetry-claude-agent-sdk-sessions.md`
