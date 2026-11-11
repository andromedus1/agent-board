# Verification checklist

- Date: 2026-11-10
- Gate: `adversarial-read` (fresh context)
- Input: `parent.md` (registration `dispatch.md`; specialists `herdr-ecosystem`, `herdr-core-line`, `android-access`, `mac-mini-headless-host`)
- discipline-sha256: 6408290171aaeefdf82fd3277d01558ce2b811665c427024286dbeb0f66ebbae
- Lint, re-run, URL probes skipped: 158 resolved, 0 broken, 0 thin, 12 pattern flags (version numbers, two `only` superlatives, one false effort-estimate hit on the maturity row). The two `only` flags are covered under findings M2 and (b) below.

**Verdict: NEEDS-REVISION.** Two high findings: a retirement premise that its own cited attestation contradicts, and a quoted passage that no attestation contains. Nine medium findings mostly concern composed claims stated as fact, or contradictions and qualifiers that the specialist briefs record but parent.md drops.

Each finding gives the parent line, the attestation passage, and the proposed fix. Severity: H = high, M = medium, L = low.

---

## (a) Semantic citation-chain walk

### H1. "No API to set an agent's status" in Herdr TUI is contradicted by the cited attestation

- Parent §2 (L220–223): "In the TUI there is no API to set an agent's status: the event API subscribes to changes [hma-herdr-tui-agents-notify-docs]{11}, and the control surface is keys and text [hma-herdr-tui-agents-notify-docs]{12}." Disconfirming (L375–376): "Sought a TUI API that accepts external status: none in the method list read [hma-herdr-tui-agents-notify-docs]{12}." The same premise underlies Bottom line #4 ("the observation half has no place to land in the TUI").
- The same attestation says the opposite:
  - `hma-herdr-tui-agents-notify-docs`{1}: OpenCode, Pi, Kimi and Kilo are annotated "also reports state"; the "Supported by the agent" agents "report their own state".
  - `hma-herdr-tui-agents-notify-docs`{2}: "When an integration also reports state, Herdr uses those reports instead of reading the screen. For agents that support Herdr, the agent's own reports decide the state."
  - Passage {12} only says "No structured **approve/deny decision** method appears in the fetched pages". It does not list the socket methods and does not say that no status-reporting call exists. The citation stretches an approval-method absence into a status-API absence.
- Other attestations agree: `herdr-integrations-docs`{3} ("a custom agent with lifecycle hooks can report `working`, `idle`, and `blocked` using a stable source, optional ordered sequence number, and release-on-exit behavior") and `herdr-agents-docs`{8} ("the custom-integration route can report lifecycle state without native support"). One attestation qualifies it: `herdr-agents-docs`{3} ("a pane has one authority ... session integrations intentionally do not become lifecycle authorities because their hooks can miss transitions"). `herdr-source-repo`{4} lists the full-lifecycle hook authorities, and Claude and Codex are not among them. All three are from 2026-08-20 and need the dispatch's currency check before they are cited.
- Fix: rewrite the §2 paragraph and the disconfirming bullet. Suggested wording: "Herdr TUI documents a lifecycle-report path for agents and custom integrations that report their own state [hma-herdr-tui-agents-notify-docs]{1}[hma-herdr-tui-agents-notify-docs]{2}. For Claude Code and Codex, the screen manifest is the status authority and the official hooks report identity only [hma-herdr-tui-agents-notify-docs]{3}. Whether an external reporter can override the manifest for these two agents is not documented in the pages read." Then restate the retirement inference on that weaker footing, with an {inferred} marker on Bottom line #4. The retirement conclusion can stand as composed judgment, but its stated reason is false. Optional enrichment: re-fetch the TUI integrations page ("Integrate your own agent") under an `hma-` handle and record the reporting protocol and its authority rules.

### H2. The quote "After a client attaches" appears in no attestation (read-but-not-attested)

- Parent §1 (L96–98): "eligible panes resume "After a client attaches" [hma-herdr-tui-session-state-docs]{5}, so after a reboot the operator must connect once before agents come back {inferred: composed from the two passages}." The same claim drives §5 step 6 ("confirm resume after attaching") and §6 ("resume waits for a client attach").
- `hma-herdr-tui-session-state-docs`{5} reads: "enabled by default (`[session] resume_agents_on_restore`); Herdr resumes panes that reported a session reference 'through a current official Herdr integration'; table lists Claude Code (integration version 6 ...) and Codex (version 5 ...)". It says nothing about a client attach. A grep of the whole attestation directory for "client attaches" finds nothing. The phrase exists only in the `herdr-ecosystem` brief (Q2) and in `acquisitions.md`.
- Fix (discipline §8, correct toward the substrate): re-fetch https://herdr.dev/tui/docs/session-state/ (or wherever the sentence lives), add the passage verbatim to `hma-herdr-tui-session-state-docs` as a new numbered passage, and re-point the citation. If the sentence cannot be found, drop the quote, mark "agents resume only after an attach" as unknown, and change §5 step 6 and §6 to "test whether resume needs an attach".

### M1. "Tailnet not up before unlock" is stated as fact in the Bottom line and key_findings; its stated premise is unattested, and a better source goes uncited

- Bottom line #2 (L48–49): "its SSH unlock happens before Tailscale runs". key_findings #4: "Tailscale's daemon cannot be running before that unlock". Summary: "that unlock is reachable only on the home LAN". Only §1 (L175–177) marks this {inferred}.
- §1's stated premise ("the daemon's plist lives on the locked volume") rests on `hma-host-tailscale-tailscaled-wiki`{2}. That passage gives only the path `/Library/LaunchDaemons/com.tailscale.tailscaled.plist`. No attestation says which volume that path sits on, or that it is unavailable before unlock.
- Better attestations, uncited by parent:
  - `hma-host-geerling-filevault-ssh`{1}: SSH in "pre user login, then enter an Administrator's account password to 'unlock' the machine and **complete the full boot**".
  - `hma-host-geerling-filevault-ssh`{5}: "FileVault encryption means the Mac won't fully boot until you log in".
  - `hma-host-apple-launchd-archive`{1}: system daemons in /Library/LaunchDaemons load after boot.
  - The mac-mini specialist's disconfirming analysis also notes that the wiki's "before any user has logged in" [hma-host-tailscale-tailscaled-wiki]{3} refers to user login, not to FileVault unlock.
- Fix: in Bottom line #2, key_findings #4 and the summary, add "{inferred: no source tests tailscaled with FileVault on}" or phrase it as "the sources indicate", and keep the reboot drill (step 3) as the test. In §1, ground the inference in geerling{1}{5} and launchd-archive{1} instead of the volume-layout premise. In the summary, change "reachable only on the home LAN" to "reachable through the home LAN, directly or through a LAN-side relay (untested)".

### M5. Reboot-resume claims leave out that a power cut is not covered

