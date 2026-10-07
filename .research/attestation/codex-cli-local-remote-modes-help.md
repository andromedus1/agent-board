---
source_handle: codex-cli-local-remote-modes-help
fetched: 2026-08-14
source_path: .research/source-captures/codex-cli-0.147.0/help.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The installed `codex-cli 0.147.0` top-level help exposes app-server as a separate command family and remote-control as another separate command family. The ordinary interactive CLI also has a `--remote` flag that connects the TUI to an app-server endpoint.

## Key passages

- [1] Lines 16-17: the main command list includes `app-server` and `remote-control` as separate experimental command families.
- [2] Lines 57-64: `--remote <ADDR>` connects the TUI to a remote app-server endpoint, with accepted forms `ws://host:port`, `wss://host:port`, `unix://`, or `unix://PATH`; `--remote-auth-token-env` supplies the bearer token for a remote app-server websocket.

## Structural notes

- This file is a local source capture from the installed CLI help output.
- The help describes explicit client-to-app-server connection mode; it does not describe attaching app-server to an already-running ordinary local TUI.
