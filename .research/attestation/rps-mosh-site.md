---
source_handle: rps-mosh-site
fetched: 2026-10-26
source_url: https://mosh.org/
source_path: .research/source-captures/rps-mosh-faq-src/capture.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The mosh.org home page plus FAQ (single HTML page, text-extracted). It describes roaming and sleep tolerance, SSH-based login followed by a UDP session, UDP port range requirements, and the scrollback limitation, with tmux or screen as the stated workaround.

## Key passages

- [1] Home page: "Mosh automatically roams as you move between Internet connections. Use Wi-Fi on the train, Ethernet in a hotel, and LTE on a beach: you'll stay logged in."
- [2] Home page: "With Mosh, you can put your laptop to sleep and wake it up later, keeping your connection intact. If your Internet connection drops, Mosh will warn you — but the connection resumes when network service comes back."
- [3] Home page: Mosh does not listen on network ports or authenticate users; the client logs in via SSH, then runs mosh-server remotely and connects to it over UDP.
- [4] FAQ (UDP port message): firewalls blocking UDP prevent connection; "If you had to forward TCP port 22 on a NAT for SSH, then you will have to forward UDP ports as well"; mosh uses the first available UDP port starting at 60001 and stopping at 60999.
- [5] FAQ (scrollback): "Mosh synchronizes only the visible state of the terminal"; the stated workaround is to use screen or tmux on the remote side.
- [6] Man-page summary on page: connection uses a UDP port between 60000 and 61000; "But you'll need working UDP".

## Structural notes

- The page has no section on window titles, OSC sequences, or clipboard escapes; absence here is not evidence either way.
- HTML text extracted locally; the saved capture is the raw HTML.
