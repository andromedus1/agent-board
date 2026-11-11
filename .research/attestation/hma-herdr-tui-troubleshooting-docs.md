---
source_handle: hma-herdr-tui-troubleshooting-docs
fetched: 2026-11-10
source_url: https://herdr.dev/tui/docs/troubleshooting/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The troubleshooting page documents macOS-specific server launch-context hazards for Herdr TUI: a server started through SSH or a background job may lack Keychain access; automatically started servers use a per-user service context so logout does not kill DNS/user lookup for panes; older servers can lose that context after logout.

## Key passages

- [1] "Keychain-backed tools fail inside Herdr on macOS": check `launchctl managername` from a pane; "Background is normal for automatically started macOS servers"; "If Keychain access fails and the server was started through SSH or a background job, stop it and start Herdr again from a normal GUI terminal"; "a server started through SSH or a background job may not have access to interactive Keychain services" (issue #966 referenced).
- [2] "SSH or DNS fails after macOS logout": "Automatically started macOS servers use a per-user service context so logging out does not leave their panes with a dead connection to macOS services. Explicit herdr server launches retain their caller's context."
- [3] Same section: "An older server can survive logout while losing user lookup and DNS. Symptoms include No user exists for uid 501, Could not get manager name., and curl: (6) Could not resolve host"; recovery is a full session restart from a GUI terminal "in the new login", which "ends live pane processes but restores the saved session layout" (issue #4100 referenced).
- [4] "Remote attach cannot authenticate": for a passphrase-protected key in a non-interactive shell, CI job "or mobile terminal", load the key into ssh-agent before remote attach.
- [5] "Find diagnostic logs": logs live in `~/.config/herdr/` (`herdr.log`, `herdr-client.log`, `herdr-server.log`).

## Structural notes

Official docs page converted from HTML to text on 2026-11-10. The page does not describe a launchd agent for Herdr TUI, boot-time start, or behaviour before first GUI login.
