---
source_handle: hma-android-moshi-docs-chat-view
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/chat-view
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of Chat View: a phone-native conversation layer over a live agent terminal, how approvals and questions appear, and troubleshooting conditions.

## Key passages

- [1] "Chat View is a visual layer over the coding agent already running in your Moshi terminal." "The terminal remains the source of truth. Chat View does not start a second agent or recreate the conversation in Moshi's cloud."
- [2] How it works: moshi-hook detects a supported agent and its native session ID; the app opens the host gateway through the SSH connection; the gateway reads the agent's local transcript and streams entries to the app; "Prompts and supported approval actions go back into the same live terminal session."
- [3] "When the agent asks for permission, Chat View can show an approval bar with Approve and Deny... Action support varies by agent and prompt type; a card that cannot be answered safely in Chat View tells you to answer in the terminal."
- [4] "Approval buttons act on the live session; they do not approve a copied or server-side request. The exact controls differ because each agent exposes permissions differently."
- [5] Troubleshooting: Chat View needs the agent to run inside tmux or herdr; "An agent launched directly in a plain shell stays terminal-only"; Free trial uses of Chat View may be exhausted.

## Structural notes

- Vendor documentation; page marked updated 2 weeks ago.
