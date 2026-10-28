---
source_handle: rps-codex-developer-commands-remote
fetched: 2026-10-26
source_url: https://learn.chatgpt.com/docs/developer-commands?surface=cli
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

Re-fetch of the Codex developer-commands/CLI reference (developers.openai.com/codex/cli/reference redirects here) for the remote-related commands. It supersedes the 2026-08-14 `developer-commands-remote-control` for these commands: `codex remote-control` now has a bare form, a `pair` subcommand and `--json`, and the TUI accepts `--remote`. The extract is tool-processed.

## Key passages

- [1] `codex remote-control` is described as experimental; it manages remote control for the local app-server or creates pairing codes. Bare `codex remote-control` starts remote control through the managed background server with foreground fallback; `start` starts the local app-server daemon with remote control enabled; `stop` stops it; `pair` creates and prints a short-lived manual pairing code.
- [2] `--json` output of `pair` includes `pairingCode`, `manualPairingCode`, `environmentId`, `expiresAt`; `--no-daemon` applies only to the bare command.
- [3] `codex app-server --listen` accepts `stdio://`, `ws://IP:PORT`, `unix://`, `unix://PATH`, `off`.
- [4] WebSocket auth via `--ws-auth` with `capability-token` or `signed-bearer-token`, with flags `--ws-token-file`, `--ws-token-sha256`, `--ws-shared-secret-file`, `--ws-issuer`, `--ws-audience`, `--ws-max-clock-skew-seconds`.
- [5] The interactive `codex` command accepts `--remote ws://host:port`, `wss://host:port`, `unix://`, `unix://PATH`, and `--remote-auth-token-env <ENV_VAR>` (WebSocket only).
- [6] The standalone `codex mcp-server` command has been removed in favor of the Codex app server.

## Structural notes

- Official OpenAI documentation page reached via 308 redirect. Prior attestation `developer-commands-remote-control` (2026-08-14) records only `start`/`stop` and `--listen` transports.
