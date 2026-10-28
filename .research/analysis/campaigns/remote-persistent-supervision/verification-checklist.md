---
campaign: remote-persistent-supervision
synthesis: parent.md (sha256 67e55e7352e0b685b85372e2db310eaef8113fe0a1a99e1a8b3c9ce73b85c571)
rigor: standard (multi-path; evaluate runs separately)
mechanical_input: lint-campaign.txt (682 resolved, 0 broken, 0 thin, 4 pattern flags; reduced-substrate info rows for the provider pages)
stage: adversarial-read
authored: 2026-10-26
provenance: agent-synthesis
---

# Verification checklist: remote-persistent-supervision parent

Line references are to `parent.md` at the snapshot hash above. Every cited
`[handle]{N}` in parent.md was walked against the numbered key passage in
`.research/attestation/<handle>.md`. The 16 rps-* attestations the parent does
not cite were also read for job (d).

Severity: **M** = material (it changes what a reader would conclude, or it breaks
a discipline invariant). **n** = nit.

## (a) Semantic citation-chain walk

1. **M — Table, Approval semantics, multiplexer column (L191).** "Key delivery
   [rps-moshi-docs-multiplexer]{2}". Moshi is a phone client in the generic-stack
   lane, not a multiplexer-shaped supervisor. No multiplexer-supervisor
   attestation documents an approval mechanism. Herdr's controller accepts
   `terminal.input` [rps-herdr-persistence-remote-docs]{7}, ccmux documents
   tool-approval *detection* only [rps-ccmux-readme]{6}, and tmai lists
   "prompt/approve" with no mechanism given [rps-tmai-readme]{6}. Remedy: change
   the cell to something like "Terminal input via Herdr controller
   [rps-herdr-persistence-remote-docs]{7}; approval mechanism otherwise not
   documented". Move Moshi's verified key injection to the Generic-stack cell,
   which now reads a bare "Keystrokes".
2. **M — Contradictions row 7 (L327).** It says the competitors describe Remote
   Control as having "a ~10-minute timeout", against vendor docs that describe "a
   ~10-minute network-outage exit". Those two statements agree.
   [rps-claudecodeui-readme]{5} says "timing out after about 10 minutes without a
   network connection", which matches [rps-claude-remote-control-docs]{13}.
   [rps-purplemux-readme]{3} says neither single-session nor ~10 minutes. It only
   recommends purplemux "when you need multi-session management, push
   notifications, and persistent sessions". "Single active session" is also
   correct for interactive mode, since the vendor doc says "one remote session
   per interactive process outside server mode" [rps-claude-remote-control-docs]{12}.
   Remedy: re-type the row as `qualifies`: the competitor describes interactive
   mode, and the vendor adds a multi-session server mode {4}. Drop the
   timeout-contradiction wording, attribute only what purplemux{3} says, and add
   RC{12} to the vendor side.
3. **M — Disconfirming analysis, provider cross-vendor (L304–306).** The claim
   "Each provider page addresses only its own agent [rps-claude-mobile-docs]{1}"
   rests on one Claude passage. That passage says the app is a client for Claude
   Code sessions. It says nothing about other vendors, and no OpenAI page is
   cited. Remedy: mark it as `{inferred: aggregate absence}`, add the Codex-side
   passages ([rps-codex-remote-connections-docs]{4}, [rps-codex-cloud-docs]{2}),
   and add `{confidence: search-summary}` because all of these attestations are
   reduced-substrate.
4. **M — Table, Glyph row, provider-native cell (L188).** "online dot only" is
   true of Remote Control's list [rps-claude-remote-control-docs]{5}. It is not
   true of the whole family. Codex cloud "Tasks display status and progress"
   [rps-codex-cloud-docs]{3}, and Claude Projects exist so the user can "see
   which threads finished or need you" [rps-claude-mobile-docs]{7}. Remedy: write
   "Not documented; Remote Control: online dot only [RC]{5}; Codex cloud: status
   and progress, values not in extract [codex-cloud]{3}{7}".
