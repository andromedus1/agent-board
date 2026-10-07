---
source_handle: ilmari-readme
fetched: 2026-08-14
source_url: https://github.com/bnomei/ilmari
provenance: source-direct
substrate_confidence: source-direct
source_class: project-repository
---

# Ilmari README

## Summary

Ilmari is a tmux-oriented agent radar with a versioned, render-neutral local state interface. Its state snapshot includes identity, activity, liveness-adjacent freshness fields, warnings, and suggested next actions.

## Key passages

1. A local Unix-domain socket can expose a full versioned snapshot containing pane/session/window identity, agent status, workspace and Git facts, timestamps, warnings, observation time, revision, and TTL; consumers are told to reject incompatible versions and stale observations. (Section “Local JSON socket”; lines 575–604.)
2. Its compact action queue projects agent statuses into consumer states and next intents: running→wait, waiting-input→inspect, finished→result, terminated→cleanup, and unknown→inspect. (State mapping; lines 604–635.)
3. The MCP surface is resource-only, with no control tools, and supports update subscriptions. (Section “MCP resources”; lines 636–657.)
4. Terminal-buffer capture can improve classification but may expose prompts, command output, paths, or tokens; disabling it reduces classification quality for adapters that depend on recent terminal text. (Section “Pane output privacy”; lines 658–669.)

## Structural metadata

GitHub repository README for `bnomei/ilmari`, fetched from the repository landing page on 2026-08-14. Relevant sections: Local JSON socket, MCP resources, and Pane output privacy.
