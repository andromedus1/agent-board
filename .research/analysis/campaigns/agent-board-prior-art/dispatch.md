---
intent: survey-landscape
output_kind: landscape-brief
consumer: agent-board-foundation-docs
verification_rigor: standard
temporal_contract: write-once-on-converge
primitives_extends: []
primitives_opts_out: []
decision_relevance: Findings may change how Agent Board detects Codex lifecycle state, owns Ghostty tab titles, stores local session state, and whether V1 needs a resident process; they may also remove or defer product surfaces that do not contribute to the first attention-routing proof.
scope_authority: mixed
analytical_artifact_type: per-campaign-brief
provenance: agent-synthesis
---

# Agent Board prior-art landscape

Map direct, adjacent, and analogous prior art for a lightweight local control
plane that lets one macOS operator supervise several terminal-based coding
agents. The first proof is deliberately narrow: Codex in one Ghostty tab per
project, machine-controlled status plus a human-controlled project label in the
tab title, and a terminal `agents` board backed by the same local state.

The fixed product boundary is attention routing rather than terminal macros;
local-first operation; no tmux dependency; no generic keystroke presented as a
semantic action; and no hardware commitment before the software control plane
is useful. Research may adapt the integration mechanism and internal state
shape, but not silently expand V1 into the earlier daemon, multi-agent,
navigation, GUI, or hardware vision.
