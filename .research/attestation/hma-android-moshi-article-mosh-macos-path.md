---
source_handle: hma-android-moshi-article-mosh-macos-path
fetched: 2026-11-10
source_url: https://getmoshi.app/articles/fix-mosh-fallback-ssh-macos
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi team article (dated February 26, 2026) explaining why Homebrew's default PATH setup makes mosh fall back to SSH on macOS and how to fix it.

## Key passages

- [1] "Mosh bootstraps by running mosh-server new through a non-interactive SSH shell. On macOS, Homebrew's installer tells you to add its PATH to ~/.zprofile — a file that only loads for login shells... mosh-server isn't found and your client silently falls back to SSH."
- [2] Fix for zsh: add eval "$(/opt/homebrew/bin/brew shellenv)" to ~/.zshenv on the Mac (Apple Silicon); verify with ssh user@your-mac 'which mosh-server'.
- [3] With connection mode Auto, Moshi tries Mosh first and silently falls back to plain SSH; the terminal's top-right badge reads "Mosh" or "SSH".

## Structural notes

- Vendor article.
