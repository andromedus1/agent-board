---
source_handle: rps-happy-server-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/slopus/happy/main/packages/happy-server/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of the Happy relay server. States a zero-knowledge design (server stores ciphertext), a vendor-operated free cloud instance, self-hosting via a single Docker image, and push notifications when Claude Code finishes or needs permissions.

## Key passages

- [1] Features: 'Zero Knowledge' - the server stores encrypted data but cannot decrypt it; cryptographic auth with public key signatures and no stored passwords.
- [2] Features: push notifications 'when Claude Code finishes tasks or needs permissions (encrypted, we can't see the content)'.
- [3] How it works: clients generate encryption keys locally and use Happy Server as a secure relay; the server stores encrypted blobs and syncs them between the user's devices over WebSocket.
- [4] Hosting: a free cloud server at `happy-api.slopus.com` is offered; the server is open source and self-hostable and the stated security model is identical either way.
- [5] Self-hosting with Docker: single container with embedded PGlite, local filesystem and in-memory event bus; requires `HANDY_MASTER_SECRET`.

## Structural notes

- Raw README of packages/happy-server. Describes itself as a backend for 'Claude Code clients'; provider coverage is therefore stated only for Claude here, while the root README and CLI README list others.
