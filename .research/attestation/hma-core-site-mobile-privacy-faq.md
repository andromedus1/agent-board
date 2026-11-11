---
source_handle: hma-core-site-mobile-privacy-faq
fetched: 2026-11-10
source_url: https://herdr.dev/mobile/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Re-read of herdr.dev/mobile, /privacy and the home-page FAQ on 2026-11-10 for details not captured in hma-herdr-site-product-pages: notification behaviour, what a core-only host shows, reboot FAQ, and the privacy statement.

## Key passages

- [1] Mobile page, Inbox: "While the app is open, a banner tells you when an agent needs you or is done." No sentence on push notifications when the app is closed appears in the text extracted from /mobile/.
- [2] Mobile page FAQ: "What do I need on my computer? herdr-core, the runtime under Herdr. It comes with the Herdr app, or you can install it on its own. Terminals and agents show up either way; spaces show up when the Herdr app runs there too."
- [3] Mobile page FAQ: "Does it work with Herdr TUI? No. The phone app talks to herdr-core ... Herdr TUI runs its own server, so agents started there don't show up on your phone. Both can run on the same machine."
- [4] Mobile page, How it connects: connect one machine and "Herdr offers the others it knows about: the machines Herdr there already uses, the hosts in your SSH config and your Tailscale devices." "No sign-in, no ads, no tracking, no analytics."
- [5] Mobile page, Answer it: "For more than a few words, open compose: write, paste text or a screenshot, attach photos, or dictate. It goes to the agent as one paste, then Enter." Inbox: "Swipe right to pin an agent or mark it read, left to send it Esc."
- [6] Home FAQ, What happens when I quit, update or reboot?: "If the machine reboots or herdr-core stops, the programs stop too. Their panes come back with a shell in the same folder, but Herdr doesn't restart an agent or resume its work in progress. Start it again and carry on."
- [7] Home FAQ: "My agent doesn't show up in the agents list: The list shows agents that report their status through OSC 7501, so check these: Older versions of an agent may not report it yet. Update the agent. An agent running inside tmux within Herdr can't report through tmux. Run it in a Herdr pane directly."
- [8] Home FAQ: "Herdr TUI is the original Herdr: a terminal app with its own server. This is a new, separate program built on herdr-core. They don't share agents, so what runs in one doesn't show up in the other. Herdr TUI keeps working".
- [9] Privacy page (last updated Nov 2, 2026): "The app talks only to the machines you add, over SSH." "There's no sign-in, no ads, no tracking and no analytics." The desktop app "sends one anonymous usage report a day"; speech models "download once from huggingface.co and github.com"; feedback includes "herdr-core version".
- [10] Home FAQ: "Is it free? Yes. The app, herdr-core and Herdr TUI are all open source."; mobile FAQ: "Is it free? Yes."

## Structural notes

Fetched with curl and HTML-to-text on 2026-11-10: https://herdr.dev/mobile/, https://herdr.dev/privacy/, https://herdr.dev/ . Extends hma-herdr-site-product-pages.
