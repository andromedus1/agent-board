---
source_handle: hma-host-codex-auth
fetched: 2026-11-10
source_url: https://developers.openai.com/codex/auth
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

OpenAI Codex documentation, Authentication page: credential caching and headless login.

## Key passages

- [1] "Codex caches login details locally in a plaintext file at ~/.codex/auth.json or in your OS-specific credential store."
- [2] "cli_auth_credentials_store ... file | keyring | auto | ephemeral": "file stores credentials in auth.json under CODEX_HOME"; "keyring stores credentials in your operating system credential store and fails if it is unavailable."; "auto uses the OS credential store when available, otherwise falls back to auth.json."
- [3] Headless: "prefer device code authentication (beta) ... run codex login --device-auth directly."
- [4] "For sign in with ChatGPT sessions, Codex refreshes tokens automatically during use before they expire".

## Structural notes

- None.
