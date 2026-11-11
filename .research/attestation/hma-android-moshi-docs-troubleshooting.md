---
source_handle: hma-android-moshi-docs-troubleshooting
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/troubleshooting
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi troubleshooting page: mosh-server PATH on macOS, hook installation, Codex shared-server misattribution, and push delivery checks.

## Key passages

- [1] "Mosh bootstraps through a non-interactive SSH session, which does not load ~/.zshrc, ~/.bashrc (interactive section), or ~/.profile. A Homebrew-installed mosh-server (/opt/homebrew/bin on Apple Silicon, /usr/local/bin on Intel/Linuxbrew) often isn't on the non-interactive PATH." Fix: set the Mosh path field to the absolute path.
- [2] "Jump hosts are available for SSH connections. If you configured a jump host while forcing mosh, switch the connection type to SSH."
- [3] "Codex sessions show the wrong pane or all look like one terminal": Codex 0.157 turned on features.daemon_auto_start by default, so interactive sessions share one background server and Moshi "attributes every Codex session to that first terminal"; moshi-hook doctor --yes turns it off. Clients using --remote to a shared app-server "share one server the same way, and Moshi cannot tell their panes apart."
- [4] Push checklist: notification permission for Moshi on the phone, notifications not paused in Moshi settings, test notification, and moshi-hook serve or the macOS service running (the page's wording refers to iOS permission).

## Structural notes

- Vendor documentation. The Codex shared-server misattribution is a vendor-documented defect affecting approvals routed to panes.
