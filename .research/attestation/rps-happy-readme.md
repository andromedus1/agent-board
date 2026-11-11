---
source_handle: rps-happy-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/slopus/happy/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Root README of slopus/happy. Positions Happy as a multi-provider app (Claude, Codex, Grok) with an end-to-end encrypted mobile app, MIT licensed, and describes the monorepo split among the mobile app, the original CLI that wraps Claude Code and Codex, and the relay server.

## Key passages

- [1] Header: 'Orchestrate Claude, Codex and Grok in one app'; 'Free and open source'.
- [2] What you get, item 2: sign in with the Claude, Codex and Grok subscriptions you already pay for; Happy adds a harness, not another bill.
- [3] What you get, item 3: open source MIT; runs on your own hardware and projects stay ordinary folders.
- [4] What you get, item 4: end-to-end encrypted mobile app; the same sessions are already on your phone and what moves between devices is encrypted.
- [5] Repository table: slopus/happy holds the mobile app (iOS, Android, web), the original CLI, and the relay server; desktop app and Happy Agent runtime live in separate repositories.
- [6] Original Happy CLI: wraps the Claude Code and Codex harnesses directly in your terminal and lets you continue from your phone; `happy claude` / `happy codex`; the README directs multi-model and team use to the desktop app and Happy Harness.
- [7] Package list: happy-app (Expo mobile and web client), happy-cli, happy-agent (remote session control for the original CLI), happy-server (relay server for encrypted sync).

## Structural notes

- Raw README from main. GitHub API reported pushed_at 2026-10-26, not archived.
- The README presents a desktop-centered direction ('move to the desktop app') for newer features while keeping the original CLI in the repo.