5. **M — Table, Host reboot row (L186).**
   - The multiplexer cell generalises Herdr to the whole family. agent-deck reboot
     behaviour is not documented. Codirigent resumes Claude and Codex sessions
     [rps-codirigent-readme]{3}.
   - The provider-native cell ("Cloud VM reclaimed after inactivity") answers an
     inactivity question, not a reboot question.
   - The phone-first cell says "Not documented", but Happy documents a daemon
     across reboots via the shell profile [rps-happy-cli-readme]{5}. The Happy
     welcome page also claims "Every conversation and subagent survives a closed
     window and a restart" [rps-happy-welcome-docs]{1}, at search-summary depth.
     tmux-webui's own daemon "survives reboots" [rps-tmux-webui-readme]{6}.

   Remedy: prefix product names in each cell ("Herdr, Codirigent: provider
   resume; others not documented"). Replace the provider cell with the
   process-stop and offline statements ([RC]{12}, [codex-remote]{3}). Replace the
   phone-first "Not documented" with the Happy and tmux-webui daemon facts, each
   carrying its confidence marker.
6. **M — Table, "Both Codex and Claude", multiplexer cell (L190).** "Yes" is
   wrong for the zellij status plugin, which is Claude only
   [rps-claude-code-zellij-status-readme]{4}. It is also wrong for tmai, which
   documents Claude Code hooks only [rps-tmai-readme]{4}{5}. Remedy: change it to
   "Mostly yes", to match the phone-first cell, and cite the exceptions.
7. **n — ccmux status merge (L69–70).** It cites [rps-ccmux-readme]{5}, but the
   three-signal merge is {9}. Remedy: re-point it to {9}. Also see (g).
8. **n — claude-squad "no documented remote path" (L74–75).** It cites
   [rps-claude-squad-readme]{4}, which is the key menu. That passage does not
   speak to remote use. Remedy: mark it as an absence and add
   [rps-claude-squad-issues]{1}: a user asked whether they could "drop in" over
   SSH, and ctrl-q misbehaved when they tried.
9. **n — "agent-unaware web terminals" (L172–173).** The cited passages, ttyd{2},
   gotty{2} and wetty{1}, are about auth and options. "Agent-unaware" is an
   absence inference. Remedy: add `{inferred: absence}`.

## (b) Claim shapes the lint missed

1. **M — Implications, Build (L282–287).** "The provider-qualified state Agent
   Board already derives is the property most families lack." This is an
   unmarked comparative claim. It also contradicts the parent's own key finding 3
   (L13), which classes agent-deck, ccmux, purplemux, Codirigent and the Moshi
   hook daemon as provider hooks with fallback. That is provider-sourced state.
   What the survey actually shows as differentiating is *visible confidence and
   capability*. Even that has a partial counter-example: Herdr dims cached remote
   state and labels it "cached information, not live state"
   [rps-herdr-connecting-machines-docs]{4}.

   "None of these is documented as provided by the surveyed tools in Agent Board's
   shape" (L286–287) cannot be falsified. Remedy: delete "the property most
   families lack". Restate it as "most surveyed status is screen-inferred or
   hook-with-fallback, and few sources document visible confidence (Herdr's
   cached-state dimming is one)", marked `{inferred: aggregate}`. Drop "in Agent
   Board's shape".
2. **M — Implications, Compose (L288–290).** "The generic stack documents every
   piece except the glyph-plus-rename arrangement" is a universal that the
   parent's own gaps contradict. Gap 1 covers phone-width legibility of the
   status line, gap 2 covers title display on the phone, and gap 4 covers the
   acknowledgement substitute. Remedy: list what is documented (persistence,
   transport, notification escapes) and what is undocumented (the glyph and
   rename arrangement, phone legibility, an acknowledgement substitute).
3. **M — Topology, "an obvious alternate projection target" (L269–271).**
   "Obvious" is evaluative and tilts toward a tmux-adapter seam. Remedy: use
   "one alternate projection target".
4. **n — Cross-cutting 5 heading "…is common" (L216) and key finding 5 "the
   common multiplexer-family mechanism" (L15).** Both rest on two instances.
   Moshi is the phone client, not a multiplexer supervisor. tmux-webui is
   phone-first and is not documented as *verifying* the prompt; it parses a
   displayed menu [rps-tmux-webui-deck-doc]{2}. Remedy: write "Key injection
   recurs (Moshi with re-capture verification; tmux-webui behind parsed
   buttons)", mark it `{inferred: aggregate}`, and drop "multiplexer-family"
   from key finding 5.
5. **n — Cross-cutting 6, "usually user-operated" (L221).** This is an unmarked
   aggregate. It also omits the Codex vendor relay ("secure relay layer"
   [rps-codex-remote-connections-docs]{7}) and leaves Happy uncited in the
   relay clause. Remedy: add the marker and the two citations
   ([rps-happy-server-readme]{3}).
6. **n — "nearest" rankings (L12, L188, L205, L301).** "Nearest" is a composed
   ranking. Key finding 2 already says "both inferred". Remedy: carry
   `{inferred: comparison}` in the table cell and in cross-cutting 3 too.

## (c) Coherence read for smoothed contradictions

1. **M — iOS backgrounding (L229–230) against the Moshi vendor claim.**
   [rps-moshi-marketing]{2} claims both Blink and Moshi keep "a shell alive while
   the phone sleeps". [rps-blink-notifications]{4} says "the system can kill the
   remote connection after some time", and Termius says activity stops within
   20–30 s [rps-termius-ios-background]{1}. The failure-modes bullet states only
   one side, and the Contradictions table has no row for it. Remedy: add a
   `tension` row (moshi-marketing{2} vs blink{4} and termius{1}) with
   `{ambiguous: mosh client state vs app-process lifetime}`. Moshi's own sessions
   page, where a killed app reconnects and reattaches [rps-moshi-docs-sessions]{4},
   is the bridging passage.
2. **M — tmux-webui auth (L247–248).** The failure-modes bullet states "no
   authentication in LAN mode" as fact. Contradictions row 6 (L326) records that
   the README instead describes a token gate [rps-tmux-webui-readme]{7}. Remedy:
   make the bullet say "one tmux-webui doc says LAN mode has no authentication;
   the README describes a token gate (see Contradictions)".
3. **M — Reboot boundary (L200–203, key finding 1 at L11).** No source restores a
   live process, but three attested sources qualify the "manual relaunch" picture
   and are neither cited nor recorded:
   - tmux-continuum documents automatic restore on server start
     [rps-tmux-continuum]{1}{3}.
   - Happy claims "every conversation and subagent survives … a restart"
     [rps-happy-welcome-docs]{1}. Claude cloud does not restore subagents
     [rps-claude-code-web-docs]{8}.
   - Omnara's Postgres record lets "any worker … pick an agent back up after a
     crash or restart" [rps-omnara-readme]{3}, using its own agent loop.

   Remedy: add these to the reboot row and to pattern 2 as `qualifies`, with
   `{confidence: search-summary}` on Happy. Reword key finding 1 from "no surveyed
   tool keeps" to "no fetched source documents keeping", to match L36–39 and
   L200.
4. **n — Contradictions row 1 (L321).** The docs side cites plain detach
   [rps-herdr-persistence-remote-docs]{1}. #5170 concerns `herdr --remote`, where
   "the remote server owns running panes" {4}. Remedy: cite {4} (and {2}, SIGHUP)
   on the docs side. Consider citing the reporter's "user linger on" from
   [rps-herdr-issues]{2} under the ambiguity pointer.
5. **n — Table, persistence row, multiplexer cell (L185).** "Yes while the host
   server lives" sits beside an open tension (#5170). Remedy: add "(see Herdr
   #5170 tension)".

## (d) Noise domination and relevance weighting

1. **M — Acknowledgement "was not researched" (L276; gap 4 at L341–344).** The
   attestations hold evidence on acknowledgement that the parent ignores:
   - agent-deck distinguishes waiting ("stopped and unacknowledged") from idle
     ("stopped and acknowledged") [rps-agent-deck-tui-reference]{1}, and a key
     marks a session unread {4}.
   - Herdr: "a done agent stays visible until viewed" [rps-herdr-agents-currency-docs]{2}.
   - ccmux has an unread state [rps-ccmux-readme]{3}.
   - Remote Control skips pushes while the user is focused on the connected
     terminal [rps-claude-remote-control-docs]{11}.

   The architecture lens also already has an explicit `agent-board ack` fallback
   (docs/ARCHITECTURE.md L21, L196). Remedy: replace "not researched" with a short
   lensed comparison of these mechanisms, and narrow gap 4 to "a focus-equivalent
   *automatic* signal on the host or phone".
2. **M — Zellij separation "would need a plugin" (L115–117).**
   [rps-zellij-cli-actions]{1}{2}{3} documents `zellij action rename-tab --tab-id`
   and `rename-tab-by-id`, so an external process can rename tabs without a
   plugin. The parent cites only the plugin API. The specialist brief (diy L50)
   had this. Remedy: write "separation would need an external owner (a plugin via
   `rename_tab_with_id`, or a process via `zellij action rename-tab-by-id`) that
   re-composes glyph and label, because a tab holds one name string", and cite
   both.
3. **M — Naming mechanics omit Claude's own title and process-name writes
   (L107–117, pattern 4 at L210–215).**
   - [rps-claude-issue-process-title]{1}: Claude Code sets `process.title` to its
     version, so tmux `automatic-rename` shows e.g. `2.1.112` as the window name.
     The issue was closed not planned [rps-claude-issue-process-title]{2}.
   - Cite-through: tmux-webui's doc attributes to Claude that it "sets the
     terminal title to <braille-spinner> while working and a star glyph while
     idle" [rps-tmux-webui-deck-doc]{4}.

   This is the one documented provider-side glyph in a title. It is not in a
   *name* and is not rename-preserving, so the parent's absence claim stands. But
   (i) a fair four-lane statement has to name it as the nearest provider-side
   mechanism. Remedy: add it to the naming mechanics, to cross-cutting 3 and to
   the provider-native glyph cell, in cite-through form ("tmux-webui attributes
   to Claude Code…").
4. **M — Missing failure mode: macOS host daemons lose Keychain.** When the
   Herdr server is started via SSH or a background job, Keychain-backed tools in
   panes fail [rps-herdr-troubleshooting-docs]{2}. An older macOS server that
   survives logout loses user lookup and DNS {3}. Happy's macOS LaunchAgent
   cannot reach the Keychain, so Claude authentication fails with 401
   [rps-happy-cli-readme]{5}. This bears directly on the always-on macOS host
   case and on Topology "What transits" (provider auth on a host-launched
   process). Remedy: add a failure-modes bullet, and add a Topology note marked
   `{inferred}`.
5. **M — Migrate bullet (L292–296) cites only Herdr's defects.** agent-deck has
   attested defects on exactly the phone path the bullet credits:
   - On iPhone Safari over Tailscale the web terminal ignores taps
     [rps-agent-deck-issues]{3}, unverified.
   - Remote rows carry only coarse status [rps-agent-deck-tui-reference]{3} and
     [rps-agent-deck-readme]{10}.
   - Hook drift [rps-agent-deck-issues]{1}{2}.

   Remedy: state the agent-deck limits alongside Herdr's, for symmetry (see (iii)
   in Priority notes).
6. **n — Cross-cutting 3 (L206–207) cites agent-deck's "separate tmux status
   bar" [rps-agent-deck-readme]{5}.** That is a waiting-notification bar. The
   closer analog is the TUI glyph column [rps-agent-deck-tui-reference]{1} beside
   a title that can be locked against sync [rps-agent-deck-readme]{3}. Remedy:
   cite those.
7. **n — Moshi Jump To lists tmux sessions and windows
   ([rps-moshi-docs-multiplexer]{5}; tip "use short session and window names"
   [rps-moshi-docs-sessions]{7}).** This is a phone-visible path for window
   *names* that pattern 4 does not mention. It cuts against the user-option
   separation: a glyph kept out of the name would not appear in that list.
   Remedy: add an `{inferred: tension}` sentence to pattern 4 and Topology.
   Consider adding it to gap 1.
8. **n — Codex desktop SSH hosts.** The desktop app can run chats on an SSH host
   [rps-codex-remote-connections-docs]{6}{7}. That is a documented remote-host
   topology the provider section leaves out. Remedy: add one sentence to the Codex
   desktop bullet (L143–147), with `{confidence: search-summary}`.
9. **n — Codex CLI "no fetched page ties these to a phone path" (L151–152).**
   [rps-codex-remote-connections-docs]{9}, "mobile setup can't be set up from the
   Codex CLI", is the relevant disconfirming passage. Remedy: cite it.

## (e) Quote-context walk

1. **M — agent-deck "occasionally wrong" (L64–66).** The parent writes "pane
   reading otherwise is described as 'occasionally wrong'", in a Codex sentence.
   In [rps-agent-deck-readme]{8} that quote is about **pi's** fallback. For Codex
   without the hook, the README says turn status "cannot converge reliably".
   Remedy: "Codex status uses its notify hook; without it, turn-level status
   'cannot converge reliably'; for pi, pane reading is 'slower and occasionally
   wrong'".
2. **n — Blink "can kill … after some time" becomes "ends" (L229–230).** Blink
   also documents the `geo` workaround [rps-blink-notifications]{4}. Remedy:
   "iOS can end backgrounded phone sessions (Blink: after some time, `geo`
   mitigates; Termius: 20–30 s)".
