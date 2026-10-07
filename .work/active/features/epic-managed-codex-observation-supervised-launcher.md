---
id: epic-managed-codex-observation-supervised-launcher
kind: feature
stage: done
tags: [integration, cli]
parent: epic-managed-codex-observation
depends_on: [epic-managed-codex-observation-app-server-client, epic-managed-codex-observation-lifecycle-adapter]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-16
---

# Supervised Codex Launcher

## Brief

Deliver `agent-codex`: resolve/register the current terminal session, start one
app-server on `ws://127.0.0.1:0`, wait for advertised readiness, initialize the
observer, launch `codex --remote <endpoint>` with direct terminal IO and Board
title ownership, and supervise the process group until clean or failed exit.

The launcher must keep startup/cleanup bounded, pass Codex arguments safely,
preserve normal TUI interrupt behavior, terminate children on hangup/termination,
classify abnormal exits visibly, and leave a live registered tab idle after a
clean TUI exit. It does not install a resident service.

## Inherited design decisions

- One short-lived launcher owns one tab's app-server/TUI/observer group.
- Managed mode is default; ordinary `codex` is not presented as equivalent.

## Research and foundation references

- `.research/analysis/briefs/codex-detector-topology.md` — managed workflow and process risks.
- `.research/attestation/codex-cli-managed-runtime-probe.md` — remote-TUI and endpoint behavior.
- `docs/ARCHITECTURE.md` — per-tab launcher steps, signals, and observability.

## Design decisions

- **App-server gets its own process group; the TUI does not**: the detached
  loopback server must not receive terminal-generated `SIGINT`, while the remote
  TUI inherits the launcher's foreground process group and direct
  stdin/stdout/stderr. The launcher installs a no-op `SIGINT` handler so Codex
  retains normal interrupt behavior; `SIGHUP`/`SIGTERM` initiate bounded cleanup.
- **Managed compatibility is a hard startup gate**: run bounded `codex
  --version`, require the verified `0.147.x` family, and report an error on the
  registered session when incompatible. Do not silently launch ordinary Codex
  or claim equivalent observation.
- **Readiness comes only from bounded advertised output**: start exactly `codex
  app-server --listen ws://127.0.0.1:0`, combine bounded stdout/stderr startup
  text, and accept only `parseAdvertisedEndpoint`'s resolved loopback endpoint.
  Early exit, conflicting output, timeout, or output overflow fail startup.
- **Observer subscription precedes the TUI**: connect and initialize the Board
  client, invoke the managed observer so it establishes its notification stream,
  then start `codex --remote`. This preserves the lifecycle feature's
  subscription-before-discovery contract.
- **User Codex arguments remain argv data**: forward arguments without a shell,
  but reject caller-supplied `--remote`, remote-auth, or
  `tui.terminal_title` overrides. Append Board's endpoint and
  `-c tui.terminal_title=[]` so one component owns the Ghostty title; Codex
  requires this setting to be a sequence.
- **Outcome ownership is explicit**: clean TUI exit records `process-exit: 0`;
  nonzero/signal exit and unexpected server/observer failure record visible
  error; deliberate `SIGHUP`/`SIGTERM` records `interrupted`. Every committed
  change triggers best-effort terminal reconciliation without making a title
  failure kill an otherwise healthy Codex session.
- **Focus acknowledgement is reliable-or-explicit**: a background watcher reads
  the store cheaply and calls Ghostty only while completion is unread. It
  acknowledges only when Ghostty itself reports the application frontmost plus
  the exact selected window/tab/focused terminal. Unsupported/failing focus
  evidence leaves unread state intact for `agent-board ack`.
- **The launcher restores its inherited terminal contract**: capture the exact
  controlling-terminal state with shell-free `/bin/stty -g` before launch and
  restore that opaque snapshot after every managed exit path. Non-terminal
  stdin skips capture; capture failure on a terminal stops before Codex launch.
  A restore failure is actionable stderr context and does not replace the
  managed outcome; the launcher never applies blanket `stty sane` defaults.

## Architectural choice

Separate process mechanics from orchestration. A Codex process host owns
shell-free spawn, streaming readiness, process-group termination, and exit
promises. A managed-launch application service composes registration, client
initialization, lifecycle observation, title reconciliation, focus acknowledgement,
and outcome classification. The CLI owns only argv/std streams and OS signal
bridging.

Alternatives were rejected. Buffering app-server output until process exit can
never signal readiness for a long-running server. Proxying TUI bytes would harm
the exact Ghostty/Codex scrolling workflow this project exists to preserve. A
global daemon or shared app-server weakens per-tab failure isolation and is
deferred. Mixing spawn/event cleanup into the CLI would make hermetic lifecycle
testing needlessly difficult.

