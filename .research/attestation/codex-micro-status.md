---
source_handle: codex-micro-status
fetched: 2026-08-14
source_url: https://learn.chatgpt.com/docs/features/codex-micro
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The Codex Micro page documents a first-party hardware/client status surface that makes explicit how ChatGPT maps higher-level chat states. Its Agent Key status table includes Idle, Thinking, Complete, Requires input, Error, and No assigned chat, with “Complete” meaning the chat completed with an unread update.

## Key passages

- [1] Lines 790-792: each Agent Key can follow a chat and light up to show its current status.
- [2] Lines 793-800: the Agent Key status table maps White to Idle, Blue to Thinking, Green to Complete for a chat that completed with an unread update, Amber to Requires input, Red to Error, and Off to No assigned chat.
- [3] Lines 804-807: the “Priority chats” arrangement puts chats waiting for input, unread chats, and active chats first.

## Structural notes

- Relevant page: Codex Micro.
- The fetched source resolves at `learn.chatgpt.com`; the older `developers.openai.com/codex/features/codex-micro` path redirects there.
- This source clarifies presentation-layer semantics for “completed with unread update”.
