---
source_handle: agentdeck-architecture
fetched: 2026-08-14
source_url: https://github.com/puritysb/AgentDeck/blob/master/docs/architecture.md
provenance: source-direct
substrate_confidence: source-direct
source_class: project-documentation
---

# AgentDeck architecture

## Summary

AgentDeck’s architecture document records a mature adapter-and-capability design spanning hooks, managed PTYs, a daemon, software dashboards, and physical displays. It distinguishes lifecycle authority from terminal observation and gates control features by adapter capabilities.

## Key passages

1. The bridge contains daemon, optional managed PTY session bridge, lifecycle/event adapters, terminal observers, state caches, WebSocket/SSE, and a TUI; separate device modules support Apple, Android, Stream Deck, ESP32, and other displays. (Section “Monorepo layout”; lines 204–214.)
2. PTY output is explicitly not lifecycle authority. Claude and Codex adapters use lifecycle hooks for state, limiting terminal observation to interaction details that hooks do not provide; a monitor adapter can operate hook-only without PTY ownership. (Section “PtyAdapter hierarchy”; lines 224–230.)
3. The adapter abstraction carries an agent type, capabilities, and unified hook/parser/terminal/metadata/activity/connection events. Capability fields gate actions that a given integration cannot safely support. (Section “AgentAdapter abstraction”; lines 250–261.)
4. Dashboard hardware connects through the daemon, and session bridges do not activate hardware modules. (Section “Device module system”; lines 231–233.)

## Structural metadata

Canonical architecture documentation in the `puritysb/AgentDeck` repository. The page identifies itself as stable, reviewed and revised 2026-07-21, with `docs/architecture.md` as source of truth.
