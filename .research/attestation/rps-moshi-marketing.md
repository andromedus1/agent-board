---
source_handle: rps-moshi-marketing
fetched: 2026-10-26
source_url: https://getmoshi.app/compare/blink
source_path: .research/source-captures/rps-getmoshi-blink/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Vendor comparison page of the Moshi iOS (and, per the page, Android) terminal app against Blink Shell, text-extracted from HTML. It is a vendor-authored comparison and therefore a source on what the vendor claims about Blink, not an independent test of Blink. The vendor home page (https://getmoshi.app/, capture at .research/source-captures/rps-getmoshi/) lists the same product capabilities.

## Key passages

- [1] Intro: Blink Shell is described as open source (GPL-3.0), Mosh-native, around since 2016; Moshi is described as a phone terminal built around AI coding agents with an approval inbox, push when an agent needs you, voice, image paste and a diff viewer; "Both speak Mosh".
- [2] "Same foundation" paragraph: both apps are said to be a Mosh client that survives network changes and keeps a shell alive while the phone sleeps; "most 'terminal' apps on iOS are plain SSH and drop the moment you switch from Wi-Fi to cellular" (vendor claim).
- [3] Capability table and text: Moshi lists "Multiplexer UI: tmux / Zellij / Herdr"; Blink is listed as "Runs tmux"; Android app listed for Moshi but not Blink; Blink listed as open source.
- [4] Notifications paragraph: "Blink's notifications are escape-sequence driven — a BEL or an OSC 9 fires a banner while you're looking at a connected session, but there's no server-push to reach you when the app is backgrounded or closed" (vendor characterization of Blink).
- [5] Moshi's mechanism: with a host daemon (`brew install moshi-hook`) agent permission prompts and turn events go to an inbox, push, Live Activity and Apple Watch; Moshi's terminal, SSH, voice and Pro image paste work without moshi-hook, which adds the agent-aware inbox, usage, Chat View, approvals and review surfaces.
- [6] Supported agents list on the page includes Claude Code and Codex among many others.
- [7] Home page: "Moshi connects directly to your own Mac, Linux machine, WSL box, or VPS over SSH, Mosh, or ET. There's no session relay" and lists "Herdr, tmux & Zellij" multiplexer integration, "Webhook Alerts" push notifications when long jobs finish, and OSC 52 remote clipboard.
- [8] Pricing text: Pro unlocks the full agent workflow; $7.99/mo, $69.99/yr, or $199 lifetime.

## Structural notes

- Vendor marketing; the "no session relay" statement coexists with the hooks page statement that moshi-hook maintains a WebSocket connection to Moshi (see rps-moshi-docs-hooks), so the relay-free claim applies to the terminal session path as the page describes it.
- The page does not state anything about window-title (OSC 0/2) display.
