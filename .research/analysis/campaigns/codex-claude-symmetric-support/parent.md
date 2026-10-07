---
description: Read this before designing or implementing symmetric Codex and Claude support in Agent Board.
type: program-report
kind: research
status: locked
updated: 2026-08-20
summary: |
  {inferred: cross-provider synthesis} Agent Board can offer the same five primary glyphs, board behavior, naming, acknowledgement, and attention-routing workflow for Codex and Claude without requiring identical provider signals. Codex supplies authoritative lifecycle state through app-server; Claude's ordinary TUI supplies native hook evidence for input waits, normal completion, API failure, and session lifecycle, while working-start and user-interrupt recovery require lower confidence until live validation closes the gaps.
key_findings:
  - "{inferred: product contract} Symmetry should mean invariant glyph semantics and operator workflow, not identical provider topology or evidence authority."
  - "Codex app-server exposes native active/idle, approval/input waits, completion, interruption, and failure.[symmetry-codex-app-server]{6} [symmetry-codex-app-server]{9} [symmetry-codex-app-server]{11} [symmetry-codex-app-server]{12}"
  - "Claude hooks expose permission and MCP input waits, normal completion, API failure, and session end, but Stop does not fire on user interruption.[symmetry-claude-hooks]{2} [symmetry-claude-hooks]{3} [symmetry-claude-hooks]{4} [symmetry-claude-hooks]{5} [symmetry-claude-hooks]{6}"
  - "Completion-unread remains Board-owned for both providers; the inspected Codex schema has no unread field, and Claude Stop is a completion event rather than an acknowledgement model.[symmetry-codex-local-schema-0-148-0]{12} [symmetry-claude-hooks]{3}"
  - "Herdr demonstrates honest terminal-level symmetry by sharing state vocabulary while exposing provider-specific manifests and keeping Claude/Codex lifecycle authority screen-derived.[herdr-agents-docs]{2} [herdr-agents-docs]{3} [herdr-source-repo]{5} [herdr-source-repo]{6}"
  - "{inferred: implementation comparison} The existing Agent Board glyph projection and normalized transitions can remain common; the material new work is a Claude launcher/plugin/translator, provider capability diagnostics, and a cross-provider runtime matrix."
research_method: /research
provenance: agent-synthesis
---

# Symmetric Codex and Claude support

## Decision position

{inferred: cross-provider synthesis} Symmetric support is feasible if symmetry
is defined at the product boundary: the same glyph meanings, board behavior,
tab-title behavior, naming, completion acknowledgement, and attention-routing
workflow. It must not mean that Codex and Claude emit identical signals or that
Agent Board hides evidence-quality differences.

{extends: shared common-glyph product contract} The five primary glyphs can
remain unchanged:

| Glyph | Shared meaning | Provider-neutral rule |
| --- | --- | --- |
| `○` | Idle | The managed session is live and the adapter has trustworthy evidence that no foreground turn requires attention. |
| `●` | Working | The adapter has fresh evidence of submitted or active work at the confidence shown with the session. |
| `✓` | Finished | A turn completed and the completion remains unacknowledged in Agent Board. |
| `!` | Needs input | A provider-native permission, question, or elicitation is waiting for the operator. |
| `×` | Error | The provider or managed runtime reported a non-retryable failure. |

{extends: honest fallback behavior} `?` remains the non-primary diagnostic projection whenever the adapter cannot
honestly choose one of those meanings. This is the key to low-cost symmetry:
the visible vocabulary is already above the provider boundary, while evidence
kind, confidence, capability, and diagnostics preserve the asymmetry underneath.

## Cross-provider evidence matrix

{extends: product-level disposition of provider evidence into common glyph semantics}

