# Agent Board

Agent Board is a local attention router for terminal coding agents. It shows
which Ghostty tabs need attention without requiring a manual tab scan.

The first release supports Codex and Claude Code, one managed session per
Ghostty tab per project, on macOS. It owns each registered tab title and
renders the same state through `agents`, regardless of which agent is running
in that tab.

```text
● data-platform        working
! acquisition          needs input
✓ agent-board          finished
○ legacy-engine        idle
× reporting            error
```

## Requirements

- macOS
- Node.js 22 or later
- Ghostty 1.3 or later
- Codex 0.147.x, 0.148.x, 0.149.x, 0.150.x, 0.152.x, 0.153.x, or 0.154.x
- Claude Code 2.1.226 or later (the 2.1.x family is tested; newer releases run
  with a warning as long as the packaged Agent Board plugin still validates)
- npm

Agent Board uses Ghostty AppleScript and macOS Automation. It does not require
tmux, a daemon, a database server, or network access for local board operations.

## Configure Ghostty

The complete recommended tab workflow, and Codex-specific status-line pairing,
are in the [companion configuration guide](docs/configuration.md). The tab
workflow applies to both Codex and Claude Code sessions; the status-line
guidance is Codex-specific. Copyable merge fragments live under
[`examples/ghostty/`](examples/ghostty/) and [`examples/codex/`](examples/codex/).

Enable AppleScript in your Ghostty configuration:

```text
macos-applescript = true
```

Remove any global `title` setting. If `bell-features` includes `title`, add
`no-title`. Reload Ghostty's configuration after a change; restart Ghostty if
the new settings do not take effect immediately.

Agent Board owns the complete title of each registered tab. Do not use Ghostty's
manual title override for those tabs.

## Install from a checkout

1. Install the dependencies.

   ```bash
   npm install
   ```

2. Build the five commands (`agent-board`, `agent-name`, `agent-codex`,
   `agent-claude`, and `agents`).

   ```bash
   npm run build
   ```

3. Link the package into your npm command path.

   ```bash
   npm link
   ```

   To test a standalone local artifact, pack and install it instead:

   ```bash
   npm pack --ignore-scripts
   npm install --global ./agent-board-0.1.0.tgz
   ```

4. Open a Ghostty tab.

5. Check the supported environment.

   ```bash
   agent-board doctor
   ```

The first AppleScript check may cause a macOS Automation prompt. Grant the
requested Ghostty control, then run the doctor again.

The doctor checks the runtime, local state directory, Codex, Claude Code, and
Ghostty, including whether Claude Code accepts the packaged Agent Board hook
plugin. It returns nonzero when an error blocks managed operation. Warnings do
not block managed operation.

Use JSON for automation:

```bash
agent-board doctor --json
```

## Start the first managed session

1. Open a Ghostty tab in the project directory.

2. Give the tab a stable project label.

   ```bash
   agent-name agent-board
   ```

   Before a managed launcher is running, use the target tab's normal shell
   prompt so Agent Board can safely resolve that focused terminal.

3. Start the agent through its managed launcher.

   ```bash
   agent-codex
   ```

   or

   ```bash
   agent-claude
   ```

`agent-codex` starts a private Codex app-server and connects the normal remote
TUI. It forwards supported extra Codex arguments unchanged; Agent Board reserves
the remote transport and terminal-title override, so arguments that set
`--remote` or `tui.terminal_title` are rejected.

`agent-claude` launches an ordinary, interactive Claude Code session — the same
TUI you get from running `claude` directly — with a per-run, observation-only
Agent Board plugin loaded alongside it. The plugin only reports Claude's own
lifecycle hooks (prompt submitted, permission requested, turn stopped, session
ended, and so on); it adds no approval, input-forwarding, or automation
surface. `agent-claude` forwards supported extra Claude Code arguments
unchanged; Agent Board reserves the interactive surface the plugin depends on,
so `-p`, `--print`, `--bare`, and `--background` are rejected.

Either launcher gives its owned agent process the exact registered session
identity through `AGENT_BOARD_SESSION_ID`. Any command descended from that
process—a shell escape run from inside the TUI (Codex `!`), an `agent-name`
invocation, or an agent's own tool execution—inherits that session ID and
renames the stored session without consulting current Ghostty focus. If a
managed Codex or Claude session was already running when this capability was
installed, exit it and start it once more with `agent-codex` or `agent-claude`
to inherit the session identity.

