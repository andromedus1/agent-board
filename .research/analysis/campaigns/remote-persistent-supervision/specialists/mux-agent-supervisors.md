---
name: mux-agent-supervisors
description: Prior-art survey of multiplexer-shaped coding-agent supervisors (Herdr remote facet, agent-deck, claude-squad, ccmux, Codirigent, tmai, a zellij status plugin) against the remote-persistent-supervision grid.
type: research-specialist
kind: research
status: draft
updated: 2026-10-26
provenance: agent-synthesis
---

# Multiplexer-shaped agent supervisors

Scope: survey only. No product is ranked or recommended. "Not documented" means the sources read in this engagement are silent, not that the feature is absent. Source versions are those fetched on 2026-10-26.

## Findings by product

### Herdr (remote / server / phone facet only)

- **Persistence.** Herdr runs a background server that owns panes; clients attach and detach, and detaching leaves panes and agents running [rps-herdr-persistence-remote-docs]{1}. The server ignores SIGHUP on Linux and macOS [rps-herdr-persistence-remote-docs]{2}. A live server keeps original processes; a server restart keeps layout and cwd but not arbitrary processes, and conversations return only through native agent restore [herdr-session-docs]{1}[herdr-session-docs]{3}. Claude Code and Codex restore through `claude --resume <id>` and `codex resume <id>` [herdr-session-docs]{4}.
- **Phone.** The docs state "Herdr works on your phone without a mobile app or web dashboard": install an SSH client, connect to the host, run `herdr`; the TUI adapts to narrow screens, and moshi is named for iPhone [rps-herdr-how-to-work-docs]{3}. For a local desktop, `herdr --remote` draws the UI locally while the remote server owns panes [rps-herdr-persistence-remote-docs]{4}, and saved SSH machines show Local plus remotes with one agent list [rps-herdr-connecting-machines-docs]{1}. On connection loss the last state stays visible, dimmed, labelled as cached [rps-herdr-connecting-machines-docs]{4}; reconnect retries back off up to two minutes [rps-herdr-connecting-machines-docs]{5}. A "mobile switcher" is mentioned for workspace navigation [rps-herdr-connecting-machines-docs]{3}. For third-party bridges there is a read-only frame observer and a writable controller stream [rps-herdr-persistence-remote-docs]{7}.
- **Glyph and rename.** No glyph-in-name mechanism is documented in the pages read. Agent labels can be renamed for display (`herdr agent rename`) [rps-herdr-agents-currency-docs]{3}; state is shown by sidebar rollups to pane, tab and workspace [rps-herdr-agents-currency-docs]{2}. {inferred: because status is a rollup rendered by the sidebar and rename only changes a display label, rename does not interact with status, but no source states this}.
- **Status authority.** For Claude Code and Codex, state comes from screen-manifest detection; the integrations report session identity only [rps-herdr-agents-currency-docs]{5}[rps-herdr-agents-currency-docs]{6}. Where an integration reports lifecycle (example: Kimi), the agent's reports become authoritative [rps-herdr-agents-currency-docs]{1}[rps-herdr-agents-currency-docs]{7}. Visibility of that confidence to the operator was not established from the pages read.
- **Providers.** Claude Code and Codex are both in the supported list with the same authority class [rps-herdr-agents-currency-docs]{5}[rps-herdr-agents-currency-docs]{6}; other agents with hooks or plugins also appear [rps-herdr-agents-currency-docs]{7}.
- **Failure modes.** An open bug report says a `--remote` server died with the SSH session and killed pane processes in one reporter's environment; a reply could not reproduce it and asked about logind KillUserProcesses [rps-herdr-issues]{1}[rps-herdr-issues]{2}[rps-herdr-issues]{3}. A closed request asked for mosh because the thin-client attach dies on sleep and roaming while panes survive [rps-herdr-issues]{4}. Updating does not replace a running server; stopping it ends panes [rps-herdr-troubleshooting-docs]{1}. macOS servers started over SSH can lack Keychain access, and older ones lost DNS after logout [rps-herdr-troubleshooting-docs]{2}[rps-herdr-troubleshooting-docs]{3}.

### agent-deck