3. **n — Moshi "only sessions and windows for tmux" (L105).** The source wording
   is that the page *describes* only sessions and windows. That is an absence of
   description, not a documented restriction. Remedy: "the page describes only
   sessions and windows for tmux".
4. **n — Failure modes, agent-deck "stale running status" (L244–246).** #2896
   concerns a **pi** conductor [rps-agent-deck-issues]{1}, not Claude or Codex.
   Remedy: name the agent.

## (f) Analytical-tier inheritance walk

The lint reports no `intra-program-resolved` handle, and the parent cites no brief
or prior synthesis as a source. ARCHITECTURE.md is declared as a lens (L255–257).
Residual items:

1. **n — "sidebar rollup" (L57, L207).** The word "sidebar" does not appear in
   [rps-herdr-agents-currency-docs]{2}. It came from the mux brief (L21). Remedy:
   say "pane/tab/workspace rollup", or attest the sidebar wording.
2. **n — Disconfirming "Every lane reported…" (L300–301).** This uses the briefs
   as evidence. It is accurate as a process note (all four briefs say so), but it
   should be framed as such, or grounded in the attestation absences directly.
3. **n — Topology lens accuracy (L265–268).** "Provider adapters … would run on
   the always-on host unchanged in kind" overstates the lens. Per ARCHITECTURE.md
   (L89, L169) the managed launcher first resolves the focused Ghostty
   window/tab/terminal and fails without it. Only the observer and hook halves
   transit as they are. Remedy: separate launcher identity resolution, which does
   not transit, from observation, which does.

