# Adversarial verification checklist

Campaign: `codex-claude-symmetric-support`
Synthesis: `parent.md`
Rigor: `full`
Mechanical input: parent 76 resolved citations; specialists 61/39/122 resolved;
zero broken and zero structurally thin citations.

## (a) Semantic citation-chain walk

- **Needs revision — `UserPromptSubmit` ordering is read-but-not-attested.**
  `parent.md:50`, `parent.md:189-194`, and
  `specialists/claude-current-surface.md:42` say that `UserPromptSubmit` fires
  before Claude processes the prompt. `[symmetry-claude-hooks]{1}` records the
  cadence and event list, but its attestation prose does not record the
  before-processing specific. The fetched source range may contain the detail;
  the required quote-before-cite chain does not. Extend the attestation entry
  with that ordering before retaining these citations.
- **Needs revision — the experimental-command claim points at the wrong
  attested specifics.** `parent.md:77-82` and
  `specialists/codex-current-surface.md:18-23` say the local CLI labels
  app-server (and, in the specialist, remote-control) experimental.
  `[symmetry-codex-local-cli-probe-0-148-0]{1}` attests only the version;
  `[symmetry-codex-app-server]{3}` concerns experimental protocol methods and
  fields, not the CLI command label. The local capture does contain the command
  labels under “Relevant top-level commands,” so correct toward the substrate:
  record that specific in the attestation and cite the corresponding passage.
- **Needs revision — upstream HTTP status is absent from the cited
  attestations.** `specialists/codex-current-surface.md:33` says error data can
  carry an upstream HTTP status, but `[symmetry-codex-app-server]{11}` records a
  typed error and `[symmetry-codex-local-schema-0-148-0]{9}` records error IDs
  and retry indication; neither attestation entry records `httpStatusCode`.
  The captured schema contains the field, so extend the schema attestation and
  re-point/add the citation rather than softening the finding.
- **Needs revision — Claude version gating is not attested at the cited
  passages.** `specialists/claude-current-surface.md:69-72` says current
  documentation gives feature minimum-version conditions, but
  `[symmetry-claude-hooks]{1}` and
  `[symmetry-claude-local-cli-2.1.226]{1}` do not record a minimum-version
  condition. Name and attest the specific gated feature/version, or reduce the
  sentence to the supported local-version observation.
- **Needs revision — Remote Control carries unattested details.**
  `specialists/claude-current-surface.md:74-83` says the bridge retains the
  local filesystem, MCP, and tools. The cited
  `[symmetry-claude-remote-control]{1-3}` entries record provider restrictions,
  server spawning/capacity, and continued local terminal use, but not all three
  of those retained capabilities. Add the load-bearing details to the
  attestation before citing them.
- **Needs revision — Herdr specialist prose outruns its attestations.** In
  `specialists/herdr-prior-art.md`, the remote-update restrictions at line 28
  are not recorded in `[herdr-agents-docs]{6}`; the stable source, sequence,
  and release-on-exit fields at line 32 are not recorded in
  `[herdr-integrations-docs]{3}`; and the public CLI/local-socket reporting
  route at line 42 is broader than `[herdr-integrations-docs]{3}` plus
  `[herdr-cli-reference-docs]{1}` as attested. Enrich the relevant attestations
  with the cited specifics or narrow the claims.
- Other load-bearing lifecycle, permission, completion, interruption,
  failure, session-identity, and Herdr screen-authority claims walked to
  semantically supporting attestation prose. No disclaiming-attestation shape
  was found.

## (b) Claim shapes the mechanical lint missed

- **Needs revision — unmarked composed product rules.** The glyph rules in
  `parent.md:30-43`, diagnostic-fallback conclusion at `parent.md:86-88`,
  observation-only Claude handler at `parent.md:109-113`, live-validation and
  acceptance contract at `parent.md:162-185`, and SDK tradeoff conclusion at
  `parent.md:206-212` are product/design synthesis, not source-attested facts.
  Their section headings and nearby citations do not replace per-claim
  epistemic markers. Mark them `{inferred: ...}` or `{extends: ...}` at the
  applicable claim/list boundary.
