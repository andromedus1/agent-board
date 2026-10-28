---
source_handle: rps-codex-remote-connections-docs
fetched: 2026-10-26
source_url: https://learn.chatgpt.com/docs/remote-connections.md
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

Official "Remote connections" page (developers.openai.com/codex/remote-connections and /codex/app/mobile redirect here). The ChatGPT mobile app pairs by QR code to a desktop host running the ChatGPT/Codex desktop app on macOS or Windows; the host must be awake and online. The page also covers SSH hosts for remote projects. Extracts came through the fetch tool, so absences are recorded as "not on the extracted page".

## Key passages

- [1] Setup: start in the desktop app on the host, scan a QR code on the phone; same ChatGPT account and workspace on both; MFA/SSO/passkey steps where applicable.
- [2] Host support: "the ChatGPT desktop app on macOS and Windows"; hosts must be "awake, online, and signed in to the same account and workspace."
- [3] "If that computer sleeps, loses network access, or closes the app, remote access stops until it's available again." On Mac laptops access can stay available with lid open and power connected; with the lid closed an external display is needed; selecting Sleep still stops remote access.
- [4] Mobile abilities: start threads in host projects, send follow-ups and answer questions, "approve commands and other actions", review outputs, and "get notified when ChatGPT completes a task or needs your attention."
- [5] Remote access uses the host's projects, threads, files, credentials, permissions and local tools; credentials stay on the host. Codex keeps running if the phone disconnects (stated in a search snippet of the page, not in the fetched extract).
- [6] SSH hosts: users "add remote projects from an SSH host and run chats against the remote filesystem and shell"; hosts are read from `~/.ssh/config`; Codex must be installed and authenticated on the remote host with `codex` on PATH.
- [7] "Remote connections use SSH to start and manage the remote Codex app server. Don't expose app-server transports directly on a shared or public network." A "secure relay layer keeps trusted machines reachable across your authorized ChatGPT devices without exposing them directly to the public internet."
- [8] "Codex can't hand off the chat making the request, and handoff to a Codex cloud environment isn't supported."
- [9] Mobile setup "can't [be set] up from the Codex CLI or IDE extension"; availability "can vary by rollout."
- [10] Troubleshooting headings: host not visible on the phone; Remote Control off after sign-in; the approval request doesn't appear; the remote session disconnects; authentication blocks setup.
- [11] Not in the extract: Linux or headless host support for mobile, per-thread status values, thread rename.

## Structural notes

- Official OpenAI documentation page reached via 308 redirects; two question-directed fetches plus one search snippet.
