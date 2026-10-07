---
campaign: agent-board-prior-art
stage: adversarial-read
updated: 2026-08-14
verdict: APPROVED
provenance: agent-synthesis
---

# Adversarial verification checklist

## (a) Semantic citation-chain walk

- **Blocking — Codex passage locators are not semantically usable as written.**
  The Codex specialist used its bibliography ordinals (`1` through `11`) in
  `[handle]{N}` citations rather than the numbered key passage inside each
  attestation. The synthesis copied those locators. This makes several
  load-bearing chains resolve mechanically while pointing at a nonexistent or
  unrelated passage:
  - `parent.md:66-77`: `[notifications-activity]{6}` and
    `[codex-micro-status]{8}` have no such passages; the two attestations each
    contain only three key-passage bullets. `[app-server-protocol]{1}` is the
    transport/deep-integration passage, not the thread-status/turn-outcome
    passages. `[codex-cli-local-app-server-schema]{2}` supports thread status,
    but not the separately claimed active flags and turn outcomes.
    `[config-advanced-notifications]{3}` is the project-local-config restriction,
    not the completion/approval event evidence. `[hooks-lifecycle]{5}` is the
    enforcement-boundary caveat, not the three lifecycle-event passages.
  - `parent.md:163-166`: `[config-reference-tui]{4}` does not exist; the title
    writer and `null` off-switch are in that attestation's second passage.
  - `parent.md:179-205`: `[codex-cli-local-remote-modes-help]{10}` and
    `[developer-commands-remote-control]{11}` do not exist. The app-server
    citation used for stored-thread read/resume also needs the attestation's
    stored-thread passage, not `{1}`. The same broken locators recur in
    `parent.md:275-303`.
  - The underlying `specialists/codex-lifecycle.md` repeats this locator pattern
    throughout lines 13-95, including `{7}`, `{8}`, `{9}`, `{10}`, and `{11}` on
    attestations with only two or three key passages.
- **Action:** number every Codex attestation's key passages explicitly, then
  repoint each Codex specialist citation by the specific it supports. Propagate
  those corrected passage locators into `parent.md`. Split composed sentences
  across multiple citations where one claim uses thread status, active flags,
  and turn outcomes. Do not merely change the out-of-range numbers: several
  currently in-range locators are semantically wrong.
- Apart from the Codex locator problem, the parent’s load-bearing Ghostty,
  state-model, acknowledgement, liveness, and deferred-option claims walk to
  relevant direct attestations.

## (b) Claim shapes mechanical lint missed

- **Blocking — unsupported compound prior-art claim.**
  `specialists/attention-board.md:99` says completion, approval, and error
  notifications **plus a global menu-bar surface** are established patterns,
  citing only `[ccmux-readme]{4}`. That passage supports waiting/finished
  notifications, focus acknowledgement, and mapped notification actions. It
  does not support error notifications or any menu-bar surface. The claim should
  be split and narrowed to what ccmux attests, or supplied with a direct
  attestation for the other surfaces.
- **Non-blocking but required cleanup — unmarked comparative framing.**
  `parent.md:48` calls ccmux the “nearest” shape, and
  `specialists/attention-board.md:21` says it “most directly matches.” Those are
  composed comparisons, not source descriptions. Replace with a non-comparative
  description (for example, “closely matches”) or mark and substantiate the
  comparison as an inference.
- **Non-blocking epistemic-status cleanup.** Several architectural conclusions
  in `parent.md:215-235` are recommendations composed from the evidence rather
  than directly attested facts: reconciliation on every read/write, immediate
  disconnected tombstones, acknowledgement transition policy, and atomic-file
  sufficiency. The specialist briefs usually mark these as inferred, but the
  parent drops the marker. Add one `{inferred: synthesis}` marker to each
  composed recommendation paragraph or rewrite them explicitly as proposed V1
  policy.

## (c) Coherence-read for smoothed contradictions

- No hidden source disagreement was smoothed over in the parent. The important
  tensions are kept distinct: unchanged standalone TUI versus app-server-managed
  TUI; flat display vocabulary versus orthogonal stored facts; daemon now versus
  daemon later; and live process versus live Ghostty surface.
- The claim that app-server has no documented post-hoc attachment remains
  correctly scoped as absence in the fetched official material, and the
  specialist carries a medium-confidence marker. The parent should retain that
  qualification when citations are repaired.

## (d) Noise domination / relevance weighting

- No less-relevant source displaces a materially better attestation in the
  parent’s main decision chain. Exact Codex wire-state claims use the locally
  generated schema; Ghostty control claims use official docs/reference/source;
  and attention/acknowledgement claims use products that document those
  behaviors directly.
- The one relevance problem is the compound menu-bar claim in job (b): ccmux is
  relevant to notifications but irrelevant to a menu-bar surface. This is a
  support gap, not merely a preference among adequate sources.

## (e) Quote-context walk

- No qualifier-stripping problem surfaced. The material quotations—“currently
  alive,” “completed with unread update,” and the named CLI/config values—retain
  their relevant scope. The Ghostty brief explicitly preserves the ambiguity
  between “currently alive” enumeration and undo-close retention rather than
  treating the phrase as proof of visible-tab membership.

## (f) Analytical-tier-inheritance walk

- No `[handle]{N}` citation resolves to a specialist brief, prior synthesis,
  glossary, or other analytical-tier artifact. All cited handles resolve to
  `.research/attestation/` files. No lens laundering surfaced.

## (g) Line-reference / passage-reference walk