## (g) Line-reference walk

1. **n — ccmux {5} → {9}** (see a.7).
2. **n — "macOS Automation" (L259–260)** cites [ghostty-applescript]{1}{2}. TCC
   Automation is {5}. Remedy: add {5}. The ghostty-applescript attestation numbers
   its key passages `1.`, not `- [N]`. That is a format drift from the deployment
   convention; the lint resolved it anyway.
3. **n — tmux-webui "key sends behind parsed menu buttons"** cites deck-doc{2}.
   Key sends are in {1}. Remedy: cite {1}{2}.
4. **n — Remote Control "native dialogs" (L191, L220)** cites RC{14}, which says
   prompts stay open until answered. The "actions required" push is {11}.
   Acceptable; consider adding {11}.

The remaining herdr-session-docs line ranges ({3} 89–107, {4} 112–145) and the
tmux-manual line citations match their passages.

## (h) Thin-attestation check (semantic)

1. **M — Per-claim confidence markers on reduced substrate.** rps-codex-cloud-docs,
   rps-codex-remote-connections-docs, rps-claude-code-web-docs,
   rps-claude-mobile-docs, rps-codex-developer-commands-remote and
   rps-happy-welcome-docs carry `substrate_confidence: search-summary`. The parent
   puts one blanket `{confidence: tool-extract}` in the Scope section (L36–39) and
   none at the claims. Key finding 4, the provider-native table cells, L140–152
   and the Contradictions row 5 sides all lean on these pages. Remedy: add
   `{confidence: search-summary}`, the label the attestations use, at each
   load-bearing provider claim, especially absences.
2. **n — rps-codex-cloud-docs {7}** is a passage recording what the extract does
   *not* contain. Citing it for "not in the extract" is honest, but on its own it
   cannot support any provider-wide absence. Remedy: keep the citation, and do
   not let it underwrite "online dot only" or "No" cells for Codex.

No substantively thin source-direct attestation was found among those the parent
cites.

## Priority notes on the operator's specific checks

- **(i) Glyph-in-name absence across four lanes.** It is fair as stated, narrowly:
  all four briefs and the attestations agree that no source documents a glyph in
  a *name* that survives rename. Two things need adding: the provider-side title
  glyph and `process.title` evidence (d.3), and the agent-deck TUI glyph column
  with title lock as an analog (d.6). Without them the "gap" framing (L204)
  understates how near the field comes.
- **(ii) Table overgeneralisation.** This is confirmed on the approval (a.1), host
  reboot (a.5), both-vendors (a.6) and provider glyph (a.4) cells.
- **(iii) Implications neutrality.** It leaks. The Build bullet carries an
  unmarked comparative advantage that contradicts key finding 3 (b.1). Compose is
  over-credited with "every piece" (b.2). Migrate lists only Herdr's defects
  (d.5). The section has no `{inferred}` marker even though the whole of it is
  composed. Remedy: give it a blanket marker like Topology's ("every claim here is
  {inferred: synthesis}"), and fix b.1, b.2 and d.5.
- **(iv) {inferred} coverage.** Markers are missing at key findings 3, 5, 6 (second
  clause) and 8; at cross-cutting 2, 5 and 6; at the whole Implications section;
  at the uncited table cells (Status authority, Both Codex and Claude, Phone path
  for the generic and phone-first columns); and at the absence claims (claude-squad
  remote, agent-unaware terminals).
- **(v) Contradictions typing.** Row 5, Codex host against Codex cloud, is
  mis-typed `incommensurable`. The two claims are stated in a shared frame (does
  work continue while the computer sleeps?). They concern different systems, so
  they do not diverge on one claim at all. Labelling them incommensurable
  "performs" an incommensurability that is not there. Remedy: delete the row and
  keep the topology distinction in the body, or re-type it `qualifies`. Row 7 is
  mis-typed `contradicts` and over-attributed (a.2). Row 4 is a single-source
  internal qualification and better belongs in body prose (nit). A `tension` row
  is missing for iOS backgrounding (c.1).