The trickiest unit is the supervisor race among TUI exit, app-server exit,
observer failure, and external termination; exactly one outcome must classify
state while cleanup remains bounded and idempotent. Terminal-mode restoration
runs outside that outcome race, after managed cleanup completes.

## Implementation units

### Unit 1: Long-lived Codex process host

**File**: `src/integrations/codex/process.ts`

```ts
export interface ProcessExit {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
}

export interface ManagedChild {
  readonly pid: number;
  readonly processGroup: boolean;
  readonly exited: Promise<ProcessExit>;
  readonly diagnosticTail: () => string;
}

export interface StartedAppServer {
  readonly child: ManagedChild;
  readonly endpoint: AppServerEndpoint;
}

export interface CodexProcessHostOptions {
  readonly command?: string;
  readonly runner?: ProcessRunner;
  readonly spawn?: typeof import("node:child_process").spawn;
  readonly readinessTimeoutMs?: number;
  readonly shutdownGraceMs?: number;
  readonly maxStartupOutputBytes?: number;
  readonly maxDiagnosticTailBytes?: number;
}

export class CodexProcessHost {
  constructor(options?: CodexProcessHostOptions);
  version(signal?: AbortSignal): Promise<string>;
  startAppServer(signal: AbortSignal): Promise<StartedAppServer>;
  startRemoteTui(
    endpoint: AppServerEndpoint,
    forwardedArgs: readonly string[],
  ): Promise<ManagedChild>;
  stop(child: ManagedChild): Promise<ProcessExit>;
}
```

**Implementation notes**:

- `version` uses the existing bounded `ProcessRunner` and parses successful
  `codex --version` output. Abort before/after the call fails promptly.
- Spawn app-server with `shell:false`, `stdio:["ignore","pipe","pipe"]`, and
  `detached:true`. Accumulate stdout+stderr until a complete valid endpoint is
  advertised; treat only “not advertised yet” as incomplete. Keep draining
  afterward into a bounded diagnostic tail so a chatty child cannot block or
  grow memory.
- Spawn the TUI with `shell:false`, `stdio:"inherit"`, and `detached:false`.
  Validate forwarded arguments before spawn, then construct exact argv:
  `[...forwardedArgs, "--remote", endpoint.websocketUrl.toString(), "-c",
  "tui.terminal_title=[]"]`.
- Expose one exit promise that settles on `exit`/spawn error exactly once. Never
  include environment dumps or prompt content in diagnostics.
- `stop` sends `SIGTERM` to the process or negative app-server process-group
  PID, waits the grace bound, escalates to `SIGKILL`, and fails if exit still
  cannot be observed. `ESRCH` is already exited. Repeated stop is safe.

**Acceptance criteria**:

- [x] App-server readiness handles split chunks and either output stream,
  rejects unsafe/conflicting endpoints, bounds bytes/time, and fails on early
  exit.
- [x] The TUI inherits terminal I/O and receives exact non-shell argv; forbidden
  topology/title arguments fail before spawn.
- [x] TERM→KILL escalation targets only the owned child/group and always has a
  bounded result.

### Unit 2: Reliable Ghostty focus evidence and completion watcher

**Files**: `src/integrations/ghostty/scripts.ts`,
`src/integrations/ghostty/protocol.ts`, `src/integrations/ghostty/client.ts`,
`src/application/watch-completion-focus.ts`

```ts
export interface FocusedTerminalPort {
  focused(): Promise<TerminalIdentity | null>;
}

export interface CompletionFocusWatcherDependencies {
  readonly store: SessionStore;
  readonly terminal: FocusedTerminalPort;
  readonly clock: Clock;
  readonly pollIntervalMs: number;
  readonly sleep?: (milliseconds: number, signal: AbortSignal) => Promise<void>;
  readonly onRecord?: (record: SessionRecord) => Promise<void> | void;
}

export function watchCompletionFocus(
  dependencies: CompletionFocusWatcherDependencies,
  sessionId: string,
  signal: AbortSignal,
): Promise<void>;
```

**Implementation notes**:

- Add one constant AppleScript query that returns a sentinel unless Ghostty is
  frontmost, then returns exact front-window/selected-tab/focused-terminal IDs.
  Parse strictly; `focused()` returns null for the not-frontmost sentinel and
  typed failure for unusable evidence.
- The watcher polls the store on an abortable interval. Only while attention is
  `completion_unread` does it query Ghostty; exact equality of all three IDs
  calls `acknowledgeCompletion(..., "ghostty-focus", now)` and then `onRecord`.
  Input-required and ordinary states never acknowledge.
