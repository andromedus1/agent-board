---
source_handle: rps-termius-ios-background
fetched: 2026-10-26
source_url: https://docs.termius.com/help-center/faq/how-can-i-keep-termius-sessions-alive-in-the-background-on-ios-ipados
source_path: .research/source-captures/rps-termius-background/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Termius Help Center FAQ on why SSH sessions disconnect when the iOS/iPadOS app is backgrounded and what reduces the impact. It names location tracking, iPad Split View, and screen/tmux as mitigations.

## Key passages

- [1] "Termius, like most other apps, cannot keep running in the background because of iOS and iPadOS restrictions. Recent versions stop background activity almost immediately, usually within 20 to 30 seconds. Older versions could allow it for 2 to 3 minutes."
- [2] Location tracking: enabling it, per the page, makes background connections "less likely to be interrupted" as a side effect.
- [3] screen / tmux "can preserve your terminal session if the connection drops. However, they do not help if the app goes to the background while port forwarding is active."
- [4] A startup snippet can launch tmux or screen automatically when connecting.

## Structural notes

- The page concerns SSH sessions; Termius' Mosh handling is not covered in this page and was not fetched.