- Table row "Host reboot" (L75): "Layout back; Claude/Codex relaunched with native resume [hma-herdr-tui-session-state-docs]{5}". Attention table "Recovery" (L242) and Bottom line #1 ("the one that resumes agent conversations after a reboot"). The parent's own recovery scenario is a power cut (Bottom line #2, §6).
- `hma-herdr-tui-session-state-docs`{4}: the pre-shutdown save "does not cover forced shutdown, power loss"; snapshots are kept "at most one per 15 minutes". `hma-herdr-releases`{3}: on macOS, "Herdr saves before the system starts closing apps", which covers an OS restart, not a power cut; the power-cut fix only guarantees that a save file stays readable. The herdr-ecosystem brief (Q2 survival matrix) says "Whether a macOS power cut is covered is not documented."
- Fix: add to the table row, the Recovery row and §6: "after a power cut, restore uses the last periodic snapshot (≤1 per 15 min); macOS power-loss behaviour is not documented [hma-herdr-tui-session-state-docs]{4}[hma-herdr-releases]{3}". Add a power-pull (not `shutdown`) variant to §5 step 6.

### Other (a) checks that passed

- The TUI-vs-core table's status, states, phone, ecosystem and maturity cells match their passages: agents-notify {1}{3}{6}; core-readme {6}; core-docs-commands-skill {1}; core-claude-code-osc7501-issues {1}; core-codex-osc7501-issues {1}; core-site-mobile-privacy-faq {1}{6}{8}; core-issues-resume-recovery {4}; core-moshi-herdr-page-recheck {1}; herdr-projects-readme {1}{4}; herdr-releases {1}; herdr-open-issues {10}; core-changelog {1}; core-api-schema {1}.
- FileVault SSH unlock (deploy-filevault-intro{1}, security-filevault-managing{1}), autologin{1}, the variants table {2}{3}{5}, poweron-mini, the platform-support-updates restart passage, and the Claude and Codex credential passages all match.
- Moshi: the approval quote (multiplexer{2}), licensing{1}, the iOS-only list (article-android{2}), the Herdr picker (herdr{1}{2}), Agents view grouping (sidebar{2}), pricing{1}, subscription{2}, troubleshooting{3}, and e2ee{1}{2} all match.
- The issue summaries for #5749, #5624, #5634, #5471, #5170 and #5837/#5909 match `hma-herdr-open-issues`.

## (b) Claim shapes the lint missed

- **M9. Composed comparative that attested differences contradict.** §1 (L194–198): tmux + ccmux / agent-deck "do not offer anything the Herdr + Moshi pairing lacks for this operator {inferred: grid comparison}". Attested differences:
  - Both are hook-based for status: `hma-herdr-alternatives-currency`{2} (agent-deck: "Without the hook, turn-level running/waiting status cannot converge reliably") and {3} (ccmux hooks for "authoritative session matching"). Herdr TUI is screen-inferred for Claude and Codex (agents-notify{3}), and parent itself lists that as a guardrail gap.
  - Moshi integrates tmux as deeply as Herdr: `hma-android-moshi-docs-multiplexer`{1} ("Herdr and tmux get the deepest integration") and {4} (Herdr is at parity with tmux).
  - agent-deck also has a Telegram bridge and ntfy watchers (`hma-android-agent-deck-readme`{3}), so "generic SSH or their own web UI" is incomplete.
  - Fix: reframe as a trade. Example: "tmux + ccmux/agent-deck offer hook-based status, and Moshi supports tmux as fully as Herdr; Herdr TUI offers native agent resume after a reboot [hma-herdr-tui-session-state-docs]{5}. Which matters more is the operator's call {inferred}."
- **L4. Unmarked comparatives.**
  - §1 (L80): "herdr-core is the better long-term match for the ... guardrail". Add {inferred: from the status-source rows}.
  - Disconfirming (L366–367): "no core equivalent of #5170 in the sampled issues". Add {inferred: absence in a sample}, as the herdr-core-line brief does.
- **M2. Lint `only` flag at L51.** "This is the only variant that runs before login" matches variants{3}, but it is stated without the {ambiguous} that parent's own Contradictions section records. See (c).

## (c) Coherence read for smoothed contradictions

- **M2. The Bottom line and key_findings smooth two contradictions that the Contradictions section keeps open.**
  - Bottom line #3 (L50–52): "Use the open-source `tailscaled` daemon ... This is the only variant that runs before login. FileVault unlock and mosh both need ordinary OpenSSH." key_findings #5 makes the same flat claim.
  - Contradictions (L339–347) records `hma-host-tailscale-run-unattended`{3} ("macOS: The Tailscale client runs within the user login session. Running it as a standalone system daemon is not currently supported") as {ambiguous}.
  - It also records that mosh through Tailscale SSH is {contested}: `rps-blink-tailscale-mosh`{1}{3} enables Tailscale SSH and then runs mosh.
  - Fix: Bottom line #3 → "Of the three variants, only `tailscaled` is listed as running before login [variants]{3}; Tailscale's run-unattended KB disagrees without naming a variant (see Contradictions), so the reboot drill decides. FileVault unlock needs macOS Remote Login; Moshi's docs say mosh cannot bootstrap through Tailscale SSH (Blink disagrees), so keeping Tailscale SSH off avoids the question." Add a pointer to the ambiguity in key_findings #5.
- **M3. "Unnecessary in core" smooths over documented gaps in what the agents report.**
  - Bottom line #4 (L56): the observation half "is unnecessary in core, where the agents report state themselves". §2 (L223–225) repeats it.
  - §1 lists some gaps (probe miss, `--resume`). The herdr-core-line brief records more: backgrounding or agent view stops reporting (`hma-core-claude-code-osc7501-issues`{4}{5}), Codex holds `working` (`hma-core-codex-osc7501-issues`{3}), and Claude in tmux never reports ({1}).
  - Users already fill these gaps with hook→OSC 7501 shims (`hma-core-app-issue-537`{5}{6}). `hma-core-claude-code-osc7501-issues`{2} says: "Hooks cover most state changes, but Esc, rewound turns and cancelled dialogs fire no hook".
  - Fix: replace "unnecessary" with "in core, Claude Code and Codex report state themselves, with documented gaps that third-party hook-to-OSC-7501 shims already target [hma-core-app-issue-537]{6}; an Agent Board-style observer would be one more such shim {inferred}".
- **M6. Moshi's two state sources are presented as one "good ordering".**
  - Attention table (L236): "Good ordering in Herdr and Moshi". §2 row "Native (non-inferred) state ... Not available in TUI".
  - `hma-android-moshi-docs-multiplexer`{4}: Sidebar status comes from "Herdr's own agent awareness". `hma-android-moshi-docs-sidebar`{5}: in the Agents view, "Agent status comes from the agents' hooks".
  - The android-access brief notes that neither view shows a native-versus-inferred marker. So the phone can show hook-derived state (Agents view) next to screen-inferred state (Sidebar) for the same agent, with no marker telling them apart.
  - Fix: add to the attention table and the §2 "Native state" row: "Moshi's Agents view takes status from moshi-hook's agent hooks [sidebar]{5} while its Sidebar mirrors Herdr's screen inference [multiplexer]{4}; neither marks the source, and they can disagree {inferred}". This is also a partial answer to the "native state" gap and should be stated as one.