- A focus adapter failure is nonfatal and leaves attention untouched; retry on
  the next interval. Abort removes timers/listeners and resolves cleanly.

**Acceptance criteria**:

- [x] A selected Ghostty tab is not sufficient when Ghostty is not frontmost.
- [x] Exact frontmost focus clears only completion unread; another tab/window or
  input-required state remains unchanged.
- [x] No Ghostty call occurs while there is no completion attention.
- [x] Abort releases a pending sleep without an error transition.

### Unit 3: Managed launch orchestration

**File**: `src/application/launch-managed-codex.ts`

```ts
export interface ManagedLaunchDependencies {
  readonly register: () => Promise<RegisterSessionResult>;
  readonly processes: CodexProcessHost;
  readonly connectClient: (endpoint: AppServerEndpoint) => Promise<AppServerClient>;
  readonly store: SessionStore;
  readonly terminal: ReconciliationTerminalPort & FocusedTerminalPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
  readonly bindTimeoutMs: number;
  readonly focusPollIntervalMs: number;
}

export interface ManagedLaunchResult {
  readonly sessionId: string;
  readonly exitCode: number;
  readonly outcome: "clean" | "failed" | "terminated";
}

export function launchManagedCodex(
  dependencies: ManagedLaunchDependencies,
  forwardedArgs: readonly string[],
  signal: AbortSignal,
): Promise<ManagedLaunchResult>;
```

**Implementation notes**:

- Register with no explicit label first. Version-gate, start app-server, then
  claim the stable session for this launcher by recording its PID and clearing
  any native thread binding from the prior managed runtime. Connect and
  initialize the observer client, invoke `observeManagedCodex`, then start the
  TUI. The observer callback best-effort calls `reconcileSession`; terminal
  errors are already persisted as presence diagnostics and do not stop Codex.
- Start the completion-focus watcher for the registered session and route its
  committed acknowledgement through the same reconciliation callback.
- Race TUI exit, unexpected app-server exit, observer rejection/early resolve,
  and caller abort. Capture the first outcome exactly once; abort the observer
  tree, close the client, and stop remaining children in `finally`.
- Clean TUI exit applies `process-exit` with code `0`; a nonzero/signal TUI exit,
  server exit, incompatible version, client/observer/startup failure applies an
  error transition with bounded metadata; deliberate caller abort applies
  `interrupted`. Run best-effort reconciliation after the terminal mutation.
- Preserve the original failure when failure reporting or cleanup also fails,
  but include cleanup failure in the returned/raised bounded diagnostic. Never
  remove the registered session on launcher exit.

**Acceptance criteria**:

- [x] Invocation order proves observer subscription begins before TUI spawn.
- [x] A sequential relaunch preserves the Board/Ghostty session while replacing
  the prior runtime's native Codex thread binding.
- [x] Clean exit leaves the visible registered tab idle; abnormal outcomes are
  visible error; deliberate HUP/TERM is interrupted/idle.
- [x] App-server, observer, focus watcher, and TUI are cleaned exactly once for
  every startup and runtime failure point.
- [x] Each lifecycle/ack/outcome commit uses canonical reconciliation for title
  parity and preserves concurrent rename/terminal fields.

### Unit 4: `agent-codex` CLI and production composition

**Files**: `src/cli/agent-codex.ts`,
`src/composition/create-agent-codex.ts`, `package.json`

```ts
export interface AgentCodexCommandDependencies {
  launch(args: readonly string[], signal: AbortSignal): Promise<ManagedLaunchResult>;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
}

export function runAgentCodex(
  argv: readonly string[],
  dependencies: AgentCodexCommandDependencies,
  signal: AbortSignal,
): Promise<number>;

export function createAgentCodexCommand(): Pick<AgentCodexCommandDependencies, "launch">;
```

**Implementation notes**:

- The production composition shares one `JsonSessionStore`, `GhosttyClient`,
  real clock, registration dependencies, `CodexProcessHost`, and
  `AppServerClient.connect`. Initialize the client as `agent-board/0.1.0` before
  observation.
- `main` installs a no-op `SIGINT` listener and `SIGHUP`/`SIGTERM` listeners that
  abort one controller with signal reason. Remove all listeners in `finally` so
  imported/tested CLI code does not leak global handlers.
- Forward every allowed argument unchanged. Print only actionable launcher
  diagnostics; normal interactive output belongs directly to the inherited TUI
  streams. Add npm bin `agent-codex: dist/cli/agent-codex.js`.

**Acceptance criteria**:

- [x] The built package exposes `agent-codex`; handler tests need no real signal,
  Codex, Ghostty, or terminal.
