---
source_handle: rps-moshi-docs-hooks
fetched: 2026-10-26
source_url: https://getmoshi.app/docs/hooks
source_path: .research/source-captures/rps-moshi-hooks/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of moshi-hook, a host daemon that installs hook configuration for supported coding agents and reports normalized lifecycle events (approvals, session starts, tool activity, turn completion) to the phone app. The install page (https://getmoshi.app/docs/install-moshi-hook, capture at .research/source-captures/rps-moshi-install-moshi-hook/) is also reflected.

## Key passages

- [1] Intro: moshi-hook "runs on your host, installs agent hook config, keeps a local Unix socket for hook calls, and maintains a WebSocket connection back to Moshi for approvals and status updates."
- [2] Tiers: Tier A (native Chat View) lists Claude Code and Codex among others; Tier B (agent-aware hooks and inbox) lists Gemini and Qwen Code; Tier C is any terminal agent, which runs in Moshi "even when it has no Moshi-specific integration", with a generic webhook fallback for completion notifications.
- [3] Tier C clarification: "Tier C is terminal compatibility, not a claim that Moshi installs or detects that agent, parses its transcript ... or can resume its native sessions."
- [4] "What install changes": `moshi-hook install` writes Moshi-owned entries into agent config files; managed location for Claude Code is `~/.claude/settings.json`; designed to leave user-owned hooks alone.
- [5] Install page: single Go binary, runs on macOS and Linux (x86_64, arm64), serves a host gateway on 127.0.0.1:24543; macOS install via Homebrew tap with `moshi-hook pair --token` then `moshi-hook install` and `brew services start moshi-hook`; Linux via install script and `moshi-hook serve` under a process manager.
- [6] Hooks normalize events "into the same small set of inbox categories" across agents.

## Structural notes

- The Codex managed config path on the page was cut off in the extraction and is not attested here.
- Vendor documentation; the page shows how events reach the Moshi app, not a documented way to write a status string into tmux or Zellij names.
