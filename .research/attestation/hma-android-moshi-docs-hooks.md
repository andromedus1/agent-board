---
source_handle: hma-android-moshi-docs-hooks
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/hooks
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of moshi-hook: agent support tiers, install on macOS, what install changes, the daemon and local gateway, inbox categories, and a data-privacy section describing what reaches Moshi's server. It is the current version of the page previously attested as rps-moshi-docs-hooks.

## Key passages

- [1] Intro: moshi-hook "runs on your host, installs agent hook config, keeps a local Unix socket for hook calls, and maintains a WebSocket connection back to Moshi for approvals and status updates."
- [2] Tiers: Tier A (native Chat View) lists Claude Code, Codex and others; Tier B (agent-aware hooks and inbox) lists Gemini and Qwen Code; Tier C is any terminal agent. "Chat View is currently experimental and requires a live host-gateway connection to the agent's terminal session."
- [3] macOS install: brew tap rjyo/moshi; brew trust rjyo/moshi; brew install moshi-hook; moshi-hook pair --token <token from Moshi>; moshi-hook install; brew services start moshi-hook. For headless macOS, if the Keychain is locked, run security unlock-keychain or pair with --store file.
- [4] Managed locations include Claude Code ~/.claude/settings.json and Codex ~/.codex/hooks.json plus a Codex config flag; if Codex's shared background server (features.daemon_auto_start, on by default since Codex 0.157) is on, install asks before turning it off.
- [5] Inbox categories are approval_required, task_complete, session_started, tool_running and tool_finished; "Moshi's inbox keeps one active row per agent session."
- [6] Data privacy: transcripts, diffs and terminal traffic stay between host and phone; what reaches Moshi's server includes event summaries, up to 200 characters of the prompt, up to 80 characters of the assistant response, "The command or question behind an approval request, up to 256 characters", project name, session ID, agent, model, tool name and terminal identifiers, and "Pairing, usage synchronization, approval decisions, and WebSocket control traffic."
- [7] With end-to-end encryption on for a host, prompt and response text, approval commands and choices, decisions and most metadata are sealed, and Moshi's server "can no longer approve anything for you"; enable with moshi-hook e2ee enable.
- [8] Diagnostics: moshi-hook doctor reports per feature Ready, Partial, Broken or Off, including agent inbox and alerts, Chat View, Workspaces and Jump To (the Sidebar), and it checks Herdr as the daemon resolves it, "Herdr older than 0.9", and duplicate Herdr installs.
- [9] moshi-hook ask "Deploy to prod?" blocks until you approve or deny on your phone; moshi-hook notify sends from scripts with --silent and --strict options.
- [10] Proxies: "The daemon only needs outbound HTTPS to Moshi." The same section documents moshi-hook set proxy for hosts that reach the internet through a proxy.

## Structural notes

- Vendor documentation; page marked updated 2 weeks ago. The page's text refers to "the iOS app" for the gateway and Diff viewer, and mentions Live Activity as iOS; it does not state per-platform parity for Android.
