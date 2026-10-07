---
name: agent-board-architecture
description: Read this before implementing or changing Agent Board modules, process topology, state contracts, or external adapters.
type: architecture
kind: planning
status: locked
nav_priority: high
updated: 2026-09-12
summary: |
  Agent Board is a local TypeScript modular monolith with five small CLI binaries and no permanently installed daemon. Each supervised tab runs a provider-specific managed launcher: Codex uses app-server plus remote TUI, while Claude preserves its ordinary interactive CLI and emits lifecycle evidence through bundled hooks. Both persist normalized state and share one Ghostty-title and board projection policy.
decisions:
  - Managed app-server plus `codex --remote` is the default Codex V1 topology; ordinary mode remains a registration-only diagnostic state until a managed observer attaches.
  - Managed ordinary Claude plus a bundled per-run hook integration is the Claude topology; hook gaps remain lower-confidence or diagnostic rather than being promoted to native state.
  - Each supervised tab owns its short-lived launcher, app-server, TUI, and observer process group; there is no global resident daemon.
  - The stable Board session, Ghostty binding, and project identity outlive a managed runtime; each relaunch replaces the prior launcher metadata and native Codex thread binding.
  - The implementation is a Node.js 22+ TypeScript modular monolith with runtime-validated external boundaries.
  - One versioned session record is the source of truth and is updated atomically under a per-session lock.
  - The domain stores orthogonal identity, activity, attention, health, adapter evidence, and terminal presence; visible statuses are derived centrally.
  - Managed working projection uses an ephemeral, reconciliation-verified launcher process existence check matched to the persisted launcher binding; the 60-second freshness threshold remains a fallback whenever that proof is unavailable.
  - Ghostty 1.3+ AppleScript stable IDs and targeted tab-title overrides are the primary terminal contract.
  - Completion acknowledgement is Board-owned and clears when the registered Ghostty tab is reliably focused, with an explicit acknowledgement command as fallback.
  - Provider compatibility is explicit and evidence-preserving: experimental Codex protocol families are version-gated, while Claude Code 2.1.226 is the hook floor, 2.1.x is tested, and newer families warn when plugin validation succeeds.
  - V1 exposes observation, naming, and board administration, with no semantic agent actions; focus navigation, notifications, GUI, remote, and hardware remain outside the runtime boundary.
---

# Architecture: Agent Board

*Last updated: 2026-09-12*

> How the system is built. For product intent, see [Vision](VISION.md),
> [Specification](SPEC.md), and [Principles](PRINCIPLES.md). Runtime decisions
> are grounded in the [Codex topology brief](../.research/analysis/briefs/codex-detector-topology.md)
> and [Ghostty contract brief](../.research/analysis/briefs/ghostty-registration-liveness.md),
> plus the [Codex-Claude campaign](../.research/analysis/campaigns/codex-claude-symmetric-support/parent.md)
> and [common-glyph position](../.research/analysis/positions/codex-claude-common-glyph-contract.md).

## System overview

Agent Board is one installable local CLI package. It has several entry points,
but one domain model and one set of adapters.

```text
Ghostty tab
  │
  ├─ agent-name <label> ───────────────┐
  ├─ agent-codex [codex args...]       │
       │                               │
       ├─ resolve/register tab         │
       ├─ codex app-server :0          │
       ├─ Board observer client ───────┼─> session service
       └─ codex --remote <endpoint>    │        │
  │                                    │        │
  └─ agent-claude [claude args...]     │        │
       ├─ resolve/register tab         │        │
       ├─ bundled observation hooks ───┘        │
       └─ ordinary interactive claude           │
                                                v
                                     versioned session store
                                         │             │
                                  title projection   agents
                                         │             │
                                         v             v
                               Ghostty tab override  terminal board
```

`agent-codex` is the default launcher. It binds an ephemeral loopback port by
starting `codex app-server --listen ws://127.0.0.1:0`, initializes a second
observer client, then gives the terminal directly to `codex --remote`. Codex
selects the port and prints the resolved endpoint, avoiding fixed-port conflicts
across tabs. Loopback WebSocket deliberately supersedes the research brief's
provisional Unix-socket recommendation because it is the transport verified with
both the remote TUI and a concurrent observer. Unix-socket multi-client support
may replace it later if an integration test proves equivalent behavior. The
launcher exists only while that Codex TUI exists.

