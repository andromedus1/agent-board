---
source_handle: hma-android-moshi-docs-e2ee
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/e2ee
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of per-host end-to-end encryption for the events moshi-hook sends.

## Key passages

- [1] "E2EE is a per-host switch and is off by default. It needs moshi-hook 0.4.32 or later and Moshi 4.1.0 or later on every phone you use with that host."
- [2] "Moshi's servers can't approve for you. With E2EE on, the host ignores any approve or deny that isn't sealed with its key. Your phone seals each decision to one specific approval, so it can't be replayed or redirected."
- [3] Phones get the key over SSH only; a phone that has never connected to the host over SSH in Moshi "shows 'Encrypted' in place of the content and can't approve." Where a push cannot be opened it shows a generic "Approval needed on a host" with no action buttons.
- [4] The key is kept in "the Keychain on iOS" per the page; Android key storage is not stated on this page.

## Structural notes

- Vendor documentation; page marked updated 2 weeks ago.
