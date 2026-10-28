---
source_handle: rps-termote-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/lamngockhuong/termote/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Termote is a self-hosted PWA for driving terminal multiplexer sessions (tmux, psmux, Herdr, Zellij) from a phone, with basic auth on by default, a host allowlist, Tailscale HTTPS publishing, and a Chat view that reads and answers a pane running Claude Code or Codex.

## Key passages

- [1] Intro: remote control CLI tools (Claude Code, GitHub Copilot, any terminal) from mobile or desktop via PWA.
- [2] Backends: tmux by default; psmux on Windows; Herdr (per-pane coding-agent status badges); Zellij 0.45.0 or later via `--mux zellij`.
- [3] Chat view: 'read and answer a pane running Claude Code (or Codex started with --no-daemon) as a chat, with slash command suggestions and dialog answers'.
- [4] Session features: multiple tmux sessions with create/edit/delete; horizontal tab bar for quick window switching.
- [5] PWA: installable to homescreen and offline-capable; connection indicator auto-detects disconnect.
- [6] Security: basic auth enabled by default (`--no-auth` to disable); Host header allowlist (DNS-rebinding protection); `--tailscale` publishes over Tailscale HTTPS; Herdr backend exposes every Herdr workspace on the host so `--mux herdr --no-auth` requires an extra flag.
- [7] Container mode: runs a ghcr.io image with podman or docker on port 7680.
- [8] License: MIT (WebFetch-processed page extract).

## Structural notes

- Raw README. The Herdr status badges are provided by the Herdr backend, not by Termote's own classifier as far as the read text states.
