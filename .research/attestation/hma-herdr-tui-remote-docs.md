---
source_handle: hma-herdr-tui-remote-docs
fetched: 2026-11-10
source_url: https://herdr.dev/tui/docs/connecting-machines/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr TUI docs (Latest 0.9.5) describe three remote paths: SSH to the host and run `herdr` there (tmux-style, recommended for phone SSH clients, and the docs name Moshi), `herdr --remote <host>` (local UI, remote server), and saved SSH machines (several servers in one client). The remote server owns the panes; clients are separable and multiple clients may attach. Authentication stays with OpenSSH; no Herdr-specific listening port or auth layer is documented.

## Key passages

- [1] Connecting machines, intro: save an SSH machine once and switch between its workspaces and Local; "Each machine keeps its own Herdr server, sessions, and running processes. A lost connection to one machine does not disconnect the others."
- [2] Connecting machines, "Switch between machines": the selected machine receives pane input and size; other connected machines "keep updating their workspace information, agent states, and notifications without streaming their pane screens".
- [3] Connecting machines, "Switch between machines": when a connection is lost "the last workspace and agent state remains visible but dimmed. That is cached information, not live state."
- [4] Connecting machines, "Connection problems": retry after interruption, sleep or SSH failure with delay up to two minutes; connections to Linux and macOS close their remote bridge after a minute without traffic, sleep counting toward that deadline, and "Cleanup leaves the remote Herdr server, sessions, and pane processes running."
- [5] Connecting machines, "Updates and saved data": saved profiles hold only an opaque ID, label, SSH target, explicit remote session and enabled state; "Herdr does not store passwords, private keys, agent tickets, or SSH control sockets"; "Authentication stays with OpenSSH."
- [6] Connecting machines, "Before you connect": clients on Linux, macOS and Windows connect to Linux or macOS servers on x86_64 or aarch64; "Each machine ... Compatible client and server versions do not have to match."
- [7] Connecting machines, "Settings and automation": the UI uses the client's local theme and keybindings; "Workspace, tab, pane IDs, and agent names are scoped to one server"; remote CLI automation uses `herdr --machine <label-or-id> agent list`, over non-interactive SSH.
- [8] How to work with Herdr (https://herdr.dev/tui/docs/how-to-work/), "Work from your phone": "Herdr works on your phone without a mobile app or web dashboard. Install any SSH client, connect to the machine where your agents run, and start Herdr there"; "The same persistent Herdr session opens in your phone terminal"; "On iPhone, apps like moshi work well." (no Android client is named).
- [9] Persistence and remote access (https://herdr.dev/tui/docs/persistence-remote/), "Detach and reattach": `ctrl+b q` detaches while "panes and agents keep running"; `herdr server stop` stops the session and its panes; "On Linux and macOS, the server ignores SIGHUP, so a hangup from its launching shell does not stop the panes."
- [10] Persistence and remote access, "Remote attach over SSH": with `herdr --remote` "the remote server owns the running panes and sends their terminal content and session state over SSH"; remote attach uses normal OpenSSH authentication, and for a "mobile terminal that cannot show the passphrase prompt" the key must be loaded into ssh-agent first.
- [11] Persistence and remote access, "Direct terminal attach": `herdr agent attach <name>` / `herdr terminal attach <id>` attach one terminal; "Only one writable direct attach client owns input and resize for a terminal"; `--takeover` replaces the owner; `herdr terminal session observe` gives multiple read-only observers as JSON frames and `session control` gives one writable controller.
- [12] Concepts (https://herdr.dev/tui/docs/concepts/), "Client and server": "The server owns panes and process state. The client is the terminal UI attached to that server"; with multiple clients each can view its own workspace and tab, and when clients view the same tab the last to interact controls pane sizes.
- [13] Configuration (https://herdr.dev/tui/docs/configuration/), "Headless terminal size": with no client attached the server uses a 120x40 virtual terminal for layout and new panes (`headless_cols`, `headless_rows`).
- [14] CLI reference (https://herdr.dev/tui/docs/cli-reference/), `herdr server`: "runs the headless server explicitly. Use it for supervised or service-style setups." The fetched docs pages contain no launchd plist, login-item or boot-start instruction for Herdr TUI itself.

## Structural notes

Official documentation pages converted from HTML to text on 2026-11-10 from herdr.dev/tui/docs (version selector shows Latest 0.9.5); anchors are section headings. The `rps-herdr-connecting-machines-docs` and `rps-herdr-persistence-remote-docs` attestations (2026-10-26) cover the same pages; this fetch confirms those statements unchanged and adds the saved-machine, phone, direct-attach and headless-size passages.