- **Blocking — same defect as job (a), detected at sub-attestation granularity.**
  The Codex `{N}` values are bibliography positions masquerading as passage
  locators. The local source-capture line anchors themselves are accurate:
  `help.txt:57-64`, `app-server-help.txt:34-38`, and
  `ServerNotification.json:3905-3910,5158-5227,5573-5580` contain the facts
  attested. The break is from brief/synthesis to the specific attestation
  passage.
- Ghostty and attention-board citations use passage locators consistently, and
  no out-of-range passage citation was found in those two briefs or in the
  parent’s non-Codex chains.

## (h) Thin-attestation check

- **Blocking for the Codex specialist, non-blocking for the current parent.**
  `pets-status.md` is marked `source-direct`, but all three supporting passages
  are described as search-result snippets rather than fetched page passages and
  have no stable source-internal anchors. It is substantively too thin to carry
  the specialist’s detailed status and compatibility claims at source-direct
  confidence. Re-fetch the official page and rewrite the attestation from page
  content, mark the attestation at the actual lower confidence with appropriate
  claim markers, or remove Pets-dependent claims. The parent currently does not
  cite Pets, so this does not undermine its final recommendations once the
  Codex citations are repaired.
- The other attestations contain enough claim-specific detail to support their
  uses. The local CLI/schema attestations are especially strong because their
  exact captures are committed under `.research/source-captures/`.

## Verdict

NEEDS-REVISION

The synthesis position is coherent and likely survives unchanged, but approval
is blocked until the Codex passage-locator chain is repaired. The attention-board
menu-bar/error-notification overclaim and the thin Pets attestation must also be
corrected in the specialist substrate so the campaign is internally sound.

## Revision verification — pass 2

### Closed findings

- **Codex semantic passage locators: closed.** Every Codex attestation now has
  explicit numbered key passages. I sampled every parent claim cluster rather
  than relying on lint:
  - presentation semantics use `notifications-activity` passage 2 and
    `codex-micro-status` passage 2;
  - app-server runtime state, active flags, and turn outcomes use
    `app-server-protocol` passages 7/10 and local-schema passages 1/2/3;
  - ordinary-TUI completion/approval/stop/session-end claims use notification
    passages 1/2 and hook passages 1/2/3;
  - terminal-title configuration uses `config-reference-tui` passage 2;
  - managed-TUI topology uses app-server passages 2/5/6, remote-help passage 2,
    and developer-commands passage 2; and
  - managed-TUI state fidelity again uses app-server passages 7/10 and schema
    passages 1/2/3.
  Each sampled locator now exists and semantically supports the adjacent claim.
- **Pets source depth: closed.** `pets-status.md` is now written from fetched
  official page content with stable line anchors and three claim-specific
  passages. Specialist uses of state vocabulary, current-session scope, and
  terminal constraints point to the appropriate passages.
- **Notification/menu-bar overclaim: closed.** The attention-board table now
  limits the ccmux-backed row to notifications and moves menu-bar/always-on-top
  views into a separately marked `{inferred: deferred option}` row without
  pretending the sampled source validates them.
- **Comparative language: closed.** “Nearest” and “most directly matches” were
  replaced with non-superlative descriptions (“close analogue” / direct feature
  description).
- **Parent inference markers: closed.** The liveness/tombstone,
  acknowledgement, and atomic-store/daemon recommendation paragraphs now each
  carry `{inferred: synthesis}`.

### Remaining finding

- **Blocking — the parent still drops the specialist's absence qualification.**
  The corrected specialist carefully states that the fetched sources did not
  reveal post-hoc app-server attachment and marks that result `{confidence:
  medium}`. `parent.md:179-184` instead opens with the unqualified “There is no
  documented post-hoc attachment,” and `parent.md:275-280` says official Codex
  evidence “defeats” non-invasive full-fidelity observation. The cited sources
  positively document the inverse topology, but an absence search over fetched
  sources does not establish an ecosystem-wide impossibility. This was called
  out in pass 1 under job (c), including the explicit instruction to retain the
  qualification after citation repair.
- **Action:** change the parent claim to “The fetched official material does not
  document post-hoc attachment…” and retain `{confidence: medium}` (including
  the frontmatter key finding if it remains phrased as an absence). In the
  disconfirming section, replace “defeats” with “does not support” or otherwise
  scope the conclusion to the fetched official evidence. The prototype
  recommendation can remain unchanged.

## Final verdict after revision verification

NEEDS-REVISION

All mechanical and substantive source-chain repairs are now sound. Approval is
withheld only for the remaining overstatement of an absence finding in the
parent synthesis; no change to the synthesis direction is required.

## Lead terminal spot-check after pass-2 correction

The lead corrected each remaining absence claim in `parent.md` toward the
verified substrate:

- The frontmatter finding now says the fetched official material does not
  document retroactive attachment.
- The topology section carries `{confidence: medium}` and states that the
  fetched official material does not document post-hoc attachment.
- The disconfirming analysis now says the fetched Codex evidence does not
  support non-invasive full-fidelity observation rather than claiming it proves
  impossibility.
- The contradiction section is likewise scoped to the fetched official
  material.

The lead re-ran citation lint after the correction: 93 citations resolved, zero
broken, zero thin. The only remaining pattern flags are two cited Ghostty
version-number checks. A semantic sample walked the topology claims to
`app-server-protocol` passages 2/5/6 and
`codex-cli-local-remote-modes-help` passage 2; those passages support the
positive documented topology while the prose retains the medium-confidence
absence qualification.

## Campaign verdict

APPROVED
