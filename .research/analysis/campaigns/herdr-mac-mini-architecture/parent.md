---
name: herdr-mac-mini-architecture
description: Read this before setting up the Mac mini agent host or deciding Agent Board's future; it scrutinizes the proposed Herdr TUI + Tailscale + Moshi stack against current sources and recommends an architecture, a host-prep sequence, and Agent Board's retirement.
type: decision-brief
kind: research
status: active
updated: 2026-11-10
summary: |
  Decision brief on an always-on Apple-silicon Mac mini (macOS 26) hosting Claude Code and Codex sessions in Herdr, reached over Tailscale from a MacBook Air and an Android phone. Herdr TUI remains the better host runtime today over the newer herdr-core line (which the Herdr desktop app runs on): core has program-reported status but no reboot resume and no documented closed-app phone alerts, while TUI infers Claude and Codex state from the screen. Moshi on Android documents Herdr TUI awareness and push, which is enough to defer wherdr, but carries approvals as verified keystrokes. FileVault can stay on because macOS 26 documents SSH unlock after restart, which the sources indicate must be reached through the home LAN; of Tailscale's macOS variants, only open-source tailscaled is listed as running before login. Agent Board can be retired as a product; reuse inside Herdr is constrained by Herdr's guidance that user hooks report display metadata rather than take over lifecycle state.
key_findings:
  - Herdr now ships three products; the desktop app and the official Android app run on herdr-core, not Herdr TUI, so the TUI-versus-Desktop choice is also a phone-client choice.
  - Herdr TUI infers Claude and Codex state from the screen, has no failed state, documents no on-screen marker of state source, and resumes agent conversations after an orderly restart; Herdr's state-reporting API replaces screen reading only for the integrations that report state.
  - herdr-core takes state only from program-reported OSC 7501, with documented emission gaps, restores bare shells after a reboot, and documents only an in-app phone banner.
  - Moshi has a released Android app that documents Herdr TUI sessions and host-hook push; documented approvals are keys injected into the pane after a screen re-check, and Android parity is vendor-asserted by omission.
  - macOS 26 documents unlocking FileVault over SSH after a restart; the sources indicate the Mac does not finish booting, and so Tailscale is not up, until that unlock, making a LAN path necessary (inferred; untested).
  - Tailscale's variants table lists only open-source tailscaled as running before login; a Tailscale KB page disagrees without naming a variant, so a reboot drill must confirm it.
  - Herdr Projects' TUI-compatible line is one its author has moved past for herdr-core, so the Model B target may be the trigger to revisit the core line.
  - Reboot resilience (composed) rests on fewer and cleaner reboots (manual update window, UPS shutdown), a LAN rescue device for remote FileVault unlock, and one client attach to trigger Herdr agent resume; Herdr has no documented unattended resume, and SSH-started servers are reported to run in a Background launchd context.
research_method: /research
provenance: agent-synthesis
---

# Herdr Mac mini architecture: decision brief

## Question and decision

Should the operator run an always-on Mac mini (Apple silicon, macOS 26, wired,
at home) with Herdr TUI hosting 5–15 Claude Code and Codex sessions, reached
over Tailscale from a MacBook Air (SSH) and an Android phone (Moshi), with
wherdr and Herdr Projects as later layers? What happens to Agent Board, and in
what order should the host be prepared?

Sources were fetched on 2026-11-10 across the Herdr TUI ecosystem, the
herdr-core line, Android access, and the Mac mini as a headless host. Nothing
was installed or run; every behavioural claim is vendor documentation, source
code, a man page, or an issue-tracker report, and device behaviour remains to be
tested. Agent Board's own design is described from its repository, not cited as
a source. Recommendations in the Bottom line, Direct answers, §2, §4 and §5 are
composed judgment over the cited facts.

Out of scope: Model C (autonomous operations), sizing for future workloads
(databases, web apps, local models; no source addresses memory headroom on
32 GB with 5–15 agents), and backup design. Nothing recommended here forecloses
them {inferred: the account split and a system-level Tailscale daemon are
host-wide choices that other services can share}.

## Bottom line

The proposed shape holds, conditional on step 8's Android approval round trip,
with three corrections and one disposition {inferred: composed across the cited
facts}:

1. **Keep Herdr TUI, knowingly.** It is the runtime Moshi and wherdr support,
   and the one that resumes agent conversations after an orderly restart. Its
   costs are screen-inferred status for Claude and Codex with no documented
   source marker, and an orchestration add-on whose author has moved to the
   core line. Re-check herdr-core when it resumes agents after a reboot and
   alerts a closed phone app, or when Model B begins.
2. **Plan reboot recovery around the LAN, delivered in two phases** (§5): a UPS
   from the start, a recovery device second. The boot itself has two stages. Before the
   FileVault unlock, the Mac has not finished booting, so the sources indicate
   no tailnet exists and the unlock must come over the LAN. After the unlock,
   with no GUI login (FileVault disables automatic login), only a system-level
   Tailscale daemon can bring the tailnet up. The reboot drill (step 4) tests
   both.
3. **Use the open-source `tailscaled` daemon, keep Tailscale SSH off, use macOS
   Remote Login.** It is the only variant Tailscale's variants table lists as
   running before login; another Tailscale page disagrees without naming a
   variant (see Contradictions). FileVault unlock needs Remote Login, and
   keeping Tailscale SSH off avoids a disputed mosh interaction.
4. **Retire Agent Board as a product.** The Ghostty half does not reach a remote
   host. Its observation half could feed Herdr only as display metadata beside
   the managed integrations, or by replacing them and their resume support
   (§2). Revisit only if Herdr's screen inference proves costly in use.

## Direct answers

- **Herdr TUI or Herdr Desktop?** "Herdr Desktop" is the Herdr app, built on
  herdr-core; the app sets up herdr-core [hma-herdr-site-product-pages]{11}, and
  the official phone app talks to herdr-core only [hma-herdr-site-product-pages]{5}.
  Choose Herdr TUI today for resume, ecosystem and maturity (table below);
  choose the Desktop/core line later if native status and the official phone app
  outweigh those.
- **Does Moshi remove the need for wherdr?** For Model A, yes {inferred}. Moshi
  covers Herdr session navigation, an agent inbox, push and approvals on Android
  (§1). wherdr would add browser access from any device, Web Push that does not
  depend on Moshi's servers [hma-wherdr-docs]{6}, a transcript view
  [hma-wherdr-docs]{4}, and a board for Herdr Projects 1.x [hma-wherdr-docs]{9}.
  Its costs: an unofficial project weeks old [hma-wherdr-docs]{1}, "a remote
  shell as your user" [hma-wherdr-docs]{3}, and login-time start [hma-wherdr-docs]{2}.
  Add it when Model B needs the board, or if Moshi's Android push or approvals
  fail the step 8 test.

- **Add on to this build, or change builds, for reboot resilience?** Add on
  {inferred}: an update routine, a UPS, a LAN rescue device and a smart plug
  (§7). The build changes considered do not improve reboot persistence:
  herdr-core restores bare shells after a reboot, and FileVault off only removes
  the unlock step, at the exposure set out in §7.2.

## 1. Architecture assessment

### Herdr: three products, two phone stories