- [x] SIGINT does not abort the launcher; HUP/TERM does; listeners are restored
  after exit.
- [x] CLI exit code mirrors clean/failed/terminated outcome without dumping
  stack traces or secrets.

## Implementation order

1. Implement the long-lived process host and hermetic fake-child tests.
2. Add strict frontmost focus evidence and the completion watcher.
3. Compose registration, server/client/TUI/observer/focus races and outcome
   classification in the launch service.
4. Wire the CLI/bin, test all failure stages, and run the full suite.

This is a large but tightly coupled process-lifecycle feature. One worker should
own it end-to-end so cleanup invariants are reasoned about as one system; no
child stories are needed.

## Simplification

- Reuse `ProcessRunner` for short version probes, `AppServerClient` for protocol,
  `observeManagedCodex` for state semantics, `registerSession` for identity,
  `acknowledgeCompletion` for unread ownership, and `reconcileSession` for title
  parity.
- Add no terminal-byte proxy, daemon, IPC bus, logger framework, process
  registry, or ordinary-mode compatibility shim.
- Keep diagnostic output bounded to process metadata and tails; prompt content
  is never observed or persisted.

## Testing

- Process-host tests use an injected fake spawn/child-stream boundary to protect
  exact argv/stdio/detachment, chunked readiness, early exit, timeout/overflow,
  and TERM→KILL escalation. No real Codex process starts.
- Focus watcher tests use a fake store/terminal/abortable sleep to protect
  frontmost exact-match acknowledgement and zero calls outside unread state.
- Launch-service table tests use high-level fakes to cover every startup stage,
  clean/nonzero/signal TUI exit, app-server exit, observer failure, external
  abort, cleanup idempotency, and reconcile callback ordering.
- CLI/composition tests protect argument forwarding, stable errors, signal
  listener cleanup, and emitted bin path. The full default suite remains local
  and must not take over the terminal.

## Risks

- **Hard launcher death can orphan a detached app-server**: ordinary
  HUP/TERM/error paths are bounded and tested, but `SIGKILL` cannot run cleanup.
  A future daemon or parent-death mechanism is not justified for V1; doctor may
  later report rare leftovers.
- **Experimental command drift**: the strict version gate and exact argv tests
  intentionally fail visible rather than guessing across Codex releases.
- **Focus evidence support**: if Ghostty cannot supply trustworthy frontmost
  state on an installed build, the watcher leaves completion unread and the
  explicit acknowledgement command remains the designed fallback.
- **Multiple simultaneous failures**: first outcome owns state classification;
  cleanup failures are diagnostic context, not a second contradictory state
  transition.

## Implementation Notes (2026-08-14)

- Added `CodexProcessHost` with shell-free version gating, split-stream
  advertised-endpoint readiness, bounded startup/diagnostic buffers, direct
  inherited remote-TUI stdio, reserved-argument rejection, and bounded
  TERM-to-KILL cleanup for the detached app-server group.
- Added strict Ghostty frontmost-focus evidence and a completion watcher that
  polls only while `completion_unread` is present and leaves unread state intact
  on unsupported or failed focus queries.
- Added managed launch orchestration with observer-before-TUI startup, shared
  reconciliation callbacks, first-outcome classification, abort-driven cleanup,
  launcher PID removal, and explicit process/interrupted/error evidence.
- Added the production `agent-codex` composition/CLI and npm bin. CLI signal
  handlers ignore SIGINT for normal Codex interrupt behavior and abort on HUP or
  TERM, with listeners removed in `finally`.
- Added hermetic process-host, focus, and CLI tests. Verification completed with
  `npm run typecheck`, `npm run build`, `npm test` (102 passing tests), and a
  built `dist/cli/agent-codex.js` check. No real Codex, Ghostty, terminal
  takeover, or network integration was used.

## Review (2026-08-14)

**Verdict**: Approve with fixes

**Blockers**: none
**Important**: none
**Nits**: Simplified the focus-ack callback guard and removed an unnecessary
observer-start yield/comment.
**Rejected**: none

**Notes**: Standard weight, one cross-model independent pass. The receiver
confirmed and fixed the review's material findings: launch orchestration now has
direct clean/server-failure/signal/termination/persistence-failure coverage;
startup failure uses bounded TERM→KILL cleanup; cleanup exits cannot overwrite
the primary failure owner; title/topology arguments including glued config and
`--` are rejected; final state-write failures are raised visibly; and the CLI
signal bridge is directly tested with listener cleanup. Additional receiver
hardening avoids signaling already-exited PIDs and attaches observer failure
handling before TUI startup. Final verification: `npm run typecheck`, `npm run
build`, built-bin existence, and `npm test` (115 passing).
