---
name: provider-native-remote
description: Facet brief on the providers' own remote, mobile and cloud surfaces for Claude Code and Codex, answered on a common six-question grid.
type: research-specialist
kind: research
status: draft
updated: 2026-10-26
provenance: agent-synthesis
---

# Provider-native remote surfaces

Scope: official documentation fetched 2026-10-26 for Anthropic and OpenAI surfaces that let a phone reach a coding-agent session. No winner is selected.

## Findings: Anthropic

### Remote Control (session stays on a user machine)

Remote Control connects claude.ai/code or the Claude mobile app to a session that runs on the user's own machine; the web and mobile views are "a window into that local session", so the machine and the `claude` process must stay up [rps-claude-remote-control-docs]{2}. Server mode (`claude remote-control`) serves several concurrent sessions from one process, default capacity 32 [rps-claude-remote-control-docs]{4}. If the laptop sleeps or the network drops, Claude Code reconnects when the machine returns [rps-claude-remote-control-docs]{1}. If the process stops, the session goes offline until resumed, and the page recommends `tmux` or `screen` when running on a remote machine [rps-claude-remote-control-docs]{12}. A server-mode process gives up after roughly 10 minutes of network outage and exits; an interactive session keeps retrying [rps-claude-remote-control-docs]{13}. A crashed server-mode session is re-served when a device messages it [rps-claude-remote-control-docs]{14}. The installed binary (2.1.285) exposes `--remote-control [name]` and the name-prefix flag [rps-claude-local-cli-help-2-1-285]{2}.

Naming: the title order is explicit name, then `/rename`, then last message, then a generated `host-adjective-noun` name; a rename from the phone updates the local title [rps-claude-remote-control-docs]{6}. Status shown to the phone is a computer icon with a green dot when online [rps-claude-remote-control-docs]{5}; the page does not document a working / waiting / done state in the list. Attention is delivered by push: Claude "decides when to push", plus a "Push when actions required" toggle covering permission prompts and questions, with no per-event configuration [rps-claude-remote-control-docs]{11}. Permission prompts stay open until answered [rps-claude-remote-control-docs]{14}, so approvals are answered in the product's own prompt flow rather than as typed keys {inferred: the docs describe prompts and questions forwarded as dialogs, not keystroke injection}. The "Can't reach" message does not say whether work continues on the machine [rps-claude-remote-control-docs]{15}.

### Claude Code on the web / cloud sessions

Cloud sessions run on Anthropic-managed infrastructure (or an organization self-hosted environment) and "keep running after you close your laptop" [rps-claude-code-web-docs]{1}. They start from browser, mobile Code tab, Desktop, `claude --cloud`, or scheduled tasks [rps-claude-code-web-docs]{2}; follow-ups can be queued from any logged-in CLI with `claude -p ... --cloud <session-id>` [rps-claude-code-web-docs]{4}. They are GitHub-centred: cloning and PR creation need GitHub, non-GitHub repos go up as a bundle and cannot push back [rps-claude-code-web-docs]{9}. Sessions are listed in the claude.ai/code sidebar and support `/rename` with an argument [rps-claude-code-web-docs]{6}. Persistence has a bound: after inactivity the VM is reclaimed; history is restored on reopen but background shell commands and subagents are not [rps-claude-code-web-docs]{8}. Handoff: `--teleport` pulls a cloud session into the terminal as a separate copy whose new work does not appear in the cloud session, and a terminal session cannot be pushed to the cloud from the CLI [rps-claude-code-web-docs]{3} [rps-claude-code-web-docs]{5}. The mobile app is a client only; code never runs on the phone [rps-claude-mobile-docs]{1}.

### Dispatch and Channels (adjacent)

Dispatch runs on the Desktop app on the user's machine and needs Pro or Max [rps-claude-mobile-docs]{3}; Channels push external chat events into a CLI session on the user's machine [rps-claude-remote-control-docs]{10}. Neither is documented as a headless always-on host.

## Findings: OpenAI

### Codex cloud