"Herdr" now names a desktop app, `herdr-core` (`hc`), and Herdr TUI, all Apache
2.0 [hma-herdr-site-product-pages]{2}. Herdr TUI is v0.9.5
[hma-herdr-site-product-pages]{12}, published 2026-10-14 and the latest stable
release at fetch [hma-herdr-releases]{1}. The official mobile app (iPhone, iPad,
Android) "talks to herdr-core"; "Herdr TUI runs its own server, so agents
started there don't show up on your phone" [hma-herdr-site-product-pages]{5}.
Agents in one runtime do not appear in the other
[hma-core-site-mobile-privacy-faq]{8}.

| Dimension | Herdr TUI 0.9.5 | herdr-core 0.1.20 + app + mobile |
|---|---|---|
| Status source | Screen inference for Claude and Codex; official hooks report identity only [hma-herdr-tui-agents-notify-docs]{1}[hma-herdr-tui-agents-notify-docs]{3}; named state-reporting integrations (not Claude or Codex) replace screen reading [hma-lead-herdr-tui-state-api]{4} | Only program-reported OSC 7501; "does not guess from screen text" [hma-core-readme]{6}[hma-core-docs-commands-skill]{1} |
| Claude/Codex emit natively? | n/a | Claude Code since 2.1.295 after a ~2 s startup probe [hma-core-claude-code-osc7501-issues]{1}; Codex idle/working/done [hma-core-codex-osc7501-issues]{1} |
| States | idle, working, blocked, done, unknown [hma-herdr-tui-agents-notify-docs]{6} | idle, working, done, blocked (with kind), error [hma-core-docs-commands-skill]{1} |
| Host restart | Orderly macOS restart saved first [hma-herdr-releases]{3}; Claude/Codex relaunched with native resume [hma-herdr-tui-session-state-docs]{5}; power loss not covered, snapshots at most one per 15 min [hma-herdr-tui-session-state-docs]{4} | Panes return as shells; no agent resumed [hma-core-site-mobile-privacy-faq]{6}; resume proposal open [hma-core-issues-resume-recovery]{4} |
| Phone | Any SSH client; Moshi documents Herdr [hma-herdr-tui-remote-docs]{8}[hma-android-moshi-docs-herdr]{1} | Official free app; documented alert is a banner "While the app is open" [hma-core-site-mobile-privacy-faq]{1} |
| Ecosystem | wherdr uses the TUI socket [hma-wherdr-docs]{4}; Herdr Projects 1.x targets TUI [hma-herdr-projects-readme]{1} | Moshi page shows no core support [hma-core-moshi-herdr-page-recheck]{1}; Shepherdr 3.x targets core [hma-herdr-projects-readme]{4} |
| Maturity | v0.9.5 latest stable at fetch [hma-herdr-releases]{1}; no open p0 [hma-herdr-open-issues]{10} | Repos created 2026-10-16; releases every 2–3 days [hma-core-readme]{8}[hma-core-changelog]{1}; API "preview" [hma-core-api-schema]{1} |

herdr-core fits the "inferred state must not masquerade as native" guardrail by
construction {inferred: from the status-source rows}: state is reported or
absent, with an `app` field naming the reporter [hma-core-api-schema]{3}. Its
costs are concrete today. A Claude Code session whose startup misses the probe
"stays invisible" [hma-core-app-issue-537]{4}; a slow `--resume` start can leave
it permanently unreported [hma-core-app-issue-537]{3}; backgrounding or agent
view stops reporting [hma-core-claude-code-osc7501-issues]{4}; Codex can hold
`working` while background terminals run [hma-core-codex-osc7501-issues]{3}.
An SSH-started core on macOS has open Keychain and PATH defects
[hma-core-issues-macos-hosting]{1}[hma-core-issues-macos-hosting]{4}. Per-session
space labels on the phone need the desktop app running on the host
[hma-core-site-mobile-privacy-faq]{2}; whether it can run without a GUI login is
not documented.

### Herdr TUI on a macOS host

macOS is a supported server host [hma-herdr-tui-remote-docs]{6}; the server
ignores SIGHUP and survives its launching shell [hma-herdr-tui-remote-docs]{9}[hma-herdr-releases]{4}.
A later fix to "keep the macos server running when its terminal quits (#5236)"
is on master, after v0.9.5 [hma-herdr-releases]{6}. `herdr server` exists "for
supervised or service-style setups", but no launchd plist or boot-start
instruction is documented [hma-herdr-tui-remote-docs]{14}. Explicit server
launches "retain their caller's context" [hma-herdr-tui-troubleshooting-docs]{2},
and a server started over SSH "may not have access to interactive Keychain
services" [hma-herdr-tui-troubleshooting-docs]{1}. Restored agents resume
"After a client attaches and provides terminal size and theme context"
[hma-lead-herdr-tui-state-api]{7}, so after a reboot the operator must connect
once before agents come back {inferred: no auto-start is documented}.

Defects that bear on this topology (open at fetch):

- #5749: with macOS 26.5 and Claude Code in a shared pane, the second client
  "becomes unusable for a minute or more" [hma-herdr-open-issues]{5}. A laptop
  and a phone attached to the same tab would be two clients in this sense
  {inferred: mapping onto this topology}.
- #5624: macOS-to-macOS remote output stall without self-recovery; panes survive
  [hma-herdr-open-issues]{4}. This bears on `herdr --remote` from the MacBook.
- #5634: saved-machine probes can trip OpenSSH per-source penalties
  [hma-herdr-open-issues]{6}.
- #5471: unbounded server memory while an attached client stops reading,
  including a sleeping laptop; Linux-labelled, second reproduction 2026-11-01
  [hma-herdr-open-issues]{2}.
- #5170: panes reported dying with the SSH client on Linux; maintainer could not
  reproduce over Tailscale SSH [hma-herdr-open-issues]{1}.
- #5837/#5909: resume restores the wrong Codex thread or Claude branch
  [hma-herdr-open-issues]{9}.

### MacBook access

Herdr TUI runs inside any terminal over SSH, so Ghostty can stay; this brief
found no reason to replace it {inferred: no MacBook-terminal alternative was
assessed}. Given #5624, prefer `ssh` to the Mini and run `herdr` there over the
`herdr --remote` bridge, and use the bridge only where it proves stable
{inferred}. Herdr's `terminal` notification delivery is "an outer-terminal
notification that also works over SSH" [hma-herdr-tui-agents-notify-docs]{10},
so desktop alerts can reach the MacBook through the terminal.

### Android access

Moshi is released on Google Play ("Moshi: tmux/herdr SSH terminal", 4.7 from
340 reviews, 10K+ downloads, updated 2026-11-09) [hma-android-moshi-play-listing]{1}.
The vendor's iOS-only list is Live Activities, Dynamic Island and the Watch
[hma-android-moshi-article-android]{2}; the docs have no Android page, so parity
is vendor-asserted by omission {inferred: absence of a platform split}. Moshi
documents a Herdr session picker, blocked/working/done in its Sidebar and
Herdr-tagged events [hma-android-moshi-docs-herdr]{1}[hma-android-moshi-docs-herdr]{2},
an Agents view grouped Waiting/Done/Working/Idle [hma-android-moshi-docs-sidebar]{2},
an Inbox board [hma-android-moshi-docs-agents-inbox]{1}, Chat View for Claude
and Codex marked "currently experimental" [hma-android-moshi-docs-hooks]{2}, and
host-hook push to Android on the same licence [hma-android-moshi-docs-licensing]{1}.
Its two status views take state from different places: the Sidebar from
"Herdr's own agent awareness" [hma-android-moshi-docs-multiplexer]{4}, the Agents
view from "the agents' hooks" [hma-android-moshi-docs-sidebar]{5}; neither is
described as marking its source, and they could disagree {inferred}. Mosh,
multiplexer integration and auto-attach are Pro
[hma-android-moshi-docs-subscription]{2}; current pricing is $9.99/month,
$89.99/year or $199 lifetime [hma-android-moshi-pricing]{1}.