`agent-name` only registers and names the tab; it does not choose which agent
will manage it. Until `agent-codex` or `agent-claude` establishes managed
observation, the session remains ordinary and the board reports `?` with the
diagnostic `session is not managed` instead of guessing that the tab is idle.
Whichever managed launcher starts next in that tab safely adopts the pre-named
ordinary session as its own. A tab already managed by one provider cannot be
adopted by the other; starting the other launcher there fails with a conflict
instead of silently switching providers.

You may omit the separate `agent-name` step. The launcher then registers the
current tab with a label derived from its repository or working directory.

Start another project in another Ghostty tab. Repeat the same commands there.

## Use the board

Run the human-readable board from any terminal:

```bash
agents
```

Today, `agents` prints one current snapshot and exits. It is not yet a
continuously refreshing board, a separate resident window, or a menu-bar app.
The simplest workflow is to keep a spare terminal handy and rerun `agents`
whenever you want a fresh read of the swarm.

Use JSON when a script needs session IDs or diagnostic details:

```bash
agents --json
```

The five normal symbols apply only to managed sessions with live observation:

| Symbol | Meaning | Operator action |
| --- | --- | --- |
| `○` | The agent is idle. | None. |
| `●` | The agent is working. | None. |
| `✓` | Work finished and remains unread. | Visit or acknowledge it. |
| `!` | The agent needs input. | Visit the tab and respond in the agent. |
| `×` | The agent or managed launcher failed. | Visit the tab and inspect the error. |

A `?` row is a diagnostic state, not a sixth agent outcome. It means Agent
Board cannot prove a current managed state or terminal presence.

Board diagnostics may report stale evidence, hidden tabs, missing terminals,
title synchronization failures, or an ordinary session that has only been
registered by `agent-name`. Agent Board does not relabel uncertainty as idle.

A quiet managed turn may run for hours. Codex's working evidence stays fresh
from launcher liveness alone, so it remains `● working` while its owned
launcher is still positively alive. Claude Code's working evidence is
corroborated rather than launcher-verified — a submitted prompt is observed,
but interruption is not natively observable — so a managed Claude session ages
from `● working` to a `?` diagnostic if no new hook evidence arrives within the
freshness window, instead of guessing that it is still running. Each `agents`
read reconciles the registered launcher before rendering the board; if that
launcher has vanished or cannot be probed, the session degrades to a `?`
diagnostic until new managed evidence is available.

When you close a managed tab with `⌘W`, there is no normal cleanup command to
run. The next `agents` refresh takes one validated Ghostty snapshot and removes
that session if its terminal is no longer present. A hidden undo-closed tab is
kept registered, so Ghostty's undo-close continues to work. If Ghostty cannot
be inspected, the session remains and the board shows a diagnostic instead of
guessing.

## Rename, acknowledge, and unregister

Rename the current managed session with:

```bash
agent-name data-platform
```

Inside a session started by the current `agent-codex` or `agent-claude`, a
Codex `!` shell escape, an agent's own tool execution, and any other process
descended from the launcher inherit its exact `AGENT_BOARD_SESSION_ID`. The
one-label command therefore renames only that stored session and never uses
the currently focused Ghostty tab as its target.

Outside a managed session, the same command falls back to focus-based targeting
and must run interactively at the target tab's normal shell prompt. A detached
or non-TTY one-label invocation without a bound session ID fails before focus
resolution with:

```text
CONFLICT: agent-name <label> must run in the target terminal; use the managed agent or a shell prompt
```

The label changes independently from agent state and session identity.

For a native macOS rename prompt, run the command without a label:

```bash
agent-name
```

The no-argument form remains intentionally available to noninteractive callers
such as the macOS Shortcut. It captures the focused registered Ghostty session
before opening the dialog. Cancel is a silent successful no-op; Rename changes
only the stored label and canonical title. Passing more than one label prints
`Usage: agent-name [label]`.

