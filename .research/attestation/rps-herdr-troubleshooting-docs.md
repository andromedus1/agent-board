---
source_handle: rps-herdr-troubleshooting-docs
fetched: 2026-10-26
source_url: https://herdr.dev/docs/troubleshooting/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr's troubleshooting page records caveats relevant to long-lived remote servers: updating does not replace a running server; stopping a server exits its panes; macOS servers started via SSH may lack interactive Keychain access and, in older versions, lose user lookup and DNS after logout.

## Key passages

- [1] Lines 36-41: updating the binary does not replace a compatible running server; to pick up server changes one must stop the session and relaunch; stopping a server exits its pane processes.
- [2] Lines 43-50: Keychain-backed tools may fail in panes if the macOS server was started through SSH or a background job, because panes inherit the long-lived server's launch context; the remedy is to stop and restart Herdr from a GUI terminal, which ends pane processes.
- [3] Lines 53-57: an older macOS server can survive logout while losing user lookup and DNS (symptoms 'No user exists for uid 501', 'Could not resolve host'); logging back in does not repair it, and the fix ends live pane processes while restoring saved layout.

## Structural notes

Official documentation page 'Troubleshooting', converted from raw HTML to text; line numbers refer to the extracted text.