- **(vi) Citations that do not support the claim.** a.2 (purplemux{3}), a.3
  (claude-mobile{1}), a.8 (claude-squad{4}), e.1 (agent-deck{8}), g.1 to g.3.

## Disposition notes (not required)

- #5471 might plausibly apply to a backgrounded iOS SSH client as a stalled
  reader. That is an inference no source states. If it is added, it belongs as
  `{inferred}` in gap 3, not as a finding.
- The four lint pattern flags are all benign. The parent's two (L242 version
  number; L248 VibeTunnel no-auth) are both cited, and the specialist flags sit
  outside the parent.

## Verdict

**NEEDS-REVISION.** The material items are a.1–a.6, b.1–b.3, c.1–c.3, d.1–d.5,
e.1 and h.1. Nits may be batched. A correction pass is enough: none of these
reverses the landscape's positions, so the parent can be fixed in place with a
revisions log. Re-run the lint after editing.

## Re-check on snapshot 5ae2dded

Assessed snapshot: `parent.md` sha256 `5ae2ddedd22e98a0883ab9127417c2202083df626f23a8c6a4759319157352a6`.
Mechanical input: lint 261 resolved, 0 broken, 0 thin, 0 pattern flags.
Line references below are to this snapshot. Scope is the revision only:
(A) the disposition of each prior finding, and (B) a walk of new or changed
claims against their cited passages. Text that was unchanged and already
approved was not re-assessed.

### (A) Prior findings against the new parent

| # | Sev | Status | Where / residual |
|---|---|---|---|
| a.1 | M | RESOLVED | L248: multiplexer cell reads "Key delivery (Herdr controller) {7}; others not documented"; Moshi moved to the generic-stack cell. |
| a.2 | M | RESOLVED | L469: retyped `qualifies`; purplemux dropped; RC{4}{12}{13} on the vendor side. Nit: the note says CloudCLI gives "a roughly 10-minute timeout" but drops its "without a network connection" qualifier ([rps-claudecodeui-readme]{5}), so it reads as if CloudCLI and Anthropic disagree on what triggers the limit. The real qualification is mode: interactive versus server. |
| a.3 | M | RESOLVED | L442-446: Codex passage added; `{inferred: aggregate}` marker present. |
| a.4 | M | RESOLVED | L245: "coarse list state" cites RC{5}, codex-cloud{3} and mobile{7}. |
| a.5 | M | RESOLVED | L242: cells now name products; the provider cell reads "Not documented for host modes"; phone-first cites Happy and tmux-webui. Nit: Codirigent's session resume ([rps-codirigent-readme]{3}) is still folded into "others not documented". |
| a.6 | M | RESOLVED | L247: tmai and the zellij plugin are cited as Claude only. |
| a.7 | n | RESOLVED | L81: ccmux{9}. |
| a.8 | n | PARTIAL | L85-86: now reads "its README documents no remote path", but it still cites {4} (the key menu) and does not add [rps-claude-squad-issues]{1}. |
| a.9 | n | PARTIAL | L223-225: now reads "READMEs describe web terminals with no agent awareness", which is still an absence claim with no marker. |
| b.1 | M | RESOLVED | L412-419: comparative removed. Nit: "which several third-party tools approximate with hooks" still casts Agent Board as the reference standard, although Agent Board's own Claude adapter is hook-based too. "Also derive from hooks" would be neutral. |
| b.2 | M | RESOLVED | L420-426: exists, undocumented and risk entries are now listed. |
| b.3 | M | RESOLVED | L396-397: "a candidate projection target". |
| b.4 | n | RESOLVED | KF5 (L15) no longer says "multiplexer-family"; pattern 5 (L308-313) carries the aggregate marker. The heading's "common" is a residual nit. |
| b.5 | n | PARTIAL | L314-320: the marker is added and Happy is cited. The Codex "secure relay layer" ([rps-codex-remote-connections-docs]{7}) is still missing from the vendor-channel clause. |
| b.6 | n | PARTIAL | "nearest" is still unmarked at KF2 (L12), the table (L245) and Disconfirming (L439). |
| c.1 | M | RESOLVED | L331-335 and the L470 `tension` row. Nit: the bridging passage [rps-moshi-docs-sessions]{4} is not cited. |
| c.2 | M | RESOLVED | L366-367: "own pages disagree" points to Contradictions. |
| c.3 | M | RESOLVED | KF1 (L11) reworded; pattern 2 (L282-289) adds continuum, Happy (unverified) and Omnara. |
| c.4 | n | OPEN | L465: the docs side still cites persistence-remote{1} (plain detach). #5170 concerns `--remote`, which is {4}. |
| c.5 | n | OPEN | L241: no "(see #5170 tension)" on the persistence cell. |
| d.1 | M | RESOLVED | "Not researched" removed; pattern 7 (L321-327) added; gap 4 (L492-494) narrowed. The Implications section reintroduces the over-broad absence; see B.2. |
| d.2 | M | RESOLVED | L139-145 and L456-459: the zellij CLI by-id rename is cited, and the plugin requirement is confined to user-rename preservation. |
| d.3 | M | PARTIAL | Content added at L146-150, L294-297 and KF2. The cite-through form is kept only at L148-150; KF2 and pattern 3 drop it (B.1). The provider-native glyph cell is unchanged (nit). |
| d.4 | M | RESOLVED | L360-365: failure-mode bullet. Nit: no Topology note on provider auth for a host-launched process. |
| d.5 | M | RESOLVED | L427-433: agent-deck limits sit beside Herdr's, with the coverage caveat. |
| d.6 | n | RESOLVED | L291-293: cites tui-reference{1} and readme{3}. |
| d.7 | n | RESOLVED | L301-307: pattern 4 conditional. |
| d.8 | n | RESOLVED | L188-192: SSH-host sentence. |
| d.9 | n | OPEN | L195-199: [rps-codex-remote-connections-docs]{9} ("mobile setup can't be set up from the Codex CLI") is still uncited. It sits in tension with `pair` ([rps-codex-developer-commands-remote]{1}). |
| e.1 | M | RESOLVED | L73-76: Codex and pi quotes are now separated correctly. |
| e.2 | n | PARTIAL | The verb is "can kill" (L115, L331), but the `geo` mitigation is still omitted. |
| e.3 | n | RESOLVED | L121-123. |
| e.4 | n | RESOLVED | L355-356: "a pi session". |
| f.1 | n | RESOLVED | L62: "pane, tab, and workspace". |
| f.2 | n | RESOLVED | The "Every lane reported" bullet is removed. |
| f.3 | n | RESOLVED | L381-388: identity resolution (does not transit) is separated from observation (transits). |
| g.1 | n | RESOLVED | |
| g.2 | n | RESOLVED | L380: applescript{5}. |
| g.3 | n | RESOLVED | L207-208, L266: deck-doc{1}{2}. |
| g.4 | n | RESOLVED | L168-171: RC{11} cited for push. |
| h.1 | M | RESOLVED | L41-44 scope statement, plus per-bullet `{confidence: search-summary}` at L179, L183, L194, L199 and L220. Residual nit: KF4 and the provider table cells carry no marker. |
| h.2 | n | PARTIAL | KF4 (L14, "No provider-native surface supervises both") and the L247 provider cell ("No") are still flat negatives on search-summary substrate. The body's L445-446 wording ("no fetched provider page describes…") is the correct form. |
| (iv) | - | PARTIAL | Body markers were added throughout. Frontmatter KF3, KF6 (second clause) and KF8 are still unmarked composed claims (nit). |
| (v) | - | RESOLVED | Codex host-versus-cloud moved to prose (L476-478); the RC within-source qualification moved to prose; iOS `tension` row added. |

