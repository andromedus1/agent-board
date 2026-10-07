---
source_handle: claude-agent-sdk-streaming
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode
provenance: source-direct
substrate_confidence: source-direct
source_class: official-documentation
---

# Claude Agent SDK streaming input

## Summary

The Agent SDK exposes a persistent programmatic session with interruption,
permission-request, session-management, queueing, and real-time response
capabilities.

## Key passages

1. Streaming input is a persistent interactive session that handles user input,
   interruptions, permission requests, and session management. (Section
   “Streaming Input Mode”.)
2. Streaming mode supports queued messages, interruption, tools, real-time
   feedback, and persistent conversation context. (Section “Benefits”.)
3. Single-message mode lacks dynamic queueing, real-time interruption, and
   natural multi-turn interaction. (Section “Single Message Input —
   Limitations”.)

## Structural metadata

Official Anthropic Claude Agent SDK documentation fetched on 2026-08-20.

## Substrate test

Source-direct SDK documentation. It establishes SDK capabilities but does not
establish parity with Claude Code's terminal rendering or subscription-based
authentication.