- **Needs revision — comparative framed as description.** “Materially smaller
  than rebuilding the Codex managed topology” at `parent.md:158-160` is a
  composed comparison. The marker at line 147 applies to the preceding
  paragraph/list and does not mark this new claim. Mark it explicitly and name
  the comparison basis, or remove it.
- **Needs revision — specialist conclusions also need markers.** Examples are
  “sufficient for a provider adapter” at
  `specialists/codex-current-surface.md:13-20`, “the appropriate topology” at
  `specialists/claude-current-surface.md:85-92`, and the absence-based
  provider-approval conclusion at `specialists/herdr-prior-art.md:16-18`.
  These are composed judgments even where the surrounding factual premises are
  cited. Apply a systematic marker sweep rather than fixing only these samples.
- No fabricated absolute effort estimate, line-count estimate, or unsupported
  comparative superlative was found.

## (c) Coherence read for smoothed contradictions

- **No smoothed contradiction surfaced.** The synthesis keeps Codex native
  active/interrupted evidence beside Claude's hook-plus-terminal evidence and
  explicitly lowers Claude confidence. It also preserves the distinction
  between Herdr's generic lifecycle-reporting capability and its shipped
  session-only Claude/Codex integrations.
- **Structural revision still required.** `parent.md:214-234` names the
  `tension` and `qualifies` relationships, but the campaign contains no ledger
  row tagged with both source handles and the relationship type. Add the
  required contradiction/relationship ledger rows; do not replace the existing
  side-by-side prose with a unified resolution.

## (d) Noise domination / relevance weighting

- **Needs revision — more relevant remote-endpoint passage went uncited.**
  `specialists/codex-current-surface.md:68-73` cites
  `[symmetry-codex-local-cli-probe-0-148-0]{3}` for the remote TUI's accepted
  WebSocket and Unix endpoint forms. Passage `{3}` is the app-server listener
  surface; `{4}` is the attestation entry that explicitly records remote TUI
  endpoint forms. Cite `{4}` for the client endpoint forms while retaining the
  official app-server citation for the transport security boundary.
- The uncited `[symmetry-codex-developer-commands]` attestation is not a better
  source for the managed app-server thread-resume claims: it describes the
  separate interactive/non-interactive CLI resume and fork surface. No other
  major claim was dominated by a less-relevant attestation.

## (e) Quote-context walk (`GR.4`)

- **No qualifier-stripping quote distortion surfaced.** The artifacts contain
  protocol identifiers, command forms, glyphs, and short UI labels, but no
  source-attributed prose quotation whose surrounding synthesis removes a
  source qualifier. Literal UI/command tokens remain framed as identifiers,
  not as broader provider guarantees.

## (f) Analytical-tier inheritance walk

- **Nothing surfaced.** Every formal citation resolves to a source-direct
  attestation handle; no specialist, prior synthesis, glossary, or position is
  used as a citation target. `parent.md:248-251` also states the correct
  lens-not-substrate boundary for the specialist analyses.

## (g) Line-reference walk

- **Needs revision — all five local Claude help ranges are misaligned with the
  captured file.** In
  `.research/attestation/symmetry-claude-local-cli-2.1.226.md`, `{1}` cites
  `help.txt:3-4` for both version and interactive/print behavior although those
  are at lines 4 and 6-7; `{2}` omits line 14's names/session IDs; `{3}` omits
  line 16's generated-name prefix; `{4}` cuts off the bare-mode details at
  lines 22-23; and `{5}` omits the remainder of stream-json at lines 25-26 and
  the top-level commands at lines 28-29. Update the attestation anchors to the
  actual captured ranges.
