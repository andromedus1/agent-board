---
source_handle: hma-host-claude-code-auth
fetched: 2026-11-10
source_url: https://code.claude.com/docs/en/authentication
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Claude Code documentation, Authentication page, section "Credential management".

## Key passages

- [1] "On macOS, credentials are stored in the encrypted macOS Keychain. When the Keychain rejects the write, such as when it's locked in an SSH session, Claude Code stores your login in ~/.claude/.credentials.json with file mode 0600 instead, the same storage it uses on Linux."
- [2] "If you've set the CLAUDE_CONFIG_DIR environment variable, Claude Code keeps the .credentials.json file under that directory instead ... and keys the macOS Keychain entry to that directory too".
- [3] "Custom credential scripts: configure the apiKeyHelper setting to run a shell script that returns an API key."

## Structural notes

- Page text includes a pointer to "recovery steps" for moving a login back into the Keychain; those steps were not read.
