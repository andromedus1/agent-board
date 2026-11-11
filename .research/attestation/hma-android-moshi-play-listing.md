---
source_handle: hma-android-moshi-play-listing
fetched: 2026-11-10
source_url: https://play.google.com/store/apps/details?id=app.getmoshi.android&hl=en_US
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Google Play listing for the Moshi Android app, fetched as raw HTML and text-extracted. It records the listing title, developer, rating, install bucket, update date, the vendor description of agent, multiplexer and Herdr features, the Android Keystore statement, and three user reviews with developer replies.

## Key passages

- [1] Listing header: title "Moshi: tmux/herdr SSH terminal", developer Moshi Tech Limited, "In-app purchases", rating 4.7 from 340 reviews, content rating Everyone, "10K+ Downloads"; a separate Updated on field reads Nov 9, 2026.
- [2] Embedded page data places the string 4.3.2 immediately before the What's new text, which begins "Usage has a Servers tab with live CPU, memory and network for moshi-hook hosts / Chat View shows option previews in agent questions / Sub-agents show their model, account and run time in Chat View". The version label is read from embedded data, not from a visible Version row.
- [3] Description section TMUX AND HERDR, PROPERLY INTEGRATED: "Pair with a tmux, Zellij, or herdr session on the remote box: list windows, switch panes from the toolbar, reattach automatically."
- [4] Description section AGENT INBOX AND ALERTS: "Approve, deny, or answer every agent question in one place. Push notifications when a long task finishes... Webhook alerts to Slack, Discord, or your own endpoint. Live rate-limit tracking for Claude Code, Codex, and OpenCode."
- [5] Description section NEVER DROPS: "The Mosh protocol survives network switches, sleep mode, subway tunnels, and flaky cellular" and the session "persists across app switches and reboots, scrollback and all" (vendor claim).
- [6] Description section PRIVATE BY DEFAULT: "Private keys stay on device in the hardware-backed Android Keystore, unlocked by your biometrics"; "No passwords, keys, or terminal data reach our servers." Data safety shows "No data shared with third parties" and "No data collected" (developer-declared).
- [7] Core SSH feature list in the description: SSH and Mosh protocols; ed25519, ECDSA and RSA keys; port forwarding and SFTP; ProxyJump / jump hosts; IPv4 and IPv6.
- [8] Review dated October 24, 2026 (user who runs Claude Code in Herdr): says Chat View makes it feel like a real conversation and that they bought lifetime. Review dated September 30, 2026: notifications from Claude sessions kept arriving after disconnecting from the VPN, and "At no point did approving notifications work"; developer reply says notifications come from moshi-hook through the push service, not over the VPN, and "Approvals failing isn't expected". Review dated October 5, 2026 (Galaxy S25 Ultra) asks for smoother terminal scrolling, saying it stutters or lags.

## Structural notes

- Vendor-controlled listing text plus user reviews; the three reviews shown are a sample of 340 and are not a defect rate.