| Normalized transition | Codex managed adapter | Claude ordinary-TUI adapter | Symmetry disposition |
| --- | --- | --- | --- |
| Session identity | Thread identity plus session-tree identity; stored threads resume by thread ID.[symmetry-codex-app-server]{4} | Hook events carry a Claude session ID; CLI sessions support continue, named/ID resume, and forks.[symmetry-claude-hooks]{1} [symmetry-claude-sessions]{1} [symmetry-claude-sessions]{3} | Same Board session concept; provider-native binding fields differ. |
| Working start | `thread/status/changed` reports `active` with flags.[symmetry-codex-app-server]{6} | `UserPromptSubmit` fires before processing; queued messages can exist while another turn runs.[symmetry-claude-hooks]{1} [symmetry-claude-interactive-mode]{3} | Codex authoritative; Claude initially corroborated until a live probe establishes ordering and recovery. |
| Permission wait | Active status can carry `waitingOnApproval`; approval is a request/response protocol.[symmetry-codex-app-server]{6} [symmetry-codex-app-server]{12} | `PermissionRequest` fires before the interactive approval and may return an explicit allow/deny decision.[symmetry-claude-hooks]{2} | Both can drive `!`; keep request subtype and decision capability provider-specific. |
| Other user input | The inspected schema includes `waitingOnUserInput` and explicit tool-input requests.[symmetry-codex-local-schema-0-148-0]{2} [symmetry-codex-local-schema-0-148-0]{11} | MCP `Elicitation` is hook-visible; `AskUserQuestion` is fully programmatic in an SDK-owned session but remains a live-validation question for an ordinary TUI.[symmetry-claude-hooks]{6} [symmetry-claude-agent-sdk-user-input]{4} | `!` is common; never flatten permission, question, and elicitation into one generic approval action. |
| Completion | A completed turn is explicit; no unread field exists in the inspected schema.[symmetry-codex-local-schema-0-148-0]{3} [symmetry-codex-local-schema-0-148-0]{12} | `Stop` reports normal main-agent completion and includes remaining background/scheduled work.[symmetry-claude-hooks]{3} | Both can drive Board-owned `✓`; background work must prevent a false globally-finished claim. |
| Interruption | `turn/interrupt` resolves to terminal `interrupted`.[symmetry-codex-app-server]{9} | `Esc`/`Ctrl+C` interrupt locally, but user interruption does not fire `Stop`.[symmetry-claude-interactive-mode]{1} [symmetry-claude-hooks]{3} | Codex authoritative; Claude must reconcile with lower confidence or show `?` rather than stale `●`. |
| Failure | Failed turns emit error evidence and terminal `failed`.[symmetry-codex-app-server]{11} | API failure fires `StopFailure` instead of `Stop` and carries an error category.[symmetry-claude-hooks]{4} | Both can drive `×`; retryability and provider details remain evidence metadata. |
| Session/process end | App-server unload/`thread/closed` concerns loaded residency, not OS-process exit.[symmetry-codex-app-server]{7} | `SessionEnd` has a limited reason vocabulary and cannot block termination.[symmetry-claude-hooks]{5} | Launcher/process evidence remains separate from provider conversation state for both. |

## Common contract and asymmetric capabilities

{inferred: product contract} Each adapter should implement the same normalized
transition boundary but publish its capabilities separately. A capability is an
honest statement that the installed topology can produce or act on a class of
evidence; it is not inferred from the adapter name.

The relevant capability families are:

- native working/idle lifecycle;
- permission-wait observation;
- question/elicitation observation;
- normal completion and background-work discrimination;
- interruption observation;
- typed failure observation;
- session identity, resume, and fork;
- provider-semantic input or approval actions; and
- ordinary-TUI preservation.

Codex app-server can supply the complete native lifecycle set at the protocol
contract level, including explicit input waits and interruption. The local CLI
still labels the surface experimental and provides schema generation and
connection initialization.[symmetry-codex-app-server]{2}
[symmetry-codex-app-server]{3}
[symmetry-codex-local-cli-probe-0-148-0]{2}
[symmetry-codex-local-cli-probe-0-148-0]{3}

{extends: capability-gating requirement} Agent Board should enable this surface
only after those schema and connection checks succeed.

Claude's hook/plugin route preserves the ordinary CLI topology and can package
hooks, while managed policy may restrict available customization.[symmetry-claude-plugins-reference]{1}
[symmetry-claude-permissions]{2}

{extends: diagnostic-mode requirement} Therefore `agent-claude` should fail
visibly to diagnostic mode when its hook capability is absent or blocked, just
as an incompatible Codex protocol must fail closed rather than masquerade as
native.

## Recommended provider topologies

### Codex

