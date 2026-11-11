---
source_handle: hma-android-wherdr-docs-notifications
fetched: 2026-11-10
source_url: https://github.com/afloury/wherdr/blob/main/docs/notifications.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

wherdr documentation on Web Push notifications and policy levels.

## Key passages

- [1] "wherdr sends a Web Push when an agent goes from working to blocked (with its question and options) or to done (with the start of its answer). There is no push for the agent currently on screen."
- [2] Levels: Muted, Needs you ("questions, permission requests, board approvals"), Needs you + finished, All activity; plus per-conversation exceptions, Do not disturb, and a Sub-agents switch.
- [3] Each registered device is listed with the result of the last push: delivered, expired (404/410), rejected (401/403), push service unreachable, or failed with its HTTP status.
- [4] "An open conversation suppresses push to every device while the page is visible, focused and recently used (within two minutes)."
- [5] wherdr relays custom notifications from herdr notification show by connecting to Herdr's client socket as a passive client.

## Structural notes

- Project documentation. The docs do not describe Android battery or doze behaviour for Web Push.