Cloud tasks have their own workspace and "can keep working while your computer is asleep"; they are startable and reviewable from web, desktop, mobile and CLI [rps-codex-cloud-docs]{1} [rps-codex-cloud-docs]{2}. Tasks show status and progress and are approved through a UI [rps-codex-cloud-docs]{3} {confidence: tool-extract}. The extracted page did not state status values, rename, plan gating or non-GitHub support [rps-codex-cloud-docs]{7}.

### ChatGPT mobile to a desktop host

The ChatGPT mobile app pairs by QR code with a Codex desktop host on macOS or Windows signed in to the same account [rps-codex-remote-connections-docs]{1} [rps-codex-remote-connections-docs]{2}. The host must be awake and online; "If that computer sleeps, loses network access, or closes the app, remote access stops" [rps-codex-remote-connections-docs]{3}. The phone can start threads, answer questions, "approve commands and other actions", and receive notifications [rps-codex-remote-connections-docs]{4}. Setup cannot be done from the Codex CLI or IDE extension [rps-codex-remote-connections-docs]{9}. The page lists no Linux or headless host, no per-thread status values, and no rename [rps-codex-remote-connections-docs]{11}. Handoff to a cloud environment is unsupported [rps-codex-remote-connections-docs]{8}.

### SSH remote projects, `codex remote-control`, and `--listen`

The desktop app can run chats against an SSH host, using SSH to start and manage the remote app server; Codex must be installed there; app-server transports should not be exposed publicly [rps-codex-remote-connections-docs]{6} [rps-codex-remote-connections-docs]{7}. That keeps the project on the remote host, but the app that drives it still runs on the desktop host, which must be awake {inferred: from the host-awake requirement and the SSH description}. The CLI offers an experimental `codex remote-control` (bare, `start`, `stop`, `pair` with short-lived pairing codes, `--json`) [rps-codex-developer-commands-remote]{1} [rps-codex-developer-commands-remote]{2}, `codex app-server --listen` with `ws://`, `unix://` and token or JWT auth flags [rps-codex-developer-commands-remote]{3} [rps-codex-developer-commands-remote]{4}, and a TUI `--remote` client option [rps-codex-developer-commands-remote]{5}. The docs describe these as commands, not as a documented phone-facing supervisor; how `pair` relates to the mobile app flow is not documented in the fetched pages {ambiguous: pairing-code purpose vs QR flow}. An earlier attestation recorded only start/stop and `--listen` [developer-commands-remote-control]{2}; the surface has since grown.

## Grid

| Surface | 1 Persistence | 2 Phone connection | 3 Naming / status in list | 4 Status authority | 5 Vendor | 6 Limits |
|---|---|---|---|---|---|---|
| Claude Remote Control | Session on user's machine; survives sleep/network drop via reconnect; ends if process stops [rps-claude-remote-control-docs]{1} [rps-claude-remote-control-docs]{12} | Claude app Code tab, claude.ai/code, QR [rps-claude-remote-control-docs]{5} | Name flags, `/rename`, generated name; green online dot [rps-claude-remote-control-docs]{5} [rps-claude-remote-control-docs]{6} | Provider-native product; no working/waiting/done in list documented | Claude only | Server mode exits after ~10 min outage; plan gating; no API key [rps-claude-remote-control-docs]{3} [rps-claude-remote-control-docs]{13} |
| Claude cloud sessions | Anthropic VM; survives laptop close; reclaimed after inactivity [rps-claude-code-web-docs]{1} [rps-claude-code-web-docs]{8} | Mobile Code tab, web, CLI `--cloud` [rps-claude-code-web-docs]{2} | Sidebar list, `/rename` [rps-claude-code-web-docs]{6} | Provider-native | Claude only; GitHub-centred | Shared rate limits, IP allowlist, no third-party providers [rps-claude-code-web-docs]{9} |
| Codex cloud | Cloud workspace, works while computer asleep [rps-codex-cloud-docs]{1} | Web, mobile, CLI [rps-codex-cloud-docs]{2} | Rename not documented | Status and progress shown; values not documented [rps-codex-cloud-docs]{3} | Codex only | Plan gating not in fetched extract |
| ChatGPT mobile to desktop host | Desktop host; stops on sleep/offline [rps-codex-remote-connections-docs]{3} | QR pairing in ChatGPT app [rps-codex-remote-connections-docs]{1} | Not documented | Not documented; approvals and notifications exist [rps-codex-remote-connections-docs]{4} | Codex only | macOS/Windows hosts; not set up from CLI [rps-codex-remote-connections-docs]{2} [rps-codex-remote-connections-docs]{9} |
| Codex SSH / remote-control / `--listen` | Project on SSH host; driver app still host-bound; app-server daemon commands [rps-codex-developer-commands-remote]{1} | App via SSH; TUI `--remote` over ws/unix [rps-codex-developer-commands-remote]{5} | Not documented | Not documented | Codex only | Experimental command; do not expose publicly [rps-codex-remote-connections-docs]{7} |

