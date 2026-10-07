---
name: agent-board-research-plan
description: Read this for the completed pre-architecture research decisions and the entry conditions for deliberately deferred follow-up research.
type: research-plan
kind: planning
status: locked
nav_priority: high
updated: 2026-08-20
summary: |
  Scout and the focused Codex, Ghostty, and Codex-Claude engagements are complete. Managed remote TUI is accepted as the Codex V1 default, managed ordinary Claude with hooks is accepted as the Claude topology, and the mixed-provider terminal arc is implemented and verified. Follow-up research remains deliberately deferred until its entry conditions are met.
decisions:
  - No deep-research or research-program campaign is warranted before the first proof.
  - Codex detector topology is the first pre-architecture decision because it changes workflow friction and state fidelity.
  - Ghostty scripting behavior requires an empirical integration check in addition to documentation research.
  - Store encoding and implementation language are well-understood reversible choices and need no external research yet.
  - Hardware, wireless, remote aggregation, and multi-agent research remain deferred until their entry conditions are met.
  - Ghostty 1.3+ AppleScript IDs and targeted tab-title overrides are validated for V1, with hierarchy-aware liveness required for undo-close.
  - Managed app-server plus remote TUI is the V1 default; ordinary Codex remains a degraded-confidence fallback.
  - Codex and Claude share outcome glyphs over asymmetric native evidence; Claude preserves its ordinary interactive CLI and uses a bundled per-run observation plugin.
---

# Agent Board research plan

## Completed discovery

The prior-art Scout engagement is complete and verified at:

`.research/analysis/campaigns/agent-board-prior-art/parent.md`

It covers Codex lifecycle interfaces, Ghostty title/session APIs, direct attention
supervisors, state-model patterns, liveness, and preservation of the old product
horizon.

## Completed pre-architecture research

### 1. Codex detector topology — `/research` complete

Output: `.research/analysis/briefs/codex-detector-topology.md`

Question: In Andrew's real Ghostty workflow, which supported launch topology
provides the smallest acceptable combination of startup friction, TUI fidelity,
state completeness, reliability, and recoverability?

Compare:

- unchanged ordinary `codex` plus hooks/notifications; and
- a small managed launcher that starts app-server and connects the TUI through
  `codex --remote` over a local endpoint.

The engagement should include a bounded local prototype because official docs
have already established the topology but cannot establish experiential parity.
Measure coverage for working, input/approval waits, completion, immediate idle,
error, interruption, session end, and acknowledgement. Inspect version-specific
generated schemas from the installed Codex build.

Rationale: this finding changes the first supported adapter, install/startup
experience, normalized confidence contract, and possibly process topology.

Result: both topologies are viable, but only managed app-server plus remote TUI
provided authoritative active/idle transitions to a concurrent observer. Andrew
accepted the managed recommendation as the V1 default; the implementation must
version-gate the experimental interface.

### 2. Ghostty registration and liveness contract — `/research` complete

Output: `.research/analysis/briefs/ghostty-registration-liveness.md`

Question: Against the installed supported Ghostty release, do AppleScript IDs and
targeted tab-title actions remain stable across rename, focus, reorder, agent exit,
tab close/undo-close, window movement, and unregister?

The engagement should read the installed app's bundled `Ghostty.sdef` and run a
bounded integration probe. It should also verify configuration diagnostics,
Automation permission behavior, title clearing, bell-title interaction, and
whether hidden undo-close surfaces remain enumerable.

Rationale: this finding changes identity, stale cleanup, minimum Ghostty version,
and whether OSC must remain a supported fallback.

Result: stable IDs and targeted title set/update/clear are suitable for V1.
Closed tabs remain enumerable during undo-close and return with the same IDs, so
reconciliation must distinguish visibility from process/surface existence.

### 3. Codex-Claude symmetric support — `/research` complete

Outputs:

- `.research/analysis/campaigns/codex-claude-symmetric-support/parent.md`
- `.research/analysis/briefs/claude-code-adapter-feasibility.md`
- `.research/analysis/positions/codex-claude-common-glyph-contract.md`

Question: Can Agent Board supervise ordinary interactive Claude tabs beside
managed Codex tabs with one honest glyph vocabulary despite different native
observation surfaces?

Result: yes. Both providers share normalized outcomes and Board-owned
acknowledgement, while provider identity, evidence authority, confidence, and
capabilities remain explicit. Claude keeps its ordinary CLI and receives a
per-run bundled hook plugin; missing or stale evidence projects diagnostic `?`
rather than fabricated parity. The resulting mixed-provider arc is implemented
and verified.

## Optional follow-ups after architecture

- Acknowledgement behavior — a small usability/telemetry study if focus, prompt,
  and explicit-ack signals remain ambiguous after the detector prototype.
- Store contention — a technical brief only if concurrent writers make the
  initial atomic-file design insufficient.
- Third agent adapter — `/brief` when a specific additional provider is
  promoted; do not research generic parity in advance.
- Notification and menu-bar behavior — `/research` after terminal V1 provides
  false-positive and acknowledgement data.
- Focus/navigation — local Ghostty prototype when that backlog option is promoted.
- External protocol and simulated client — architecture research only after a
  second live consumer exists.
- Hardware, wireless, battery, enclosure, and premium-market questions — a
  `/research-program` only after software usage demonstrates a physical product
  decision worth changing.

## No research currently needed

- local CLI framework and implementation language;
- atomic local file encoding;
- table rendering for `agents`;
- repo and branch discovery; and
- basic installation documentation.

These are mainstream, reversible implementation choices. The locked architecture
selects Node.js/TypeScript, atomic versioned session files, and a small terminal
renderer; feature design should refine them only within those boundaries.