{extends: Codex topology recommendation} Retain the existing managed app-server
plus remote-TUI topology. It is the
documented rich-client path and exposes the native lifecycle needed by the
current adapter.[symmetry-codex-app-server]{1}

### Claude

{inferred: topology recommendation} Add a managed `agent-claude` launcher that
executes the installed ordinary interactive `claude` command with an Agent Board
plugin/hook integration enabled for that run. The installed CLI exposes plugin,
settings, session, and interactive/print distinctions; plugin packages may
contain hooks.[symmetry-claude-local-cli-2.1.226]{1}
[symmetry-claude-local-cli-2.1.226]{2}
[symmetry-claude-local-cli-2.1.226]{4}
[symmetry-claude-plugins-reference]{1}

{extends: minimal Claude adapter behavior} The hook handler should be
observation-only by default: parse event JSON,
correlate the Claude session with the stable Board session, normalize the event,
and submit one guarded store mutation. A Board failure must not block or alter
Claude's turn. Provider-semantic approval or question actions remain outside the
common glyph feature unless separately designed and validated.

{inferred: topology tradeoff} Do not use the Agent SDK merely to make lifecycle
signals look more symmetrical.
The SDK makes the application host the agent loop and directs unapproved
third-party products to API-key authentication rather than claude.ai login and
rate limits.[symmetry-claude-agent-sdk-overview]{1}
[symmetry-claude-agent-sdk-overview]{3} That is a different product topology,
not a small adapter substitution.

## What Herdr contributes

{inferred: convergence between Herdr's architecture and Agent Board's product boundary}
Herdr validates the product-level distinction between common vocabulary and
common evidence. It presents both Claude and Codex through one terminal
supervision vocabulary, but gives each a provider-specific screen manifest and
explicitly keeps their shipped integrations session-only rather than lifecycle
authorities.[herdr-agents-docs]{2} [herdr-integrations-docs]{2}
[herdr-source-repo]{5} [herdr-source-repo]{6}
[herdr-source-repo]{7} [herdr-source-repo]{8}

{extends: Herdr-derived product recommendations} Three Herdr patterns should
carry forward:

- detection and state authority are separate;
- inferred states expose the matched rule, source, version, and fallback; and
- state, presentation metadata, session identity, and terminal control remain
  separate surfaces.[herdr-agents-docs]{3} [herdr-agents-docs]{6}
  [herdr-agents-docs]{9} [herdr-integrations-docs]{3}