- **M7. The guardrail check states an absence as fact.**
  - §3 (L244): "no component carries approvals as structured decisions".
  - The android-access brief (disconfirming) marks {ambiguous: managed hook event list not enumerated}, because `hma-android-moshi-docs-hooks`{4} lists managed config files but not hook events.
  - Fix: "no component in the recommended stack **documents** structured approval carriage; Moshi's hook event list is not published, so a structured path cannot be excluded [hma-android-moshi-docs-hooks]{4}".
- **M4. A macOS server-survival qualifier and the SSH-start caveats are dropped.**
  - §1 (L93–94): "the server ignores SIGHUP and survives its launching shell [remote-docs]{9}[releases]{4}". §5 step 6: "start `herdr server` from SSH".
  - `hma-herdr-releases`{6}: master commit "fix: keep the macos server running when its terminal quits (#5236)", dated after v0.9.5 and "not in v0.9.5". The herdr-ecosystem brief Q1 records this.
  - `hma-herdr-tui-troubleshooting-docs`{2}: "Explicit herdr server launches retain their caller's context". {1}: if Keychain access fails for a server "started through SSH ... start Herdr again from a normal GUI terminal". A FileVault host with no autologin has no GUI session to restart from.
  - Fix: in §1, add "a master-only fix (#5236) for the macOS server stopping when its terminal quits is not in v0.9.5 [hma-herdr-releases]{6}". In §5 step 6, test that the server survives closing the SSH session, and note the caller-context caveat [troubleshooting]{2}. Add both to §6.
- **L9. The adoption condition in the registration is not yet met.**
  - dispatch.md `decision_relevance` makes adoption conditional on "usable Android notifications/approvals". Android approvals rest on vendor assertion plus one adverse review (`hma-android-moshi-play-listing`{8}).
  - The Bottom line says "The proposed shape holds" without that condition. §5 step 7 does test it.
  - Fix: add one clause to the Bottom line: "conditional on step 7's Android approval round trip".