Phone UX: these Moshi views are the mobile-optimized layer. The raw Herdr TUI
on a phone is documented as adapting to narrow screens
[hma-android-herdr-docs-how-to-work]{2}, while a user report over Moshi found
long labels and footers do not fit the narrow panel [hma-android-herdr-issue-3840]{3}.
Short labels help on the phone {inferred}.

Approvals: "Tapping Approve or Deny ... injects the right keys into the exact
pane, after moshi-hook has re-captured the screen and verified the prompt is
still the one you saw" [hma-android-moshi-docs-multiplexer]{2}. Both agents
expose a structured PermissionRequest decision
[hma-android-claude-code-hooks-docs]{1}[hma-android-codex-hooks-docs]{1}; Moshi's
docs neither claim to use it nor list the hook events they install
[hma-android-moshi-docs-hooks]{4}. With Codex 0.157+ shared-daemon defaults,
Moshi attributes every Codex session to the first terminal and approvals can go
to the wrong pane until `moshi-hook doctor --yes`
[hma-android-moshi-docs-troubleshooting]{3}.

Other Android options: wherdr (see Direct answers) installs as an Android PWA
with Web Push on blocked or done [hma-wherdr-docs]{7}[hma-wherdr-docs]{6};
"Without a passkey, anyone who can reach the address can control your agents"
[hma-wherdr-docs]{5}. Provider-native remote does not fit the Herdr topology:
Claude Remote Control covers Claude Code only and documents tmux/screen, not
Herdr [hma-android-claude-remote-control-docs]{4}; Codex remote control needs
the ChatGPT desktop app as host and cannot be set up from the CLI
[hma-android-codex-remote-connections-docs]{2}. Generic clients (Termius,
ConnectBot, Termux) carry SSH/mosh without agent awareness
[hma-android-termius-play]{1}[hma-android-connectbot-play]{1}[hma-android-termux-mosh-package]{1};
JuiceSSH is reported delisted [hma-android-moshi-article-android]{5}.

### Mac mini host

- FileVault stays locked after any restart until credentials are given
  [hma-host-apple-deploy-filevault-intro]{1}, and it disables automatic login
  [hma-host-apple-autologin]{1}. On macOS 26, "FileVault can be unlocked over
  ssh after a restart if Remote Login is turned on and a network connection is
  available" [hma-host-apple-deploy-filevault-intro]{1}[hma-host-apple-security-filevault-managing]{1}.
  One practitioner unlocked with an admin password over wired Ethernet, which
  let the Mac "complete the full boot" [hma-host-geerling-filevault-ssh]{1}[hma-host-geerling-filevault-ssh]{3}
  {confidence: practitioner}.
- Tailscale variants: the variants table lists only open-source `tailscaled` as
  running before login and acting as a Tailscale SSH server
  [hma-host-tailscale-macos-variants]{3}. Tailscale recommends it only for
  "unattended installs managed by experienced macOS system administrators"
  [hma-host-tailscale-macos-variants]{2}; it has no auto-update
  [hma-host-tailscale-macos-variants]{5}.
- Boot stage 1, before unlock: the Mac "won't fully boot until you log in"
  [hma-host-geerling-filevault-ssh]{5}, and system daemons load as part of boot
  [hma-host-apple-launchd-archive]{1}, so `tailscaled` is likely not running at
  the pre-boot unlock {inferred: no source tests tailscaled with FileVault on}.
  A subnet router on the LAN can bridge the tailnet to LAN addresses, uses SNAT
  by default, and respects Tailscale access policies
  [hma-host-tailscale-subnets]{1}[hma-host-tailscale-subnets]{2}[hma-host-tailscale-subnets]{3};
  no source tests it for pre-boot unlock. It would expose the advertised LAN
  range to whichever tailnet devices the policy allows, so scope it to the
  operator's own devices {inferred}.
- Boot stage 2, booted without a GUI login: per-user agents load "When a user logs
  in" [hma-host-apple-launchd-archive]{2}, so login-started services (wherdr's
  installer, possibly `brew services`) may not run after a reboot {inferred}.
- Power: "Start up when power is connected" = Always needs a Mac mini introduced
  in 2024 or later on macOS 26.5 [hma-host-apple-poweron-mini]{1} and also
  restarts after an outage [hma-host-apple-poweron-mini]{2}[hma-host-apple-poweron-mini]{3}.
  Background Security Improvements "may require a Mac restart"
  [hma-host-apple-platform-support-updates]{2}.
- Agent credentials over SSH: Claude Code falls back to
  `~/.claude/.credentials.json` when the Keychain is locked in an SSH session
  [hma-host-claude-code-auth]{1}; Codex can be set to `file` storage
  [hma-host-codex-auth]{2}; a practitioner reports Claude Code failing in that
  state [hma-host-projectinsomnia-keychain]{2} (see Contradictions).
- Tailnet policy: tags mark non-user devices such as servers and remove
  user-based authentication from them [hma-host-tailscale-tags]{1}[hma-host-tailscale-tags]{2};
  tagging the Mini fits, while laptops and phones stay user devices
  [hma-host-tailscale-tags]{6}.

### Alternatives

- **herdr-core line**: covered above; deferred rather than rejected.
- **tmux + ccmux or agent-deck**: a real trade rather than a dominated option
  {inferred}. Both are current and use hooks for status
  [hma-herdr-alternatives-currency]{2}[hma-herdr-alternatives-currency]{3}; Moshi
  integrates tmux as deeply as Herdr [hma-android-moshi-docs-multiplexer]{1}[hma-android-moshi-docs-multiplexer]{4};
  agent-deck adds Telegram and ntfy bridges [hma-android-agent-deck-readme]{3}.
  Herdr TUI offers native agent resume [hma-herdr-tui-session-state-docs]{5}
  and attention rollups [hma-herdr-source-master]{1} {confidence: master-branch
  source; v0.9.5 not checked}.
- **Provider-native remote**: excluded by single-vendor scope and host
  requirements (above).

## 2. Agent Board disposition: retire the product

What Agent Board does, from its architecture: per-tab managed launchers that
observe Codex through a private app-server and Claude through bundled hooks,
normalize state into a five-glyph projection with confidence, write it into
Ghostty tab titles via AppleScript, acknowledge completion on focus, and run a
doctor.

| Agent Board capability | Recommended stack |
|---|---|
| Persistent `project: feature` label per session | Herdr workspace/tab/pane/agent rename [hma-herdr-tui-agents-notify-docs]{7}; Moshi renames workspaces, tabs and panes on the host [hma-android-moshi-docs-sidebar]{4}; label persistence across a server restart not documented [hma-herdr-tui-agents-notify-docs]{8} |
| Working / needs-input / done-unread / idle | Herdr blocked/done/working/idle with done held until seen [hma-herdr-tui-agents-notify-docs]{5}[hma-herdr-tui-agents-notify-docs]{6} |
| Attention ordering | Herdr rollup: blocked, unseen done, working, seen idle, unknown [hma-herdr-source-master]{1} {confidence: master-branch source; v0.9.5 not checked} |
| Failed state | Not in Herdr's state set [hma-herdr-tui-agents-notify-docs]{6} — a gap |
| Visible state source / confidence | Not shown in the sidebar per the docs read; `herdr agent explain` reports the matched rule and fallback reason [hma-herdr-tui-agents-notify-docs]{9}[hma-lead-herdr-tui-state-api]{6} — a gap |
| Focus acknowledgement | Done badge tracked per client [hma-herdr-tui-agents-notify-docs]{6} |
| Ghostty tab titles | Not applicable to a remote host |

