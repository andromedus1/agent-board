---
name: remote-persistent-supervision-landscape
description: Read this before scoping phone-driven or remote-host supervision for Agent Board, or before a build-versus-migrate call; it maps how existing tools keep coding-agent sessions alive on an always-on host and surface their status to a phone.
type: landscape
kind: research
status: active
updated: 2026-10-26
summary: |
  Breadth survey of four approach families for supervising Codex and Claude sessions that live on an always-on host and are watched from a phone: multiplexer-shaped agent supervisors, the generic multiplexer-plus-transport-plus-phone-client stack, provider-native remote and cloud surfaces, and phone-first web supervisors. Host-side owners make live-process persistence across client loss routine; no fetched source documents a status glyph in the session name that survives rename, and status authority, approval semantics, and phone-visible status differ across and within families.
key_findings:
  - Live agent processes survive laptop sleep and client loss when a host-side owner (tmux, zellij, Herdr, a product daemon, or a vendor cloud) holds them; no fetched source documents keeping a live interactive agent process across a host reboot, and recovery is layout, provider resume, relaunch, or a product's own state replay.
  - No fetched source documents a status glyph written into a session, tab, or window name together with a rename that preserves it; the nearest analogs keep status beside the label (ccmux's tmux format suffix, agent-deck's TUI glyph column with title lock, Herdr's rollups), and tmux-webui's documentation attributes to Claude a spinner or star written into its terminal title.
  - Status authority varies within families, not only across them; screen or I/O inference (Herdr for Claude and Codex, tmux-webui, VibeTunnel) and provider hooks, with fallback where documented (agent-deck, ccmux, purplemux, Codirigent, Moshi's hook daemon) both appear among third-party tools, while provider-native product state is confined to one vendor per surface.
  - No provider-native surface supervises both Codex and Claude; the provider surfaces document coarse list state (Remote Control's online dot, Codex cloud's status and progress, Claude Projects' finished-or-needs-you), not a glyph in the name.
  - Phone approval is carried as native provider dialogs, structured hook decisions, or key delivery into a pane; key delivery appears in Herdr's controller stream, Moshi, and tmux-webui, which is where the no-keystroke-as-approval guardrail is at stake.
  - Phone terminal clients document notification escapes and iOS background termination but not window-title display; an in-terminal multiplexer status line is the path that does not depend on title support.
  - Herdr's tracker carries open p1 remote defects (server lifetime on SSH loss in one reporter's environment; unbounded memory while a client stops reading, stated to apply to a sleeping laptop), and agent-deck's carries hook-drift and iPhone web issues; this asymmetry partly reflects which trackers were read.
  - Agent Board's Ghostty AppleScript title contract is bound to a local Ghostty process; a laptop Ghostty attached to host tmux could receive host titles through tmux set-titles, but Ghostty's tab override wins over program titles, so the two title paths would need reconciling.
research_method: /scout
provenance: agent-synthesis
---

# Remote-persistent supervision landscape

## Scope and question

This landscape maps existing ways to keep several Codex and Claude coding-agent
sessions running on an always-on host (not a phone, not a laptop) and supervise
them from a phone, while retaining a per-session status glyph in the session
name, a rename that preserves the glyph, and provider-qualified state in which
no generic keystroke implies semantic approval. It informs whether that
workflow should be built into Agent Board, composed from existing tools around
it, or obtained by migrating to another product. It does not choose among
them.

"Not documented" means the fetched sources are silent, not that a capability
is absent. New sources were fetched on 2026-10-26. Reused attestations from
earlier engagements (`herdr-session-docs`, `herdr-cli-reference-docs`,
`ghostty-*`) carry their own earlier fetch dates; the Herdr agents and
integrations pages were re-read on 2026-10-26 with Claude and Codex status
authority unchanged [rps-herdr-agents-currency-docs]{5}[rps-herdr-agents-currency-docs]{6},
while Herdr session-restore claims rest on the 2026-08-20 attestation. The
Claude cloud and mobile pages, the Codex cloud, remote-connections, and
developer-commands pages, and Happy's welcome page were read through a fetch
tool's extraction; absence claims resting on them carry
`{confidence: search-summary}`.

## Approach families

### 1. Multiplexer-shaped agent supervisors

A host-side server owns agent panes; clients attach and detach.

- **Herdr.** Detaching leaves the server, panes, and agents running
  [rps-herdr-persistence-remote-docs]{1}, and the server ignores SIGHUP
  [rps-herdr-persistence-remote-docs]{2}. A server restart keeps layout and cwd
  but not processes, with Claude and Codex conversations returning through
  native resume [herdr-session-docs]{3}[herdr-session-docs]{4}. Phone use is
  plain SSH plus `herdr` on the host: "Herdr works on your phone without a
  mobile app or web dashboard" [rps-herdr-how-to-work-docs]{3}. Claude and Codex
  state is screen-manifest detection with session-identity-only integrations
  [rps-herdr-agents-currency-docs]{5}[rps-herdr-agents-currency-docs]{6}.
  Agent labels rename for display [rps-herdr-agents-currency-docs]{3}; state
  rolls up to pane, tab, and workspace, and a done agent stays visible until
  viewed [rps-herdr-agents-currency-docs]{2}. A glyph in the name is not
  documented. Herdr exposes a read-only observer and a writable controller
  stream accepting `terminal.input` for third-party bridges
  [rps-herdr-persistence-remote-docs]{7}, and its CLI refuses a prompt to an
  already-blocked agent [herdr-cli-reference-docs]{2}.
- **agent-deck.** tmux-backed with a web UI carrying token auth, Tailscale Serve
  allow-listing, and browser push [rps-agent-deck-readme]{2}, plus chat-app
  bridges [rps-agent-deck-readme]{6}, and lists Claude Code and Codex among
  supported tools [rps-agent-deck-readme]{7}. Status glyphs appear in its TUI list,
  with waiting meaning stopped and unacknowledged [rps-agent-deck-tui-reference]{1};
  titles sync from the provider's own name unless locked
  [rps-agent-deck-readme]{3}. Codex status uses its notify hook; without it,
  turn-level status "cannot converge reliably", and pi's pane-reading fallback
  is "occasionally wrong" [rps-agent-deck-readme]{8}. Remote rows carry coarse
  status only [rps-agent-deck-tui-reference]{3}[rps-agent-deck-readme]{10}.
- **ccmux.** Supports Claude Code, Codex, and other agents
  [rps-ccmux-readme]{1}. Observes agents in the user's own tmux and publishes tmux user
  options; the user appends `#{@ccmux_mark}` after `#W` in
  `window-status-format`, and the mark shows waiting before unread
  [rps-ccmux-readme]{3}. Status merges JSONL log parsing, terminal patterns,
  and hook markers [rps-ccmux-readme]{9}. For a remote devbox the README places
  ccmux, tmux, and agents on the host with nothing crossing SSH
  [rps-ccmux-readme]{7}.
- **claude-squad, Codirigent, tmai, a zellij status plugin.** claude-squad is
  tmux plus worktrees, and its README documents no remote path
  [rps-claude-squad-readme]{4}; Codirigent is a desktop alpha with hook-based
  status [rps-codirigent-readme]{1}[rps-codirigent-readme]{4}; tmai documents a
  mobile web remote driven by Claude Code hooks
  [rps-tmai-readme]{5}[rps-tmai-readme]{6}; the zellij plugin renders Claude-only
  hook glyphs in a status-bar segment [rps-claude-code-zellij-status-readme]{3}.

### 2. Generic stack: host multiplexer, roaming transport, phone client

- **Persistence.** tmux sessions survive disconnection and detach
  [rps-tmux-manual]{1}. tmux-continuum saves every 15 minutes and can restore
  automatically, but only at tmux server start
  [rps-tmux-continuum]{2}[rps-tmux-continuum]{3}; tmux-resurrect's default
  program list excludes `claude` and `codex` [rps-tmux-resurrect]{4}. zellij
  serializes layout and pane commands and re-runs them behind a "Press ENTER"
  banner after resurrection
  [rps-zellij-resurrection]{2}[rps-zellij-resurrection]{3}. shpool, abduco, and
  dtach keep a shell or program detached without windows or tabs
  [rps-shpool]{1}[rps-abduco]{1}[rps-dtach]{1}.
- **Transport.** mosh roams and survives sleep but synchronizes only visible
  state, so scrollback relies on a remote multiplexer
  [rps-mosh-site]{2}[rps-mosh-site]{5}; it needs UDP [rps-mosh-site]{6}.
  Eternal Terminal reconnects over TCP and can return to a still-running remote
  shell after a client crash [rps-eternal-terminal]{7}. Tailscale SSH claims
  port 22 and runs only on Linux and open-source macOS `tailscaled` hosts
  [rps-tailscale-ssh-kb]{1}[rps-tailscale-ssh-kb]{2}. Blink and Moshi document
  incompatible guidance on running mosh after Tailscale SSH (see
  Contradictions).
- **Phone clients.** Blink raises notifications from BEL, OSC 9, and OSC 777
  [rps-blink-notifications]{1}[rps-blink-notifications]{2} and warns that iOS
  "can kill" a backgrounded connection [rps-blink-notifications]{4}; Termius
  says background activity stops within about 20 to 30 seconds on recent iOS
  [rps-termius-ios-background]{1}. Moshi pairs a phone terminal with a host
  daemon, `moshi-hook`, that installs Claude Code and other hooks
  [rps-moshi-docs-hooks]{1}[rps-moshi-docs-hooks]{2}; its Approve and Deny
  inject keys into the pane after re-capturing the screen to verify the prompt
  [rps-moshi-docs-multiplexer]{2}; its Jump To page describes status dots for
  Herdr rows and describes the tmux tree as sessions and windows
  [rps-moshi-docs-multiplexer]{5}. These are vendor statements.
- **Naming and title mechanics.** In tmux, a window name is replaced by
  `rename-window`, which also disables `automatic-rename` for that window
  [rps-tmux-manual]{4}. Windows have no title of their own; a window's title is
  its active pane's title, which programs set with OSC 0 or 2
  [rps-tmux-manual]{3}[rps-tmux-manual]{5}. tmux forwards a title to the
  outer terminal only when `set-titles` is on, using the format-expanded
  `set-titles-string`, and `set-titles` is off by default
  [rps-tmux-manual]{6}; other sequences can bypass tmux only with
  `allow-passthrough` [rps-tmux-manual]{11}. User options hold arbitrary
  per-window strings [rps-tmux-manual]{2}, `window-status-format` controls the
  status-line rendering [rps-tmux-manual]{7}, and `bind-key` with
  `command-prompt -I` expresses a rename hotkey [rps-tmux-manual]{15}.
  {inferred: composing these, a glyph option and a label option rendered as
  `#{@glyph} #{@label}` keep the two separate so a label-only rename hotkey
  preserves the glyph; the manual shows the parts, not the combination.}
  zellij renames tabs from the CLI by focus or by stable id
  [rps-zellij-cli-actions]{1}[rps-zellij-cli-actions]{2}, and a tab exposes one
  `name` string [rps-zellij-plugin-api]{3}. {inferred: an external process can
  rewrite a zellij tab as `<glyph> <label>` through `rename-tab-by-id`, but a
  user rename through zellij's own rename mode would replace the whole string,
  so glyph preservation on user rename needs a wrapper or plugin that holds the
  label separately.}
- **Provider-side title writers.** Claude Code sets `process.title` to its
  version string, which tmux `automatic-rename` then shows as the window name
  [rps-claude-issue-process-title]{1}. tmux-webui's documentation states that
  Claude sets the terminal title to a braille spinner while working and a star
  while idle [rps-tmux-webui-deck-doc]{4}.
- **Always-on hosts.** GitHub Codespaces stop after inactivity, default 30
  minutes [rps-codespaces-timeout]{1}; Coder workspaces auto-stop when idle
  [rps-coder-readme]{1}. A closed-lid Mac can stop answering UDP, and Moshi's
  docs suggest blocking sleep with `caffeinate` or Amphetamine
  [rps-moshi-docs-tailscale]{6}.

### 3. Provider-native remote and cloud surfaces

- **Claude Remote Control.** The session runs on the user's machine and the
  phone is "a window into that local session" [rps-claude-remote-control-docs]{2};
  server mode serves several sessions, while an interactive process serves one
  [rps-claude-remote-control-docs]{4}[rps-claude-remote-control-docs]{12}. A
  sleeping laptop reconnects on return [rps-claude-remote-control-docs]{1}; a
  stopped process goes offline, and the page suggests tmux or screen on a
  remote machine [rps-claude-remote-control-docs]{12}. Server mode exits after
  roughly 10 minutes of network outage [rps-claude-remote-control-docs]{13}.
  The list shows a green dot when online [rps-claude-remote-control-docs]{5};
  rename syncs both ways [rps-claude-remote-control-docs]{6}; push covers
  permission prompts and questions and is skipped while the user is focused on
  the connected terminal [rps-claude-remote-control-docs]{11}; permission
  prompts are answered as dialogs [rps-claude-remote-control-docs]{14}.
- **Claude cloud sessions and mobile.** Cloud sessions run on Anthropic-managed
  infrastructure and keep running after the laptop closes
  [rps-claude-code-web-docs]{1}, but the VM is reclaimed after inactivity and
  background commands are not restored [rps-claude-code-web-docs]{8}; they are
  GitHub-centred [rps-claude-code-web-docs]{9}. The Claude app is a client for
  Code sessions, not a place where code runs [rps-claude-mobile-docs]{1}, and
  its Projects view is framed around seeing "which threads finished or need
  you" [rps-claude-mobile-docs]{7}. {confidence: search-summary}
- **Codex cloud.** Tasks keep working while the computer sleeps
  [rps-codex-cloud-docs]{1} and display status and progress
  [rps-codex-cloud-docs]{3}; status values and rename are not in the extract
  [rps-codex-cloud-docs]{7}. {confidence: search-summary}
- **ChatGPT mobile to a Codex desktop host.** QR-paired macOS or Windows desktop
  host [rps-codex-remote-connections-docs]{1}[rps-codex-remote-connections-docs]{2};
  "If that computer sleeps, loses network access, or closes the app, remote
  access stops" [rps-codex-remote-connections-docs]{3}; the phone can approve
  commands [rps-codex-remote-connections-docs]{4}. The desktop app can also run
  chats against an SSH host's filesystem and shell
  [rps-codex-remote-connections-docs]{6}, starting the remote app server over
  SSH, with a warning not to expose app-server transports on shared networks
  [rps-codex-remote-connections-docs]{7}. Linux or headless mobile hosts,
  per-thread status values, and rename are not in the extract
  [rps-codex-remote-connections-docs]{11}. {confidence: search-summary}
- **Codex CLI.** An experimental `codex remote-control` with `start`, `stop`,
  and `pair` [rps-codex-developer-commands-remote]{1}, and `app-server --listen`
  over `ws://` or `unix://` with auth flags
  [rps-codex-developer-commands-remote]{3}; no fetched page ties the CLI
  commands to the phone pairing flow. {confidence: search-summary}

### 4. Phone-first supervisors and web-terminal bridges

- **Host tmux plus a phone web app, no relay.** tmux-webui streams panes to a
  PWA [rps-tmux-webui-readme]{1} for Claude Code, Codex, and other agents in
  tmux panes [rps-tmux-webui-readme]{2}, can run as a crash-restarting user service
  that survives reboots [rps-tmux-webui-readme]{6}, and infers state from the
  pane title and screen text once per second [rps-tmux-webui-deck-doc]{4}; its
  approve and deny are key sends behind parsed menu buttons
  [rps-tmux-webui-deck-doc]{1}[rps-tmux-webui-deck-doc]{2}. purplemux runs an
  isolated tmux server where "Close the browser and everything stays put"
  [rps-purplemux-readme]{2}, with status from Claude and Codex hooks plus
  polling [rps-purplemux-readme]{5}. Termote fronts tmux, zellij, or Herdr and
  takes status badges from Herdr [rps-termote-readme]{2}.
- **Host daemon plus relay.** Happy wraps Claude Code or Codex on the host
  [rps-happy-cli-readme]{1}[rps-happy-cli-readme]{2}, recommends restarting its daemon from the shell
  profile across reboots [rps-happy-cli-readme]{5}, syncs encrypted blobs
  through a vendor or self-hosted relay
  [rps-happy-server-readme]{3}[rps-happy-server-readme]{4}, and pushes when
  Claude finishes or needs permission [rps-happy-server-readme]{2}. Its welcome
  page claims every conversation "survives a closed window and a restart"
  [rps-happy-welcome-docs]{1}. {confidence: search-summary}
- **Activity-only bridges.** VibeTunnel infers active or idle from recent I/O
  [rps-vibetunnel-readme]{5} and supports session retitling
  [rps-vibetunnel-readme]{6}. ttyd, GoTTY, and WeTTY READMEs describe web
  terminals with no agent awareness
  [rps-ttyd-readme]{2}[rps-gotty-readme]{2}[rps-wetty-readme]{1}.
- **Notification-only relays.** claude-remote-approver turns a Claude
  `PermissionRequest` hook into an ntfy prompt and waits for the reply
  [rps-claude-remote-approver-readme]{2}.
- **Different product shape.** Omnara's current repository is a managed agent
  platform running its own agent loop [rps-omnara-readme]{4}, whose Postgres
  event log lets any worker resume an agent after a crash or restart
  [rps-omnara-readme]{3}; it is not a mirror of a user's terminal sessions.

## Comparison along the operator's requirements

Cells summarize the family's documented range; single-product cells name the
product. Uncited cells are composed from the family sections above.

| Requirement | Multiplexer supervisors | Generic stack | Provider-native | Phone-first bridges |
|---|---|---|---|---|
| Live sessions survive laptop sleep and client loss | While the host server lives (Herdr) [rps-herdr-persistence-remote-docs]{1}; tmux-backed (agent-deck, ccmux) | tmux, zellij [rps-tmux-manual]{1} | Claude host must stay up [rps-claude-remote-control-docs]{2}; Codex desktop host stops on sleep [rps-codex-remote-connections-docs]{3}; clouds continue [rps-claude-code-web-docs]{1}[rps-codex-cloud-docs]{1} {confidence: search-summary} | Where tmux-backed [rps-purplemux-readme]{2} |
| Host reboot | Herdr: layout plus provider resume [herdr-session-docs]{4}; others not documented | Layout restore at server start; agents relaunched [rps-tmux-continuum]{3}[rps-tmux-resurrect]{4}[rps-zellij-resurrection]{3} | Not documented for host modes | tmux-webui service survives reboot [rps-tmux-webui-readme]{6}; Happy daemon restart and restart claim [rps-happy-cli-readme]{5}[rps-happy-welcome-docs]{1} |
| Idle or inactivity loss | Not documented | Codespaces and Coder idle stops [rps-codespaces-timeout]{1}[rps-coder-readme]{1} | Claude cloud VM reclaimed [rps-claude-code-web-docs]{8} | Not documented |
| Phone path | SSH TUI (Herdr) [rps-herdr-how-to-work-docs]{3}; web UI and chat bridges (agent-deck) [rps-agent-deck-readme]{2}[rps-agent-deck-readme]{6} | Any SSH, mosh, or ET client {inferred} | Vendor apps [rps-claude-remote-control-docs]{5}[rps-codex-remote-connections-docs]{1} | PWA, Happy's native app, or browser [rps-happy-readme]{5} {inferred} |
| Glyph in name, survives rename | Not documented; ccmux suffix and agent-deck glyph column nearest [rps-ccmux-readme]{3}[rps-agent-deck-tui-reference]{1} | Composable in tmux {inferred}; zellij needs label held outside the tab name {inferred} | Not documented; coarse list state [rps-claude-remote-control-docs]{5}[rps-codex-cloud-docs]{3}[rps-claude-mobile-docs]{7} {confidence: search-summary for Codex and mobile} | Not documented |
| Status authority | Screen (Herdr) to hooks with fallback (agent-deck, ccmux) | None native; push-in via user options [rps-tmux-manual]{2} | Native, per vendor {inferred} | Inference (tmux-webui) to hooks (purplemux) |
| Both Codex and Claude | Herdr, agent-deck, ccmux; tmai and the zellij plugin document Claude only [rps-tmai-readme]{5}[rps-claude-code-zellij-status-readme]{4} | Agnostic {inferred} | No | tmux-webui (pane support; state rules documented for Claude), purplemux, Happy; claude-remote-approver Claude only |
| Approval mechanism | Key delivery (Herdr controller) [rps-herdr-persistence-remote-docs]{7}; others not documented | Verified key injection (Moshi) [rps-moshi-docs-multiplexer]{2} | Native dialogs (Claude) [rps-claude-remote-control-docs]{14}; phone approval (Codex) [rps-codex-remote-connections-docs]{4} {confidence: search-summary} | Key sends (tmux-webui) [rps-tmux-webui-deck-doc]{1}; hook decision (approver) [rps-claude-remote-approver-readme]{2} |

## Approval mechanisms against the keystroke guardrail

{inferred: synthesis throughout this section} The operator's guardrail is that
no generic keystroke may imply semantic approval. Mapped against it:

- **Native provider approval** (Claude Remote Control's forwarded prompts;
  ChatGPT mobile's documented command approval, form not stated) carries the
  provider's own decision rather than keystrokes
  [rps-claude-remote-control-docs]{14}[rps-codex-remote-connections-docs]{4}.
  {confidence: search-summary for Codex}
- **Not documented** for Happy, purplemux, tmai, and agent-deck's chat
  bridges in the fetched sources.
- **Structured hook decisions** (claude-remote-approver) return a decision
  through Claude's `PermissionRequest` hook
  [rps-claude-remote-approver-readme]{2}.
- **Verified key injection** (Moshi) sends keys only after re-capturing the
  screen to confirm the prompt is unchanged
  [rps-moshi-docs-multiplexer]{2}; this narrows the race but remains a
  keystroke whose meaning is inferred from the screen.
- **Parsed-menu key sends** (tmux-webui) label buttons from screen parsing and
  send keys [rps-tmux-webui-deck-doc]{1}[rps-tmux-webui-deck-doc]{2}.
- **Raw key delivery** (Herdr's controller stream) is terminal input; Herdr's
  prompt refusal on a blocked agent is a safeguard, not an approval API
  [rps-herdr-persistence-remote-docs]{7}[herdr-cli-reference-docs]{2}.

The last three would conflict with the guardrail if presented as approval
rather than as terminal input.

## Cross-cutting patterns

1. **Persistence is delegated to a host-side owner.** Every family that keeps
   sessions alive without the laptop does so by putting the agent under a
   long-lived host server, a product daemon, or a vendor cloud. Moshi's
   documentation says mosh itself does not keep the remote shell alive after
   the remote process exits [rps-moshi-docs-sessions]{4}.
   {inferred: convergence across families}
2. **Reboot is the shared boundary.** No fetched source documents a live
   interactive agent process surviving a host reboot. Recovery takes the form
   of layout plus provider resume (Herdr), layout restore with relaunch
   (tmux-continuum, zellij), a restarted daemon (tmux-webui, Happy, whose
   restart claim is unverified), or replay from a product's own event log
   (Omnara)
   [herdr-session-docs]{3}[rps-tmux-continuum]{3}[rps-zellij-resurrection]{3}[rps-tmux-webui-readme]{6}[rps-happy-welcome-docs]{1}[rps-omnara-readme]{3}.
   {inferred: aggregate}
3. **The glyph-plus-rename property is undocumented, but its parts are near.**
   Status beside the label is the recurring move: ccmux's format suffix
   [rps-ccmux-readme]{3}, agent-deck's glyph column with a title lock against
   provider renames [rps-agent-deck-tui-reference]{1}[rps-agent-deck-readme]{3},
   and Herdr's rollups [rps-herdr-agents-currency-docs]{2}. tmux-webui's
   documentation attributes to Claude a braille spinner while working and a
   star while idle in its terminal title [rps-tmux-webui-deck-doc]{4}, which
   would put a status-like glyph in the title independently of any
   supervisor. Separately, Claude's version-string process title surfaces as a
   tmux window name and carries no status [rps-claude-issue-process-title]{1}.
   {inferred: convergence}
4. **What the phone can see.** No fetched phone-client page documents OSC 0/2
   window-title display, while BEL and OSC 9/777 notifications are documented
   [rps-blink-notifications]{1}[rps-blink-notifications]{2}. Moshi's Jump To
   reads tmux sessions and windows live from the host
   [rps-moshi-docs-multiplexer]{5}. {inferred: a tmux or zellij status line is
   drawn inside the terminal grid and so reaches any phone terminal client,
   whereas a title-borne glyph depends on undocumented client behavior; and if
   Moshi lists tmux window names, keeping the glyph out of the name would also
   keep it out of that list.}
5. **Key delivery is the common third-party approval path.** Herdr, Moshi, and
   tmux-webui deliver keys
   [rps-herdr-persistence-remote-docs]{7}[rps-moshi-docs-multiplexer]{2}[rps-tmux-webui-deck-doc]{1};
   structured decisions appear where provider hooks or native apps carry them
   [rps-claude-remote-approver-readme]{2}[rps-claude-remote-control-docs]{14}.
   {inferred: aggregate}
6. **Remote reach is often user-operated.** Tailscale-style overlays recur
   (agent-deck, purplemux, tmux-webui, Termote, Moshi's terminal path)
   [rps-agent-deck-readme]{2}[rps-purplemux-readme]{6}[rps-tmux-webui-remote-doc]{3}[rps-termote-readme]{6}[rps-moshi-docs-tailscale]{1};
   vendor-side channels appear where a vendor app is in the loop (Happy's
   relay, Claude Remote Control's transcript sync, Moshi's hook WebSocket)
   [rps-happy-server-readme]{3}[rps-claude-remote-control-docs]{8}[rps-moshi-docs-hooks]{1}.
   {inferred: aggregate}
7. **Acknowledgement is a recurring separate state.** agent-deck distinguishes
   unacknowledged waiting from acknowledged idle and lets the operator mark a
   session unread [rps-agent-deck-tui-reference]{1}[rps-agent-deck-tui-reference]{4};
   Herdr keeps a done agent visible until viewed [rps-herdr-agents-currency-docs]{2};
   ccmux ranks waiting before unread [rps-ccmux-readme]{3}; Remote Control
   suppresses push while the user is focused on the terminal
   [rps-claude-remote-control-docs]{11}. {inferred: convergence}

## Failure modes recorded

- **Phone backgrounding.** iOS can kill a backgrounded connection
  [rps-blink-notifications]{4}; Termius reports background activity stopping
  within about 20 to 30 seconds [rps-termius-ios-background]{1}. Moshi's
  marketing claims its shell stays alive while the phone sleeps
  [rps-moshi-marketing]{2} (see Contradictions).
- **Host sleep** defeats a laptop or closed-lid Mac host
  [rps-codex-remote-connections-docs]{3}[rps-moshi-docs-tailscale]{6}.
- **Title loss through a multiplexer.** tmux does not forward pane titles to
  the outer terminal unless `set-titles` is enabled [rps-tmux-manual]{6}, and
  `automatic-rename` shows Claude's version string as the window name
  [rps-claude-issue-process-title]{1}; mosh title passthrough is not documented,
  and Blink says some sequences are unsupported in mosh
  [rps-blink-notifications]{3}.
- **Herdr remote lifetime.** #5170 is open, labelled `p1`, `remote`, `sessions`,
  and triaged; its only comment could not reproduce over Tailscale SSH with
  `KillUserProcesses=false` and asked for the host's logind setting
  [rps-herdr-remote-issues-followup]{1}[rps-herdr-remote-issues-followup]{2}.
- **Herdr stalled-client memory growth.** #5471, open and `p1`, reports
  unbounded server memory growth while an attached client stops reading,
  reproduced with a ttyd tab in a backgrounded browser and stated to apply to
  an SSH client on a sleeping laptop
  [rps-herdr-remote-issues-followup]{7}[rps-herdr-remote-issues-followup]{8}.
- **Herdr cgroup exhaustion** killing all panes (#3324) is recorded as fixed in
  a later release [rps-herdr-remote-issues-followup]{4}[rps-herdr-remote-issues-followup]{6}.
- **agent-deck remote and hook issues.** Open reports of a pi session stuck as
  running and of missed Codex turn ends despite hooks
  [rps-agent-deck-issues]{1}[rps-agent-deck-issues]{2}, and of the iPhone web
  terminal ignoring taps with no way back to the list
  [rps-agent-deck-issues]{3}; reporter causes are unverified.
- **macOS daemon launch context.** Herdr panes inherit a server started over
  SSH or a background job and can lose Keychain access, and an older macOS
  server can lose user lookup and DNS after logout
  [rps-herdr-troubleshooting-docs]{2}[rps-herdr-troubleshooting-docs]{3};
  Happy's daemon under a macOS LaunchAgent fails authentication with a 401
  [rps-happy-cli-readme]{5}.
- **Exposure.** tmux-webui's own pages disagree on LAN-mode authentication
  (see Contradictions); VibeTunnel's auth options include none
  [rps-vibetunnel-readme]{8}; ntfy topic secrecy is the approver's access
  control [rps-claude-remote-approver-readme]{7}; Codex warns not to expose
  app-server transports publicly [rps-codex-remote-connections-docs]{7}.

## Topology fit with Agent Board

This section is composed judgment against Agent Board's locked architecture
(`docs/ARCHITECTURE.md`), used as a lens. Every claim here is
{inferred: synthesis}.

- **What does not transit.** Agent Board's title projection drives Ghostty
  through AppleScript, which macOS Automation permission protects on the same
  machine [ghostty-applescript]{1}[ghostty-applescript]{5}. With sessions on a
  remote host there is no host-side Ghostty to target, and the phone runs a
  different terminal. The Ghostty window, tab, and terminal identity binding,
  which the launchers resolve before starting a provider, and the focus-based
  acknowledgement have no direct counterpart on the host.
- **What transits with change.** The provider adapters (Codex app-server
  observer, Claude per-run hooks) execute beside the agent, so their
  observation would run on the always-on host; their launch path would need a
  terminal identity other than Ghostty's. The versioned session store and
  glyph derivation are host-local too.
- **Hybrid laptop case.** A laptop Ghostty attached over SSH to host tmux can
  receive a host-composed title when tmux `set-titles` is enabled
  [rps-tmux-manual]{6}, which tmux emits as OSC 0 for xterm-like terminals;
  the Ghostty attestation covers program titles through OSC 2
  [ghostty-osc2]{1}, so OSC 0 handling is assumed rather than attested.
  Ghostty's tab-title override wins over program titles until cleared
  [ghostty-actions-title]{1}[ghostty-actions-title]{3}, so a laptop-side Agent Board override and a
  host-side tmux title are competing paths to the same tab.
- **Where a seam could sit.** tmux user options and status formats
  [rps-tmux-manual]{2}[rps-tmux-manual]{7} are a candidate projection target,
  and ccmux demonstrates the publish-user-option pattern
  [rps-ccmux-readme]{3}. Herdr's observer and controller streams
  [rps-herdr-persistence-remote-docs]{7}, Moshi's hook daemon
  [rps-moshi-docs-hooks]{1}, and provider push
  [rps-claude-remote-control-docs]{11} are alternate attention-delivery paths.
  The acknowledgement analogs in pattern 7 are candidate replacements for
  Ghostty focus; none was tested here.

## Implications for the build, compose, or migrate decision

{inferred: synthesis throughout this section} Scout does not choose. For each
option, the evidence shows what exists, what is undocumented, and the recorded
risks.

- **Build into Agent Board.** Exists: Agent Board's own provider-qualified
  derivation; agent-deck, ccmux, and purplemux also use provider hooks
  for status. Undocumented anywhere: glyph-plus-rename on
  a remote host, phone title rendering, and an automatic, focus-equivalent
  acknowledgement on a remote host or phone (explicit-mark and viewed-state
  analogs exist; see pattern 7). Risks: the option requires a non-Ghostty terminal projection,
  a host-resident lifecycle, and a phone attention path that the locked
  architecture does not yet contain, and it inherits the hook-drift failure
  class recorded for agent-deck.
- **Compose around Agent Board.** Exists: host persistence, roaming transport,
  phone clients, notification escapes, and tmux primitives that compose into a
  separate glyph and label. Undocumented: the glyph-plus-label pattern as used
  practice, phone title rendering, mosh title passthrough, and an automatic,
  focus-equivalent acknowledgement on a remote host or phone. Risks: iOS
  backgrounding, host sleep, the Tailscale SSH plus mosh disagreement, title
  loss through tmux, and hook drift wherever composition relies on hooks;
  keeping Agent Board's provider-qualified state in a composed stack still
  needs a non-Ghostty projection target and terminal identity (see Topology
  fit).
- **Migrate.** Exists: Herdr and agent-deck deliver host persistence and a
  phone path; purplemux and tmux-webui deliver web-first phone paths.
  Undocumented: glyph-in-name rename in all of them. Risks: Herdr's Claude and
  Codex state is screen inference and its tracker carries open p1 lifetime and
  stalled-client defects; agent-deck carries hook-drift, coarse remote status,
  and iPhone web issues; tmux-webui approves through key sends. These risk
  lists reflect the trackers read, not measured relative reliability.

## Disconfirming analysis

- **Searched for the full requirement set in any one product.** No fetched
  source documents glyph-in-name plus rename. ccmux and agent-deck come
  nearest by construction [rps-ccmux-readme]{3}[rps-agent-deck-tui-reference]{1},
  but rename preservation there is inferred. The gap stands as undocumented,
  not proven absent.
- **Searched for provider-native cross-vendor supervision.** The Claude app is
  a client for Claude Code sessions [rps-claude-mobile-docs]{1}, and the Codex
  mobile flow pairs with a Codex desktop host
  [rps-codex-remote-connections-docs]{1}. {inferred: aggregate; no fetched
  provider page describes supervising the other vendor's agent.}
- **Searched for evidence that host persistence fails in practice.** Herdr's
  tracker supplies it
  [rps-herdr-remote-issues-followup]{1}[rps-herdr-remote-issues-followup]{7};
  agent-deck's tracker supplies status-reliability faults rather than process
  loss [rps-agent-deck-issues]{1}. No tmux or zellij tracker was read, so this
  asymmetry reflects search coverage, not relative reliability.
- **Searched for a relay being required for phone supervision.** tmux-webui,
  purplemux, and Termote document user-operated paths without a vendor relay
  [rps-tmux-webui-remote-doc]{1}[rps-purplemux-readme]{2}[rps-termote-readme]{6},
  which disconfirms a relay requirement.
- **Searched for zellij needing a plugin to rename.** `rename-tab-by-id` is a
  plain CLI action [rps-zellij-cli-actions]{2}, which disconfirms that external
  status writes need a plugin; user-rename preservation still does
  {inferred}.

## Contradictions

| Source A | Source B | Relation | Note |
|---|---|---|---|
| [rps-herdr-persistence-remote-docs]{1} | [rps-herdr-issues]{1}[rps-herdr-remote-issues-followup]{2} | `tension` | Docs say detach keeps panes; one open report says SSH loss killed them; a collaborator could not reproduce with `KillUserProcesses=false`. {ambiguous: host logind configuration} |
| [rps-agent-deck-readme]{8} | [rps-agent-deck-issues]{1}[rps-agent-deck-issues]{2} | `tension` | Hook-driven status versus reports of stale or missed transitions; causes unconfirmed. |
| [rps-blink-tailscale-mosh]{3} | [rps-moshi-docs-tailscale]{3}[rps-moshi-docs-tailscale]{4} | `tension` | Blink documents mosh after Tailscale SSH; Moshi says mosh cannot bootstrap through it. {ambiguous: different client flows} |
| [rps-tmux-webui-readme]{7} | [rps-tmux-webui-remote-doc]{2} | `contradicts` | Same project, same `--lan` mode: "behind a token gate" versus "There is no authentication." {ambiguous: pages may describe different versions} |
| [rps-claudecodeui-readme]{5} | [rps-claude-remote-control-docs]{4}[rps-claude-remote-control-docs]{12}[rps-claude-remote-control-docs]{13} | `qualifies` | CloudCLI describes Remote Control as single-session and timing out after roughly 10 minutes without a network connection; Anthropic's page scopes single-session to interactive mode and the roughly 10-minute limit to network outage in server mode. |
| [rps-moshi-marketing]{2} | [rps-blink-notifications]{4}[rps-termius-ios-background]{1} | `tension` | Moshi claims its shell stays alive while the phone sleeps; Blink and Termius document iOS ending backgrounded connections. {ambiguous: mosh session state versus app connection} |
| [rps-moshi-marketing]{7} | [rps-moshi-docs-hooks]{1} | `qualifies` | No terminal relay, but the hook daemon holds a WebSocket to the vendor. |

Qualifications that are not cross-source contradictions are kept in body prose: Claude Remote Control's
"machine must stay on" alongside "sleeping laptops reconnect"
[rps-claude-remote-control-docs]{1}[rps-claude-remote-control-docs]{2}, with
in-flight turn behavior during sleep unstated; and Codex's host topology
stopping on sleep while its cloud topology continues, which are different
systems [rps-codex-remote-connections-docs]{3}[rps-codex-cloud-docs]{1}.

## Research gaps and recommended follow-ups

1. **Live probe of a tmux projection.** Whether a `@glyph` plus `@label`
   status format with a label-only rename binding behaves as inferred, and
   whether Blink or Moshi render the tmux status line legibly at phone width.
   This is a runtime check, not literature.
2. **Title paths.** Whether Blink, Moshi, or Termius display OSC 0/2 titles or
   tmux `set-titles` output, whether mosh passes titles, and how a laptop
   Ghostty override and a host tmux title should coexist.
3. **Herdr remote lifetime on the intended host.** Re-check #5170 and #5471
   after a reporter reply or fix, and test detach and stalled clients on a
   macOS and a Linux host.
4. **Acknowledgement without Ghostty focus.** Which of the pattern-7 analogs
   (explicit mark, viewed-state, focus-suppressed push) fits Agent Board's
   completion acknowledgement on a remote host and phone.
5. **Provider surfaces as attention paths.** Whether Claude Remote Control push
   or Codex `remote-control pair` can coexist with Agent Board's managed
   launchers on the same host session, including a local `codex
   remote-control --help` capture.
6. **Enriching sources named by fetched pages** are listed in
   `acquisitions.md`.

## Revisit if

- Any surveyed product documents a glyph in the session name that survives
  rename, or a phone client documents window-title display.
- Herdr resolves #5170 or #5471, adds a web or mobile client, or moves Claude
  or Codex to hook-authoritative state.
- Anthropic or OpenAI document a headless always-on host for phone access, or
  list-level working, waiting, and done states readable by third-party tools.
- A provider surface supervises both vendors.

## Revisions

- 2026-10-26, correction (position preserved): after adversarial-read and
  isolated evaluation of snapshot `67e55e73`, neutralized the Implications
  section and gave each option comparable exists, undocumented, and risk
  entries; added title-passthrough mechanics, a title-loss failure mode, and
  the hybrid laptop-Ghostty case; added the approval-guardrail mapping and an
  acknowledgement pattern; re-cited and narrowed comparison-table cells;
  retyped and added contradiction rows; added per-claim confidence and
  inference markers; corrected the agent-deck quote context, the zellij rename
  claim, and citation pointers; added reboot-recovery and macOS daemon
  evidence.
- 2026-10-26, correction (position preserved): after scoped re-checks of
  snapshot `5ae2dded`, restored the tmux-webui attribution for Claude's title
  glyph and separated the version-string process title; narrowed the
  acknowledgement gap to an automatic focus-equivalent signal; limited the
  persistence-failure evidence to Herdr; narrowed the Herdr re-read statement
  to the agents and integrations pages; added cited Codex and Claude coverage
  for ccmux, agent-deck, and tmux-webui; marked extract-based table cells;
  separated Codex phone approval from Claude's dialogs; noted the OSC 0 versus
  OSC 2 attestation gap in the hybrid case; restored the CloudCLI qualifier.

## Sources

Source-direct evidence is recorded in `.research/attestation/` under the
`rps-*` handles authored for this campaign, plus the reused
`herdr-session-docs`, `herdr-cli-reference-docs`, `ghostty-applescript`,
`ghostty-osc2`, and `ghostty-actions-title` attestations. The four
within-specialist analyses in `specialists/` are lenses for this synthesis,
not citation targets.