The ordinary `codex` path is not presented as evidence-equivalent. `agent-name`
alone only creates or updates a registered session record; it does not attach a
live observer. Until `agent-codex` claims that session and binds managed
observation, projection treats the visible ordinary record as `? diagnostic`
with `session is not managed`. Only a managed provider mode with usable
observation capability can produce the five canonical agent glyphs.

## Process topology

### Per-tab managed Codex launcher

One `agent-codex` process owns one supervised tab's runtime:

1. Resolve the currently focused Ghostty window, tab, and terminal IDs.
2. Find the existing Board session for that terminal or register one using the
   repository directory name as an editable initial label.
3. Start app-server on an ephemeral loopback WebSocket endpoint with the stable
   Board session ID in its process environment as `AGENT_BOARD_SESSION_ID`.
   Also pass the Codex config override
   `-c shell_environment_policy.set.AGENT_BOARD_SESSION_ID=<JSON-encoded-session-id>`
   so Codex's shell-environment filtering explicitly bridges that identity into
   agent-tool shell descendants. Then wait for advertised readiness with a
   bounded timeout.
4. Claim that stable session for this launcher by recording its process ID and
   clearing any native thread binding left by the prior managed runtime.
5. Connect the Board observer, complete protocol initialization, subscribe to
   notifications, and discover existing threads. Discovery validates the
   `thread/loaded/list` wire response as thread-ID strings, then resolves each
   ID through `thread/read` with turns omitted before root-thread binding.
6. Start the remote Codex TUI with inherited stdin/stdout/stderr, the same
   `AGENT_BOARD_SESSION_ID`, and the exact override
   `-c tui.terminal_title=[]`; Codex requires this setting to be a sequence,
   and the empty sequence disables its title components so the Ghostty adapter
   owns the registered title. Codex `!` descendants inherit the exact targeting
   context.
7. Normalize observed thread and turn events, update the store, and render the
   tab title after each meaningful transition.
8. Poll focused Ghostty identity only while unread completion exists. Reliable
   focus clears completion attention; input-required attention remains until
   Codex reports that the wait ended.
9. On clean TUI exit, stop app-server, mark the agent activity idle with explicit
   process-exit evidence, and leave the project tab registered.
10. On launcher, protocol, or app-server failure, record a visible diagnostic or
   error before bounded cleanup.
11. After every managed exit path, restore the exact controlling-terminal mode
   captured before launch, then pop/reset Codex's CSI-u keyboard-reporting stack
   and disable xterm modifyOtherKeys. Non-terminal stdin skips this operation;
   capture failure on a terminal stops before Codex launches. Failure in either
   restoration step is reported with the fallback `reset` recovery command and
   never replaces the managed outcome.

The launcher ignores terminal `SIGINT` while the child TUI is active so Codex
retains its normal interrupt behavior. Termination and hangup signals trigger
bounded child cleanup. Child processes are never adopted as a machine-wide
service.

### Per-tab managed Claude launcher

One `agent-claude` process owns one supervised tab's runtime:

1. Resolve or register the current Ghostty terminal and preserve the stable
   Board session ID, project label, and terminal binding.
2. Claim the session for a Claude managed runtime, recording launcher identity
   and clearing provider-native binding left by an earlier launcher.
3. Start the ordinary interactive `claude` executable with inherited terminal
   streams, `AGENT_BOARD_SESSION_ID`, and the packaged Agent Board plugin/hook
   directory enabled only for that run.
4. Hook callbacks parse bounded provider event JSON, correlate the exact Board
   and Claude session identities, map supported events through the common
   transition boundary, mutate the latest locked record, and render its title.
5. Prompt submission supplies corroborated working evidence; permission and MCP
   elicitation supply input-required evidence; `Stop`, `StopFailure`, and
   `SessionEnd` supply completion, failure, and lifecycle evidence. Background
   work prevents a false globally-finished projection.
6. Because user interruption does not invoke Claude's `Stop` hook, launcher and
   later hook evidence reconcile stale working state; unresolved recovery
   projects diagnostic `?` rather than guessing completion or idle.
7. Hook failures never block or alter Claude's turn. Managed policy, missing
   hook capability, incompatible version, or invalid event shape degrades the
   Board record visibly.
8. On process exit or termination, perform bounded cleanup, preserve the
   registered tab, and record provider-qualified process evidence.