## Disconfirming analysis

I searched the attested pages for a single provider surface that supervises both Codex and Claude: none found; each page addresses one vendor, and the Claude mobile page names only Claude Code sessions [rps-claude-mobile-docs]{1}. I searched for a documented status glyph or state-in-name feature: none found for either vendor; the nearest items are the green online dot [rps-claude-remote-control-docs]{5} and unspecified Codex "status and progress" [rps-codex-cloud-docs]{3}. I searched for an always-on headless host with phone access on the Codex side: the host list names macOS and Windows desktop apps only [rps-codex-remote-connections-docs]{2}; the Codex CLI `remote-control` and `--listen` surfaces could fit but no fetched page documents a phone path through them. Absence in tool-extracted pages is weaker than absence on the site {confidence: tool-extract}.

## Contradictions

- Claude Remote Control page states the process must keep running and the machine stay on [rps-claude-remote-control-docs]{2}, while the same page says sleeping laptops reconnect automatically [rps-claude-remote-control-docs]{1}. These are compatible if the session resumes after wake; the pages do not state the in-flight turn behavior. {ambiguous: in-flight turn during sleep}
- Codex mobile docs say remote access stops when the host sleeps [rps-codex-remote-connections-docs]{3}; the Codex cloud page says tasks continue while the computer sleeps [rps-codex-cloud-docs]{1}. Different topologies (host vs cloud), side by side without merger.
- A prior attestation says Codex `remote-control` is start/stop daemon management [developer-commands-remote-control]{2}; the current page adds `pair` and a bare form [rps-codex-developer-commands-remote]{1}. Later source supersedes for current behavior.

## Revisit if

- Anthropic documents Remote Control for an always-on or headless host beyond the `tmux` note, or adds list-level working/waiting/done states.
- OpenAI documents a Linux or headless mobile-pairable host, or ties `codex remote-control pair` to the mobile app.
- Either vendor exposes status or rename in a form readable by third-party tooling.
- The `claude remote-control --help` and `codex remote-control --help` local captures become available (the former did not return; the latter was not captured).

## Sources

1. `rps-claude-remote-control-docs` — Continue local sessions from any device with Remote Control (https://code.claude.com/docs/en/remote-control)
2. `rps-claude-code-web-docs` — Use Claude Code in the cloud (https://code.claude.com/docs/en/claude-code-on-the-web)
3. `rps-claude-mobile-docs` — Claude Code on mobile (https://code.claude.com/docs/en/mobile)
4. `rps-claude-local-cli-help-2-1-285` — Local claude --help capture, 2.1.285 (.research/source-captures/rps-local-cli-help/help.txt)
5. `rps-codex-cloud-docs` — Codex cloud (https://learn.chatgpt.com/docs/cloud)
6. `rps-codex-remote-connections-docs` — Remote connections (https://learn.chatgpt.com/docs/remote-connections.md)
7. `rps-codex-developer-commands-remote` — Developer commands, CLI surface (https://learn.chatgpt.com/docs/developer-commands?surface=cli)
8. `developer-commands-remote-control` — prior attestation, Codex developer commands (https://learn.chatgpt.com/docs/developer-commands)
