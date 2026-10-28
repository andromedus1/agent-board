---
campaign: remote-persistent-supervision
synthesis: parent.md
assessed_snapshot: "sha256 prefix 67e55e7352e0b685"
gate: "evaluate (isolated context, synthesis and seed only)"
updated: 2026-10-26
provenance: agent-synthesis
---

# Campaign evaluation (isolated)

**Verdict on snapshot 67e55e73: NEEDS-REVISION.** Mostly sound and disciplined; bounded material targets.

## Component findings

1. **Coverage.** All seed vectors addressed. Material gaps: title passthrough /
   title-loss failure mode not covered in body; hybrid topology (laptop Ghostty
   attached over SSH to host tmux) absent from Topology fit; the "no generic
   keystroke implies semantic approval" guardrail is not mapped per family.
   Nit: Claude mobile lacks a body entry.
2. **Coherence.** Material: Implications "Build" bullet says provider-qualified
   state is what "most families lack", contradicting the body's hook-based
   tools; "Compose" says the stack documents "every piece except" glyph+rename,
   contradicting the acknowledgement and phone-title gaps; options are given
   uneven risk treatment (Migrate lists defects, Build lists none, Compose omits
   hook drift; the coverage-asymmetry caveat is not carried into Migrate). Table
   cell "Both Codex and Claude: Yes" for multiplexer supervisors conflicts with
   Claude-only entries. Nits: "Cloud VM reclaimed" filed under host reboot;
   Codex app-server phone-path wording versus a remote-connections citation;
   Moshi classed under user-operated overlays while also holding a vendor
   WebSocket.
3. **Contradictions.** Section present and substantive; Herdr and agent-deck
   tensions well handled. Nits: the Remote Control competitor row adjudicates
   ("vendor page governs") and may be a currency/trigger difference rather than
   `contradicts`; tmux-webui row may be `qualifies`; Codex host-vs-cloud row is
   not a contradiction; Blink/Moshi tension not echoed in the transport body.
4. **Groundedness.** Generally strong posture. Material: the multiplexer
   approval cell cites Moshi (a phone client) and the "common multiplexer-family
   mechanism" key finding rests on it; composed table cells lack citation or
   `{inferred}`; the tool-extract caveat is global rather than per load-bearing
   absence claim. Nits: aggregates unmarked; reused attestation fetch dates vs
   "fetched on 2026-10-26" wording; single-vendor citation for "each provider
   page addresses only its own agent".

## Priority-ordered recommendations

1. Neutralize Implications (qualify "most families lack"; list actual
   undocumented pieces; comparable risks per option; carry coverage caveat).
2. Add title-passthrough coverage, a title-loss failure mode, and the hybrid
   laptop-Ghostty-to-host-tmux case, or record them as explicit gaps.
3. Fix the comparison table citations and the provider-coverage cell.
4. Map each family's approval mechanism against the guardrail, `{inferred}`.
5. Per-claim `{confidence: tool-extract}` on extract-based absence claims.
6. Nits: aggregate markers; contradiction-row relation types; Moshi class;
   Claude mobile entry; reused-attestation date wording.

## Re-evaluation on snapshot 5ae2dded (isolated)

Prior targets 1, 2, 4 RESOLVED; 3 and 5 PARTIAL; nits mostly resolved.
Minimum fix set to approve: restore the tmux-webui attribution for Claude's
title glyph (key finding 2, pattern 3); support or drop the "Both Codex and
Claude" cell entries for ccmux, tmux-webui, and agent-deck; optionally reword
"approximate" and mark extract-based table cells. The evaluator stated that
after these fixes the draft could be approved on spot-check without another
full evaluation. All were applied and lead-verified (see
`verification-checklist.md`, engagement verification record).
