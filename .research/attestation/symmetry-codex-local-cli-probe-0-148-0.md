---
source_handle: symmetry-codex-local-cli-probe-0-148-0
fetched: 2026-08-20
source_path: .research/source-captures/symmetry-codex-cli-0.148.0/local-cli-probe.md
provenance: source-direct
substrate_confidence: source-direct
---

# Local Codex CLI read-only probe, 0.148.0

## Structural metadata

- Source type: local command-help capture.
- Executable path: `/opt/homebrew/bin/codex`.
- Commands captured: `codex --version`, `codex --help`, `codex app-server
  --help`, `codex resume --help`, `codex app-server daemon --help`, and
  `codex remote-control --help`.

## Paraphrased summary

The inspected executable identifies as Codex CLI 0.148.0. Its top-level surface
includes experimental app-server and remote-control commands, interactive
resume and fork, and a `--remote` option for connecting the TUI to WebSocket or
Unix app-server endpoints. The local app-server command offers stdio, Unix, and
WebSocket listener modes and schema/binding generation. Its daemon and
remote-control commands expose managed service and pairing operations; this
probe did not start, stop, bootstrap, pair, or reconfigure any service.

## Key passages and source-internal anchors

[1] `Version`: reports `codex-cli 0.148.0`.
[2] `Relevant top-level commands`: labels app-server and remote-control
  experimental and shows resume and fork commands.
[3] `App-server surface`: shows transport listener options and protocol-schema
  generation.
[4] `Remote TUI and resume surface`: shows remote endpoint forms and resume
  selection flags.
[5] `Managed-daemon and remote-control surface`: lists daemon management and
  pairing commands.