The Claude launcher does not host Claude's agent loop and does not use the Agent
SDK. Claude retains its ordinary keyboard, permission, scrollback, and terminal
interaction. Generic terminal keys are never modeled as semantic approval.

### Independent CLI invocations

- `agent-name [label]` has two one-label target paths. When
  `AGENT_BOARD_SESSION_ID` is present, it passes that exact ID to registration,
  renames only the stored session, and never resolves Ghostty focus; managed
  managed-agent and tool descendants use this path. Without a bound ID, it
  requires interactive stdin and uses the focused Ghostty tab; a detached or
  non-TTY process fails before focus resolution. Its stable error is shown
  below. With no label, the command remains callable noninteractively by the
  macOS Shortcut: it captures the focused registered session once before
  opening the native rename prompt; Cancel is a successful no-op and Rename
  changes only the project label/title.

  ```text
  CONFLICT: agent-name <label> must run in the target terminal; use the managed agent or a shell prompt
  ```

  Registration without a managed provider launcher leaves the session in ordinary mode, so
  projection stays diagnostic until managed observation attaches.

  Running managed agent processes do not receive a newly added environment
  binding retroactively. Sessions launched before this contract must exit and
  restart through their Agent Board launcher once.
- `agents` reconciles Ghostty presence, renders every registered session, and
  repairs stale title projection where safe. One successfully validated
  application-wide snapshot is also the authority for closed-session cleanup:
  a session classified `missing` is removed and omitted from that board result.
  `hidden` (including Ghostty undo-close) and `unknown` sessions remain
  registered; snapshot failure removes nothing. A failed removal leaves the
  missing diagnostic visible so a later board read can retry.
- `agent-board doctor` validates versions, executables, Automation permission,
  Ghostty config conflicts, Codex protocol compatibility, Claude hook/plugin
  capability, and state-directory access.
- `agent-board ack [session]` is the explicit completion acknowledgement fallback.
- `agent-board unregister [session]` clears the title override and removes the
  registration through a recoverable, session-scoped operation.

These commands do not require the managed launcher to be running.

## Module map

```text
src/
  domain/
    session.ts              normalized session schema and invariants
    registries.ts           status/evidence/capability source of truth
    transitions.ts          native observation -> normalized transition
    projection.ts           one status/title/board projection policy
    ports.ts                store, terminal, agent-event, clock, process ports

  application/
    acknowledge-session.ts  explicit/focus-derived acknowledgement target resolution
    acknowledge.ts          completion acknowledgement transition
    doctor.ts               runtime, state, provider, and Ghostty diagnostics
    launch-managed-claude.ts supervised Claude lifecycle orchestration
    launch-managed-codex.ts supervised lifecycle orchestration
    list-sessions.ts        board query and diagnostic annotations
    observe-agent.ts        apply validated provider observations
    observe-claude-hook.ts  apply validated Claude hook observations
    observe-managed-codex.ts managed Codex lifecycle observation
    prompt-rename-session.ts focused-session capture and native rename application
    reconcile-session.ts    terminal and managed-launcher liveness reconciliation
    register-session.ts     idempotent register/rename use case
    render-title.ts         locked read-current-state then targeted render
    resolve-session-target.ts explicit/focused session resolution
    unregister-agent-session.ts title clear and session removal
    unregister-session.ts   unregister transition
    watch-completion-focus.ts focus-derived completion acknowledgement

  integrations/
    codex/                  app-server protocol, WebSocket client, lifecycle,
                            thread binding, compatibility, and process hosting
    claude/                 hook-event schemas, lifecycle mapping, plugin assets,
                            compatibility, and interactive process hosting
    launcher-liveness.ts    non-destructive local signal-zero process probe
    ghostty/                AppleScript client/protocol, title actions, and diagnostics
    macos/                  native rename prompt through macOS Automation
    git/                    repository context lookup
    terminal-mode.ts        exact pre/post-TUI controlling-terminal restoration
    command-config.ts       absolute executable override validation
    process-runner.ts       bounded external-process execution
  infrastructure/
    json-session-store.ts   atomic JSON records and scoped locks
    file-lock.ts            crash-aware lock implementation
    session-files.ts        record file layout and parsing
    state-diagnostics.ts    state-directory probe
    state-paths.ts          state-root resolution

  cli/
    agent-board.ts          doctor, ack, unregister command router
    agent-name.ts           naming entry point
    agents.ts               board entry point
    agent-claude.ts         managed Claude entry point
    agent-claude-hook.ts    packaged Claude hook event entry point
    agent-codex.ts          managed-launch entry point
    doctor-output.ts        stable doctor rendering
    output.ts               stable board/CLI error rendering
    is-main.ts              installed-bin entry-point guard

  composition/
    create-agent-board.ts   doctor, ack, and unregister wiring
    create-agent-claude.ts  managed Claude wiring
    create-agent-codex.ts   managed Codex wiring
    create-agent-name.ts   naming wiring
    create-agents.ts        board wiring

tests/
  domain/                   pure transition/projection tests
  application/              use-case tests with fake ports
  cli/                      command parsing, rendering, and packaging guards
  infrastructure/           store, lock, file, and state-directory tests
  integrations/             provider, Ghostty, Git, and process-boundary tests
  e2e/                      packed fake provider/Ghostty/Automation vertical slices
  integration/              opt-in installed provider/Ghostty probes
```

