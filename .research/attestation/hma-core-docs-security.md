---
source_handle: hma-core-docs-security
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core/blob/main/docs/security.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdr-core security and trust model: no sandbox, no API authentication beyond local socket permissions, SSH carries remote trust, unencrypted state, and updates verified by SHA-256 against a manifest from releases.herdr.dev.

## Key passages

- [1] "Core runs commands with your account's access. It is not a sandbox or a permission broker for agents." "Anyone who can connect to its API can run commands, read and change files, and control its terminals with that access."
- [2] "On Unix, core listens on a local Unix socket, not a public TCP port." State and socket directories are created mode 0700. "There is no separate API password or per-client permission check. Other programs running as your account are part of the trust boundary."
- [3] "A status of blocked can prevent a normal send, but it is not an access boundary against another client."
- [4] Remote trust: "SSH handles login, host keys, and encryption. Core carries its protocol through that connection." "Core does not add another encryption layer or authenticate a remote user itself." "Adding a machine gives local clients access to its hc account's commands, files, and terminals."
- [5] "State is not encrypted by core." State includes "terminal records, saved screens and history" under `~/.local/state/herdr-core/<session>/`; "terminal output and saved screens may contain secrets."
- [6] Updates: installers check the archive's SHA-256 against a manifest at releases.herdr.dev; "The manifest is not verified with a separate signing key." On macOS the bundle install is refused unless codesign finds Herdr's Apple team 2W9652Q7QR and identifier dev.herdr.core; as root or outside the home folder the plain executable is checked only by SHA-256.
- [7] Sessions: `HC_SESSION` selects a separate core and state directory; "They are not security boundaries: another process under the same account can select the same session."
- [8] "The CLI starts a background core when it needs one." (What runs) and "Holder processes own the terminals so a core restart or update can leave programs running."

## Structural notes

Fetched with `gh api repos/herdrdev/herdr-core/contents/docs/security.md`, full file read.
