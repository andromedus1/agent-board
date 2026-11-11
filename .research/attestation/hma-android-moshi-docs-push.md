---
source_handle: hma-android-moshi-docs-push
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/notifications
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of push notifications and webhooks: how agent events and custom webhooks reach the phone, deep links, rate limits and unified push.

## Key passages

- [1] "Moshi supports push notifications from two sources: custom webhooks and agent events from moshi-hook." Agent pushes "surface on the lock screen, Dynamic Island, and Apple Watch — and you can allow or deny right from the banner" (iOS-framed).
- [2] Webhook API: POST https://api.getmoshi.app/api/webhook with a token, title and message; the endpoint "sends a normal notification; it does not start or update a Live Activity." A data field can carry a moshi://tmux or moshi://herdr?workspace=<id> link opened on tap.
- [3] On macOS, moshi-hook set suppress-push-while-unlocked on makes visible pushes silent while the console is unlocked; "If the lock-state check fails, the notification remains enabled so an approval cannot disappear silently."
- [4] Unified push: with unified: true, or for hook events from a host attached to a license, delivery fans out to every opted-in device on the same Moshi license.
- [5] Rate limits: "free hosts can send up to 10 events per 60 seconds, while hosts attached to Moshi Pro can send up to 60 events per 60 seconds."
- [6] "For coding agents, prefer moshi-hook over hand-written webhook prompts."

## Structural notes

- Vendor documentation; page marked updated 3 days ago. The Android push transport is not described on this page; the Play data-safety and licensing pages only say each device keeps its own OS-level push token.
