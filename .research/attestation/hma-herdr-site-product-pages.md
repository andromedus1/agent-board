---
source_handle: hma-herdr-site-product-pages
fetched: 2026-11-10
source_url: https://herdr.dev/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The official herdr.dev site now presents three named pieces: the Herdr app (desktop, built on herdr-core), herdr-core (`hc`, a terminal runtime), and Herdr TUI (the terminal app, v0.9.5, served under /tui/). A separate Herdr mobile app (iPhone, iPad, Android) connects to herdr-core over SSH and explicitly does not support Herdr TUI. Status for herdr-core comes from the OSC 7501 program-status protocol rather than screen inspection; the TUI page keeps the screen-reading description.

## Key passages

- [1] Home page (https://herdr.dev/), hero and "Your agents, from anywhere": "Herdr connects over SSH, and Tailscale works too"; "Your phone and your computers talk straight to your machines. No account, and your terminals never pass through us." Nav lists App, Mobile, Core, Gallery, Guide, Blog, and a "Herdr TUI" link; Play Store and App Store links for the mobile app appear in the page.
- [2] Home page, "Close it, they keep working": agents run in `herdr-core`, "a small server on your machine, not in the window"; "The app, herdr-core and Herdr TUI are open source under Apache 2.0."
- [3] Home page, "Any agent": agents that support OSC 7501, "an open status protocol", show whether they are working, done or need you; the example is `printf '\e]7501;state=blocked:app=my-agent\e\\'`.
- [4] Mobile page (https://herdr.dev/mobile/), intro: "Works with herdr-core, which comes with the Herdr app. Herdr TUI isn't supported."
- [5] Mobile page, FAQ "Does it work with Herdr TUI?": "No. The phone app talks to herdr-core, the runtime the Herdr app is built on. Herdr TUI runs its own server, so agents started there don't show up on your phone. Both can run on the same machine."
- [6] Mobile page, "See who needs you": the Inbox lists every agent on every machine sorted "needs you, done, working, idle"; a blue dot marks unread; swipe left sends the agent Esc; "While the app is open, a banner tells you when an agent needs you or is done."
- [7] Mobile page, "How it connects": the phone talks to herdr-core over SSH; "There's no Herdr account and no server of ours in between"; away from home "Tailscale or any VPN gets you there, and Tailscale SSH works without setting up a key."
- [8] Mobile page, "Answer it": opening an agent shows its real terminal; a key bar offers Esc, Ctrl, Tab and arrows; compose mode sends text, pasted screenshots, photos or dictation "as one paste, then Enter".
- [9] Core page (https://herdr.dev/core/), "Status from the source": "herdr-core draws nothing and guesses nothing. A terminal's status (working, done, needs you) is what its program reports through OSC 7501 ... No screen scraping, no list of known agents."
- [10] Core page, "Build your own client": the same API is open to other clients; `hc schema` prints it as OpenRPC "with streams and events for live updates".
- [11] Download page (https://herdr.dev/download/): macOS build is Apple silicon; the app "sets up herdr-core if you don't have it yet"; iPhone, iPad and Android "connects to herdr-core on your machines over SSH (not Herdr TUI)".
- [12] TUI page (https://herdr.dev/tui/): footer reads "v0.9.5 · Apache 2.0"; copy says "Herdr reads every pane and marks each agent working, blocked or idle"; "Close the lid or drop the network and the agents keep working; restart the machine and Herdr brings the layout back and resumes their sessions."

## Structural notes

Pages fetched with curl and converted from HTML to text on 2026-11-10: https://herdr.dev/, https://herdr.dev/mobile/, https://herdr.dev/core/, https://herdr.dev/download/, https://herdr.dev/tui/. The docs root https://herdr.dev/docs/ redirects to https://herdr.dev/tui/docs/ (the TUI docs, "Latest 0.9.5"). Marketing copy; behaviour claims on these pages are the vendor's own and are corroborated or qualified by the docs and issue attestations.