The domain imports no filesystem, process, WebSocket, AppleScript, or wall-clock
implementation. Ports exist only at these real boundaries; internal pure
functions do not receive ceremonial interfaces.

## Domain and storage contract

### Session record

Each file under the state directory is one validated record:

```text
schemaVersion
revision
sessionId

identity:
  projectLabel
  repoPath?
  gitBranch?
  createdAt

terminal:
  adapter = ghostty
  windowId
  tabId
  terminalId
  presence = visible | hidden | missing | unknown
  observedAt

agent:
  adapter = codex | claude
  mode = managed | ordinary
  nativeThreadId?       # Codex managed binding
  nativeSessionId?      # Claude managed binding
  launcherPid?
  activity = unknown | idle | working
  attention = none | completion_unread | input_required
  completionObservedAt?  # required while completion is unread
  health = live | stale | error
  observedAt
  evidenceKind
  confidence = authoritative | corroborated | inferred
  detail?
```

The primary five glyphs are not stored. `projection.ts` derives them from the
record registry. Diagnostic states such as missing terminal or incompatible
adapter may use a clearly non-primary `?` projection rather than lying with
idle or error.

### Physical layout

```text
${AGENT_BOARD_STATE_DIR:-$HOME/.local/state/agent-board}/
  v1/
    sessions/<session-id>.json
    locks/<session-id>.lock/
    locks/registry.lock/
```

`AGENT_BOARD_STATE_DIR` makes tests and advanced installations hermetic. The
default is deliberately transparent and user-inspectable.

Every mutation:

1. acquires the registry or session lock with a bounded timeout;
2. reads and validates the latest record;
3. changes only the fields owned by the use case;
4. increments `revision`;
5. writes a unique temporary file in the same directory;
6. flushes and atomically renames it over the canonical record; and
7. releases the lock.

Read paths need no lock because canonical files are replaced atomically. Lock
metadata uses `proper-lockfile` heartbeat `mtime` updates; a lock is eligible
for takeover when its heartbeat exceeds the configured stale threshold, without
an owner-process liveness check. Invalid JSON, unknown schema versions, and
broken invariants fail with actionable diagnostics; they are never interpreted
heuristically.

### Identity and idempotency

`sessionId` is Board-owned UUID identity. Ghostty IDs are adapter binding, not
the primary key. Registration under the registry lock scans for the current
terminal ID and updates that record rather than duplicating it. Repository path,
label, branch, and tab index are never identity keys.

## State transition and projection policy

The registry defines native event mappings, allowed normalized values, display
labels, glyphs, precedence, confidence, and freshness in one place.

```text
terminal missing or observation unusable       -> ? diagnostic
agent mode ordinary                            -> ? diagnostic
agent health error                             -> × error
attention input_required                       -> ! needs input
attention completion_unread                    -> ✓ finished / unread
managed/live working with verified PID match   -> ● working
working without verified launcher proof and fresh -> ● working
visible managed tab with live idle evidence    -> ○ idle
```

Codex managed event rules:

- thread `active` with no wait flags starts or continues `working`;
- `waitingOnApproval` or `waitingOnUserInput` sets `input_required`;
- successful turn completion sets `idle + completion_unread`;
- interrupted completion sets `idle + none`;
- failed turn or `systemError` sets `error` with native detail;
- a clean TUI process exit leaves a visible registered project idle and records
  the process-exit evidence; it does not impersonate terminal disappearance;
