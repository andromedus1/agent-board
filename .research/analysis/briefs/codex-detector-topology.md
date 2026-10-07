---
name: codex-detector-topology
description: Read this before selecting or implementing the Codex V1 adapter; it compares unchanged ordinary-TUI observation with a managed remote TUI on the installed build.
type: technical-brief
kind: research
status: locked
updated: 2026-08-14
summary: |
  Managed app-server plus a remote Codex TUI preserves the recognizable terminal workflow and supplies exact active/idle state to a concurrent observer, but it changes launch topology and relies on an experimental interface. Ordinary Codex has lower startup friction but cannot fulfill the same working/idle/error contract without visibly lower confidence.
key_findings:
  - A second app-server client can discover a remote-TUI thread and receive its active/idle transitions.
  - The remote TUI retained the normal prompt, project/branch/model/context status line, and terminal-title behavior in a PTY probe.
  - Ordinary-TUI hooks and notifications remain useful partial evidence but do not expose working start or immediate generic idle.
  - Human-wait flags are present in the installed schema but were not forced in the runtime probe.
  - The topology choice is a product-taste decision between launch friction and semantic fidelity.
research_method: /research
provenance: agent-synthesis
---

# Codex detector topology

## Decision position

The managed topology is technically viable for V1: launch one local app-server,
connect the ordinary Codex terminal UI with `codex --remote`, and connect Agent
Board as a second protocol client. The remote TUI rendered the familiar prompt
and configured status information, while the observer independently received
the TUI thread's active then idle transitions.[codex-cli-managed-runtime-probe]{3}
[codex-cli-managed-runtime-probe]{4}

The tradeoff is product-level rather than technical. App-server and remote mode
are experimental, and the wrapper changes how Codex starts even if the resulting
surface looks familiar.[app-server-protocol]{2} [app-server-protocol]{3}
[codex-cli-managed-runtime-probe]{5} An unchanged ordinary `codex` launch avoids
that dependency, but its documented hooks and notifications cover completion,
approval, stop, and delayed session end—not an authoritative working start or
immediate general idle transition.[config-advanced-notifications]{1}
[config-advanced-notifications]{2} [hooks-lifecycle]{1}
[hooks-lifecycle]{2} [hooks-lifecycle]{3}

## Measured comparison

| Concern | Ordinary `codex` | Managed app-server + remote TUI |
| --- | --- | --- |
| Startup | Existing command and process topology. | Wrapper/server plus `codex --remote`; can be hidden behind one command. |
| Working | No documented native start signal; inference required. | Observer received `active` immediately.[codex-cli-managed-runtime-probe]{4} |
| Immediate idle | No complete terminal hook. | Observer received `idle` after completion.[codex-cli-managed-runtime-probe]{4} |
| Needs input | Approval notification and permission hook; user-question coverage is incomplete.[config-advanced-notifications]{2} [hooks-lifecycle]{1} | Installed schema defines approval and user-input flags.[codex-cli-local-app-server-schema]{1} |
| Completion | Native completion notification/hook evidence. | Direct client received `turn/completed`; a non-subscribed observer received status transitions in this pass.[codex-cli-managed-runtime-probe]{1} [codex-cli-managed-runtime-probe]{5} |
| Error | Partial presentation evidence. | Thread `systemError` and failed turn are schema-defined; a runtime tool error remained visible in the stream.[codex-cli-local-app-server-schema]{2} [codex-cli-local-app-server-schema]{3} [codex-cli-managed-runtime-probe]{2} |
| TUI fidelity | Native baseline. | Familiar TUI rendered in the PTY probe.[codex-cli-managed-runtime-probe]{3} |
| Stability | Supported ordinary CLI surfaces. | Experimental interface; version-pin and diagnostics required.[app-server-protocol]{3} |

## Recommended shape if managed is selected

- Keep the human-facing launch to one small command; the launcher owns server
  startup, health, and remote-TUI connection.
- Use a local Unix socket in production. The WebSocket listener was useful only
  for the concurrent-observer experiment; official docs describe both Unix and
  WebSocket transports and label the WebSocket/app-server surface experimental.
  [codex-cli-local-app-server-help]{2} [app-server-protocol]{3}
- Treat version compatibility as an adapter capability check against generated
  schemas, not as an assumed stable wire contract.[app-server-protocol]{4}
- Keep completion-unread as Board-owned acknowledgement state. App-server
  supplies completion/activity, not a portable unread bit.[app-server-protocol]{10}
- Retain ordinary-TUI side-channel mode as a degraded-confidence fallback, not
  as evidence-equivalent state.

## Disconfirming evidence and limits

The experiment sought a way to preserve TUI behavior without proxying terminal
bytes. A separately initialized observer did receive global thread status from a
TUI-owned turn, which supports the managed design.[codex-cli-managed-runtime-probe]{4}
However, it did not receive detailed turn notifications in that pass, and a
pre-turn resume failed because no rollout existed.[codex-cli-managed-runtime-probe]{5}
V1 should therefore build only on the observed global status contract plus
schema-defined flags, and add a version-specific integration test before using
any richer event.

The runtime probe did not force a human approval or user-question wait. Those
states are supported by the installed generated schema, not yet by a completed
live waiting experiment.[codex-cli-local-app-server-schema]{1}
[codex-cli-managed-runtime-probe]{5}

## Taste gate

Choose managed-by-default if the five-state attention promise is more important
than preserving the literal `codex` startup path. Choose ordinary-by-default if
the startup topology itself is part of the desired experience and accept that
working/idle/error must be shown as inferred or unknown more often. The evidence
supports both as honest products; it does not turn that preference into an
engineering fact.