- Contradictions that the briefs record and parent leaves out (low; not load-bearing, no fix needed beyond optional mention):
  - ConnectBot mosh (article vs Play).
  - Herdr narrow-screen fit (how-to-work{2} vs issue-3840{3}).
  - Claude Code native 7501 (#537 reporter vs commenter). The table's "after a ~2 s startup probe" settles this one.

## (d) Noise domination / relevance weighting

- **M8. Starting host services on a host with no GUI login.**
  - §5 step 7: "Install moshi-hook with Homebrew and `brew services` [hma-android-moshi-docs-hooks]{3}". §4 lists "[optional] wherdr service".
  - The same passage {3} says: "For headless macOS, if the Keychain is locked, run security unlock-keychain or pair with --store file". Parent omits this.
  - `hma-wherdr-docs`{2}: the installer "configures automatic startup: at login on macOS".
  - With FileVault on there is no automatic login (`hma-host-apple-autologin`{1}), and per-user agents load "When a user logs in" (`hma-host-apple-launchd-archive`{2}). The mac-mini brief Q2 concludes that a per-user LaunchAgent does not start after a reboot. No attestation says what `brew services` registers.
  - Fix: in step 7, add `moshi-hook pair --store file` [hooks]{3}. Add to the step 3/6 reboot drill: "confirm moshi-hook (and wherdr, if used) is running after a reboot with no GUI login". Add the wherdr login-start caveat to §4 and §6.
- **L3. Steps missing from the implementation sequence.**
  - Native resume requires sessions reported "through a current official Herdr integration" (`hma-herdr-tui-session-state-docs`{5}). Step 6 should include `herdr integration install claude` and `codex`.
  - Moshi's Herdr detection needs `herdr` on the non-interactive SSH PATH (`hma-android-moshi-docs-herdr`{6}). Step 7 should add it beside the mosh-server PATH fix.
- **L7. Vendor-churn risk not listed.** moshi-hook auto-updates every 6 hours and installs releases (`hma-android-moshi-docs-hook-settings`{4}). Add to §6 "Vendor churn".
- **L8. wherdr approval carriage can be stated more precisely.**
  - Disconfirming (L373–374): "wherdr's carriage is not stated at API level [hma-wherdr-docs]{8}".
  - {8} says closed-question shortcuts write text "exactly as Reply and typing would". That is documented text-into-pane carriage.
  - Fix: "wherdr documents its one-tap answers as text written into the pane [hma-wherdr-docs]{8}".
- Better-fit citations (low):
  - Label persistence across a restart: `hma-herdr-tui-agents-notify-docs`{8} says outright that the pages "do not state whether ... rename labels persist across a server restart". It fits better than session-state{3} (L235).
  - Pane survival on detach: remote-docs{9} fits better than {4} (L238).

## (e) Quote-context walk

- **L1. Misquotes.**
  - Attention table (L236): "idle is not authorization to approve an action". The source in `hma-herdr-tui-agents-notify-docs`{4} reads "idle status is not authorization to approve an action". Restore "status".
  - "deliberately strict" (L236) is quoted as source text, but it appears only in the attestation's own Summary paraphrase, not in a Key passage or the source. Remove the quotation marks, or quote {4}: "Herdr only marks blocked when the live bottom-buffer snapshot matches known visible approval, question, or permission UI".
- **L5. Overstated vendor response.**
  - §6 (L324–325): "(vendor disputes)". `hma-android-moshi-play-listing`{8}: the developer replied that "Approvals failing isn't expected" and explained the push path. That acknowledges an unexpected failure rather than disputing it.
  - Fix: "(vendor says this is not expected)". The Contradictions section's "Tension" wording is fine.
- Other quotes checked and passing: "stays invisible", "becomes unusable for a minute or more", "talks to herdr-core", "may not have access to interactive Keychain services", "While the app is open", "Use tab names", "currently experimental", "to one specific approval", "less tested", "a remote shell as your user", "does not guess from screen text", "unattended installs managed by experienced macOS system administrators", "may require a Mac restart", "cannot bootstrap through Tailscale SSH", "Both can coexist". The approval quote keeps the source's re-verification qualifier.

## (f) Analytical-tier inheritance walk

- No citation in parent.md resolves to an analytical-tier artifact; the lint reports no `intra-program-resolved` handles. The `remote-persistent-supervision` campaign is not cited.
- Agent Board facts (§2 capability list, Bottom line #4 "Ghostty half") are introduced as "from its architecture" / "from its repository". They match `docs/ARCHITECTURE.md`: managed launchers, Codex app-server, Claude hooks, a five-glyph projection with confidence, AppleScript tab titles, focus acknowledgement, and a doctor. They are not presented as research findings.
- Bottom line #4 carries no marker, while Bottom line #1 does. Add {inferred} or "composed" to #4 for symmetry. This is covered by the H1 fix.
- §4–§5 are declared composed judgment (L36). The uncited items in §4–§5 (account split, "restrict tailnet access", "Live with Model A") are composed and framed that way. Nothing found.

## (g) Line-reference walk (low)

- **L2. Citations that point at the wrong passage.**
  - L180–181: the eligibility requirement (2024-or-later Mac mini, macOS 26.5) is `hma-host-apple-poweron-mini`{1}, not {2}{3}. Add {1}.
  - L64–65: "released 2026-10-14 as a hotfix [hma-herdr-releases]{2}". The date is in {1}, and no passage says "hotfix". Cite {1} and drop "hotfix", or source the word.
  - L194–196: agent-deck being hook-based is `hma-herdr-alternatives-currency`{2}; {1} is the release list only.
  - L270–271: "its author has moved to the core line [hma-herdr-projects-readme]{3}". {3} is the rename metadata; "mission control for herdr-core" is {4}. Cite {3}{4}.
  - L95–96: "No launchd unit or boot-time start is documented [hma-herdr-tui-troubleshooting-docs]{2}". {2} concerns per-user service context. The absence is stated in that attestation's Structural notes and in `hma-herdr-tui-remote-docs`{14}. Re-point to remote-docs{14}.

## (h) Thin-attestation check (semantic)

- `hma-herdr-tui-agents-notify-docs` bundles six doc pages under one `source_url`, and its passages carry the load for the TUI-API claim in H1. {12} records the key and text methods and the absence of an approve/deny method, but no complete socket method list. It cannot support a "no status-setting method" claim either way, so this is substantively thin for that claim. Fix: covered by H1 (re-fetch the integrations and socket-API pages and record the reporting methods).
- `hma-host-tailscale-subnets` (three generic passages) is thin but used proportionately: parent says only that a subnet router "can bridge" and that "no source tests it for pre-boot unlock".
- `hma-core-moshi-herdr-page-recheck` and `hma-herdr-source-master` are grep-level by design. They are used for an absence and an ordering respectively, which is appropriate.
- `hma-host-apple-security-filevault-managing` is a single sentence, used only as corroboration. Acceptable.

## Registration

- **L6. The herdr-core-line lane is not registered.** dispatch.md (status `locked`) registers three specialist lanes plus a lead-inline Agent Board lane. parent.md (L31–32) reports four lanes including "herdr-core line", and `specialists/herdr-core-line.md` exists. No amendment records that lane being added. Fix: append a dated registration amendment to dispatch.md (or a sibling amendment note) naming the `herdr-core-line` lane and why it was added.

---

## Findings for the revision pass

| # | Sev | Locus | One-line action |
|---|---|---|---|
| H1 | high | §2 L220–223, Disconfirming L375–376, Bottom line #4 | Retract "no API to set status"; state the TUI lifecycle-report path [agents-notify]{1}{2}; restate retirement as {inferred} on the narrower gap |
| H2 | high | §1 L96–98; §5 step 6; §6 | "After a client attaches" is in no attestation: extend session-state attestation and re-point, or drop and mark unknown |
| M1 | medium | Bottom line #2, key_findings #4, summary, §1 L175–177 | Mark "tailnet not up pre-unlock" inferred everywhere; ground in geerling{1}{5} + launchd-archive{1} rather than an unattested volume premise |
| M2 | medium | Bottom line #3, key_findings #5 | Carry the run-unattended {ambiguous} and the Blink mosh {contested} into the Bottom line |
| M3 | medium | Bottom line #4, §2 L223–225 | Replace "unnecessary in core" with the documented emission gaps and existing hook→7501 shims |
| M4 | medium | §1 L93–94, §5 step 6, §6 | Add #5236 (macOS server-quit fix not in 0.9.5) and "explicit launches retain caller context" |
| M5 | medium | Table "Host reboot", attention "Recovery", Bottom line #1, §6 | Power cut not covered; restore uses ≤15-min snapshot; add power-pull test |
| M6 | medium | Attention table, §2 native-state row | Moshi Agents view = hook-sourced vs Sidebar = Herdr inference; unmarked, may disagree |
| M7 | medium | §3 L244 | "no component documents" structured approvals; hook event list unpublished |
| M8 | medium | §5 step 7, §4 diagram, §6 | `--store file` for moshi-hook; verify moshi-hook/wherdr start with no GUI login in the reboot drill |
| M9 | medium | §1 L194–198 | Reframe tmux+ccmux/agent-deck as a trade (hook status, Moshi tmux parity) vs Herdr resume |
| L1 | low | L236 | Fix "idle status is not authorization"; un-quote "deliberately strict" |
| L2 | low | L64, L95, L180, L194, L270 | Re-point line references as listed in (g) |
| L3 | low | §5 steps 6–7 | Add `herdr integration install claude/codex`; `herdr` on non-interactive PATH |
| L4 | low | L80, L366 | Add {inferred} to "better long-term match" and the sample-absence claim |
| L5 | low | §6 L324–325 | "vendor disputes" → "vendor says not expected" |
| L6 | low | dispatch.md | Record the herdr-core-line lane amendment |
| L7 | low | §6 Vendor churn | Add moshi-hook 6-hourly auto-update |
| L8 | low | Disconfirming L373–374 | wherdr carriage is documented as text into the pane |
| L9 | low | Bottom line | Note adoption is conditional on step 7 Android approval round trip |

---

## Re-check after revision (2026-11-10)

Scope: H1–H9/L1–L9 above, the new lead attestation `hma-lead-herdr-tui-state-api` (passages checked against `.research/source-captures/hma-lead/{socket-api,integrations,session-state}.txt`), every parent claim citing it, and the `dispatch.md` registration amendment. Lint re-run: 195 resolved, 0 broken, 0 thin, 10 pattern flags. The flags are version numbers, one false named-feature hit, and one attested `only`.

### Lead attestation check

All seven passages match the captures, with only whitespace normalized:
- [1]: the "report custom agent state from hooks and plugins" bullet and the raw method list (`pane.report_agent`, `pane.report_agent_session`, `pane.report_metadata`, `pane.clear_agent_authority`, `pane.release_agent`).
- [2]: the "Integrations report agent state with pane.report_agent" example and "affects waits, notifications, and rollups".
- [3]: `resume_argv`, "must hold the pane through pane.report_agent", "takes precedence over Herdr's built-in resume command".
- [4]: "While they report, Herdr uses them instead of reading the screen. The others leave state to screen detection."
- [5]: "User hooks that run next to a Herdr-managed integration should use metadata instead of report-agent. Metadata changes presentation without taking over the integration's idle, working, blocked, or session restore authority."
- [6]: `screen_detection_skip_reason`.
- [7]: "After a client attaches and provides terminal size and theme context, Herdr resumes eligible restored agent panes…".

Frontmatter and structural notes are adequate. The attestation is sound. The problem is in how parent uses it (N1).

### Per-finding status

| # | Status | Evidence in revised parent |
|---|---|---|
| H1 | Resolved, but the fix introduced N1 | §2 now documents `pane.report_agent` [lead]{1}{2}. The Disconfirming bullet records the reversal. The retirement case now rests on cost and hook blind spots. |
| H2 | Resolved | The quote is now cited to [hma-lead-herdr-tui-state-api]{7} and verified verbatim in `session-state.txt`. |
| M1 | Resolved | Bottom line #2, key_findings #5 and the summary say "sources indicate" and "(inferred; untested)". §1 is regrounded on geerling{5} and launchd-archive{1}. |
| M2 | Resolved | Bottom line #3 and key_findings #6 carry the variants-vs-KB disagreement. The mosh interaction is called "disputed". |
| M3 | Resolved | "Unnecessary in core" is removed. The emission gaps and hook shims are cited (537{6}, claude-code-osc7501{2}{4}, codex{3}). |
| M4 | Resolved | §1 adds #5236 and caller context. Step 6 adds the survive-SSH-close test. §6 lists both. |
| M5 | Resolved | The table "Host restart" row, the Recovery row, Bottom line #1 ("orderly restart"), the step 3 power pull and §6 all cover it. |
| M6 | Resolved | The §1 Android paragraph, the attention table and §6 now name the two status sources. |
| M7 | Resolved | §3 now says "documents structured approval carriage" and that the hook list is unpublished [hooks]{4}. |
| M8 | Resolved | Step 7 adds `--store file` and a no-GUI-login reboot check. §1 has a per-user-services bullet. §6 has a login-started-services item. |
| M9 | Resolved, but one new clause belongs to N1 | The comparison is reframed as a trade. The added "state-reporting API that closes much of the hook gap [lead]{2}" is part of N1. |
| L1 | Resolved | Both quotes are now verbatim from agents-notify{4}. |
| L2 | Resolved | poweron{1}, releases{1} (no "hotfix"), alternatives{2}{3}, projects{3}{4} and remote-docs{14} are all re-pointed. |
| L3 | Resolved | Step 6 installs the integrations. Step 7 puts `herdr` on the non-interactive PATH. |
| L4 | Resolved | Both comparatives are marked {inferred}. |
| L5 | Resolved | Now reads "replied that this 'isn't expected'". |
| L6 | Resolved | The dated registration amendment names the `herdr-core-line` lane and the lead attestation. |
| L7 | Resolved | moshi-hook auto-update is added to Vendor churn. |
| L8 | Resolved | §3 and Disconfirming now say wherdr writes input into the pane [wherdr]{8}. |
| L9 | Resolved | The Bottom line is conditional on step 7, and step 7 is called "the adoption gate". |

### New findings introduced by the revision

**N1 (medium, material): the new reporter option overstates [lead]{4} and leaves out the vendor's caution in [lead]{5}.**
- Overstated claims:
  - key_findings #2: "it also accepts reported state through pane.report_agent, which replaces screen reading while a reporter holds the pane".
  - Table, Status source (L83): "reported state replaces screen reading while a reporter holds the pane [hma-lead-herdr-tui-state-api]{4}".
  - Alternatives (L229–230): "a state-reporting API that closes much of the hook gap [hma-lead-herdr-tui-state-api]{2}".
  - Bottom line #4 (L64–66): the observation half "is the one piece with a home: Herdr TUI's `pane.report_agent`".
- What the sources say:
  - [lead]{4} covers only named integrations: "The Pi, OMP, Kimi Code CLI, OpenCode, Kilo Code CLI, and MastraCode integrations also report the agent's state. While they report, Herdr uses them instead of reading the screen. The others leave state to screen detection." It does not say that any reporter holding a Claude or Codex pane displaces their screen manifest.
  - [lead]{5}, which parent never cites: "User hooks that run next to a Herdr-managed integration should use metadata instead of report-agent. Metadata changes presentation without taking over the integration's idle, working, blocked, or session restore authority."
  - [lead]{3}: a reporter's resume command is kept "only while the same source and agent hold the pane" and "takes precedence over Herdr's built-in resume command".
- Why it matters: Claude and Codex panes in this design run Herdr-managed integrations, and step 6 installs them because native resume needs them. An Agent Board-style `report-agent` beside them is the case the vendor advises against. Its takeover semantics may extend to session-restore authority, which is the resume advantage Bottom line #1 relies on. Whether a custom report displaces the screen manifest for these two agents remains undocumented. The older `herdr-source-repo`{4} lists the lifecycle authorities, and Claude and Codex are not among them; that capture is 2026-08-20 and has had no currency check.
- Fix:
  1. Scope the table cell and key_findings #2 to "integrations that report state (Pi, OpenCode, Kimi, …) replace screen reading [lead]{4}".
  2. Add [lead]{5} and {3} to §2 and Bottom line #4. Suggested wording: "Herdr advises user hooks beside a managed integration to use metadata, not `report-agent`, which would take over state and session-restore authority. A Claude/Codex reporter would therefore have to carry its own `resume_argv` or replace the managed integration, and whether it overrides the screen manifest for these agents is not documented {inferred}."
  3. Drop "closes much of the hook gap" or mark it {inferred}.
  4. Optionally name `pane.report_metadata` as the vendor-sanctioned display-only path.

**N2 (low): "Herdr's own unexplained retreat from Codex hooks" (§2 L263).** The v0.9.5 note [hma-herdr-releases]{2} gives the removal together with the fix for the "clamping Interrupt hook timeout" warning, so the only stated context is a hook-timeout problem. Fix: replace "unexplained" with "with a hook-timeout warning as the only stated context".

### Verdict: NEEDS-REVISION

All 20 original findings are resolved. One new medium finding (N1) is material because it bears on the reporter option the revision recommends and on the resume advantage the recommendation rests on. N1 is a narrow fix: scope two citations, add the [lead]{5}/{3} caveat, and soften one clause. N2 is optional. I expect no further adversarial pass to be needed after that fix: a spot-check of the N1 lines should be enough.

## Lead spot-check and gate closure (2026-11-10)

- Effective rigor: `standard`; multi-path walk, so gates run: lint, adversarial-read, evaluate, spot-check.
- Lint (no URL probe; HEAD probes fail on several fetched hosts): 222 resolved, 0 broken, 0 thin; remaining pattern flags are source-attested version numbers or variant-table wording.
- Adversarial-read: round 1 NEEDS-REVISION (H1–H2, M1–M9, L1–L9) → corrected; re-check resolved all 20 and raised N1 (medium) and N2 (low) → corrected in the second pass. N1 fix verified at spot-check: state-reporting claims scoped to named integrations [hma-lead-herdr-tui-state-api]{4}; metadata guidance {5} and resume-holding {3} carried into §2 and Bottom line #4.
- Evaluate: round 1 NEEDS-REVISION (ten items) → corrected; round 2 APPROVED.
- Spot-check (lead, full substrate): verified newly cited passages against attestations (product-pages {11}; wherdr {2}{6}{9}; moshi agents-inbox {1}, e2ee {2}, article-android {6}, licensing {1}; tailscale tags {1}{2}{6}; remote-docs {4}{9}{14}; releases {1}{3}{6}; troubleshooting {2}; poweron-mini {1}; geerling {5}; launchd-archive {2}; core osc7501 {2}); all seven `hma-lead-herdr-tui-state-api` passages verified by the adversarial reader against captures. Corrections at spot-check: Moshi licensing wording narrowed to "approval and completion alerts"; master-branch caveat propagated to §2 and §3 rollup claims. `agents-notify` {8} and {9} each contain both specifics they are cited for. `rps-blink-tailscale-mosh` is a source-direct attestation (fetched 2026-10-26) currency-checked by the android-access lane.
- Result: all required gates satisfied on the current `parent.md`. No unresolved gate.

---

## Adversarial read of §7 (2026-11-10)

**Scope:**
- parent.md §7 (7.1–7.3), the new key_finding ("Reboot resilience rests on …"), and the new Revisit-if bullet.
- Consistency of §7 with §4–§6.
- Sources: specialist briefs `reboot-host-controls.md` and `rescue-access.md`, the `hma-reboot-*` / `hma-rescue-*` attestations, and the reused `hma-host-*`, `hma-herdr-*` and `hma-lead-*` handles that §7 cites.

**Lint and registration:**
- Lint (URL probes skipped): 279 citations resolved, 0 broken, 0 thin, 16 pattern flags. None of the flags falls in §7 except version numbers.
- dispatch.md registers both new lanes (L93–95).
- §7 cites no snippet-thin attestation. The rescue attestations it does cite are search-summary tier (model-processed extracts).

Severity: H = high, M = medium, L = low. The prefix S7- distinguishes these findings from the earlier rounds.

### (a) Semantic chain walk: findings

**S7-H1. §7.2 misstates the security cost of the configuration it proposes.**
- §7.2 first offers a benefit: "Automatic login of the agent user would also give Herdr a GUI launchd context after reboot … {inferred: untested}".
- The next sentence states the cost: "The cost: a person holding the Mac faces account passwords and recoveryOS rather than a boot-time credential."
- With automatic login on, which is the configuration just proposed, a person holding the Mac does not face an account password. Power-cycling it boots into the agent user's logged-in session. That session holds the credential files `~/.claude/.credentials.json` [hma-host-claude-code-auth]{1} and `~/.codex/auth.json` ("plaintext file" [hma-host-codex-auth]{1}{2}), plus whatever the agents can do.
- The reboot-host-controls brief §3 states the exposure as "FileVault off converts the physical-possession threat from 'needs a password to decrypt' to 'needs an account password or a recoveryOS path'". That framing applies only without automatic login. The brief also notes that credential files are "readable by whoever can log in as that user".
- Fix: split the two cases. Suggested wording: "FileVault off, manual login: a holder faces account passwords and recoveryOS {inferred}. FileVault off with automatic login of the agent user: a holder who restarts the Mac gets that user's logged-in session, agent credentials and agents, with no password {inferred}. That is the price of the GUI-context benefit." Keep the closing recommendation (FileVault on).

**S7-M3. §7.1 never says where the manual update's restart lands, and an attestation that qualifies it goes uncited.**
- §7.1 Update routine: "Install by hand with `softwareupdate --install --os-only --restart` [hma-reboot-man-softwareupdate]{2}".
- {2} only says that admin authentication is needed. The command shape is {1}, and the restart behaviour is {3}: "If the user is not logged in, macOS will trigger a forced reboot if necessary". The Apple-silicon owner authorisation flags are {4} and {5}.
- Nothing in parent says whether this restart preserves the FileVault unlock. The authrestart row is a separate mitigation, and `--restart` is not shown to be an authenticated restart. The reboot-host-controls brief §2 marks "--stdinpass plus --restart may land at the login window" as {inferred}.
- Uncited qualifier: `hma-reboot-eclectic-authrestart`{1} reports that "Apple uses authenticated restarts because they make updates more seamless". {4} reports a case where the authenticated restart "didn't work properly" and the Mac asked for a password. Both are practitioner sources from 2023, macOS 13.
- Fix: re-point to {1}{3}. Add to the Caveats column: "whether a CLI-initiated update restart keeps the unlock is not documented (practitioner: Apple's own updates use authenticated restart, sometimes failing [hma-reboot-eclectic-authrestart]{1}{4} {confidence: practitioner, pre-macOS 26}); plan for it to land at the FileVault prompt and run the update window from home or with the rescue device ready".

**S7-M4. The UPS row reads source facts beyond what they say.**
- "What the sources establish" includes "Herdr saves 'before the system starts closing apps' on a macOS restart [hma-herdr-releases]{3}". Placed in the UPS row, this implies a save on UPS shutdown. The source names "Restarting a Mac or shutting down Windows" and is silent on a Mac shutdown or halt. The reboot-host-controls brief §4 marks it "{inferred: … no fetched source tests Herdr under a UPS shutdown}".
- The Caveats column says "The shutdown runs `shutdown -h now` per scripts read on the operator laptop [hma-reboot-local-ups-plumbing]{1}". The script also has a `WaitForUPS` path, `shutdown -hu now` ("take the system down abruptly"). The attestation's structural note says "nothing here shows which path ioupsd takes on a desktop".
- Uncited: `hma-reboot-herdr-issue-4414`{4}, where v0.9.4's graceful-shutdown recovery excludes "a hard kill that cannot run the native shutdown hook".
- Fix: move the Herdr-save clause to Caveats with "{inferred: release note covers restart only}". Change the shutdown sentence to "the shipped script has a graceful (`shutdown -h`) and an abrupt (`shutdown -hu`) path; which one Energy settings use was not observed". Add 4414{4}.

**S7-L1. The Herdr start row overstates issue #4926.**
- Parent: "a LaunchAgent has been run successfully, with a Files and Folders permission grant [4926]{1}{2}".
- {1} reports a LaunchAgent whose server "never answers API requests". {2} is the maintainer's workaround (a Files and Folders grant), and {3} records a v0.9.4 responsiveness fix. No passage reports success.
- Fix: "a LaunchAgent setup is reported; it hung restoring from `~/Documents` until a Files and Folders grant (workaround) and a v0.9.4 fix [hma-reboot-herdr-issue-4926]{1}{2}{3}".

**S7-L2. Citations that point at the wrong passage, and absences stated as facts.**
- Herdr start row: "#4291: a saved-machine bridge can start the server in that context first after a reboot [4291]{1}". {1} is about respawning a deliberately stopped server. The after-reboot race is {5} ("SSH comes up before GUI login, so the bridge usually wins") and {6}. Re-point to {5}{6}.
- Wake-on-LAN, "Wake from sleep only [hma-rescue-apple-mac-wake-settings]{1}": "only" is inference. Mark it {inferred}.
- Apple TV, "no shell, so no watchdog [appletv]{3}": {3} says the extract found no mention of a shell. Rephrase as "no shell documented".

**S7-L3. A daemon start in the Background context is stated as fact.**
- Parent: "SSH or daemon starts run in the Background launchd context, where Keychain-backed tools fail [hma-reboot-herdr-issue-966]{1}[hma-reboot-man-launchd-plist]{2}".
- The SSH half is attested: 966{1}{3}, 4291{5}, and pr-5236{3}. The daemon half rests on launchd-plist{2}, which says only that there are "no distinct sessions in the privileged system context".
- The reboot-host-controls brief marks the combined claim {inferred}. Fix: mark the daemon half {inferred}.

### (b) Claim shapes the lint missed

**S7-M6. Search-summary evidence carries no confidence marker.**
- §7.3 cites ten attestations whose `substrate_confidence` is `search-summary`, meaning model-processed extracts whose quotes are "as returned": ssh-config-proxyjump, moshi-docs-jumphost, tailscale-acl-syntax, tailscale-subnets-detail, ntfy-docs, healthchecks-docs, pikvm-faq, rpi-getting-started, glinet-router-tailscale, tailscale-appletv, and apple-mac-wake-settings.
- §7.3 carries no `{confidence: search-summary}` marker. Per discipline §7, an unmarked claim reads as source-direct.
- The rescue brief discloses the tier in its own header. parent.md does not.
- Fix: add one sentence at the head of §7.3, e.g. "Most rescue-device sources were read as processed extracts {confidence: search-summary}". Or add per-claim markers on the load-bearing ones: ProxyJump, Moshi jump host, ACL `IP:port`, /32 route.

**S7-L4. A marker is misused.** The Unattended agent resume row has "{contested: not traced in source}". `contested` is for a standing dispute in the field. This is an untraced unknown. Use "{ambiguous: not traced in source}" or plain "untested".

**S7-L5. The new key_finding's framing.**
- "Reboot resilience rests on fewer reboots (manual update window, UPS shutdown) …": a UPS does not make reboots rarer. It turns a power loss into a graceful shutdown that still needs unlock and resume.
- The finding is composed but unmarked, unlike key_finding #5's "(inferred; untested)".
- Fix: "rests on fewer and cleaner reboots (manual update window; UPS-triggered graceful shutdown) …", and append "(composed)".

### (c) Contradictions the two briefs record that §7 smooths over

**S7-M2. BSI versus RSR, and the unaddressed third toggle.**
- §7.1 tells the operator to turn off "Install macOS updates" and BSI "Automatically Install". It is silent on the third toggle, "Install Security Responses and system files", which the same attestation names, describing it as installing "system files and Rapid Security Responses automatically" [hma-reboot-apple-macos-autoupdates]{1}.
- The reboot-host-controls brief records a `tension` between that page and the BSI pages ([hma-reboot-apple-bsi-support]{1}, [hma-reboot-apple-bsi-platform-support]{3}). It leaves {ambiguous} whether the toggle governs BSI, RSR or only XProtect-type data, citing [hma-reboot-apple-deploy-enforce-updates]{7}: "XProtect, Gatekeeper, and system data files".
- Fix: add to the Update routine row: "A third toggle, 'Install Security Responses and system files', still names Rapid Security Responses [autoupdates]{1}; whether it governs BSI, RSR or only XProtect-type data is not stated [deploy-enforce-updates]{7} {ambiguous}. The power-pull drill period should watch for unplanned restarts." Add a Contradictions entry.

**S7-M5. KVM compatibility is a contested point; parent cites only the negative side.**
- The KVM row says: "Typing at the Apple-silicon FileVault screen is unverified; PiKVM lists macOS keyboard issues [hma-rescue-pikvm-faq]{1}".
- The rescue brief records {contested} with three positions:
  - JetKVM: "Anything with HDMI out and USB works, from the BIOS onwards" [hma-rescue-jetkvm-faq]{1}.
  - PiKVM: macOS input fixes [pikvm-faq]{1}.
  - Apple: "If your Mac is locked, you need to unlock it before you can allow an accessory to connect" [hma-rescue-apple-accessories]{3}. This is the most relevant passage and goes uncited; note the page names Mac laptops.
- Fix: cite all three in the KVM row or in Contradictions, marked "{contested: whether USB HID emulation works at the Apple-silicon FileVault screen; no source-direct test}". The composed "Defer a KVM until confirmed" then follows directly.

**S7-L6. Handoff stability is a tension; parent cites only the negative reports and strips qualifiers.**
- The handoff row cites only the negatives. The brief records a `tension`: a Linux reporter found "the live handoff itself works well … every pane process kept its PID and state" ([hma-reboot-herdr-issues-handoff]{4}, comment), and #3864's commenter says processes and bindings survived ({3}).
- Qualifiers dropped:
  - #5443 occurs "When two panes have the same `agent_session` value" (from Codex's shared app-server) ({1}).
  - #808 "also happens without handoff" ({2}).
  - Handoff does not apply to Homebrew installs [hma-reboot-herdr-docs-named-sessions-handoff]{6}.
- Fix: add the qualifiers and one positive clause. The "not recommended" composed conclusion can stand.

**S7-L7. The Tailscale-before-login ambiguity, as it affects the rescue device.**
- §7.3 states as fact that the Mini waits at the FileVault prompt "and its own Tailscale is not running". This is the inference marked in §1.
- If the step 3 drill finds that `tailscaled` does not start without a GUI login (the reading of the run-unattended KB, [hma-host-tailscale-run-unattended]{3}), the Mini stays off the tailnet even after unlock. The rescue route would then become the steady-state access path, not just the unlock path.
- Fix: add "(inferred; see §1)", plus one sentence on that contingency.

### (d) Better attestations left uncited

- S7-M3: eclectic-authrestart{1}{3}{4}; softwareupdate{3}.
- S7-M4: herdr-issue-4414{4}.
- S7-M5: apple-accessories{3}; jetkvm-faq{1}.
- **S7-L8.** §7.3 claims Moshi jump host or /32 route "expected to work", but neither the jump-host nor the subnet-route path to the Mini's pre-boot sshd is tested anywhere. The rescue brief's Gaps: "No source-direct confirmation … that the Mini's pre-boot SSH works through a jump host or subnet route." Fix: add this to the "What it solves" paragraph and to the Revisit-if bullet as a test item.
- **S7-L9.** Watchdog: ntfy's public service has public topic names, "choose something that cannot be guessed easily" [hma-rescue-ntfy-docs]{3}. Add it as a caveat, since the alert reveals host state.

### (e) Quote-context walk

- These quotes keep their qualifiers:
  - "require the device to restart" (bsi-platform-support{1})
  - "bypassing the initial unlock" (paired with "may not work on all systems")
  - "After a client attaches …" (lead{7})
  - "the volume is still encrypted …" (filevault-volume{3})
  - "are required during the boot process" ({6})
  - the PiKVM read-only quote ({3})
- **S7-L10.** "Activation Lock blocks erase and reuse without the Apple Account [actlock]{1}" drops the conditions: Find My must be on, plus Full Security and two-factor authentication ([hma-reboot-apple-actlock-mac-support]{2}{3}). Add "(with Find My on)".
- The #5443 and #808 qualifiers are covered under S7-L6.

### (f) Analytical-tier inheritance

Nothing found. §7 cites only attestations.
- The `hma-reboot-local-*` handles are local captures from the operator laptop, and parent names them as such ("not the Mini").
- The §7.3 "Composed recommendation" and the "Practical routine" are framed as composed.

### (g) Line-reference walk

- See S7-L2: softwareupdate{2}→{1}{3}; 4291{1}→{5}{6}.
- The fdesetup "on supported hardware" phrase is in host-man-fdesetup{1}, not {4}. This is minor, because {4} carries "may not work on all systems".

### (h) Thin-attestation check

- The search-summary rescue attestations are used for single, narrow claims. Their quotes are "as returned", so the remedy is the confidence marker in S7-M6, not new acquisition.
- `hma-reboot-local-ups-plumbing` and `hma-reboot-local-softwareupdate-state` come from a different machine. Parent uses them with that caveat. They are adequate for the narrow claims, except the overreach in S7-M4.

### Consistency of §7 with the rest of parent.md

**S7-M7. §5 and §6 do not carry the §7 mitigations that the new key_finding says resilience rests on.**
- The key_finding names the manual update window, UPS shutdown, a LAN rescue device, and one client attach.
- §5 contains none of these:
  - the update and BSI toggles;
  - `fdesetup supportsauthrestart` run on the Mini;
  - a UPS power-return test;
  - the scripted-client resume test;
  - building the rescue device.
- Step 8 defers "a subnet router, a UPS" as later options, while §7.3's composed recommendation makes the Pi and a shared UPS part of the resilience design.
- §6 "Reboot while away" and "Security Improvement restarts" do not point to the §7 mitigations.
- Fix, either option:
  - (a) Add the items to §5: step 1 gets the update/BSI toggles and `fdesetup supportsauthrestart`; step 3 gets the scripted-client resume test and a power-return check; a new step after 7 covers the rescue device, UPS and watchdog. Point §6's two risks at §7.
  - (b) State that §7 is a second phase after Model A, and soften the key_finding to "would rest on".

**S7-L11 (outside §7, found during the consistency check).** §5 step 6 says "start `herdr server` from SSH and confirm it survives closing that SSH session (the #5236 fix is not in v0.9.5)". `hma-reboot-herdr-pr-5236`{3} says "Starts over SSH … keep the old direct spawn". #5236 therefore does not govern the SSH start that step 6 tests; it concerns servers started from a terminal app ({1}). Fix: drop the parenthetical, or reword to "#5236 covers terminal-app starts, not SSH starts [pr-5236]{1}{3}".

Other cross-checks passed:
- §1 and §6 "resume waits for a client attach" matches the §7.1 resume row.
- The §4 diagram's "LAN path … or a LAN subnet router" matches §7.3.
- §6's "subnet router … widens tailnet reach" matches §7.3's scoped /32 recommendation.
- §5 step 1 "Start up when power is connected" matches the UPS and smart-plug rows.

### Findings table

| # | Sev | Locus | One-line action |
|---|---|---|---|
| S7-H1 | high | §7.2 cost sentence | Split the manual-login and automatic-login cases; with automatic login a holder gets the agent session and credential files without a password |
| S7-M2 | medium | §7.1 Update routine; Contradictions | Address the "Security Responses and system files" (RSR) toggle and the BSI/RSR {ambiguous} |
| S7-M3 | medium | §7.1 Update routine | Re-point to softwareupdate{1}{3}; state the restart may land at the FileVault prompt; cite eclectic{1}{4} as practitioner |
| S7-M4 | medium | §7.1 UPS row | Mark the Herdr save under UPS {inferred}; note both shutdown script paths; cite 4414{4} |
| S7-M5 | medium | §7.3 KVM row | Record JetKVM vs PiKVM vs Apple accessories{3} as {contested} |
| S7-M6 | medium | §7.3 throughout | Add {confidence: search-summary} for the extract-tier rescue sources |
| S7-M7 | medium | §5, §6 vs key_finding | Carry the §7 actions into §5 and point §6 to them, or label §7 a second phase and soften the key_finding |
| S7-L1 | low | §7.1 Herdr start | #4926 reports a hang plus workaround, not success |
| S7-L2 | low | §7.1, §7.3 table | 4291{5}{6}; WoL "only" {inferred}; Apple TV "no shell documented" |
| S7-L3 | low | §7.1 Herdr start | Mark the daemon-start Background context {inferred} |
| S7-L4 | low | §7.1 resume row | {contested} → {ambiguous} / untested |
| S7-L5 | low | key_finding | "fewer and cleaner reboots"; add (composed) |
| S7-L6 | low | §7.1 handoff row | Add positive reports and the #5443/#808/Homebrew qualifiers |
| S7-L7 | low | §7.3 intro | Mark Tailscale-not-running inferred; add the steady-state contingency |
| S7-L8 | low | §7.3; Revisit if | Pre-boot SSH through a jump host or route is untested |
| S7-L9 | low | §7.3 watchdog | ntfy public topics caveat |
| S7-L10 | low | §7.2 | Activation Lock requires Find My (+ Full Security, 2FA) |
| S7-L11 | low | §5 step 6 | #5236 does not apply to SSH starts (pr-5236{3}) |

### Verdict: NEEDS-REVISION

S7-H1 is a composed security statement that contradicts the configuration it accompanies. Of the six medium findings, three are contradictions or qualifiers that the briefs recorded and §7 drops (M2, M4, M5), two are a missing restart outcome and missing confidence markers (M3, M6), and one is the §5/§6 inconsistency (M7). Every fix is local to §7, §5, §6, Contradictions, or the key_finding. After the fix, a spot-check of the edited lines should be enough.

## §7 gate closure (2026-11-10)

- Lint (no URL probe): 303 resolved, 0 broken, 0 thin.
- Adversarial-read of §7: NEEDS-REVISION (S7-H1, S7-M2–M7, S7-L1–L11) → corrected; lead spot-checked the edited lines and every re-pointed passage (issue-4291 {5}{6}, softwareupdate {1}{3}, ntfy {3}, actlock {3}, issue-4414 {4}, ups-plumbing {1}, pr-5236 {3}, enforce-updates {7}, eclectic {4}, named-sessions-handoff {6}, jetkvm-faq {1}, apple-accessories {3}, codex-auth {1}).
- Evaluate §7: round 1 NEEDS-REVISION (5 items) → corrected; round 2 APPROVED. The update-step correction is grounded in the session-state capture (`.research/source-captures/hma-lead/session-state.txt`: autosave and shutdown write session.json) and the v0.9.4 pre-restart save [hma-herdr-releases]{3}.
- Carried-over items (`rps-blink-tailscale-mosh` provenance; agents-notify {8}/{9} dual use) were cleared in the earlier lead spot-check above.
- Result: all required gates satisfied for the extended `parent.md`.
