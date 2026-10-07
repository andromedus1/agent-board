---
source_handle: ghostty-zsh-title
fetched: 2026-08-14
source_url: https://github.com/ghostty-org/ghostty/blob/332b2aefc6e72d363aa93ab6ecfc86eeeeb5ed28/src/shell-integration/zsh/ghostty-integration
provenance: source-direct
substrate_confidence: source-direct
source_class: official-source-code
---

# Ghostty 1.3.1 zsh title integration

## Summary

Ghostty's zsh integration itself emits OSC 2 title changes at two lifecycle
points, demonstrating that an application which also writes OSC 2 does not
have exclusive title ownership by default.

## Key passages

1. When `GHOSTTY_SHELL_FEATURES` contains `title`, the integration appends an
   OSC 2 write to its prompt (`precmd`) hook, formatting the current directory
   for display. (Lines 246–249 at the 1.3.1 commit.)
2. The same feature appends an OSC 2 write to `preexec`, setting the title to
   the command being executed after stripping control characters. (Lines
   250–251 at the 1.3.1 commit.)

## Structural metadata

Ghostty zsh integration source at the peeled `v1.3.1` commit
`332b2aefc6e72d363aa93ab6ecfc86eeeeb5ed28`, fetched 2026-08-14.