- a new active turn clears prior completion attention and recoverable error;
- focus acknowledges completion only when AppleScript identifies the registered
  window, selected tab, and focused terminal; elapsed time alone never does.

Claude managed event rules:

- `UserPromptSubmit` starts `working` at corroborated confidence;
- `PermissionRequest` and MCP `Elicitation` set `input_required` with their
  provider-specific subtype retained in evidence detail;
- `Stop` sets `idle + completion_unread` only when no reported background work
  remains;
- `StopFailure` sets error with bounded provider detail;
- `SessionEnd` and launcher exit update lifecycle evidence without pretending
  that session termination is successful turn completion;
- a later prompt, wait, completion, failure, or process observation reconciles
  earlier working state; a user interrupt without such evidence degrades to
  diagnostic rather than inferring idle; and
- focus acknowledgement uses the same full Ghostty identity guard as Codex.

If detailed turn outcome is temporarily unavailable, `active -> idle` may
produce completion attention only at `corroborated` confidence and must retain
that evidence detail. It must not convert a known failure or interruption into
success.

The lifecycle adapter keeps the app-server notification iterator established
before discovery so a root-thread start/discovery race cannot lose the first
event. Loaded-thread discovery first validates the ordered ID list, then reads
each thread with `{ threadId, includeTurns: false }` to obtain the status,
working directory, and parent metadata consumed by binding. It binds only one
viable root in the dedicated process, persists the native thread binding before
applying lifecycle observations, and refuses ambiguous, mismatched, or
contradictory evidence. An authoritative interruption is a distinct normalized
transition that clears completion attention; retryable Codex errors remain
diagnostic evidence within the active lifecycle.

## Ghostty integration

The adapter invokes `/usr/bin/osascript` with constant scripts and passes user
data as positional arguments, never by interpolating labels into AppleScript.
The application boundary validates tab labels before adapter transport and
rejects control characters.

Registration captures window, tab, and terminal IDs from the active hierarchy.
Title rendering targets the terminal ID with `set_tab_title:<glyph> <label>`.
Unregister clears with `set_tab_title:`.

Reconciliation performs one structured hierarchy snapshot. A terminal found in
the expected current window/tab ancestry is `visible`; an application-wide
terminal that has lost that ancestry is `hidden`; an absent ID is `missing`.
The distinction is necessary because undo-closed surfaces remain alive and
enumerable with stable IDs. Batch reconciliation for `agents` removes only the
authoritatively `missing` records from that validated snapshot. Single-session
reconciliation remains diagnostic, and an invalid or unavailable snapshot maps
sessions to `unknown` without deleting anything.

Before shared projection, reconciliation probes the persisted managed launcher
PID with local signal-zero process existence and carries that verified PID only
for the current title/board projection. A live probe leaves native agent
evidence unchanged and does not refresh it periodically. A missing or
unprobeable launcher atomically records stale health with corroborated local
launcher-liveness diagnostic evidence, retaining the PID as runtime binding
context. A persisted PID without a matching current probe is not sufficient to
bypass freshness, including on direct title-render paths. Working records
without verified launcher proof retain the configured freshness fallback.
Because V1 has no resident daemon, hard launcher death is discovered when
`agents` or another state reconciliation runs.

Setup diagnostics require:

- Ghostty with the official AppleScript object model;
- AppleScript enabled and macOS Automation permission granted;
- no incompatible fixed global `title`;
- title bell decoration disabled so the prefix position remains stable; and
- a usable `set_tab_title` action.

## Codex integration

The observer validates every JSON-RPC message before mapping it. It binds only
the root remote-TUI thread created within its dedicated app-server process;
unrelated or child thread events cannot overwrite the tab record. The binding
algorithm uses the dedicated process scope, thread start/load events, parent
metadata when available, and the expected working directory. Ambiguity produces
an explicit diagnostic instead of guessing.

A native thread binding belongs to one short-lived managed launcher and
app-server lifetime, not to the stable Board session. Re-running `agent-codex`
in a registered tab retains its Board session, Ghostty binding, and project
label while replacing the launcher metadata and native thread binding. The new
observer can then bind the root thread created by its own private app-server.

Protocol compatibility is checked against the installed Codex version and the
minimum event/schema shapes Agent Board needs. V1 does not vendor the entire
generated app-server schema; it maintains narrow boundary schemas for the
methods it consumes and integration-tests them against the installed generator.
The installed probe guards both the `thread/loaded/list` ID surface and the
`thread/read` metadata surface. Unknown additive fields are allowed. Missing
required fields or changed enum semantics fail the managed adapter visibly;
response-validation failures name the JSON-RPC method that drifted.

