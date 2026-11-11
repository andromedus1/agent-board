---
source_handle: hma-core-app-issues-mobile
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-app/issues/864
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Two open herdr-app issues (both created 2026-11-10) reporting Android mobile app connection difficulty, plus search listings of mobile and notification issues.

## Key passages

- [1] herdr-app #864 (open; 2026-11-10; Herdr version 1.0.5, Android 17): "Currently this is not possible even if the user adds the public key as authorized on the desktop. The app asks for the user password for the desktop, even when it doesn't need it, without trying the ssh connection." Expected: "It should just connect when passwordless ssh is enabled for a device."
- [2] herdr-app #832 (open; 2026-11-10): "How do I even connect Herdr GUI to the new Herdr Android app? I honestly have no idea and the UX is not very clear and concise"; requests a QR scan connection.
- [3] Search listings (title only, state open on 2026-11-10): herdr-app #430 'Allow disabling of notifications', #120 'macOS: add native Notification Center alerts when agents finish or need input', #312 'No app command to post a notification, so only a mod can notify', #306 'Any plans for mobile access to Herdr App?'.
- [4] A search of herdrdev/herdr-core issues for 'push' returned #103 'Add webhook support', #174 and #106 only; no issue titled for mobile push notification was seen in the listings.

## Structural notes

Read via `gh issue view 864`/`832` and `gh search issues ... --repo herdrdev/herdr-app` on 2026-11-10. #864 and #832 are single-reporter first-day reports, not triaged. The mobile app's source is not in the herdrdev org list (herdr-app, herdr-core, herdr, herdr-layout-examples, herdr-nix).