All 20 prior material items are RESOLVED, except d.3, which is PARTIAL because
of B.1.

### (B) New or changed claims walked

**Title mechanics (L124-145).** tmux{4} (rename-window disables
automatic-rename), {3}{5} (windows have no title; OSC 0/2 set it), {6}
(set-titles, off by default), {11}, {2}, {7} and {15}; zellij-cli{1}{2};
zellij-plugin-api{3}. All support the claims. The two `{inferred}` blocks are
correctly marked. Nit: "forwards a title to the outer terminal only when
`set-titles` is on" is slightly strong, because `allow-passthrough` {11} can
also carry an OSC title through. The next clause partly covers this.

**Provider-side title writers (L146-150).** process-title{1} supports the
claim, and the cite-through form for deck-doc{4} is correct. Nit: the issue
was closed not planned on v2.1.112 {2}, so currency on later Claude versions is
unverified.

**Approval guardrail (L250-272).** RC{14}, codex-remote{4}, approver{2},
moshi-multiplexer{2} ("verified the prompt is still the one the user saw"),
deck-doc{1}{2}, herdr-persistence{7} and herdr-cli{2} (prompt rejects an
already-blocked target) all support their claims. The section-level
`{inferred: synthesis}` covers "do not rely on keystrokes" and "safeguard, not
an approval API". No material error.

