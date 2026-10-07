---
source_handle: codex-cli-local-app-server-help
fetched: 2026-08-14
source_path: .research/source-captures/codex-cli-0.147.0/app-server-help.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The local `codex app-server --help` output confirms that the installed CLI exposes experimental app-server tooling directly in the terminal build. It includes daemon and proxy subcommands plus schema and TypeScript binding generation, and supports `stdio`, `unix`, `ws`, and `off` listen modes.

## Key passages

- [1] Lines 1-10: the command is labeled “[experimental] Run the app server or related tooling” and lists `daemon`, `proxy`, `generate-ts`, and `generate-json-schema`.
- [2] Lines 34-38: `--listen` supports `stdio://` (default), `unix://`, `unix://PATH`, `ws://IP:PORT`, and `off`.

## Structural notes

- This file is a local source capture from the installed CLI, not a web doc.
- It establishes current local availability of app-server tooling.
