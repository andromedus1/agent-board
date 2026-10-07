---
name: codex-claude-common-glyph-contract
description: Read this before designing, implementing, or reviewing provider-neutral Codex and Claude status projection in Agent Board.
type: position
kind: research
status: locked
updated: 2026-08-20
summary: |
  {inferred: locked provider-neutral product position} Agent Board will define Codex and Claude symmetry at the outcome boundary: the same five primary glyph meanings, acknowledgement behavior, and attention-routing workflow, with provider-specific evidence authority, confidence, capability, and diagnostics kept visible.
key_findings:
  - "{extends: shared glyph contract} Both adapters project `○` idle, `●` working, `✓` completion-unread, `!` needs input, and `×` error; `?` is the diagnostic fallback when evidence is insufficient."
  - "Codex app-server exposes native active/idle, approval waits, completion, interruption, and failure.[symmetry-codex-app-server]{6} [symmetry-codex-app-server]{9} [symmetry-codex-app-server]{11} [symmetry-codex-app-server]{12}"
  - "Claude hooks expose prompt submission, permission and MCP input waits, normal completion, API failure, and session end, but user interruption does not fire `Stop`.[symmetry-claude-hooks]{1} [symmetry-claude-hooks]{2} [symmetry-claude-hooks]{3} [symmetry-claude-hooks]{4} [symmetry-claude-hooks]{5} [symmetry-claude-hooks]{6}"
  - "{inferred: Board-owned projection} Completion-unread is Board state for both providers, not a provider-native lifecycle field.[symmetry-codex-local-schema-0-148-0]{12} [symmetry-claude-hooks]{3}"
  - "{inferred: prior-art convergence} Herdr supports common supervision vocabulary with provider-specific state manifests, while its Claude and Codex hooks remain session-only.[herdr-agents-docs]{2} [herdr-agents-docs]{3} [herdr-source-repo]{5} [herdr-source-repo]{6} [herdr-source-repo]{7} [herdr-source-repo]{8}"
research_method: /research
provenance: agent-synthesis
---

# Codex–Claude common-glyph contract

## Position

{inferred: locked product contract} Agent Board treats provider symmetry as
equivalent operator meaning, not identical runtime events. Codex and Claude use
the same primary glyph vocabulary:

| Glyph | Provider-neutral meaning |
| --- | --- |
| `○` | The managed session is live and trustworthy evidence says no foreground turn requires attention. |
| `●` | Fresh provider or adapter evidence says submitted or active work is in progress. |
| `✓` | A turn completed and remains unacknowledged in Agent Board. |
| `!` | A provider-native permission, question, or elicitation awaits the operator. |
| `×` | The provider or managed runtime reported failure. |

{extends: honest fallback} When an adapter cannot support one of those meanings
confidently, it projects `?` with evidence and capability diagnostics instead of
guessing a primary state.

## Evidence boundary

Codex app-server reports native thread status, active approval flags, explicit
turn interruption, and failed turns.[symmetry-codex-app-server]{6}
[symmetry-codex-app-server]{9} [symmetry-codex-app-server]{11} Claude's ordinary
interactive route can report prompt submission, permission waits, completion,
API failure, MCP elicitation, and session end through hooks, but its `Stop` hook
does not fire after a user interrupt.[symmetry-claude-hooks]{1}
[symmetry-claude-hooks]{2} [symmetry-claude-hooks]{3}
[symmetry-claude-hooks]{4} [symmetry-claude-hooks]{5}
[symmetry-claude-hooks]{6}

{inferred: confidence disposition} Therefore Codex may project working and
interrupted outcomes authoritatively from the protocol, while Claude's initial
working-start and interrupt-recovery projections remain lower-confidence until
live validation establishes their ordering and reconciliation behavior.

Neither provider supplies Agent Board's completion acknowledgement contract.
The inspected Codex schema contains no unread field, and Claude `Stop` reports
completion rather than operator acknowledgement.[symmetry-codex-local-schema-0-148-0]{12}
[symmetry-claude-hooks]{3} `{inferred: Board ownership}` The Board owns the
transition from `✓` to acknowledged idle for both providers.

## Architecture consequence

{extends: smallest honest implementation boundary} Keep the existing managed
Codex app-server plus remote-TUI topology. Add Claude through a managed ordinary
interactive launcher with an observation-first plugin/hook translator. Both
adapters feed the existing normalized transition and glyph projection, while
publishing their provider identity, evidence kind, confidence, and capabilities.

Generic terminal input is never a semantic approval action. Codex approvals use
the protocol's request/decision flow, while Claude permission decisions are
semantic only when a configured hook or SDK integration explicitly returns the
decision.[symmetry-codex-app-server]{12} [symmetry-claude-hooks]{2}

## Validation and revisit contract

{extends: symmetric-support release gate} Before Claude support is advertised,
exercise matching managed-launcher scenarios for identity/resume, working,
permission and other input waits, completion/acknowledgement, interruption,
failure, background work, process exit, incompatible extensions, and concurrent
Codex/Claude terminal identity. Equivalent operator situations must yield the
same primary glyph, while confidence and diagnostics remain evidence-accurate.

Re-engage this position if either provider changes its lifecycle, hook, session,
or policy contracts; if live Claude interruption recovery cannot avoid stale
working state; or if Agent Board expands into provider-semantic remote actions.

## Contradictions

Codex native lifecycle evidence and Claude ordinary-TUI hook evidence are in
`tension`, not contradiction: they support a common outcome vocabulary at
different confidence levels.[symmetry-codex-app-server]{6}
[symmetry-codex-app-server]{9} [symmetry-claude-hooks]{1}
[symmetry-claude-hooks]{3}

Herdr's generic reporting API is qualified by its shipped provider behavior:
Claude and Codex remain screen-manifest lifecycle integrations even though the
platform can accept complete lifecycle reporters.[herdr-agents-docs]{2}
[herdr-agents-docs]{3} [herdr-source-repo]{4}

| Source A | Source B | Relationship |
| --- | --- | --- |
| `[symmetry-codex-app-server]` | `[symmetry-claude-hooks]` | `tension` |
| `[herdr-agents-docs]` | `[herdr-source-repo]` | `qualifies` |

## Disconfirming analysis

{inferred: alternatives tested} Exact native-signal parity fails because Claude
does not emit a `Stop` hook on user interruption. A screen-parser-first design
would discard Codex's stronger native lifecycle surface, while an SDK-owned
Claude client would change the ordinary interactive and authentication topology.
Those alternatives do not improve the common-glyph goal enough to replace the
qualified adapter design.[symmetry-claude-hooks]{3}
[symmetry-codex-app-server]{6} [symmetry-codex-app-server]{9}
[symmetry-claude-agent-sdk-overview]{1}
[symmetry-claude-agent-sdk-overview]{3}