Herdr TUI lets hooks and plugins report agent state with `pane.report_agent`,
which "affects waits, notifications, and rollups"
[hma-lead-herdr-tui-state-api]{1}[hma-lead-herdr-tui-state-api]{2}. Only the
named state-reporting integrations replace screen reading; "The others leave
state to screen detection" [hma-lead-herdr-tui-state-api]{4}, and Claude Code and
Codex are among the others [hma-herdr-tui-agents-notify-docs]{3}. Herdr added
Codex turn reporting in v0.9.4 and removed it in v0.9.5
[hma-herdr-releases]{5}[hma-herdr-releases]{2}. Herdr's guidance for user hooks
beside a managed integration is to "use metadata instead of report-agent", which
"changes presentation without taking over the integration's idle, working,
blocked, or session restore authority" [hma-lead-herdr-tui-state-api]{5}; a
custom reporter's resume command holds only while it holds the pane
[hma-lead-herdr-tui-state-api]{3}. Hooks also miss some transitions: "Esc,
rewound turns and cancelled dialogs fire no hook"
[hma-core-claude-code-osc7501-issues]{2}.

So reusing Agent Board's event mapping inside Herdr has two shapes, both
narrower than Agent Board itself {inferred}:

- **Display metadata beside the managed integrations.** Per-state labels and
  tokens are visual only; waits, notifications and rollups still use Herdr's
  state [hma-herdr-tui-agents-notify-docs]{8}. This could label a pane with
  hook-observed state, partly answering the source-visibility gap, without
  touching resume.
- **Replacing the managed integrations** with a reporter that holds the pane and
  supplies its own resume command. Whether a custom report overrides screen
  detection for Claude or Codex is not documented, and this would give up the
  official resume path the TUI choice relies on.

The composed recommendation: archive Agent Board, run Herdr's screen inference
first, and consider the display-metadata shape only if missed or false blocked
states prove costly in practice. What the operator gives up meanwhile is a
visible state-source and confidence marker. In herdr-core, native OSC 7501
emission plus third-party hook shims [hma-core-app-issue-537]{6} would fill the
observation role instead.

## 3. Attention-management assessment

