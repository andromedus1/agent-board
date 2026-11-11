---
name: mobile-first-supervisors
description: Prior-art survey of phone-first agent supervisors, web-terminal bridges and push-notification relays, answered against a common grid for the remote-persistent supervision campaign.
type: research-specialist
kind: research
status: draft
updated: 2026-10-26
provenance: agent-synthesis
---

# Mobile-first supervisors and web-terminal bridges

Facet of the `remote-persistent-supervision` campaign. Survey only; no product is ranked. Sources were fetched 2026-10-26. Most evidence is first-party README text, which is self-description; marketing-heavy pages are flagged by `substrate_confidence` in the attestations.

## Findings per product

### Happy (slopus/happy)

- Persistence and relay: a CLI wraps Claude Code or Codex on the host and shows a QR code for phone or browser connection; new sessions can be started from the phone "while your computer is online" [rps-happy-cli-readme]{1}. A background daemon "stays running on your machine" and spawns sessions without an open terminal [rps-happy-cli-readme]{4}; reboot survival is the user's job via shell profile, and a macOS LaunchAgent breaks keychain auth [rps-happy-cli-readme]{5}. A relay server syncs encrypted blobs between devices [rps-happy-server-readme]{3}; a vendor-operated free instance exists and the server is self-hostable [rps-happy-server-readme]{4}. The CLI also documents a setting to disable macOS sleep prevention [rps-happy-cli-readme]{8}, which suggests host sleep is a live concern {inferred: the setting implies the CLI normally holds the host awake}. A docs extract claims sessions survive a closed window and restart [rps-happy-welcome-docs]{1} (lower confidence).
- Phone: native iOS/Android app plus web client [rps-happy-readme]{5}; end-to-end encrypted [rps-happy-readme]{4}. Offline behavior: not documented.
- Naming/status: not documented in the fetched READMEs.
- Status authority and approvals: the server README says push notifications fire when Claude Code finishes or needs permissions [rps-happy-server-readme]{2}; the transport of approvals (hook, SDK, or keystroke) is not documented in the fetched text. The daemon note references the bundled claude-agent-sdk [rps-happy-cli-readme]{5}, hinting at SDK-driven sessions {inferred: SDK rather than screen scraping, unconfirmed}. One backend (agy) has no approval surface at all [rps-happy-cli-readme]{3}.
- Providers: Claude, Codex, Grok at the product level [rps-happy-readme]{1}; CLI also covers agy, openclaw, and ACP-compatible CLIs [rps-happy-cli-readme]{2}.
- Security/license/activity: E2E key-pair design and zero-knowledge server claims [rps-happy-server-readme]{1}; MIT [rps-happy-readme]{3}; repository pushed 2026-10-26 per API [rps-happy-readme]. The README directs newer multi-model features to a separate desktop app [rps-happy-readme]{6}.

### Omnara (omnara-ai/omnara)