- **Needs revision — Herdr source anchors do not all exist or contain the named
  specific.** In `.research/attestation/herdr-source-repo.md`, `{2}` names
  `src/detect/mod.rs:72-94`, but the `SCREEN_MANIFEST_AGENTS` declaration and
  Claude/Codex entries are at lines 94-97; `{5}` ends at line 175 although the
  Claude manifest's idle rules continue through line 189; `{6}` claims
  `codex.toml:1-100` although the captured file has 89 lines; and `{7}` claims
  the Claude hook script through line 106 although the captured file has 101
  lines. Correct these source-internal ranges before the dependent citations
  are treated as fully walked.
- Definition/section anchors in the local Codex schema/probe exist and support
  their attested shapes. The remaining URL-backed line anchors are not frozen
  in the supplied source-capture directories, so this pass could not reproduce
  their historical line numbering from campaign substrate alone; the semantic
  check above therefore treats the committed attestation prose, not a mutable
  live-page line number, as the citation boundary.

## (h) Thin-attestation check (`GR.5`)

- **Nothing structurally or substantively thin surfaced.** Each cited
  attestation has source-direct frontmatter, a descriptive summary, and keyed
  source anchors sufficient to support multiple claim-sized citations.
  The missing specifics listed under job (a) are read-but-not-attested gaps in
  otherwise substantive attestations, not whole-attestation thinness.

## Pass 1 verdict

**NEEDS-REVISION**

Before `evaluate`, revise the source-facing chain in this order:

1. Extend the affected attestations with the already-fetched specifics and fix
   the local source-capture ranges.
2. Re-point the experimental-command and remote-endpoint citations, then rerun
   the parent and specialist lints.
3. Mark the composed product rules, recommendations, and comparisons.
4. Add relationship-ledger rows for the named `tension` and `qualifies`
   relationships.
5. Repeat the adversarial read on the revised artifacts; do not advance to
   `evaluate` on the current chain.

# Pass 2 — revision verification

Mode: **correction verification**. The pass-1 record is retained above; this
section records whether each requested correction reached the artifact it was
intended to correct.

The authoritative lint was rerun against the revised parent and all three
specialists. It reports parent `76`, Claude specialist `60`, Codex specialist
`39`, and Herdr specialist `122` resolved/non-broken citations, with zero broken
and zero structurally thin citations. The remaining version-number warnings are
heuristic notices, not citation-chain failures. The source-direct attestation
tier has no audit findings.

## (a) Semantic citation-chain walk — pass 2

- **Resolved — `UserPromptSubmit` ordering.**
  `[symmetry-claude-hooks]{1}` now records that the event runs before Claude
  processes the submitted prompt.
- **Resolved — local experimental-command label.**
  `[symmetry-codex-local-cli-probe-0-148-0]{2}` now records that the inspected
  CLI labels both `app-server` and `remote-control` experimental, and the parent
  and Codex specialist cite that entry.
- **Resolved — upstream HTTP status.**
  `[symmetry-codex-local-schema-0-148-0]{9}` now records the optional forwarded
  `httpStatusCode` field used by the Codex specialist.
- **Resolved — Claude version boundary.** The Claude specialist no longer
  asserts an unattested feature-minimum condition; it states the supported
  local-version probe boundary.
- **Resolved — Remote Control retained capabilities.**
  `[symmetry-claude-remote-control]{3}` now records continued use of the local
  filesystem, MCP servers, tools, and configuration.
- **Resolved — Herdr details.** The relevant attestations now record remote
  manifest-update constraints, stable source/sequence/release fields, and the
  shipped reporting surface; the specialist also narrows the earlier
  `local-socket` formulation.
- **No new semantic citation-chain defect surfaced.** The load-bearing claims
  walked in pass 2 derive from their cited source-direct attestation entries.

## (b) Claim shapes the mechanical lint missed — pass 2

- **Resolved in part — the requested marker additions landed.** The primary
  glyph and diagnostic-fallback contracts, minimal Claude hook handler,
  live-validation and acceptance contracts, relative implementation comparison,
  and the three specialist judgments named in pass 1 now carry epistemic-status
  markers. The main SDK recommendation at `parent.md:117-123` is also marked.