App-server readiness, observer initialization, and child shutdown all have
bounded timeouts. The local endpoint binds loopback only, lives for one launcher,
and is never advertised beyond the machine.

The CLI snapshots the controlling terminal with shell-free `/bin/stty -g`
before starting the managed runtime and reapplies that opaque snapshot after
cleanup. After exact termios restoration succeeds, it emits Codex-parity
keyboard cleanup: pop and reset CSI-u enhancement levels, then disable
modifyOtherKeys before the shell prompt returns. It does not impose `reset` or
`stty sane` during normal cleanup; those are operator fallbacks only when
restoration itself fails. This preserves intentional terminal customization
while preventing forced TUI shutdown from leaving modified-key sequences
active in Ghostty.

## Claude integration

The adapter accepts only the documented hook events used by Agent Board and
validates each bounded JSON payload before mapping it. Every callback requires
the exact `AGENT_BOARD_SESSION_ID` inherited from the managed launcher and uses
Claude's reported session ID as provider binding evidence. A callback cannot
discover or target another focused tab.

The packaged plugin is enabled per launch and does not modify user or project
settings. Its hook command is constant, observation-only, and tolerant of Board
failure: it reports diagnostics locally but exits without blocking Claude's
turn. Managed policy or incompatible hook support is detected before launch
where possible and remains visible through doctor and session diagnostics.

The adapter does not parse Claude transcript JSONL as a stable control API and
does not use raw terminal output as provider-native lifecycle evidence. The
launcher owns process liveness and shutdown; hooks own only the event families
they actually receive. This split is why prompt start and user-interrupt
recovery carry lower confidence than Codex app-server lifecycle state.

## Technology and dependencies

| Dependency | Purpose | Constraint |
| --- | --- | --- |
| Node.js | CLI/process runtime | `>=22`; modern ESM, child-process, filesystem, and test support |
| TypeScript | domain and boundary contracts | Strict mode; compiled before packaging |
| Zod | JSON, CLI, config, and AppleScript boundary validation | Runtime dependency; schemas are authoritative |
| `ws` | app-server observer WebSocket client | Runtime dependency; loopback client only |
| `proper-lockfile` | crash-aware cross-process session locking | Runtime dependency; lock scope is state directory only |
| `tsx` + Node test runner | TypeScript test execution | Development dependency only |
| Codex CLI | managed agent backend and remote TUI | Version diagnosed at startup; app-server interface is experimental |
| Claude CLI | managed ordinary interactive agent and hook host | Version and required plugin/hook capability diagnosed at startup |
| Ghostty | terminal identity and title projection | macOS AppleScript-capable release |
| `/usr/bin/osascript` | Ghostty scripting transport | macOS system dependency |
| `/bin/stty` | Exact termios capture and restoration before keyboard-reporting cleanup around managed TUI launch | macOS system dependency; shell-free, controlling terminal only |

There is no CLI framework, database, web framework, logging service, or GUI
dependency. `node:util.parseArgs` and small command modules are sufficient.

## Error and diagnostic conventions

- Domain/application errors are typed with stable codes and human messages.
- External process failures include command name, exit status, bounded stderr,
  and remediation, but never dump environment variables or auth material.
- User-facing commands write normal output to stdout and diagnostics to stderr.
- `--json` output uses a versioned envelope for doctor and board automation.
- Debug logging is opt-in, structured, local, and redacts prompt content and
  tokens. Agent Board needs lifecycle metadata, not conversation content.
- Degraded modes are named in every detailed board row and diagnostic output.
- Projection precedence treats non-visible terminals and ordinary mode as
  diagnostics before health, attention, or activity. Registration and naming
  are therefore distinct from managed observation.

## Testing strategy

The test pyramid follows contracts rather than implementation lines:

1. Pure domain tests exhaust projection precedence and transition tables.
2. Store tests cover atomic replacement, schema rejection, lock contention,
   stale-lock recovery, and concurrent rename/status updates.
3. Provider adapter tests replay minimal recorded protocol or hook fixtures for loaded-ID
   discovery plus metadata reads, idle, working, both wait flags, completion,
   interruption/recovery, failure, system error, incompatible schema, and disconnect.
