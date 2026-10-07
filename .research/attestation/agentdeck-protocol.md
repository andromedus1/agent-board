---
source_handle: agentdeck-protocol
fetched: 2026-08-14
source_url: https://github.com/puritysb/AgentDeck/blob/master/docs/protocol.md
provenance: source-direct
substrate_confidence: source-direct
source_class: project-documentation
---

# AgentDeck protocol reference

## Summary

AgentDeck’s protocol document describes a daemon-centered, multi-surface architecture and a hook-owned lifecycle state machine. It is useful as evidence for the costs and capabilities of a later shared control plane, not as evidence that such a daemon is required for a one-machine tab-title proof.

## Key passages

1. A daemon is the sole hub for dashboard clients, while per-session bridges handle PTY and hook observation; the daemon records its selected local port and uses WebSocket plus other transports for multiple clients and devices. (Sections “Architecture Diagram” and “Daemon hub architecture”; lines 211–244.)
2. Sessions register with a `sessionId` plus optional agent type, project name, host, and remote-attach metadata, then push state updates containing the session ID, state, model, and effort. The push channel replaces health polling for state propagation. (Section “Internal session↔daemon push channel”; lines 245–257.)
3. Lifecycle hooks own six states: disconnected, idle, processing, awaiting permission, awaiting diff, and awaiting option. Terminal observation supplies prompt-affordance evidence that hooks do not yet expose. (Section “State Machine”; lines 260–302.)
4. `DISCONNECTED` is driven by session-end or PTY exit, `IDLE` by stop/completion evidence, `PROCESSING` by prompt submission or tool activity, and the three `AWAITING_*` states by observed interactive affordances. (State table; lines 294–302.)

## Structural metadata

Canonical protocol documentation in the `puritysb/AgentDeck` repository. The page identifies itself as stable, reviewed and revised 2026-07-21, with `docs/protocol.md` as source of truth.