- **Still needs revision — the diagnostic-mode recommendation remains
  unmarked.** `parent.md:85-89` moves from cited Claude customization facts to
  the composed requirement that `agent-claude` enter diagnostic mode and an
  incompatible Codex protocol fail closed. This was a pass-1 finding, and no
  marker was added at this claim boundary.
- **Still needs revision — the later SDK tradeoff remains unmarked.** The
  disconfirming-analysis conclusion at `parent.md:212-218` calls the SDK gain
  “disproportionate.” The marker at `parent.md:117` does not extend to this new
  paragraph and claim boundary. This is the remaining instance of the SDK
  tradeoff finding from pass 1.
- **Newly surfaced by the systematic pass-2 marker sweep — several composed
  parent claims still read as source-attested.** Add a marker at each applicable
  claim or table/list boundary:
  - the product-level “Symmetry disposition” decisions in
    `parent.md:48-57`;
  - the installation-time schema/connection requirement in
    `parent.md:78-83`;
  - the Codex topology recommendation in `parent.md:95-97`;
  - the Herdr-derived product recommendations and approval implication in
    `parent.md:127-146`; and
  - the composed conclusions in the three disconfirming-analysis paragraphs at
    `parent.md:195-218`, including “cheaper,” “stronger,” “weaken,” and
    “disproportionate” comparisons.
- **No forbidden absolute effort estimate or comparative superlative
  surfaced.** The previously flagged “materially smaller” comparison now has a
  named relative anchor and an `{inferred: ...}` marker.

## (c) Coherence read for smoothed contradictions — pass 2

- **Resolved — the relationship ledger now exists.** `parent.md:242-245`
  records the Codex/Claude `tension` and the Herdr docs/source `qualifies`
  relationship with both handles and preserves the interpretations separately.
- **No smoothed contradiction surfaced.** The revised prose still keeps native
  Codex evidence, qualified Claude evidence, and Herdr's session-only shipped
  integrations distinct.

## (d) Noise domination / relevance weighting — pass 2

- **Resolved — remote endpoint citation.** The Codex specialist now cites
  `[symmetry-codex-local-cli-probe-0-148-0]{4}` for the remote TUI endpoint
  forms while retaining the official app-server source for the transport
  boundary.
- **No new relevance-weighting defect surfaced** after rereading all retrieved
  attestations associated with the major claims.

## (e) Quote-context walk (`GR.4`) — pass 2

- **Nothing surfaced.** No revised verbatim framing strips a source qualifier.

## (f) Analytical-tier inheritance walk — pass 2

- **Nothing surfaced.** All formal handles still resolve to source-direct
  attestations; no specialist or other analytical-tier artifact is laundered as
  source evidence.

## (g) Line-reference walk — pass 2

- **Resolved — local Claude help ranges.** The five attestation ranges now align
  with the captured version, launch, session, Remote Control, customization,
  bare-mode, stream-json, and command lines.
- **Resolved — Herdr source ranges.** The corrected `SCREEN_MANIFEST_AGENTS`,
  Claude manifest, Codex manifest, and Claude hook-script ranges exist and
  contain the named specifics in the fetched repository capture.
- **No new sub-attestation range defect surfaced** in the locally captured
  sources checked for the cited specifics.

## (h) Thin-attestation check (`GR.5`) — pass 2

- **Nothing surfaced.** The revised entries close the prior read-but-not-attested
  gaps without becoming whole-source summaries; the lint likewise reports zero
  structurally thin attestations.

## Final verdict

**NEEDS-REVISION**

The citation chain, relevance correction, local source ranges, specialist
markers, and relationship ledger are now in shape. Before `evaluate`, complete
one bounded epistemic-status sweep of `parent.md`: mark the still-unmarked
composed claim boundaries identified under pass-2 job (b), then rerun lint and
the adversarial marker check. No further attestation or source-capture change is
required by this pass.

# Pass 3 — bounded marker verification

Mode: **correction verification**. This pass re-read the revised `parent.md`
against the specific marker gaps named in pass 2, then checked the edits for
citation-chain and contradiction/coherence regressions.

