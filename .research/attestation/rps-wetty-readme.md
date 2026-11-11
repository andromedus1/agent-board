---
source_handle: rps-wetty-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/butlerx/wetty/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

WeTTY is a browser terminal that launches ssh to a host, with allowed-origin enforcement and password or publickey auth. It is a web SSH front end and does not itself manage agent sessions.

## Key passages

- [1] CLI options: `--ssh-host`, `--ssh-port`, `--ssh-user`, `--title` (window title), `--ssh-auth`, `--ssh-key` (connection will be password-less and insecure), `--force-ssh`.
- [2] `--allowed-origin`: required trusted browser origin allowed to connect.
- [3] Running as a regular user launches `ssh` and connects by default to `localhost`; a remote host is chosen with the ssh-host options.
- [4] License: MIT badge.

## Structural notes

- GitHub API reported pushed_at 2026-10-25, not archived.
- Persistence beyond the ssh session is not described; it would come from what runs on the SSH target {inferred}.
