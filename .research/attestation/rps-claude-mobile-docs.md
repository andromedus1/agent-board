---
source_handle: rps-claude-mobile-docs
fetched: 2026-10-26
source_url: https://code.claude.com/docs/en/mobile
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

Official page "Claude Code on mobile". The Claude iOS/Android app is a client for Claude Code sessions and not a place where code runs; it reaches cloud sessions, projects, a session on the user's machine via Remote Control, or the Desktop app via Dispatch. Cloud sessions and Remote Control both appear in the app's Code tab.

## Key passages

- [1] Intro: the app "is a client for Claude Code sessions rather than a place where code runs"; Claude Code "doesn't have a separate mobile app".
- [2] Requirements: sign in with the same claude.ai account; cloud sessions and Remote Control are not reachable with a Console API key or a third-party provider such as Amazon Bedrock.
- [3] Feature table: cloud sessions (cloud infrastructure), Projects (coordinated parallel threads that report back), Remote Control (session on the user's computer), Dispatch (the Desktop app; Pro or Max only, not Team or Enterprise).
- [4] "If your computer will be off, use cloud sessions or a project ... Remote Control and Dispatch drive your own machine, so it needs to stay on with Claude Code or the Desktop app running. If your machine sleeps during a Remote Control session, Claude Code reconnects when the machine comes back online."
- [5] Push notifications: when Remote Control is active Claude can push when a long task finishes or a decision is needed; Dispatch sends its own notification when a spawned Code session finishes or needs approval.
- [6] Limitations: terminal-only commands do not work from the app; permission modes offered are Accept edits, Plan, Auto for cloud and Manual, Accept edits, Plan, Auto for Remote Control; Bypass permissions cannot be selected from the app.
- [7] Projects: user "want[s] to see which threads finished or need you" (stated as the use case for Projects).

## Structural notes

- Official Claude Code documentation page; one fetch, extract passed through the fetch tool.