**Patterns 2-7 (L282-327).** Pattern 2: citations hold, Happy is flagged as
unverified, and the aggregate marker is present. Patterns 4, 5, 6 and 7:
citations hold (agent-deck tui{1}{4}, herdr-agents{2}, ccmux{3}, RC{11};
pattern 6's handles all verify). Pattern 3: see B.1.

**Failure modes (L329-370).** blink{3}{4}, termius{1}, moshi-marketing{2},
tmux{6}, process-title{1}, followup{1}{2}{4}{6}{7}{8},
agent-deck-issues{1}{2}{3}, herdr-troubleshooting{2}{3}, happy-cli{5},
vibetunnel{8}, approver{7} and codex-remote{7} all verify. No material error.

**Hybrid laptop case (L390-395), KF8.** tmux{6} and ghostty-osc2{1} verify.
Nits:
- ghostty-actions-title{1} is the `prompt_tab_title` passage. That
  `set_tab_title` is also an override is {3}, so cite {1}{3}.
- tmux `set-titles` emits OSC 0 (or terminfo tsl/fsl) to xterm-like terminals,
  while the Ghostty attestation covers OSC 2 only. "Can receive" therefore
  rests on unattested OSC 0 handling. This is acceptable inside the
  `{inferred}` section but worth a word.

**Implications (L406-433).** See B.2. Otherwise neutral and symmetric.

**Contradictions (L463-478).** Rows 5 and 6 are re-typed and verified; for row
5 see the a.2 nit. Nit: row 3 cites [rps-moshi-docs-tailscale]{3} (Tailscale
SSH grabs port 22), but "mosh cannot bootstrap through Tailscale SSH" is {4}.
Cite {3}{4}.

**Disconfirming (L435-459).** See B.3. The zellij and relay bullets verify.

**Scope (L36-44).** See B.4.

#### New material issues

- **B.1 — M. The cite-through form is dropped in KF2 (L12) and pattern 3
  (L294-297).**
  - KF2 asserts "Claude itself writes a spinner or star into its terminal
    title". Pattern 3 says "Claude's own title writing (spinner or star…)".
  - The only evidence is tmux-webui's doc attributing this to Claude
    ([rps-tmux-webui-deck-doc]{4}). L148-150 states it correctly as a
    cite-through.
  - Discipline §1 forbids extending a cite-through to an independent claim
    about the attributed party. KF2 is the most-read surface and is where the
    "nearest provider-side mechanism" rests.
  - Pattern 3 also folds the `process.title` version string into "status-like
    glyphs into the title". That string is a process name that tmux shows as
    the window *name*, and it is not status-like.
  - Remedy: KF2 should read "and tmux-webui's documentation attributes to
    Claude a spinner or star in its terminal title". Pattern 3 should read
    "tmux-webui attributes to Claude a spinner-or-star terminal title
    [deck-doc]{4}; separately, Claude's `process.title` version string surfaces
    as the tmux window name [process-title]{1}".
- **B.2 — M. Implications Build (L415-416) and Compose (L424) list "an
  acknowledgement signal without Ghostty focus" as undocumented.**
  - Build says "Undocumented anywhere"; Compose lists it among the
    undocumented items.
  - The parent's own pattern 7 (L321-327) documents several such signals:
    agent-deck's explicit unread mark {4}, Herdr's viewed-state {2}, and RC's
    focus-suppressed push {11}. Gap 4 (L492-494) frames the question as
    *which* of those fits.
  - Agent Board's locked architecture (the lens) already has the explicit
    `agent-board ack` fallback.
  - As written, the build and compose reader is told that a piece must be
    invented when the survey found analogs.
  - Remedy: replace it with "an automatic, focus-equivalent acknowledgement on
    a remote host or phone (explicit marks and viewed-state exist; pattern 7)".
- **B.3 — M. Disconfirming, host persistence (L447-449) cites
  [rps-agent-deck-issues]{1} as evidence that host persistence fails.**
  - #2896 reports a pi session showing a stale "running" status for four days:
    a status and supervision gap. Pane processes were not lost.
  - No agent-deck attestation documents a persistence failure.
  - The Migrate bullet (L431-432) characterizes agent-deck correctly as
    hook-drift, coarse remote status and iPhone web issues, so this bullet
    contradicts it and over-attributes to a migrate candidate.
  - Remedy: cite Herdr only for persistence failure (followup{1}{7}, and
    optionally {4} for #3324). Move agent-deck to a status-reliability clause,
    or drop it.
- **B.4 — M (provenance; low effort). Scope (L39-40): "the Herdr session and
  agents pages were re-read on 2026-10-26 and their cited substance was
  unchanged."**
  - The agents-page re-read is attested: rps-herdr-agents-currency-docs,
    fetched 2026-10-26, says so in its summary.
  - No 2026-10-26 attestation exists for the session-state page
    (herdr-session-docs, source https://herdr.dev/docs/session-state/,
    fetched 2026-08-20). rps-herdr-persistence-remote-docs is a different URL.
  - The currency claim underwrites the Herdr reboot facts (L55-56, L242,
    pattern 2), and the substrate does not record it.
  - Remedy, either of:
    - record the re-read in the attestation tier (a currency note or a new
      attestation carrying {3}{4} substance); or
    - narrow the sentence to "the agents page was re-read…", leaving
      herdr-session-docs at its 2026-08-20 date.

### Verdict

**NEEDS-REVISION.** Every prior material item is resolved except d.3, which is
partial, and the revision is substantively sound. Four new material items
remain: B.1 to B.4. Each is a one- or two-sentence correction in place, with no
change of position, and B.4 may instead be discharged by extending the
attestation tier. The open and partial nits listed in (A) may be batched with
them. Re-run the lint after editing. A further re-check can be limited to
B.1-B.4.

## Final confirmation on snapshot e2b7ddb7

Assessed file: `parent.md` as on disk at 2026-10-26 14:31. Its full sha256 is
`e817deb3a408f4330f1236abb6120fc2cf07b495968818e9b64bdcae4c5148a7`, not the
`e2b7ddb74f9a17ec…` prefix given in the dispatch. The file was modified at
14:30, so the dispatched hash probably predates a final edit. The orchestrator
should record the hash above, or re-confirm if the content it intended differs.
Mechanical input: 269 `[handle]{N}` citations (154 distinct) resolve to an
anchored passage, 0 broken. This matches the dispatched lint. Scope: B.1–B.4,
the four minor points from the 5ae2dded re-check, the new provider-coverage
citations, and the rewritten first approval-guardrail bullet. Nothing else was
re-assessed. Line references are to the assessed file.

| # | Status | Where / evidence |
|---|---|---|
| B.1 | RESOLVED | KF2 (L12) now reads "tmux-webui's documentation attributes to Claude a spinner or star". Pattern 3 (L303-308) keeps the cite-through to [rps-tmux-webui-deck-doc]{4}, and the conditional "would put" sits under `{inferred: convergence}`. The `process.title` version string is separated out as a window name with no status, per [rps-claude-issue-process-title]{1}. L152-154 is also in cite-through form. |
| B.2 | RESOLVED | Build (L428-430) and Compose (L437-438) now name "an automatic, focus-equivalent acknowledgement on a remote host or phone", and Build points to the pattern-7 explicit-mark and viewed-state analogs. Topology (L416-417) and gap 4 agree. |
| B.3 | RESOLVED | Disconfirming (L464-469) cites only Herdr (followup{1}{7}) for persistence failure. agent-deck #2896 ([rps-agent-deck-issues]{1}) is now described as "status-reliability faults rather than process loss", which matches the attestation. The coverage caveat is kept. |
| B.4 | RESOLVED | Scope (L39-42) now claims a 2026-10-26 re-read of the agents and integrations pages only, citing [rps-herdr-agents-currency-docs]{5}{6}. That attestation's summary records both URLs and the unchanged Claude and Codex screen-manifest authority. It also states that session-restore claims rest on the 2026-08-20 attestation, which matches `herdr-session-docs` `fetched: 2026-08-20`. |
| moshi-tailscale {4} | RESOLVED | Contradictions row 3 (L485) cites [rps-moshi-docs-tailscale]{3}{4}. {4} carries "mosh cannot bootstrap through Tailscale SSH". |
| OSC 0 vs OSC 2; ghostty-actions-title {1}{3} | RESOLVED | L401-408 says tmux emits OSC 0 for xterm-like terminals ([rps-tmux-manual]{6}: "`\e]0;...\007` if the terminal appears to be xterm"). It says the Ghostty attestation covers OSC 2 only, "so OSC 0 handling is assumed rather than attested". The override cites [ghostty-actions-title]{1}{3}: `prompt_tab_title` overrides, and an empty `set_tab_title` clears the override. |
| CloudCLI qualifier | RESOLVED | Row 5 (L487) restores "timing out after roughly 10 minutes without a network connection" ([rps-claudecodeui-readme]{5}). It frames the qualification as interactive versus server mode against RC{4}{12}{13}. `qualifies` is correct. |
| "approximate with hooks" | RESOLVED | Build (L425-427) now reads "agent-deck, ccmux, and purplemux also derive status from provider hooks", which is neutral. The body supports it with agent-deck{8}, ccmux{9} and purplemux{5}. Nit: "also" can be read as saying Agent Board's derivation is wholly hook-based, but its Codex path is the app-server observer. "Also use provider hooks" would be exact. Not material. |
| ccmux{1} | VERIFIED | Attestation: "built-in support for Claude Code, Codex, …". Supports L80-81. |
| agent-deck-readme{7} | VERIFIED | The Multi-Tool Support table lists Claude Code at Full and Codex with status detection. Supports "lists Claude Code and Codex among supported tools" (L72-73). |
| tmux-webui-readme{2} | VERIFIED | "Claude Code, Codex, and friends live in tmux panes". Supports L207-209. Nit: [rps-tmux-webui-deck-doc] structural notes say its state rules are described for Claude, with Codex rules undescribed. The "Both Codex and Claude" cell (L252) is accurate for pane support, but Codex state inference by tmux-webui is not documented. A parenthetical would make this exact. Not material. |
| happy-readme{5} | VERIFIED | The repository table lists a mobile app (iOS, Android, web), the CLI and the relay. Supports the Phone-path cell (L249) "Happy's native app, or browser". Nit (pointer granularity): this is not a provider-coverage citation. Happy's Claude-and-Codex coverage rests on L218 "wraps Claude Code or Codex [rps-happy-cli-readme]{1}", and {1} names only Claude Code. Codex is in the same attestation's {2} (`happy codex`) and summary, and in [rps-happy-readme]{1}{6}. The claim is true against source. Re-point to {1}{2}, or add happy-readme{6}. Not material. |
| Approval guardrail, first bullet | RESOLVED | L260-264: "Native provider approval (Claude Remote Control's forwarded prompts; ChatGPT mobile's documented command approval, form not stated)". RC{14} supports permission prompts as forwarded dialogs that stay open until answered. codex-remote{4} supports "approve commands and other actions". "Form not stated" and `{confidence: search-summary for Codex}` keep the Codex half from implying a dialog form the extract does not carry. "Rather than keystrokes" for Codex is composed and is covered by the section-level `{inferred: synthesis}`. No material error. |

### Verdict

**APPROVED.** B.1–B.4 and all four minor points are resolved. The new
provider-coverage citations and the rewritten guardrail bullet verify against
their attestations. No material item remains open. Three optional nits may be
batched:
- the Happy Codex pointer ({1} → {1}{2});
- the tmux-webui Codex-state parenthetical;
- "also derive" → "also use".

Earlier open or partial nits from the 5ae2dded table were outside this scope
and were not re-assessed. One provenance note: the assessed file's hash
differs from the dispatched snapshot prefix; see above.

## Engagement verification record (orchestrator)

- **Outputs:** `parent.md` (final sha256 `a04d94e3e7e5e667`), four
  `specialists/*.md`, `acquisitions.md`, `campaign-evaluation.md`.
- **Rigor:** `standard`; multi-path reachability adds `evaluate`. Gates run:
  lint, adversarial-read, evaluate, lead spot-check.
- **lint:** final `parent.md` 270 resolved, 0 broken, 0 thin, 0 pattern
  flags; specialists 170/130/125/75 resolved, 0 broken, 0 thin (2 advisory
  flags in `provider-native-remote.md`: a named-feature flag on a cited
  sentence and a version token in a source title). This checklist itself
  carries shorthand handle references that lint reports as broken; it is a
  verification record, not a citing synthesis.
- **adversarial-read:** NEEDS-REVISION on `67e55e73` → correction →
  NEEDS-REVISION (B.1–B.4) on `5ae2dded` → correction → APPROVED on the
  assessed file `e817deb3`, which differs from the dispatched `e2b7ddb7` by a
  revisions-log entry only. Three optional nits were then applied to produce
  `a04d94e3` (Happy citation re-point, "also use provider hooks", tmux-webui
  Claude-only state-rule qualifier); none changes a claim's position, and each
  was verified by the lead against its attestation.
- **evaluate (isolated):** NEEDS-REVISION on `67e55e73` → correction →
  NEEDS-REVISION with a minimum fix set on `5ae2dded`, stated as approvable on
  spot-check → fix set applied and lead-verified (cite-through restored at
  key finding 2 and pattern 3; Codex and Claude coverage cited for ccmux,
  agent-deck, and tmux-webui; extract-based table cells marked).
- **spot-check (lead):** 19 load-bearing citations sampled across the
  Herdr, Moshi, tmux, zellij, provider, and phone-first claims matched their
  passages; final fixes re-verified against `rps-happy-cli-readme`,
  `rps-ccmux-readme`, `rps-agent-deck-readme`, `rps-tmux-webui-readme`,
  `rps-claudecodeui-readme`. No open material finding.
- **Outcome:** all required gates satisfied; engagement complete.
