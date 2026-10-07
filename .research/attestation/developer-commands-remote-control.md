---
source_handle: developer-commands-remote-control
fetched: 2026-08-14
source_url: https://learn.chatgpt.com/docs/developer-commands
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The developer-commands page documents `codex remote-control` as a way to start and stop the local app-server daemon with remote control enabled. It says managed remote-control clients and SSH remote workflows use these commands, and that they are not a replacement for `codex app-server --listen` when building a local protocol client.

## Key passages

- [1] Lines 1558-1560: `codex app-server --listen stdio://` keeps JSONL-over-stdio behavior, `--listen ws://IP:PORT` enables WebSocket transport for app-server clients, and `--listen unix://` accepts WebSocket handshakes on Codex’s default Unix socket.
- [2] Lines 1561-1564: `codex remote-control start` starts the local app-server daemon with remote control enabled, `codex remote-control stop` stops it, managed remote-control clients and SSH remote workflows use these commands, and they are not a replacement for `codex app-server --listen` when building a local protocol client.

## Structural notes

- Relevant page section: `### codex remote-control`.
- This page frames remote control as daemon management for managed clients/workflows, not as a retroactive attach API for an already-running standalone TUI.