4. Ghostty adapter tests cover structured snapshot parsing, ID-based targeting,
   label escaping, title clear, hidden/undoable hierarchy, and failures.
5. Hermetic end-to-end tests use fake `codex`, `claude`, and `osascript`
   executables to prove mixed-provider register -> working ->
   waiting/completed/error -> title + board parity.
6. Opt-in installed integration tests probe real executables individually:
   installed Codex verifies version plus app-server schema compatibility
   (status enum coverage, `thread/loaded/list` and `thread/read` shape);
   installed Claude verifies version plus `claude plugin validate` against the
   packaged hook plugin, not live interactive hook delivery; a separate
   Ghostty probe opens and closes a temporary window without touching
   existing user tabs. None of these automate the real Claude TUI.
7. Terminal adapter tests verify exact termios replay, keyboard-reporting
   cleanup, non-terminal silence, and restoration-failure handling.

No test asserts private function call order where a behavioral contract is
available. Real-GUI tests remain bounded and opt-in.

## Installation and operation

The package exposes five binaries through npm packaging: `agent-codex`,
`agent-claude`, `agent-name`, `agents`, and `agent-board`. Development uses `npm link`; user
installation may use a local checkout or packed tarball. No shell startup file
is mutated automatically. Documentation may offer an optional alias only after
showing the literal command it replaces.

## What's deferred

- a permanently installed event daemon or shared app-server;
- automatic shell aliases or Ghostty keybinding mutation;
- provider parity beyond the truthful Codex and Claude adapter boundaries;
- a third agent adapter;
- focus/jump navigation and semantic agent actions;
- notifications, menu-bar, always-on-top, or GUI surfaces;
- external protocol, simulator, or remote aggregation;
- tmux integration; and
- custom hardware, wireless, battery, or enclosure work.

These remain preserved as backlog ideas with entry conditions rather than
phases in the V1 architecture.

## Bounded compatibility and tuning checks

- Managed observation currently accepts Codex `0.147.x`, `0.148.x`, `0.149.x`,
  `0.150.x`, `0.152.x`, `0.153.x`, or `0.154.x`. The installed `codex-cli` `0.154.0`
  release passed the narrow generated-schema contract and lifecycle-value probe
  in `tests/integration/installed-codex.test.ts`. This probe does not validate
  status-line visual rendering. `agent-board doctor` reports
  unsupported or unrecognized versions before launch, including the explicitly
  excluded `0.151.x` family and unverified later releases. Compatibility is
  intentionally a narrow tested family, not an implicit promise for every
  future Codex release. A future upgrade must refresh the generated-schema
  integration probe and lifecycle fixtures together.
- Managed Claude observation requires Claude Code `2.1.226` or newer. The
  `2.1.x` family is tested; newer families remain available with an explicit
  `CLAUDE_VERSION_UNTESTED` warning when the packaged plugin still validates.
  This separates the hard hook-contract floor from evidence about versions the
  installed integration suite has actually exercised.
- The packaged golden journey proves lifecycle/title/board convergence under
  one second with the default observer and focus polling settings. The interval
  remains a tunable operational parameter, but changing it is a performance
  decision rather than an unresolved module-boundary question.
- Detailed outcome coverage remains bounded by the installed app-server schema:
  missing or changed required shapes fail visibly, while unknown additive fields
  remain tolerated. Any future protocol change is handled through the Codex
  compatibility boundary and its installed-schema probe.

None changes the module boundaries. These are bounded compatibility and
integration-maintenance decisions, not a reason to reopen the V1 topology.

## Related documents

| Document | Purpose |
| --- | --- |
| [Vision](VISION.md) | Product outcome and first user |
| [Specification](SPEC.md) | Behavioral and acceptance contract |
| [Principles](PRINCIPLES.md) | Tradeoff heuristics and guardrails |
| [Research plan](research-plan.md) | Completed and deferred research |
| [Codex topology brief](../.research/analysis/briefs/codex-detector-topology.md) | Managed/ordinary runtime evidence |
| [Ghostty contract brief](../.research/analysis/briefs/ghostty-registration-liveness.md) | Registration, title, and liveness evidence |
| [Codex–Claude common-glyph position](../.research/analysis/positions/codex-claude-common-glyph-contract.md) | Shared glyph contract and asymmetric provider evidence |

## Related architecture docs

No other `type: architecture` document currently exists in the knowledge index.
