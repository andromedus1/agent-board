# Local Codex CLI 0.148.0 read-only probe

Captured 2026-08-20 from `/opt/homebrew/bin/codex` without starting an agent run
or changing Codex configuration.

## Version

```text
$ codex --version
codex-cli 0.148.0
```

## Relevant top-level commands

```text
$ codex --help
Commands:
  app-server        [experimental] Run the app server or related tooling
  remote-control    [experimental] Manage the app-server daemon with remote control enabled
  resume            Resume a previous interactive session (picker by default; use --last to continue
                    the most recent)
  fork              Fork a previous interactive session (picker by default; use --last to fork the
                    most recent)
```

## App-server surface

```text
$ codex app-server --help
[experimental] Run the app server or related tooling

Commands:
  daemon                Manage the local app-server daemon
  proxy                 Proxy stdio bytes to the running app-server control socket
  generate-ts           [experimental] Generate TypeScript bindings for the app server protocol
  generate-json-schema  [experimental] Generate JSON Schema for the app server protocol

Options:
  --listen <URL>          Transport endpoint URL. Supported values: `stdio://` (default), `unix://`,
                          `unix://PATH`, `ws://IP:PORT`, `off`
```

## Remote TUI and resume surface

```text
$ codex --help
  --remote <ADDR>          Connect the TUI to a remote app server endpoint.
                            Accepted forms: `ws://host:port`, `wss://host:port`, `unix://`, or
                            `unix://PATH`.

$ codex resume --help
Resume a previous interactive session (picker by default; use --last to continue the most recent)

Usage: codex resume [OPTIONS] [SESSION_ID] [PROMPT]

Arguments:
  [SESSION_ID]  Session id (UUID) or session name.

Options:
  --last                    Continue the most recent session without showing the picker
  --all                     Show all sessions (disables cwd filtering and shows CWD column)
  --include-non-interactive Include non-interactive sessions in the resume picker and --last selection
  --remote <ADDR>           Connect the TUI to a remote app server endpoint.
```

## Managed-daemon and remote-control surface

```text
$ codex app-server daemon --help
Commands:
  bootstrap               Install durable local app-server management for SSH-driven use
  start                   Start the local app server daemon if it is not already running
  restart                 Restart the local app server daemon
  enable-remote-control   Enable remote control for future starts and a currently running managed daemon
  disable-remote-control  Disable remote control for future starts and a currently running managed daemon
  stop                    Stop the local app server daemon
  version                 Print local CLI and running app-server versions as JSON

$ codex remote-control --help
[experimental] Manage the app-server daemon with remote control enabled

Commands:
  start  Start the app-server daemon with remote control enabled
  stop   Stop the app-server daemon
  pair   Create and print a short-lived manual pairing code
```