To bind the prompt to `⌘⇧R`, follow the [Shortcut setup in the companion
configuration guide](docs/configuration.md#title-ownership-and-rename-shortcut).
It uses the macOS Services shortcut, which avoids the Shortcuts editor
intercepting `⌘⇧R` as Repeat. The companion config explicitly unbinds Ghostty's
default native title action so the Agent Board Service receives the chord.

While the managed launcher runs, it acknowledges unread completion when the
registered Ghostty tab becomes frontmost. After the launcher exits, or when
focus evidence is unavailable, use the explicit command:

```bash
agent-board ack
```

The no-argument form requires Ghostty to be frontmost. It targets the current
registered tab. From another application, pass the exact ID from `agents --json`:

```bash
agent-board ack 7b470263-224b-4f1f-a59b-e9537d23d152
```

Use unregister only when you deliberately want to release an open or hidden tab,
when troubleshooting, or before uninstalling Agent Board:

```bash
agent-board unregister
```

You may also pass an exact session ID. Unregister clears Agent Board's title
override before it removes the session record.

## State and recovery

Agent Board stores local state under:

```text
~/.local/state/agent-board/v1
```

Set `AGENT_BOARD_STATE_DIR` to choose a different base directory. Agent Board
adds its `v1` directory below that base.

The state store uses ordinary JSON files, atomic replacement, and bounded file
locks. It stores project and terminal metadata, not prompt content or secrets.

If a row shows `?`, run these commands:

```bash
agent-board doctor
agents
```

Follow the remediation beside each doctor error. Common repairs include these
actions:

- Open a Ghostty window before registration.
- Enable `macos-applescript` and restart Ghostty.
- Grant macOS Automation permission.
- Remove a fixed Ghostty `title` setting.
- Add `no-title` to title bell features.
- Install a supported Codex 0.147.x, 0.148.x, 0.149.x, 0.150.x, 0.152.x,
  0.153.x, or 0.154.x release. `0.151.x` remains unsupported.
- Install a supported Claude Code 2.1.226 or later release; the 2.1.x family is
  tested, and newer releases run with a warning as long as the packaged
  plugin still validates.
- Reinstall Agent Board if Claude Code rejects or cannot load the packaged
  Agent Board hook plugin.

If title clearing fails, Agent Board keeps the session record. Repair Ghostty,
then retry `agent-board unregister` with the exact session ID.

Both `agent-codex` and `agent-claude` capture the exact terminal mode before
launching their agent. After every managed exit path, including observer,
app-server, or hook failure, each launcher restores that exact mode and clears
the CSI-u and modifyOtherKeys keyboard reporting the agent may have enabled. If
capture fails on a terminal, the agent does not launch. Only if restoration
itself fails does Agent Board print a recovery message: run `reset` and press
Return to recover that shell; if necessary, follow with `stty sane`.

## Current limits

- Codex and Claude Code are the supported agent adapters.
- Managed launch through `agent-codex` or `agent-claude` provides the
  supported state fidelity.
- A separately started `codex` or `claude` process is not attached after
  launch.
- One supervised agent per Ghostty tab is supported; a tab already managed by
  one provider cannot be adopted by the other.
- `agent-claude` runs Claude Code's own interactive TUI unchanged; the
  packaged plugin only observes lifecycle hooks and adds no approval, input,
  or automation surface of its own.
- The first release does not send approvals, input, interrupts, or keystrokes.
- The first release has no GUI, menu-bar app, remote service, or hardware dependency.

These deferred directions remain in the project backlog. They are preserved as
options and do not expand the first release.

## Test the checkout

Run the complete hermetic suite:

```bash
npm test
```

The suite builds and installs a packed artifact in temporary directories. It
uses private executable substitutes and does not touch live Ghostty tabs, a
live Codex install, or a live Claude Code install. The current suite contains
231 tests; the three live compatibility and hardware probes below remain
skipped until explicitly enabled.

Three probes are opt-in. The Codex probe reads generated protocol schemas,
including the `thread/loaded/list` ID response and the `thread/read` metadata
response used during discovery. The Claude probe runs an installed `claude`
binary directly to confirm its reported version and that `claude plugin
validate` accepts the packaged Agent Board hook plugin. The Ghostty probe
creates and removes a disposable window.

```bash
AGENT_BOARD_LIVE_CODEX=1 npm run test:integration:codex
AGENT_BOARD_LIVE_CLAUDE=1 npm run test:integration:claude
AGENT_BOARD_LIVE_GHOSTTY=1 npm run test:integration:ghostty
```

Do not run the Ghostty probe when disposable window creation is unacceptable.

## Uninstall

1. Run `agents` after closing any tabs you no longer need; it removes ordinary
   closed-tab registrations. Unregister any remaining open or hidden sessions
   from their tab or exact session ID.

2. Remove the global npm link.

   ```bash
   npm unlink --global agent-board
   ```

3. Remove the checkout when you no longer need it.

Agent Board leaves its local state directory in place. You may remove that
directory after all sessions have been removed or unregistered.

## Project references

Current product truth lives in [VISION](docs/VISION.md), [SPEC](docs/SPEC.md),
[ARCHITECTURE](docs/ARCHITECTURE.md), and [PRINCIPLES](docs/PRINCIPLES.md).
Grounded findings live under [`.research/`](.research/).
