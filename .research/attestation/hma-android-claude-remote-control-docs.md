---
source_handle: hma-android-claude-remote-control-docs
fetched: 2026-11-10
source_url: https://code.claude.com/docs/en/remote-control
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Official Claude Code Remote Control documentation, current version: connects claude.ai/code and the Claude iOS and Android apps to a Claude Code session running on the user's machine.

## Key passages

- [1] "Remote Control connects claude.ai/code or the Claude app for iOS and Android to a Claude Code session running on your machine." "The web and mobile interfaces are a window into that local session, so your computer has to stay on and the claude process has to keep running."
- [2] Subscription: available on Pro, Max, Ultra, Team and Enterprise; API keys are not supported.
- [3] Mobile push: with Remote Control active, "/config" enables "Push when Claude decides" and "Push when actions required for permission prompts and questions"; "On Android, aggressive battery optimization can delay delivery. Exempt the Claude app from battery optimization in system settings." "Beyond the two on/off toggles below, there is no per-event configuration."
- [4] Limitations: "One remote session per interactive process"; server mode (claude remote-control) runs multiple concurrent sessions (default capacity 32); "If you run claude from a terminal on a remote machine, start it inside tmux or screen to keep the session running after you disconnect from SSH."
- [5] "Claude Code keeps permission prompts and AskUserQuestion questions open until you answer them"; other forwarded dialogs expire after five minutes by default.
- [6] Session titles: --name sets a custom title shown in the session list at claude.ai/code; otherwise auto-generated names use the machine hostname as prefix.
- [7] Network: the local session "makes outbound HTTPS requests only and never opens inbound ports"; it registers with the Anthropic API and polls for work.
- [8] Server mode gives up after roughly 10 minutes of extended network outage, while an interactive session retries and reconnects on its own.

## Structural notes

- Official documentation. Covers Claude Code only; no Codex coverage. The page does not mention Herdr.