{inferred: approval implication from Herdr's separated control and status surfaces}
Herdr does not justify generic approval buttons. Its common commands deliver
terminal input, while its blocked detector affects status and waits rather than
authorizing a semantic action.[herdr-agents-docs]{5}
[herdr-source-repo]{13}

## Relative implementation shape

{inferred: comparison against current repository boundaries} Common glyph
support is not a second product architecture. The existing projection,
transition vocabulary, store, Ghostty title policy, board ordering, and
completion acknowledgement can remain shared. The cohesive new surface is:

- plural provider identity and provider-native binding data;
- a Claude launcher, bundled plugin/hooks, and event translator;
- per-adapter capability and evidence diagnostics;
- Claude-aware composition, packaging, and doctor checks; and
- cross-provider unit, packaged-CLI, and opt-in runtime scenarios.

{inferred: comparison against the existing shared projection and store} This is
materially smaller than rebuilding the Codex managed topology, but it
is not only a glyph edit. The confidence/recovery edges and runtime probes are
the work that make the common glyphs trustworthy.

## Required live-validation matrix

{extends: release-validation contract} Before Claude is advertised as
symmetrically supported, run the same semantic
scenarios through each managed launcher and compare normalized outcomes:

1. new launch, identity binding, relaunch, resume, and fork/branch;
2. ordinary working start and repeated turns;
3. permission wait, resolution, and return to working;
4. non-permission user question or MCP elicitation;
5. successful completion and Board-owned acknowledgement;
6. user interruption while working;
7. provider/API failure and managed-process failure;
8. background work remaining after a foreground response;
9. clean process exit and forced launcher termination;
10. disabled/incompatible provider extension and unsupported version; and
11. concurrent Codex and Claude sessions with independent Ghostty identity.

{extends: symmetric-support acceptance contract} Acceptance is semantic, not
event-identical:

- equivalent operator situations yield the same primary glyph;
- confidence and diagnostic text reflect the actual evidence;
- absent or stale evidence yields `?`, never a convenient primary glyph;
- `✓` clears only through Board acknowledgement, not provider idle; and
- no raw terminal key is described as semantic approval.

## Disconfirming analysis

{inferred: disconfirming comparison of native evidence authority} I tested the desired common-glyph conclusion against the native-signal-parity
alternative. Exact native-signal parity is unavailable in the ordinary Claude
TUI because prompt submission precedes processing and user interruption skips
`Stop`, while Codex app-server exposes native active and interrupted states.
[symmetry-claude-hooks]{1} [symmetry-claude-hooks]{3}
[symmetry-codex-app-server]{6} [symmetry-codex-app-server]{9} This rejects a
claim of equal evidence authority, but it does not reject common glyph semantics
when confidence and diagnostics remain visible.

{inferred: disconfirming comparison of screen inference against native evidence}
I also tested whether Herdr's screen-manifest strategy would make both adapters
cheaper. Herdr can classify both providers from live terminal output, but its
documentation deliberately withholds lifecycle authority from those session
hooks, labels unmatched known screens as fallback idle, and exposes rule evidence.
[herdr-agents-docs]{3} [herdr-agents-docs]{5} [herdr-agents-docs]{6} Adopting
screen inference as the primary path would discard Codex's stronger native
surface and weaken Agent Board's existing confidence guardrail.

{inferred: disconfirming topology tradeoff} Finally, I tested whether an SDK-owned Claude client would close the parity gap.
It would provide host-owned sessions and programmatic input, but it changes the
interactive-client and authentication boundary.[symmetry-claude-agent-sdk-overview]{1}
[symmetry-claude-agent-sdk-overview]{3}
[symmetry-claude-agent-sdk-user-input]{1} The gain is disproportionate to a
common-glyph goal that the hook topology can already satisfy with qualified
evidence.

## Contradictions

There is no direct source contradiction. The material relationship is a
`tension` between provider surfaces:

- Codex app-server exposes authoritative active/idle and interrupted outcomes.
  [symmetry-codex-app-server]{6} [symmetry-codex-app-server]{9}
- Claude's ordinary TUI exposes prompt submission and native local interruption,
  but its `Stop` hook does not fire for that interruption.
  [symmetry-claude-hooks]{1} [symmetry-claude-hooks]{3}

{inferred: resolution of the product-level tension} The common contract should
therefore bind glyph meaning, not confidence level. Requiring identical
confidence would either misrepresent Claude evidence, weaken Codex evidence to
screen inference, or replace Claude's normal TUI with a host-owned SDK client.

Herdr's generic lifecycle reporting API is broader than its shipped Claude and
Codex integrations. This is a `qualifies` relationship rather than a
contradiction: the platform can accept authoritative reporters, while these two
providers currently remain screen-derived in Herdr.[herdr-integrations-docs]{2}
[herdr-integrations-docs]{3}

| Source A | Source B | Relationship | Preserved interpretation |
| --- | --- | --- | --- |
| `[symmetry-codex-app-server]` | `[symmetry-claude-hooks]` | `tension` | Both support the same operator outcomes, but Codex exposes native active/interrupted states while Claude's ordinary-TUI hook route has weaker working-start and interruption evidence. |
| `[herdr-integrations-docs]` | `[herdr-source-repo]` | `qualifies` | Herdr accepts lifecycle reports generically, while its shipped Claude and Codex integrations remain session-only and use screen manifests for runtime state. |

## Revisit if

- Claude adds a native turn-start and interruption-complete hook pair;
- Codex changes its app-server status, active-flag, or turn contracts;
- either provider changes session identity/resume or extension-policy behavior;
- a live probe shows Claude cannot recover from interruption without prolonged
  stale working state; or
- Agent Board expands from attention routing into provider-semantic remote
  actions, which requires a separate control-capability decision.

## Sources

Source-direct evidence is recorded in `.research/attestation/` under the
`symmetry-codex-*`, `symmetry-claude-*`, and `herdr-*` handles. The three
within-specialist analyses are retained under `specialists/` as lenses for this
cross-synthesis, not as citation targets.