- **Persistence.** Built on tmux ("tmux plus AI awareness") with SQLite state; an opt-in dedicated tmux server isolates sessions from a stray `tmux kill-server` [rps-agent-deck-readme]{9}. Error status means the tmux session does not exist [rps-agent-deck-tui-reference]{1}. Archiving stops the tmux process but keeps conversation and worktree [rps-agent-deck-readme]{11}. Behaviour across host reboot is not documented in the pages read. {inferred: tmux-backed sessions outlive the TUI process but not a host reboot}.
- **Phone.** A web UI (`agent-deck web`) with token auth, Tailscale Serve host allow-listing, read-only mode and browser push [rps-agent-deck-readme]{2}; a conductor can bridge Telegram, Slack, Discord or Mattermost for remote control [rps-agent-deck-readme]{6}; SSH remote instances can be attached from a local deck [rps-agent-deck-readme]{10}. An open issue reports the iPhone web terminal ignoring taps with no way back to the list (reporter's unverified cause) [rps-agent-deck-issues]{3}.
- **Glyph and rename.** Status glyphs (running, waiting, idle, error, starting) appear in the TUI list [rps-agent-deck-tui-reference]{1}; waiting sessions are also surfaced in the tmux status bar, a separate bar, not the session name [rps-agent-deck-readme]{5}. Rename (`r`) exists in the TUI; displayed titles sync from the provider's own name (Claude `/rename`) by default, so a set title can be overwritten unless locked [rps-agent-deck-readme]{3}. A glyph-in-name mechanism is not documented.
- **Status authority.** Codex status uses its notify hook, and without it turn-level state "cannot converge reliably"; pi uses an extension, otherwise pane reading that is "occasionally wrong" [rps-agent-deck-readme]{8}. Remote rows carry coarse status only [rps-agent-deck-tui-reference]{3}. Per-row confidence labels are not documented.
- **Providers.** Claude Code, Gemini CLI, Codex, OpenCode and many others at differing integration levels [rps-agent-deck-readme]{7}.
- **Failure modes.** Open issues: a pi session stuck as running for four days because hook events expire and quiet panes are never re-evaluated [rps-agent-deck-issues]{1}; some Codex turn ends produce no transition so a parent was never woken [rps-agent-deck-issues]{2}. A conductor does not get cross-machine completions without a manual drain [rps-agent-deck-readme]{10}. These causes are reporter hypotheses.

### claude-squad

- **Persistence.** One tmux session and one git worktree per agent; "checkout" commits and pauses a session, "resume" restarts it [rps-claude-squad-readme]{4}[rps-claude-squad-readme]{6}. Reboot and sleep behaviour: not documented.
- **Phone.** Not documented in the README. A closed issue asks whether one can SSH from a laptop and "drop in" to a running session, with ctrl-q failing when attaching to the tmux session directly [rps-claude-squad-issues]{1}; another requested a narrow-terminal layout for mobile SSH [rps-claude-squad-issues]{2}.
- **Glyph and rename.** No status glyph or rename key is documented [rps-claude-squad-readme]{4}.
- **Status authority.** The status monitor captures pane content (inferred from an error log in an issue) [rps-claude-squad-issues]{3}; no hook integration is documented.
- **Providers.** Claude Code, Codex, Gemini, Aider via `-p` [rps-claude-squad-readme]{1}[rps-claude-squad-readme]{3}.
- **Failure modes.** A FAQ notes a "timed out waiting for tmux session" error [rps-claude-squad-readme]{5}; requires tmux and gh [rps-claude-squad-readme]{2}.

### ccmux

- **Persistence.** Agents run in the user's own tmux panes; ccmux's daemon observes them [rps-ccmux-readme]{1}[rps-ccmux-readme]{2}. Persistence is therefore tmux's; ccmux adds none of its own that was read.
- **Phone.** No phone client. For a remote devbox the README says to run ccmux, tmux and the agents on the remote host and attach over SSH, with nothing crossing the SSH boundary [rps-ccmux-readme]{7}. An opt-in OSC backend carries notifications through the terminal stream, requiring `allow-passthrough` and only some terminals [rps-ccmux-readme]{8}.
- **Glyph and rename.** The daemon publishes tmux user options; the user places `#{@ccmux_mark}` after `#W` in `window-status-format`, so the mark is a format suffix of the window label and shows waiting before unread [rps-ccmux-readme]{3}. {inferred: because the mark is appended by format rather than written into the name, a rename of the window does not remove it}. Spawned windows are named after the worktree or agent with automatic-rename pinned off [rps-ccmux-readme]{4}. Only waiting and unread marks are per-window; working appears as a count [rps-ccmux-readme]{3}.
- **Status authority.** Three merged signals: JSONL log parsing, terminal pattern matching, and hook PID markers; Gemini CLI is tracked by process detection and patterns [rps-ccmux-readme]{5}[rps-ccmux-readme]{9}. Claude Code uses native hooks; Codex hooks need a minimum Codex version for tool-approval detection [rps-ccmux-readme]{6}. Per-session confidence display is not documented.
- **Providers.** Claude Code, Codex, Cursor, OpenCode, Pi, Antigravity, Copilot, Gemini CLI, custom [rps-ccmux-readme]{1}.
- **Failure modes.** Remote notifications need passthrough on every tmux layer [rps-ccmux-readme]{8}; other caveats were not read beyond the README.

### Codirigent

- A desktop app for Windows and macOS (Linux incomplete), labelled early alpha [rps-codirigent-readme]{1}[rps-codirigent-readme]{5}. Sessions are restored by resuming Claude Code and Codex sessions [rps-codirigent-readme]{3}. Phone, SSH and remote: not documented. Status indicators (idle, working, attention, ready) come from auto-installed hooks for Claude Code, Codex and Gemini, with a "less precise" fallback detector [rps-codirigent-readme]{2}[rps-codirigent-readme]{4}. Glyph-in-name and rename: not documented.

### tmai

- The public repo hosts a React WebUI with a "mobile remote", a ratatui dashboard, and a private engine; detection is hook-based "driven by Claude Code hooks" [rps-tmai-readme]{1}[rps-tmai-readme]{5}[rps-tmai-readme]{6}. It describes an always-on supervisor [rps-tmai-readme]{2}. Setup writes Claude Code hook receivers [rps-tmai-readme]{4}. Codex coverage, glyph-in-name and rename: not documented in this README. Earlier auto-approve features were removed [rps-tmai-readme]{7}.

### claude-code-zellij-status (zellij)

- A Claude Code plugin mapping hook events to about 19 glyphs, written to state files and piped to a zjstatus bar segment [rps-claude-code-zellij-status-readme]{2}[rps-claude-code-zellij-status-readme]{3}. Claude Code only [rps-claude-code-zellij-status-readme]{4}. The glyph lives in the status bar, not the tab name. Zellij persistence, phone and rename: not documented in this README.

## Grid

| Product | Persistence | Phone path | Glyph in name; rename | Status authority | Providers | Documented failures |
|---|---|---|---|---|---|---|
| Herdr | Server survives detach; restart loses processes [herdr-session-docs]{1}[herdr-session-docs]{3} | SSH client + `herdr`; no app or web [rps-herdr-how-to-work-docs]{3} | Not documented; label rename display-only [rps-herdr-agents-currency-docs]{3} | Screen manifest for Claude/Codex [rps-herdr-agents-currency-docs]{5}[rps-herdr-agents-currency-docs]{6} | Claude, Codex, others | Server died with SSH in one report [rps-herdr-issues]{1} |
| agent-deck | tmux; reboot not documented [rps-agent-deck-readme]{9} | Web UI, SSH remotes, chat bridges [rps-agent-deck-readme]{2}[rps-agent-deck-readme]{6}[rps-agent-deck-readme]{10} | TUI glyphs; title sync overwrites unless locked [rps-agent-deck-readme]{3} | Hooks for Codex/pi, else pane [rps-agent-deck-readme]{8} | Many | Stuck running; missed Codex turn ends [rps-agent-deck-issues]{1}[rps-agent-deck-issues]{2} |
| claude-squad | tmux + worktree [rps-claude-squad-readme]{6} | Not documented | Not documented | Pane capture {inferred: from issue log} [rps-claude-squad-issues]{3} | Claude, Codex, Gemini, Aider | tmux start timeout [rps-claude-squad-readme]{5} |
| ccmux | User's tmux | SSH + tmux [rps-ccmux-readme]{7} | Mark appended via format [rps-ccmux-readme]{3} | Logs + patterns + hooks [rps-ccmux-readme]{9} | 8+ agents | Passthrough needs [rps-ccmux-readme]{8} |
| Codirigent | Session resume [rps-codirigent-readme]{3} | Not documented | Not documented | Hooks + fallback [rps-codirigent-readme]{4} | Claude, Codex, Gemini | Alpha [rps-codirigent-readme]{1} |
| tmai | Always-on supervisor [rps-tmai-readme]{2} | Web mobile remote [rps-tmai-readme]{6} | Not documented | Claude hooks [rps-tmai-readme]{5} | Claude documented | Not documented |
| zellij status plugin | Not documented | Not documented | Bar segment, not name [rps-claude-code-zellij-status-readme]{3} | Claude hooks | Claude only | Not documented |

## Disconfirming analysis

- Claim tested: "no surveyed product keeps a glyph in the session name and preserves it across rename." Searched all attested sources. The nearest is ccmux, whose mark is appended in the tmux window-label format [rps-ccmux-readme]{3}; agent-deck rename is governed by title sync [rps-agent-deck-readme]{3}. No source states rename behaviour for a glyph in a name. Result: not disconfirmed, but the ccmux case is a partial counter-example by construction.
- Claim tested: "Herdr has no phone-specific surface beyond SSH." The how-to page says no app or web dashboard [rps-herdr-how-to-work-docs]{3}; the connecting-machines page mentions a mobile switcher [rps-herdr-connecting-machines-docs]{3}; observer and controller streams exist for third-party bridges [rps-herdr-persistence-remote-docs]{7}. Result: qualified.
- Claim tested: "Codex status is hook-authoritative in these products." True for agent-deck [rps-agent-deck-readme]{8}, ccmux [rps-ccmux-readme]{6}, Codirigent [rps-codirigent-readme]{4}; false for Herdr [rps-herdr-agents-currency-docs]{6}. Not uniform across the set.
- Claim tested: "documented persistence holds in practice." Contradicting evidence for Herdr appears in one open report [rps-herdr-issues]{1}; unresolved.

## Contradictions

- Herdr persistence: docs say detaching leaves the server and panes running [rps-herdr-persistence-remote-docs]{1}; an open report says dropping the SSH client killed panes in its environment [rps-herdr-issues]{1}; a reply could not reproduce it with KillUserProcesses=false [rps-herdr-issues]{3}. Relationship: tension, possibly {ambiguous: host logind configuration}.
- agent-deck status: README presents hook-driven status where hooks are installed [rps-agent-deck-readme]{8}; issues report status staying stale or missing transitions despite hooks [rps-agent-deck-issues]{1}[rps-agent-deck-issues]{2}. Relationship: tension; issue causes are unconfirmed.

## Revisit if

- Herdr adds a web or mobile client, or resolves the `--remote` server-lifetime report.
- agent-deck's open status and iPhone issues close, or remote rows carry richer status.
- Any surveyed product documents glyph-in-name plus rename behaviour.
- A product adds hook-authoritative Codex status where it is screen-based today.
- claude-squad, Codirigent or tmai documents remote or mobile access.

## Acquisition candidates

- Enriching: agent-deck `docs/REMOTE-COMMANDS.md` and `docs/COMMAND-CENTER.md` (named by the fetched README), class ingestible, web-available, completes remote status payload and fleet view details.
- Enriching: ccmux `docs/architecture.md` (named by the fetched README), class ingestible, web-available, completes the status detection cascade and confidence visibility.
- Enriching: resolution threads of herdr issues #5170 and #1779, class portal, web-available, completes the Herdr persistence contradiction.

## Sources

1. `rps-herdr-how-to-work-docs` — How to work with Herdr (https://herdr.dev/docs/how-to-work/)
2. `rps-herdr-persistence-remote-docs` — Persistence and remote access (https://herdr.dev/docs/persistence-remote/)
3. `rps-herdr-connecting-machines-docs` — Connecting machines (https://herdr.dev/docs/connecting-machines/)
4. `rps-herdr-troubleshooting-docs` — Herdr troubleshooting (https://herdr.dev/docs/troubleshooting/)
5. `rps-herdr-agents-currency-docs` — Herdr agents and integrations pages (https://herdr.dev/docs/agents/)
6. `rps-herdr-issues` — Herdr issues 5170 and 1779 (https://github.com/herdrdev/herdr/issues/5170)
7. `herdr-session-docs` — Session state and restore (https://herdr.dev/docs/session-state/)
8. `rps-agent-deck-readme` — agent-deck README (https://github.com/asheshgoplani/agent-deck/blob/main/README.md)
9. `rps-agent-deck-tui-reference` — agent-deck TUI reference (https://github.com/asheshgoplani/agent-deck/blob/main/skills/agent-deck/references/tui-reference.md)
10. `rps-agent-deck-issues` — agent-deck issues 2896, 2900, 2680 (https://github.com/asheshgoplani/agent-deck/issues/2896)
11. `rps-claude-squad-readme` — claude-squad README (https://github.com/smtg-ai/claude-squad/blob/main/README.md)
12. `rps-claude-squad-issues` — claude-squad issues 204, 147, 218 (https://github.com/smtg-ai/claude-squad/issues/204)
13. `rps-ccmux-readme` — ccmux README (https://github.com/epilande/ccmux/blob/main/README.md)
14. `rps-codirigent-readme` — Codirigent README (https://github.com/oso95/Codirigent/blob/main/README.md)
15. `rps-tmai-readme` — tmai README (https://github.com/trust-delta/tmai/blob/main/README.en.md)
16. `rps-claude-code-zellij-status-readme` — claude-code-zellij-status README (https://github.com/thoo/claude-code-zellij-status/blob/main/README.md)