- The current repository is a managed agent platform running Omnara's own agent loop on any model [rps-omnara-readme]{4}, with machines that run an outbound-connecting daemon [rps-omnara-readme]{2} and a Postgres event log that lets any worker resume an agent [rps-omnara-readme]{3}. Claude Code and Codex are positioned as separate harnesses, and as MCP clients that can launch Omnara agents [rps-omnara-readme]{5}[rps-omnara-readme]{6}.
- {inferred: the current README does not describe supervising a user's own Codex CLI or Claude Code terminal session from a phone; it is a different product shape from the other entries.} Phone app, rename, glyph: not documented in the README or the introduction page.
- Self-host or Omnara Cloud [rps-omnara-readme]{1}; approvals are an API object (ask a person first / block) enforced by the platform [rps-omnara-readme]{8}; Apache 2.0 [rps-omnara-readme]{9}; defaults "intentionally insecure" for local use [rps-omnara-readme]{7}.

### VibeTunnel (amantus-ai/vibetunnel)

- Browser terminal proxy; `vt` forwards a command's I/O to the browser through the VibeTunnel server [rps-vibetunnel-readme]{7}. Markets itself for monitoring Claude Code and other terminal AI tools [rps-vibetunnel-readme]{1}. The README has no tmux mention [rps-vibetunnel-readme]; persistence across server restart: not documented.
- Phone: responsive web; the iOS app is "not recommended for production use yet" [rps-vibetunnel-readme]{3}. Remote reach is by Tailscale, ngrok, Pinggy and similar tunnels, which the user operates [rps-vibetunnel-readme]{9}.
- Naming/status: titles can be static, filtered or app-controlled [rps-vibetunnel-readme]{4}; `vt title` renames the session [rps-vibetunnel-readme]{6}. Active/idle comes from recent input/output [rps-vibetunnel-readme]{5}; notifications derive from exit codes, command duration and bell [rps-vibetunnel-push-doc]{2}. No provider-native events. Whether a rename preserves a glyph: not documented.
- Providers: provider-agnostic (any command). Security: five auth modes including none and a dev-only local bypass [rps-vibetunnel-readme]{8}. MIT [rps-vibetunnel-readme]{10}; pushed 2026-08-05 per API.

### CloudCLI UI / Claude Code UI (siteboon/claudecodeui)

- Web UI over Claude Code, Cursor CLI and Codex with mobile access [rps-claudecodeui-readme]{1}. It auto-discovers sessions from `~/.claude` [rps-claudecodeui-readme]{5}. Self-hosted requires the machine to stay on; a vendor-hosted tier does not [rps-claudecodeui-readme]{3}[rps-claudecodeui-readme]{6}. Phone connects by any browser on the network (self-host) [rps-claudecodeui-readme]{3}; a native app is described as in the works (WebFetch-processed README summary, lower confidence).
- Session list/resume/manage [rps-claudecodeui-readme]{2}; a plugin can kill active Claude sessions [rps-claudecodeui-readme]{7}. Rename, glyph-in-name, status authority, approvals semantics: not documented in the README.
- AGPL-3.0-or-later [rps-claudecodeui-readme]{8}; pushed 2026-10-24 per API.

### Vibe Kanban (BloopAI/vibe-kanban)

- Workspace-and-kanban manager for 10+ agents [rps-vibe-kanban-readme]{2}; repository carries a sunsetting banner [rps-vibe-kanban-readme]{1}. Remote use is documented only as SSH editor integration [rps-vibe-kanban-readme]{3}. No phone surface, rename, or status glyph documented. Included for completeness of the Conductor/Kanban class; Conductor itself was not fetched.

### Generic web terminals: ttyd, GoTTY, WeTTY

- ttyd: shares a command over the web, read-only by default, basic auth or reverse-proxy auth header, SSL, origin check, `--once` [rps-ttyd-readme]{2}[rps-ttyd-readme]{3}[rps-ttyd-readme]{4}[rps-ttyd-readme]{5}. MIT [rps-ttyd-readme]{7}; pushed 2026-08-12 per API.
- GoTTY: read-only by default, "BE CAREFUL" on write, traffic unencrypted by default, and the README recommends running under tmux or Screen for sharing [rps-gotty-readme]{2}[rps-gotty-readme]{3}[rps-gotty-readme]{4}. Title format is a browser window title, not a session list [rps-gotty-readme]{1}. API showed no push since 2024-08-01 [rps-gotty-readme].
- WeTTY: browser front end that launches ssh, with an allowed-origin requirement [rps-wetty-readme]{1}[rps-wetty-readme]{2}[rps-wetty-readme]{3}; pushed 2026-10-25 per API.
- Across all three: sessions live in whatever the launched command/ssh target is; none has agent awareness, provider-qualified state, or status. Phone use is a mobile browser on xterm.js-class terminals {inferred: README text does not discuss mobile ergonomics}.

### tmux-webui (operonlab)

- Single binary beside tmux; streams panes to a browser or mobile PWA; built for "AI CLI agents running on a machine at home" with Claude Code and Codex in tmux panes [rps-tmux-webui-readme]{1}[rps-tmux-webui-readme]{2}. Sessions live in tmux; the daemon mode restarts on crash and survives reboots [rps-tmux-webui-readme]{6}. No relay; reachability by loopback, LAN, Tailscale, or Cloudflare Tunnel, with the user operating the path [rps-tmux-webui-remote-doc]{1}[rps-tmux-webui-remote-doc]{3}[rps-tmux-webui-remote-doc]{4}.
- Status: per-pane state is inferred by the server from the OSC pane title spinner glyphs and screen text rules, polled once per second and debounced [rps-tmux-webui-deck-doc]{4}[rps-tmux-webui-deck-doc]{5}[rps-tmux-webui-deck-doc]{6}; this is screen/title inference, with Claude-specific rules described. SESS page keys show a state LED per tmux session/window [rps-tmux-webui-deck-doc]{1}. Confidence of the inference is not surfaced as a label in the read passages.
- Approvals: approve/deny are `key` sends; menus are parsed from the screen into labeled buttons behind a slide-to-confirm gate [rps-tmux-webui-deck-doc]{1}[rps-tmux-webui-deck-doc]{2}. {inferred: semantics are layered on keystrokes by parsing the visible menu; no provider-native decision channel is described.}
- Notifications: opt-in watcher posts to a configured webhook when a pane enters waiting [rps-tmux-webui-notify-doc]{1}[rps-tmux-webui-notify-doc]{2}; a separate notification backend is wired in [rps-tmux-webui-notify-doc]{4}.
- Security: LAN mode is documented as having no authentication in the remote doc [rps-tmux-webui-remote-doc]{2}. Pushed 2026-07-08 per API; MIT per page extract.

### purplemux (9018/purplemux)

- Browser dashboard built on an isolated tmux server; "Close the browser and everything stays put" [rps-purplemux-readme]{2}; data stays on the host with no external servers [rps-purplemux-readme]{2}. Phone: PWA, Web Push, Tailscale HTTPS, password auth [rps-purplemux-readme]{6}.
- Status: hooks (Claude `SessionStart`, `Stop`, `Notification`; Codex including `PermissionRequest`) plus 5-15 second polling of process trees and JSONL [rps-purplemux-readme]{5}. This is provider-native events with a fallback inference, per the README. Working/needs-input is shown for each session [rps-purplemux-readme]{1}. Tabs have names and auto titles from process names [rps-purplemux-readme]{4}; whether status is rendered into the tab name, and rename behavior: not documented.
- Providers: Claude Code, Codex, Pi, omp [rps-purplemux-readme]{1}; can attach to a Codex runtime started by another app with a write lease that does not give exclusive ownership [rps-purplemux-readme]{8}. Approval transport: not documented in the read text. Another repository, subicura/purplemux, carries a near-identical README; relationship unverified [rps-purplemux-readme].

### Termote (lamngockhuong)

- Self-hosted PWA over tmux, psmux, Herdr or Zellij [rps-termote-readme]{2}; a Chat view reads and answers a pane running Claude Code, or Codex started with `--no-daemon` [rps-termote-readme]{3}. Tabs and session create/edit/delete [rps-termote-readme]{4}. With the Herdr backend, per-pane coding-agent status badges come from Herdr rather than Termote [rps-termote-readme]{2}. PWA is offline-capable with a disconnect indicator [rps-termote-readme]{5}. Auth on by default, Host allowlist, Tailscale publish [rps-termote-readme]{6}. Rename/glyph: not documented.

### Notification relays: ntfy and hook-based approvers

- ntfy: HTTP publish, Android/iOS apps [rps-ntfy-docs]{1}[rps-ntfy-docs]{3}; action buttons including an HTTP action [rps-ntfy-publish-docs]{1}; token/user auth and "the topic is essentially a password" [rps-ntfy-publish-docs]{2}; self-hostable, Apache 2.0 and GPLv2 [rps-ntfy-repo]{2}[rps-ntfy-repo]{3}. These facts come from model-processed extracts.
- claude-remote-approver: a Claude Code `PermissionRequest` hook publishes to ntfy and waits for a tap on a response topic [rps-claude-remote-approver-readme]{2}; timeouts fall back to the CLI prompt [rps-claude-remote-approver-readme]{3}[rps-claude-remote-approver-readme]{6}. Approvals are therefore structured hook decisions for Claude Code, not keystrokes {inferred: from the hook-based flow described}. The host must be running the Claude session; the relay is ntfy.sh unless self-hosted [rps-claude-remote-approver-readme]{6}; the topic's secrecy is the access control [rps-claude-remote-approver-readme]{7}. Claude only; per-session naming/status in a list: not applicable.

## Grid

| Product | 1 Sessions live / relay | 2 Phone path | 3 Name / status in name | 4 Status authority / approvals | 5 Providers | 6 Security / license |
|---|---|---|---|---|---|---|
| Happy | host CLI + daemon; vendor or self-host relay [rps-happy-server-readme]{4} | native app + web [rps-happy-readme]{5} | not documented | not documented for approvals; push on done/permission [rps-happy-server-readme]{2} | Claude, Codex, Grok, ACP [rps-happy-cli-readme]{2} | E2E claims; MIT |
| Omnara (current) | platform workers + machines daemon [rps-omnara-readme]{2} | not documented | not documented | API approvals [rps-omnara-readme]{8} | any model; own loop | Apache 2.0 |
| VibeTunnel | macOS app + Node server; user tunnel | web; iOS WIP [rps-vibetunnel-readme]{3} | titles modes; `vt title` | I/O activity only [rps-vibetunnel-readme]{5} | any command | 5 auth modes incl. none; MIT |
| CloudCLI UI | host (must stay on) or vendor cloud [rps-claudecodeui-readme]{3} | browser | not documented | not documented | Claude, Cursor, Codex | AGPL |
| Vibe Kanban | local workspaces | none documented | not documented | not documented | 10+ agents | sunsetting |
| ttyd/GoTTY/WeTTY | launched command / ssh target | mobile browser | window title only | none | none | read-only default (ttyd, GoTTY); MIT |
| tmux-webui | tmux on host; no relay | PWA | LED per window; rename n/d | screen/title inference [rps-tmux-webui-deck-doc]{4}; key sends | Claude, Codex | LAN no auth [rps-tmux-webui-remote-doc]{2}; MIT |
| purplemux | tmux on host; no relay | PWA + web push | tab names; status in UI | hooks + polling [rps-purplemux-readme]{5} | Claude, Codex, Pi, omp | password + Tailscale; MIT |
| Termote | tmux/Zellij/Herdr on host | PWA | tabs; badges via Herdr | Chat view; badges from Herdr | Claude, Codex, others | basic auth default; MIT |
| ntfy + approver hook | host session; ntfy.sh or self-host | ntfy app | n/a | hook decisions [rps-claude-remote-approver-readme]{2} | Claude | topic secrecy |

"n/d" = not documented in the fetched sources.

## Recurring patterns

- Persistence is delegated: tmux (or Zellij/Herdr) on the host keeps the process alive in tmux-webui [rps-tmux-webui-readme]{1}, purplemux [rps-purplemux-readme]{2} and Termote [rps-termote-readme]{2}; GoTTY itself suggests the same [rps-gotty-readme]{4}. Happy and VibeTunnel run their own daemon/server instead [rps-happy-cli-readme]{4}[rps-vibetunnel-readme]{7}. {inferred: the multiplexer-backed group does not need a vendor relay, while the app-based group does.}
- Relays split into three: none with user-operated tunnel (tmux-webui, VibeTunnel, Termote), vendor/self-host relay with E2E claim (Happy), and vendor cloud environment (CloudCLI Cloud, Omnara Cloud).
- Status authority splits into terminal inference (tmux-webui, VibeTunnel activity) and provider hooks with fallback (purplemux). Approval-as-structured-decision appears in the hook-based approver; approval-as-key-send appears in tmux-webui's deck.
- None of the fetched sources documents a status glyph written into the session or tab name together with a rename that preserves it. {inferred: absence in README text, not proof of absence in code.}

## Disconfirming analysis

- Searched attested sources for any product that writes status into the session name and survives rename. tmux-webui shows an LED/state per window [rps-tmux-webui-deck-doc]{1} and purplemux shows status per session [rps-purplemux-readme]{1}, but neither attestation says status is written into the title string, and rename is not documented; VibeTunnel's `vt title` exists [rps-vibetunnel-readme]{6} but its status is separate [rps-vibetunnel-readme]{5}. Claim stands as "not documented", not "absent".
- Searched for phone-supervision of provider sessions with a user-owned always-on host and no third-party relay: tmux-webui, purplemux and Termote fit by README text, which weakens any claim that a relay is required.
- Omnara was a candidate in the brief; the current README shows a different product shape [rps-omnara-readme]{4}[rps-omnara-readme]{5}. I could not verify earlier forms of the product from fetched sources.
- Candidates dropped for lack of a primary fetch: ctm (Codex tmux manager), MuxCLI, Codex Remote Control Lab, Claude Remote Hub were surfaced only by search snippets or a failed fetch; no claims made.

## Contradictions

- tmux-webui first-party sources disagree on LAN-mode authentication: the README says `--lan` binds "behind a token gate" [rps-tmux-webui-readme]{7}; the remote-access doc says "There is no authentication" in LAN mode [rps-tmux-webui-remote-doc]{2}. {ambiguous: doc and README may describe different versions}.
- CloudCLI describes Claude Code Remote Control as exposing a single session and timing out around 10 minutes [rps-claudecodeui-readme]{5}; purplemux makes a similar single-session claim [rps-purplemux-readme]{3}. Both are competitor characterizations; provider-native remote is covered by another lane.
- Happy's server README says its cloud is "just as secure as running your own" [rps-happy-server-readme]{4} while self-hosting is offered; this is vendor assertion, unverified here {contested: E2E claims not audited by this survey}.

## Revisit if

- Any surveyed product documents a status glyph in the session/tab title or rename-preserving behavior.
- Happy documents approval transport (hook, SDK or keystroke) or session naming.
- Omnara re-adds local Claude Code/Codex session supervision.
- purplemux's two repositories diverge or one is declared canonical.
- tmux-webui or Termote document Codex-specific, hook-based status.
- Vibe Kanban's sunset completes or a successor adds remote access.

## Sources

1. `rps-omnara-readme` — Omnara README (https://raw.githubusercontent.com/omnara-ai/omnara/main/README.md)
2. `rps-happy-readme` — Happy root README (https://raw.githubusercontent.com/slopus/happy/main/README.md)
3. `rps-happy-cli-readme` — Happy CLI README (https://raw.githubusercontent.com/slopus/happy/main/packages/happy-cli/README.md)
4. `rps-happy-server-readme` — Happy Server README (https://raw.githubusercontent.com/slopus/happy/main/packages/happy-server/README.md)
5. `rps-happy-welcome-docs` — Happy docs welcome page (https://happy.engineering/welcome/)
6. `rps-vibetunnel-readme` — VibeTunnel README (https://raw.githubusercontent.com/amantus-ai/vibetunnel/main/README.md)
7. `rps-vibetunnel-push-doc` — VibeTunnel push notifications doc (https://raw.githubusercontent.com/amantus-ai/vibetunnel/main/docs/push-notification.md)
8. `rps-claudecodeui-readme` — CloudCLI UI README (https://raw.githubusercontent.com/siteboon/claudecodeui/main/README.md)
9. `rps-vibe-kanban-readme` — Vibe Kanban README (https://raw.githubusercontent.com/BloopAI/vibe-kanban/main/README.md)
10. `rps-ttyd-readme` — ttyd README (https://raw.githubusercontent.com/tsl0922/ttyd/main/README.md)
11. `rps-gotty-readme` — GoTTY README (https://raw.githubusercontent.com/yudai/gotty/master/README.md)
12. `rps-wetty-readme` — WeTTY README (https://raw.githubusercontent.com/butlerx/wetty/main/README.md)
13. `rps-ntfy-docs` — ntfy docs front page (https://docs.ntfy.sh/)
14. `rps-ntfy-publish-docs` — ntfy publish docs (https://docs.ntfy.sh/publish/)
15. `rps-ntfy-repo` — ntfy repository (https://github.com/binwiederhier/ntfy)
16. `rps-claude-remote-approver-readme` — claude-remote-approver README (https://raw.githubusercontent.com/yuuichieguchi/claude-remote-approver/main/README.md)
17. `rps-tmux-webui-readme` — tmux-webui README (https://raw.githubusercontent.com/operonlab/tmux-webui/main/README.md)
18. `rps-tmux-webui-deck-doc` — tmux-webui deck doc (https://raw.githubusercontent.com/operonlab/tmux-webui/main/docs/deck.md)
19. `rps-tmux-webui-notify-doc` — tmux-webui notify doc (https://raw.githubusercontent.com/operonlab/tmux-webui/main/docs/notify.md)
20. `rps-tmux-webui-remote-doc` — tmux-webui remote access doc (https://raw.githubusercontent.com/operonlab/tmux-webui/main/docs/remote-access.md)
21. `rps-purplemux-readme` — purplemux README (https://raw.githubusercontent.com/9018/purplemux/main/README.md)
22. `rps-termote-readme` — Termote README (https://raw.githubusercontent.com/lamngockhuong/termote/main/README.md)
