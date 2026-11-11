---
source_handle: hma-wherdr-docs
fetched: 2026-11-10
source_url: https://github.com/afloury/wherdr
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

wherdr is an unofficial, third-party (afloury) self-hosted web/PWA client for Herdr, MIT licensed, latest release v2.5.0 (2026-11-02), created 2026-09-27. It runs on the same machine as the Herdr server, uses Herdr's local socket API and CLI, serves a PWA over Tailscale Serve HTTPS, supports Web Push, and installs a macOS login-time service. It targets Herdr (the TUI-side local socket) and an optional herdr-projects 1.x Board.

## Key passages

- [1] README: "wherdr is an unofficial, self-hosted web client for Herdr ... It uses the same Herdr session"; "Unofficial project; not affiliated with or endorsed by Herdr, Anthropic or OpenAI." Repo metadata via `gh api`: created 2026-09-27, pushed 2026-11-11, MIT, 16 stars, topics include herdr-plugin, pwa, tailscale; `gh release list`: v2.5.0 (Latest, 2026-11-02), v2.4.0 (2026-10-30), v2.3.0 (2026-10-28), v2.2.0 (2026-10-26).
- [2] README, Quick start: on a Linux or macOS computer "running Herdr >= 0.9.1" run `curl -fsSL https://wherdr.dev/install | sh`; "starts wherdr as your user at http://localhost:7683" and "configures automatic startup: at login on macOS; at boot on Linux with lingering enabled, otherwise at login."
- [3] README: "wherdr is a remote shell as your user. Keep it on localhost or a private network such as Tailscale; never expose it to the public Internet."
- [4] docs/overview.md, "How it works": diagram shows wherdr (Nitro server, 127.0.0.1:7683) using the Herdr API socket `~/.config/herdr/herdr.sock`, the Herdr client socket (notifications, passive client), `herdr terminal session control <pane>` for the terminal view, read-only transcripts under `~/.claude` and `~/.codex`, and `ssh -M <machine>` for other machines; "wherdr runs on the same machine as the Herdr server."
- [5] docs/security.md: listens on `127.0.0.1` only; "answers only this computer and the tailnet" (other peers get HTTP 403); `tailscale serve` is the preferred route; an optional passkey lock requires HTTPS; "Without a passkey, anyone who can reach the address can control your agents: every device on your tailnet, and every user of your tailnet if you share it."; Tailscale Funnel exposure causes wherdr to refuse connections.
- [6] docs/notifications.md: Web Push "when an agent goes from working to blocked (with its question and options) or to done (with the start of its answer)"; no push for the agent currently on screen; Do-not-disturb; per-device push result list; levels Muted, Needs you, Needs you + finished, All activity; relays `herdr notification show` through a passive client socket.
- [7] docs/phone.md (Install as an app): "Android: open the address in Chrome -> menu -> Install app (or Add to Home screen), then Settings -> Enable notifications"; the app "must be served over HTTPS"; on iOS push works only in the installed app.
- [8] docs/conversation.md: "Existing native questions, approvals, menus, waiting screens and Claude settings cards keep their controls"; an uncertain menu opens the pane's real terminal "with arrows, Enter, Escape, Tab, digits and y/n"; "Unrecognized blocking screens offer an Open interactive terminal button"; docs/devices.md: "Quick replies: answer permissions and questions in one tap from the agent list." Answers to agent questions are composed as quoted text in the message field and then sent; closed questions get Yes/No shortcuts that "exactly as Reply and typing would" write text, "nothing is sent" until the user sends.
- [9] docs/board.md: "Shepherdr 2.x is not supported by the Board, even though its plugin id is still herdr-projects"; the Board "needs herdr-projects 1.x, from 1.2.1" and wherdr installs 1.2.21 via `herdr plugin install eliasstravik/herdr-projects --ref v1.2.21 --yes`; the plugin is optional.
- [10] docs/networks.md: section "Recommended: always-on server + Tailscale" covers always-on servers and keep-awake (title only was read in detail; contents not itemised here).

## Structural notes

Read via `gh api repos/afloury/wherdr/{readme,contents/docs/*.md,contents/CHANGELOG.md}` and `gh release list` on 2026-11-10. Files: README.md, docs/overview.md, docs/security.md, docs/notifications.md, docs/phone.md, docs/conversation.md, docs/devices.md, docs/board.md, docs/networks.md, CHANGELOG.md. The docs describe behaviour, not independently tested here. Whether approvals send raw keystrokes or text into the pane is not stated at the API level; docs.conversation describes UI affordances only.
