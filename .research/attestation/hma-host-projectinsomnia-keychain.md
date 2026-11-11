---
source_handle: hma-host-projectinsomnia-keychain
fetched: 2026-11-10
source_url: https://projectinsomnia.com/blog/unlocking-login-keychain-over-ssh-headless-mac/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Practitioner blog post on the locked login keychain of a headless Mac accessed only over ssh, naming Claude Code and git osxkeychain as affected. Practitioner source; single operator.

## Key passages

- [1] "On any Mac that's only ever been logged into over ssh ... the login keychain sits locked forever. Every tool that depends on it fails in some confusing way."
- [2] "Claude Code. It stores its OAuth token in the macOS login keychain. ... on my headless Mac mini ... it meant Claude Code refused to start because it couldn't read its own auth token." (author's observation; a later official doc describes a file fallback, see hma-host-claude-code-auth)
- [3] "The login keychain is encrypted with your login password. On a normal desktop login, the LoginWindow process types that password into the keychain at unlock time. There is no other unlock path that Apple ships."
- [4] "security -i" interactive mode is used so that the password does not appear in argv.

## Structural notes

- Not an Apple statement; the claim "no other unlock path that Apple ships" is the author's.
