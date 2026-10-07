---
source_handle: codex-cli-managed-runtime-probe
fetched: 2026-08-14
source_path: .research/source-captures/codex-cli-0.147.0/managed-runtime-probe.txt
provenance: source-direct
substrate_confidence: source-direct
source_class: local-experiment
---

## Summary

The local Codex 0.147.0 experiment verified exact app-server lifecycle events,
ordinary-looking remote TUI rendering, and concurrent observation of a remote
TUI's active/idle transitions by a second initialized client. It also verified
that loopback port `0` resolves to an advertised ephemeral endpoint.

## Key passages

- [1] P1 records an ephemeral thread starting idle and a harmless turn emitting
  active, turn-started, idle, and completed events in order.
- [2] P2 records an unavailable-input-tool runtime error and rich automatic
  approval-review events, while noting that no human wait was exercised.
- [3] P3 records that the Unix-socket remote TUI rendered the normal welcome,
  prompt, project/branch/model/context status, and terminal-title behavior.
- [4] P4 records a second WebSocket client discovering the TUI-created loaded
  thread and receiving its active then idle status transitions without a
  successful resume or a terminal-byte proxy.
- [5] Limits records that waiting flags remain schema-grounded, detailed turn
  events were connection-scoped in this pass, app-server remains experimental,
  and the visual check used a PTY rather than the live Ghostty tab.
- [6] P5 records `ws://127.0.0.1:0` selecting and advertising an available
  loopback WebSocket endpoint plus readiness and health URLs.

## Structural notes

- Commands were executed locally against the installed binary.
- Prompts were bounded to exact harmless replies except for one reversible empty
  approval probe file, which was removed immediately.

## Scope and gaps

This attests runtime behavior for Codex 0.147.0 only. It does not establish a
stable cross-version protocol or full visual equivalence under every Ghostty
interaction.