| Criterion | How well the recommended stack meets it |
|---|---|
| Context visibility | Good if labels live in Herdr workspace/tab names: Moshi shows them, and agent rows can "Use tab names" [hma-android-moshi-docs-sidebar]{7}. Label persistence across a server restart is not documented [hma-herdr-tui-agents-notify-docs]{8}. |
| Attention ("who needs me now") | Ordering exists in Herdr (master-branch source) and is documented in Moshi. Herdr "only marks blocked when the live bottom-buffer snapshot matches known visible approval, question, or permission UI", falls back to idle otherwise, and warns "idle status is not authorization to approve an action" [hma-herdr-tui-agents-notify-docs]{4}. Expect some missed blocked states; Moshi's hook-sourced Agents view may catch some the Sidebar misses {inferred}. |
| Task visibility | Partial: Moshi Chat View renders Claude/Codex conversations but is experimental [hma-android-moshi-docs-hooks]{2}; wherdr reads transcripts [hma-wherdr-docs]{4}. No tool tracks requested versus remaining work; Herdr Projects is the later answer. |
| Session persistence | Panes survive client loss by design [hma-herdr-tui-remote-docs]{9}, with #5170 and #5471 as watch items. |
| Cross-device continuity | Good with one hazard: avoid laptop and phone on the same Claude tab (#5749). |
| Notification quality | Moshi push with one inbox row per session and rate limits [hma-android-moshi-docs-push]{5}[hma-android-moshi-docs-hooks]{5}; silent for agents outside Herdr/tmux by default [hma-android-moshi-docs-hook-settings]{1}. Codex's own `notify` fires only on turn completion [hma-android-codex-config-advanced]{1}. MacBook alerts via Herdr terminal notifications [hma-herdr-tui-agents-notify-docs]{10}. |
| Scaling to 5–15 | Not established by any source; #5471 reports involve ~25 panes [hma-herdr-open-issues]{2}. |
| Recovery | Orderly restarts resume agents [hma-herdr-tui-session-state-docs]{5}[hma-herdr-releases]{3}; a power cut restores from the last periodic snapshot [hma-herdr-tui-session-state-docs]{4}. Either way only after FileVault unlock (LAN) and a client attach, with open resume-identity bugs. |

Guardrail checks:

- **Inferred versus native state.** Not met by the recommended stack. Herdr's
  Claude and Codex state is screen-inferred with no documented sidebar marker,
  and Moshi's two views draw on different sources without labelling them
  {inferred: from §1 and §2}. herdr-core meets it by construction; the
  display-metadata option in §2 could partly meet it in the TUI.
- **No keystroke as semantic approval.** No component in the recommended stack
  documents structured approval carriage. Moshi's hook event list is
  unpublished, so a structured path cannot be excluded
  [hma-android-moshi-docs-hooks]{4}. Moshi's screen re-verification is the
  closest documented control found [hma-android-moshi-docs-multiplexer]{2};
  enabling its E2EE binds each decision "to one specific approval"
  [hma-android-moshi-docs-e2ee]{2}. wherdr documents its one-tap answers as
  input written into the pane [hma-wherdr-docs]{8}.

## 4. Recommended architecture

```text
            Android phone                         MacBook Air
   Tailscale app + Moshi Pro (mosh/SSH)     Tailscale + Ghostty (ssh, then herdr)
   [later] wherdr PWA (HTTPS)                            │
                 │          tailnet (WireGuard)          │
                 └───────────────┬───────────────────────┘
                                 │  OpenSSH :22 (Remote Login), mosh UDP
                                 │  wherdr via tailscale serve (later)
                        Mac mini (macOS 26, FileVault on)
   tailscaled (LaunchDaemon, tagged, key expiry off, Tailscale SSH off)
   admin user (FileVault unlock, maintenance)
   agent user: Herdr TUI server ─ panes: claude / codex per project:feature
               moshi-hook (outbound HTTPS push, E2EE on) · [later] wherdr
               Codex creds = file · Claude creds = file fallback
   LAN path for pre-boot unlock: MacBook at home, or a scoped LAN subnet router
```

Core: Mac mini, `tailscaled`, macOS Remote Login, Herdr TUI with its Claude and
Codex integrations, Claude Code, Codex, Moshi Pro + moshi-hook. Optional:
wherdr (with passkey), a LAN subnet router, a UPS, a Herdr display-metadata
reporter, Herdr Projects 1.x.

Interfaces: SSH/mosh over the tailnet for interaction; Herdr's local Unix socket
for wherdr, moshi-hook and any reporter [hma-herdr-tui-agents-notify-docs]{13};
moshi-hook to Moshi's push service over outbound HTTPS
[hma-android-moshi-docs-hooks]{10}; Tailscale Serve for wherdr HTTPS
[hma-wherdr-docs]{5}.

Model B path: Herdr Projects 1.x targets Herdr TUI [hma-herdr-projects-readme]{1},
but its author renamed the project Shepherdr and moved it to the Herdr app and
herdr-core [hma-herdr-projects-readme]{3}[hma-herdr-projects-readme]{4}, and
wherdr's board accepts only the 1.x line [hma-wherdr-docs]{9}. Parallel workers
also multiply exposure to screen-inferred state and resume-identity bugs
{inferred}. Treat the start of Model B as the decision point to re-evaluate the
core line.

## 5. Implementation sequence

Two phases, at the operator's direction. Phase 1 delivers the working host with
a UPS and laptop and phone access; Phase 2 adds the recovery device. Steps are
composed from the cited facts.

### Phase 1 — UPS, Mac mini with Herdr, laptop and phone access

1. **Host baseline.** Confirm FileVault on and store the recovery key off the
   Mini [hma-host-apple-macos-fv-help]{4}. Create an admin account (unlock) and
   a standard agent account. Enable Remote Login for named users
   [hma-host-apple-macos-remote-login]{2}; set Energy "Start up when power is
   connected" = Always [hma-host-apple-poweron-mini]{2} and disable sleep
   [hma-host-man-pmset]{1}.
2. **UPS.** Put the Mini, router and modem on the UPS. Connect its USB cable to
   the Mini and set Energy > UPS Options or `pmset -u` thresholds
   [hma-reboot-apple-ups-help]{2}[hma-reboot-man-pmset-ups]{1}.
3. **Tailscale.** Install `tailscaled` as a system daemon
   [hma-host-tailscale-tailscaled-wiki]{2}, tag the Mini so key expiry is off
   [hma-host-tailscale-key-expiry]{4}, leave Tailscale SSH off, and limit access
   to the Mini to the operator's devices in the tailnet policy.
4. **Reboot drill before anything else.** Pull the power (not just `shutdown`);
   SSH-unlock from the MacBook on the LAN; confirm `tailscaled` comes up and SSH
   works over the tailnet without any GUI login. Then trigger a UPS shutdown and
   restore mains power to see whether the Mini starts again. Also test whether a
   key-only `sshd_config` drop-in still allows the pre-boot unlock
   (undocumented), and run `fdesetup supportsauthrestart` on the Mini.
5. **SSH hardening** once the drill passes: key-only drop-in
   [hma-host-man-sshd-config]{5}.
6. **Agents.** Install Claude Code and Codex for the agent user; set Codex
   `cli_auth_credentials_store = "file"` [hma-host-codex-auth]{2} and confirm
   where Claude stored credentials [hma-host-claude-code-auth]{1}.
7. **Herdr TUI.** Install; install the Claude and Codex integrations, which
   native resume requires [hma-herdr-tui-session-state-docs]{5}; start
   `herdr server` from SSH and confirm it survives closing that SSH session
   (SSH starts keep Herdr's direct spawn [hma-reboot-herdr-pr-5236]{3}); check
   `launchctl managername` inside a pane to see its launchd context. Create one
   workspace per project and name tabs by feature. Work from the MacBook with
   `ssh` then `herdr`; try `herdr --remote` [hma-herdr-tui-remote-docs]{10}
   separately. Repeat the power pull, confirm what resumes after attaching, and
   test whether a scripted client triggers resume.
8. **Android.** Install Tailscale and Moshi; start on the free tier over SSH,
   then Pro for mosh and Herdr integration. Install moshi-hook with Homebrew,
   pairing with `--store file` for a headless host [hma-android-moshi-docs-hooks]{3},
   and turn on E2EE [hma-android-moshi-docs-e2ee]{2}; run `moshi-hook doctor`
   for the Codex daemon issue. Put `herdr` and mosh-server on the agent user's
   non-interactive SSH PATH
   [hma-android-moshi-docs-herdr]{6}[hma-android-moshi-article-mosh-macos-path]{2}.
   Confirm moshi-hook is running after a reboot with no GUI login. Test push and
   an approval round trip on cellular — the adoption gate.
9. **Update routine.** Turn off automatic macOS and Background Security
   Improvement installs; patch weekly in a planned window from home, letting the
   orderly macOS restart trigger Herdr's documented pre-restart save rather than
   stopping the server by hand (§7.1). Confirm agents resume after the first
   patch restart.

Phase 1 accepted risk: a reboot while the operator is away leaves the Mini at
the FileVault prompt until someone unlocks it from the home LAN; the UPS and the
update routine make that rarer {inferred}.

### Phase 2 — recovery device

10. **Choose the device** using the Phase 1 drill results (§7.3 decision
    criteria): a Raspberry Pi relay with watchdog, or a KVM-over-IP box.
11. **Deploy it** on the UPS, wired, tagged in Tailscale, with access limited to
    the operator's devices; add the watchdog and outage alerts (ntfy,
    Healthchecks) where the device can run them.
12. **Optional smart plug** for powering on a hung Mini (§7.3).
13. **Drill from away:** pull the Mini's power while away from home, receive the
    alert, unlock through the recovery device, attach, and confirm resume.
14. **Live with Model A for a while** before adding wherdr, a display-metadata
    reporter, or Herdr Projects.

## 6. Risks and unresolved questions

- **Reboot while away**: likely unreachable until someone unlocks FileVault from
  the LAN; mitigations and their limits are in §7.
- **Security Improvement restarts** may land at the unlock screen
  [hma-host-apple-platform-support-updates]{2}; whether `fdesetup authrestart`
  works on this model is unknown [hma-host-man-fdesetup]{4}.
- **Herdr server lifecycle**: no boot start; resume waits for a client attach;
  an SSH-started server keeps the SSH caller's context, and the macOS
  terminal-quit fix is not yet released [hma-herdr-releases]{6}.
- **Power-cut recovery** restores from a snapshot up to 15 minutes old
  [hma-herdr-tui-session-state-docs]{4}.
- **Login-started services** (moshi-hook via `brew services`, wherdr) may not
  start with no GUI login.
- **Missed or wrong state**: strict blocked detection, screen inference, no
  failed state, no visible source marker; resume identity bugs; Moshi's two
  views can disagree.
- **Shared-tab stall** (#5749), the MacBook remote-bridge stall (#5624), and
  memory growth with a sleeping client (#5471).
- **Moshi approvals are documented as keystrokes**; one Play review reports
  Android approvals failing, and the developer replied that this "isn't
  expected" [hma-android-moshi-play-listing]{8}; Codex misattribution needs
  `moshi-hook doctor`.
- **Moshi metadata**: event summaries, prompt and response excerpts, up to 256
  characters of approval commands and project names pass through Moshi's
  server unless E2EE is on, which it is not by default
  [hma-android-moshi-docs-hooks]{6}[hma-android-moshi-docs-e2ee]{1}.
- **wherdr exposure**: "a remote shell as your user" [hma-wherdr-docs]{3};
  require the passkey and limit tailnet access.
- **Model B ecosystem drift**: the TUI-line orchestration add-on is one its
  author has moved past [hma-herdr-projects-readme]{3}.
- **Tailscale daemon maintenance**: `tailscaled` has no auto-update and is "less
  tested" [hma-host-tailscale-tailscaled-wiki]{4}.
- **Vendor churn**: wherdr and herdr-core are weeks old; Herdr manifests update
  remotely [hma-herdr-tui-agents-notify-docs]{9}; moshi-hook auto-updates every
  6 hours [hma-android-moshi-docs-hook-settings]{4}.

## 7. Reboot resilience

No component keeps a live agent process through a reboot: processes end, and
work returns through layout restore plus native resume
[hma-herdr-tui-session-state-docs]{1}[hma-herdr-tui-session-state-docs]{5}. The
mitigations below make reboots rarer and cleaner, keep them recoverable while
away, and make resume as automatic as the tools allow. Agents' own durable-work
habits (commits, progress notes) are assumed and not re-examined here. §5 steps
2, 4, 7, 9 and Phase 2 carry the resulting tests and additions.

### 7.1 Verified mitigations

| Mitigation | What the sources establish | Caveats |
|---|---|---|
| Update routine | Turn off "Install macOS updates" [hma-reboot-apple-macos-autoupdates]{1} and Background Security Improvements "Automatically Install" [hma-reboot-apple-bsi-support]{3}; with BSI off, fixes wait for the next software update [hma-reboot-apple-bsi-support]{4}. Install by hand with `softwareupdate --install --os-only --restart` [hma-reboot-man-softwareupdate]{1}. | With no user logged in, `--restart` means macOS "will trigger a forced reboot if necessary" [hma-reboot-man-softwareupdate]{3}; plan for it to land at the FileVault prompt and run the window from home or with the rescue device ready {inferred}. A practitioner reports Apple's updates use authenticated restarts that can fail to a password prompt [hma-reboot-eclectic-authrestart]{4} {confidence: practitioner, pre-macOS 26}. OS-level BSIs "require the device to restart" [hma-reboot-apple-bsi-platform-support]{1}, which reconciles with §1's "may require": only OS-level ones do. Deferring is a security cost: each fix stays unapplied until the next window, so keep the window short (weekly is a composed suggestion). The third toggle, "Install Security Responses and system files", is named alongside Rapid Security Responses [hma-reboot-apple-macos-autoupdates]{1}; which updates it governs is unclear (see Contradictions). Deferral timers and enforcement are described for supervised, device-managed Macs [hma-reboot-apple-deploy-enforce-updates]{1}[hma-reboot-apple-deploy-enforce-updates]{4} {inferred: an unmanaged Mac has only the toggles and the CLI}. |
| Authenticated restart for planned reboots | `fdesetup authrestart` restarts "bypassing the initial unlock" on supported hardware and "may not work on all systems" [hma-host-man-fdesetup]{4}; `supportsauthrestart` reports support [hma-reboot-man-fdesetup-authrestart]{3}. It returned `true` on the operator's Apple-silicon laptop, not the Mini [hma-reboot-local-softwareupdate-state]{3}. | Holds an extra copy of the unlock key in memory and the SMC until unlock [hma-host-man-fdesetup]{2}. Cannot cover power loss, a UPS shutdown or a panic {inferred}. After it, no GUI user is logged in {inferred}. |
| UPS with automatic shutdown | Energy > UPS Options for a USB UPS; the Mac shuts down when the first condition is met [hma-reboot-apple-ups-help]{2}[hma-reboot-apple-ups-help]{4}; CLI `pmset -u haltlevel/haltafter/haltremain` on desktops [hma-reboot-man-pmset-ups]{1}[hma-reboot-man-pmset-ups]{4}. | macOS's UPS script has a gentle `shutdown -h now` path and an abrupt `shutdown -hu` path; which one the Energy settings use was not observed [hma-reboot-local-ups-plumbing]{1}. Herdr saves "before the system starts closing apps" for a macOS restart [hma-herdr-releases]{3}; that a UPS shutdown behaves the same is {inferred}, and a hard kill stays outside Herdr's graceful recovery [hma-reboot-herdr-issue-4414]{4}. The Mini restarts on power return only if the UPS output is actually cut and restored {inferred}; test with the chosen UPS. It still lands at the FileVault prompt. A UPS makes outages cleaner, not rarer. |
| Herdr start after reboot | `herdr server` is meant "for supervised or service-style setups" [hma-herdr-tui-remote-docs]{14}. A LaunchAgent setup was reported to hang restoring a session until a Files and Folders grant, with responsiveness fixed in v0.9.4 [hma-reboot-herdr-issue-4926]{1}[hma-reboot-herdr-issue-4926]{2}[hma-reboot-herdr-issue-4926]{3}. | A LaunchAgent needs a GUI login [hma-host-apple-launchd-archive]{2}, which FileVault-on never produces unattended. SSH-started servers run in a Background launchd context where Keychain-backed tools fail [hma-reboot-herdr-issue-966]{1}; a daemon start is in the system domain, which has no distinct sessions [hma-reboot-man-launchd-plist]{2}, so it is likely the same {inferred}. Claude Code and Codex can use credential files [hma-host-claude-code-auth]{1}[hma-host-codex-auth]{2}. Open #4291: a peer's saved-machine bridge starts the server inside sshd right after a reboot [hma-reboot-herdr-issue-4291]{5}[hma-reboot-herdr-issue-4291]{6}. Herdr's newer launchd start path keeps "the old direct spawn" for SSH starts [hma-reboot-herdr-pr-5236]{3}. Disposition {inferred}: a boot-time daemon start is not worth adding now, since it would not change the launchd context and does not remove the attach; revisit if a scripted attach proves to trigger resume, when the rescue device's watchdog could start the server and attach after unlock. |
| Unattended agent resume | Resume runs "After a client attaches and provides terminal size and theme context" [hma-lead-herdr-tui-state-api]{7}; master source gates it on a client resize path [hma-reboot-herdr-source-resume-gating]{3}. | No flag or config resumes without a client. Whether a scripted `herdr terminal session control --takeover` client counts is untested {ambiguous: not traced in source}. Practical routine: after unlock, attach once from Moshi or the MacBook, then check that each pane resumed the right conversation, given open resume-identity bugs [hma-herdr-open-issues]{9}. |
| Herdr live upgrade (`--handoff`) | Keeps pane processes across a server replacement; experimental [hma-reboot-herdr-docs-named-sessions-handoff]{4}; only for installs managed by Herdr's own updater, not Homebrew [hma-reboot-herdr-docs-named-sessions-handoff]{6}. | Reports conflict: one reporter finds the handoff step works [hma-reboot-herdr-issues-handoff]{4}; open macOS issues report a cleared session id when two panes share one, and lost permission attribution (which also occurs without handoff) [hma-reboot-herdr-issues-handoff]{1}[hma-reboot-herdr-issues-handoff]{2}. It does not help across a reboot. Not recommended for routine updates; prefer the orderly-restart path, whose pre-restart save is documented [hma-herdr-releases]{3} {inferred}. |

### 7.2 FileVault-off fallback, stated precisely

With FileVault off on Apple silicon, "the volume is still encrypted but the
volume encryption key is protected only by the hardware UID in the Secure
Enclave" [hma-reboot-apple-security-filevault-volume]{3}; FileVault's addition is
that credentials "are required during the boot process"
[hma-reboot-apple-security-filevault-volume]{6}. Without it, boot completes
unattended and daemons start {inferred}, and automatic login becomes possible
[hma-host-apple-autologin]{1}. Two variants differ sharply {inferred}:

- **FileVault off, manual login.** Tailscale and SSH return unattended; Herdr
  still starts in a Background context. A person holding the Mac faces account
  passwords and recoveryOS rather than a boot-time credential. Changing startup
  security needs administrator credentials
  [hma-reboot-apple-security-startup-policy]{3}, and with Find My on, Full
  Security and two-factor authentication, Activation Lock blocks erase and reuse
  [hma-reboot-apple-actlock-mac-support]{1}[hma-reboot-apple-actlock-mac-support]{3}.
  Apple does not state what recoveryOS allows against a FileVault-off data volume
  {ambiguous: no fetched Apple text}.
- **FileVault off, automatic login of the agent user.** Herdr would also get a
  GUI launchd context after reboot (untested). But anyone who restarts the Mac
  lands in the agent user's session with no password, holding its credential
  files — `~/.claude/.credentials.json` and the plaintext `~/.codex/auth.json`
  [hma-host-claude-code-auth]{1}[hma-host-codex-auth]{1} — and its running agents.

Keep FileVault on unless the power-pull drill shows remote unlock is unworkable;
if it does, prefer the manual-login variant.

### 7.3 The rescue device

Most rescue-device sources were read as tool-processed extracts
{confidence: search-summary}, so treat these specifics as leads to confirm on
setup.

**What it is.** A small always-on computer on the home LAN (a Raspberry Pi is
the default) that runs Tailscale and gives the phone a foothold inside the house
when the Mini is waiting at the FileVault prompt, where its own Tailscale is
likely not running yet {inferred}. If the drill shows `tailscaled` does not come
up after unlock without a GUI login, the rescue route becomes the everyday
access path too {inferred}.

**Two ways to use it.**

- *SSH jump host:* the phone connects to the Pi over the tailnet and jumps to
  the Mini's LAN address. OpenSSH `ProxyJump` forwards TCP to the target
  [hma-rescue-ssh-config-proxyjump]{2} {confidence: search-summary}, so the unlock password goes end-to-end to
  the Mini and the Pi never holds it {inferred}. Moshi supports jump hosts only in
  SSH mode, not mosh, and its docs do not confirm the Android build has the
  setting [hma-rescue-moshi-docs-jumphost]{1}[hma-rescue-moshi-docs-jumphost]{4} {confidence: search-summary}.
- *Scoped subnet router:* the Pi advertises only the Mini's address and the
  tailnet policy allows only the operator's devices to its port 22; any phone
  SSH client then reaches the Mini directly. Policy destinations take a single
  `IP:port` [hma-rescue-tailscale-acl-syntax]{1}, and routes and access rules are
  separate controls [hma-rescue-tailscale-subnets-detail]{6}. A single-host /32
  route is expected to work but is not shown in the docs
  [hma-rescue-tailscale-subnets-detail]{1}. {confidence: search-summary for all three}

Whether the Mini's pre-boot SSH accepts a connection arriving through either
path is untested; the drill should include it.

**Watchdog.** The Pi can probe the Mini and push an alert through ntfy, which
accepts plain HTTP posts from scripts [hma-rescue-ntfy-docs]{1}; on the public
server "topic names are public", so use an unguessable topic or self-host
[hma-rescue-ntfy-docs]{3}. An external dead-man's switch such as Healthchecks.io
alerts when pings stop [hma-rescue-healthchecks-docs]{1}, which also covers the
whole house losing power or internet {inferred}. If the Mini answers SSH on the
LAN but not on the tailnet, it is probably waiting for unlock, though that cannot
be told apart from "booted but Tailscale failed" {inferred}.

**What it solves:** remote FileVault unlock while away; outage alerts; a place to
run small home scripts. **What it does not solve:** a hung or powered-off Mini
(needs a smart plug or KVM), agent processes ending at reboot, the need to attach
once for resume, or an outage that also takes down the Pi, router or internet
(a UPS covering all of them reduces this). **Pros:** keeps FileVault on; the
unlock stays manual and end-to-end; inexpensive general-purpose hardware.
**Cons:** another device to patch and power; SD-card storage is fragile under
power loss, while PiKVM, for comparison, runs read-only "to prevent it from being
damaged by a sudden power outage" [hma-rescue-pikvm-faq]{3}; USB or NVMe boot is
available on newer Pis [hma-rescue-rpi-getting-started]{3}; an SSH daemon or a
route into the LAN is added to the tailnet.

**Other approaches.**

| Option | Adds | Limits |
|---|---|---|
| Router with built-in Tailscale (e.g. GL.iNet) | No extra box; the router must be up anyway | "Allow Remote Access LAN" advertises the LAN, so policy must narrow it; some models lack memory [hma-rescue-glinet-router-tailscale]{1}[hma-rescue-glinet-router-tailscale]{3}; no watchdog host |
| Apple TV as subnet router | Uses an existing device | Needs tvOS 17+ and home-hub role [hma-rescue-tailscale-appletv]{1}[hma-rescue-tailscale-appletv]{2}; no shell documented, so no watchdog [hma-rescue-tailscale-appletv]{3} |
| KVM-over-IP (PiKVM, JetKVM, GL.iNet Comet) | Screen and keyboard for a hung Mini or Recovery | Typing at the Apple-silicon FileVault screen is {contested}: JetKVM says "Anything with HDMI out and USB works, from the BIOS onwards" [hma-rescue-jetkvm-faq]{1}; PiKVM lists macOS keyboard issues [hma-rescue-pikvm-faq]{1}; Apple says a locked Mac must be unlocked before allowing an accessory (page names laptops) [hma-rescue-apple-accessories]{3}. No power control for a Mac mini (no ATX header) {inferred} |
| Smart plug | Power-on of a hung or off Mini via "Start up when power is connected" [hma-host-apple-poweron-mini]{3} | Unclean power cut; still lands at FileVault [hma-host-apple-deploy-filevault-intro]{1}; needs a controller reachable while away (a vendor cloud, or the Pi on the LAN) and sits between the UPS and the Mini {inferred} |
| Wake-on-LAN | Nothing here | Wake from sleep [hma-rescue-apple-mac-wake-settings]{1}, which the always-on Mini does not use {inferred} |

**Phase 2 decision: Pi or KVM** {inferred: composed from the rows above}.

| | Raspberry Pi relay | KVM-over-IP box |
|---|---|---|
| Remote FileVault unlock | Through the documented SSH unlock, relayed over the tailnet | By typing at the unlock screen, which is unverified on Apple silicon; or by acting as the relay if the box permits it |
| Hung or stuck Mini, Recovery | No; needs a smart plug | Shows the screen and gives a keyboard; still needs a smart plug to power on |
| Watchdog and alerts | Yes, a general Linux host | Not documented for JetKVM or Comet |
| Power-loss robustness | SD card fragile; boot from USB | PiKVM runs read-only for this reason [hma-rescue-pikvm-faq]{3} |

PiKVM sits between the two: it runs on a Raspberry Pi and installs packages
such as Tailscale [hma-rescue-pikvm-docs-home]{1}[hma-rescue-pikvm-tailscale]{1},
so it could plausibly also act as the SSH relay and watchdog, though its
read-only filesystem makes extra services more involved {inferred: not
documented}. The deciding input is the Phase 1 drill. If pre-boot SSH unlock
over the LAN works reliably, a Pi relay covers the main need and a KVM adds only
hung-Mini recovery. If it is unreliable, a KVM becomes the main path, bought
with a return window and tested at the FileVault screen first. Either way, use
wired Ethernet, the shared UPS, USB or read-only storage, and a smart plug for
power-on.

## Contradictions

- **Mosh through Tailscale SSH.** Moshi docs: mosh "cannot bootstrap through
  Tailscale SSH" [hma-android-moshi-docs-tailscale]{3}. Blink docs: enable
  Tailscale SSH, then install and run mosh [rps-blink-tailscale-mosh]{2}[rps-blink-tailscale-mosh]{3}.
  A Moshi article: keep both, "Both can coexist" [hma-android-moshi-article-mosh-failed]{2}.
  Not adjudicated; the recommendation avoids Tailscale SSH. {contested: client bootstrap behaviour}
- **Tailscale before login on macOS.** Variants page: `tailscaled` runs before
  login [hma-host-tailscale-macos-variants]{3}. Run-unattended KB: the client
  runs within the user login session and a system daemon "is not currently
  supported" [hma-host-tailscale-run-unattended]{3}. {ambiguous: the KB does not name the variant}
- **Claude Code with a locked Keychain over SSH.** Official docs: file fallback
  [hma-host-claude-code-auth]{1}. Practitioner: refused to start
  [hma-host-projectinsomnia-keychain]{2}. {ambiguous: possibly version-dependent}
- **Pane survival on client loss.** Herdr docs: panes keep running
  [hma-herdr-tui-remote-docs]{4}. #5170 reporter: every pane killed; maintainer
  non-repro [hma-herdr-open-issues]{1}. {ambiguous: reproduction conditions}
- **Moshi approvals on Android.** Vendor: approval and completion alerts reach
  Android on the same licence [hma-android-moshi-docs-licensing]{1}. One review: approvals
  never worked [hma-android-moshi-play-listing]{8}. The review qualifies the
  vendor claim for one user's setup; unresolved until tested.
- **Phone support for Herdr.** TUI docs: works on a phone through any SSH client
  [hma-herdr-tui-remote-docs]{8}. Mobile page: the phone app does not support
  TUI [hma-herdr-site-product-pages]{5}. {incommensurable: terminal-over-SSH versus native app}
- **Herdr on narrow screens.** Docs: the TUI adapts to narrow screens
  [hma-android-herdr-docs-how-to-work]{2}. User report: long labels and footers
  do not fit [hma-android-herdr-issue-3840]{3}. Tension.
- **Security-response toggle scope.** Mac User Guide: "Install Security
  Responses and system files" covers Rapid Security Responses
  [hma-reboot-apple-macos-autoupdates]{1}. BSI pages: Background Security
  Improvements are the mechanism from macOS 26.1 [hma-reboot-apple-bsi-support]{1}.
  Deployment guide: the Mac security-updates setting covers "XProtect,
  Gatekeeper, and system data files" [hma-reboot-apple-deploy-enforce-updates]{7}.
  {ambiguous: which updates the toggle governs}
- **KVM input at the FileVault screen.** JetKVM: works "from the BIOS onwards"
  [hma-rescue-jetkvm-faq]{1}. PiKVM: macOS keyboard may need fixes
  [hma-rescue-pikvm-faq]{1}. Apple: a locked Mac must be unlocked before allowing
  an accessory [hma-rescue-apple-accessories]{3}. {contested: untested on an Apple-silicon Mac mini}
- **ConnectBot and mosh.** Moshi's comparison table lists no mosh
  [hma-android-moshi-article-android]{6}; the Play listing says "SSH & Mosh
  client" [hma-android-connectbot-play]{1}. Contradicts; not load-bearing.

## Disconfirming analysis

- *TUI over core.* Searched for core reboot resume or closed-app push: the
  mobile FAQ says no resume [hma-core-site-mobile-privacy-faq]{6}, and the only
  documented alert is the in-app banner [hma-core-site-mobile-privacy-faq]{1}.
  Counter-weight: core's program-reported status [hma-core-readme]{6}, Model B's
  orchestration add-on moving to core [hma-herdr-projects-readme]{4}, and no
  core equivalent of #5170 in the sampled issues {inferred: absence in a sample}.
  The recommendation flips if the operator values reported state over resume
  and push, or once Model B starts.
- *FileVault on.* Sought evidence that remote unlock is impossible: Apple
  documents it [hma-host-apple-deploy-filevault-intro]{1}. The remaining risk is
  reach, not capability.
- *Moshi as primary.* Sought a Herdr-aware Android alternative with documented
  structured approvals: none found; wherdr writes answers into the pane
  [hma-wherdr-docs]{8}.
- *Retiring Agent Board.* Sought a supported way to feed native Claude/Codex
  state into Herdr TUI: `pane.report_agent` exists [hma-lead-herdr-tui-state-api]{1},
  but Herdr directs user hooks beside a managed integration to display metadata
  [hma-lead-herdr-tui-state-api]{5}. The recommendation rests on that constraint
  and on hook blind spots, not on impossibility.

## Revisit if

- herdr-core ships agent resume (proposal #15) or closed-app phone push, or
  Moshi and wherdr add core support; or Model B begins.
- Herdr TUI documents a macOS boot service, releases #5236, adds a failed state,
  a state-source marker, an official Claude/Codex state reporter or structured
  approvals, or fixes #5749, #5624 or #5471.
- Apple documents SSH-unlock network conditions or account scope, or Tailscale
  ships a macOS system-daemon mode in its standard app.
- Moshi documents structured PermissionRequest handling or an Android page.
- In use, Herdr's screen inference misses blocked states often enough to justify
  the display-metadata reporter.
- `fdesetup supportsauthrestart` returns false on the Mini, a UPS test shows no
  power-return start, a scripted client triggers (or fails to trigger) Herdr
  resume, pre-boot SSH fails through the rescue path, or a KVM is shown to type
  at the Apple-silicon FileVault screen.

## Revisions

- 2026-11-10 — first correction pass after adversarial-read (NEEDS-REVISION,
  H1–H2, M1–M9, L1–L9 in `verification-checklist.md`). H1 corrected the stated
  reason for retirement (Herdr TUI does accept reported state) while keeping
  the retirement recommendation on narrower grounds; H2 re-pointed the
  client-attach quote to a new lead attestation (`hma-lead-herdr-tui-state-api`);
  the herdr-core lane was registered as an amendment in `dispatch.md`.
- 2026-11-10 — second correction pass after the adversarial re-check (N1–N2)
  and isolated evaluation (ten recommendations in `campaign-evaluation.md`):
  scoped the state-reporting claims to named integrations and added Herdr's
  metadata guidance; added Direct answers, the two-phase boot model, the
  inferred-state guardrail check, MacBook and phone-UX notes, Model B and
  out-of-scope statements, tailnet and subnet-router security notes, and Moshi
  E2EE in step 7; moved authoring history out of the body.
- 2026-11-10 — extension: added §7 Reboot resilience from two further lanes
  (`reboot-host-controls`, `rescue-access`), registered in `dispatch.md`.
- 2026-11-10 — §7 correction pass after its adversarial read (S7-H1, S7-M2–M7,
  S7-L1–L11): split the FileVault-off variants by login mode, added the
  security-response toggle and KVM contradictions, tightened UPS and handoff
  claims, marked extract-tier rescue sources, and carried §7 into §4–§6.
- 2026-11-10 — §7 evaluation pass: replaced the "stop the server first" update
  step with the documented orderly-restart save, added the Herdr auto-start
  disposition and the add-on-or-change direct answer, stated the patch-delay
  security cost, and marked extract-tier rescue citations per claim.
- 2026-11-10 — operator direction: §5 restructured into Phase 1 (UPS, host,
  Herdr, laptop and phone access) and Phase 2 (recovery device); §7.3
  recommendation replaced by Pi-versus-KVM decision criteria.