The authoritative parent lint still reports `76` resolved/non-broken citations,
zero broken citations, zero structurally thin attestations, and no
attestation-tier audit finding. Its three version-number notices remain
heuristic warnings rather than chain failures.

## Marker corrections

- **Resolved — cross-provider disposition table.** The marker at
  `parent.md:48` applies at the table boundary and correctly classifies the
  product-level disposition column as an `extends` claim.
- **Resolved — capability gating and diagnostic mode.** The requirements at
  `parent.md:87-88` and `parent.md:94-97` now have distinct `extends` markers.
  This closes the previously unresolved diagnostic-mode finding.
- **Resolved — Codex topology recommendation.** The recommendation at
  `parent.md:103-106` is now marked `extends` while its rich-client factual
  premise remains cited.
- **Resolved in part — Herdr section.** The carry-forward patterns at
  `parent.md:144-151` are marked `extends`, and the approval implication at
  `parent.md:153-157` is marked `inferred`.
- **Needs revision — one composed Herdr boundary identified in pass 2 remains
  unmarked.** `parent.md:136-142` says Herdr “validates the product-level
  distinction” between common vocabulary and common evidence. The following
  provider-specific facts are cited, but the validation/convergence conclusion
  is composed across them. Add an `{inferred: ...}` marker at this paragraph
  boundary; absent a marker, it still reads as directly source-attested.
- **Resolved — all three disconfirming-analysis boundaries.** The native-signal,
  screen-inference, and SDK-topology comparisons at `parent.md:206-230` each
  carry a scoped `inferred` marker. This closes the remaining SDK-tradeoff
  finding.
- **No new forbidden effort estimate or comparative superlative surfaced.**

## Citation-chain regression check

- **Needs revision — the capability-gating edit introduced a semantic passage
  mismatch.** `parent.md:80-85` now says the surface provides “connection
  initialization,” but `[symmetry-codex-app-server]{3}` records experimental
  opt-in plus thread start/resume, and
  `[symmetry-codex-local-cli-probe-0-148-0]{3}` records listener and schema
  generation. Connection initialization is recorded in
  `[symmetry-codex-app-server]{2}`. Correct toward the existing substrate by
  citing `{2}` for that specific; the mechanically resolving `{3}` citations do
  not semantically support it.
- **No other citation-chain regression surfaced** in the edited boundaries.

## Coherence and relationship check

- **No coherence regression surfaced.** The edits add epistemic status without
  merging the Codex/Claude `tension` or Herdr `qualifies` positions. The
  relationship ledger remains intact and consistent with the side-by-side
  contradiction prose.

## Final verdict — pass 3

**NEEDS-REVISION**

Two bounded corrections remain before `evaluate`: mark the composed Herdr
validation conclusion at `parent.md:136-142`, and add
`[symmetry-codex-app-server]{2}` to the connection-initialization claim at
`parent.md:80-85`. After those edits, rerun the parent lint and one final
semantic marker/chain check; no specialist, attestation, or source-capture edit
is requested by this pass.

# Pass 4 — final bounded semantic marker/chain check

Mode: **correction verification**.

- **Resolved — Herdr convergence marker.** The composed validation conclusion
  now has an `{inferred: convergence ...}` marker at `parent.md:137`, scoped to
  the paragraph identified in pass 3.
- **Resolved — connection-initialization chain.** The claim at
  `parent.md:80-86` now cites `[symmetry-codex-app-server]{2}`, whose attestation
  entry explicitly records connection initialization. The existing `{3}` and
  local-probe citations continue to support experimental opt-in, listeners, and
  schema generation.
- **No coherence regression surfaced.** Neither correction alters the source
  positions or the relationship ledger.
- Parent lint now reports `77` resolved/non-broken citations, zero broken, zero
  thin, and no attestation-tier audit finding. The three remaining
  version-number notices are unchanged heuristic warnings.

## Final verdict — pass 4

**APPROVED**

The bounded pass-3 corrections are complete, and no remaining semantic marker,
citation-chain, or coherence defect surfaced in this final check.
