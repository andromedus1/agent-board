---
source_handle: hma-core-readme
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of herdr-core (`hc`), the terminal runtime under the Herdr app and mobile app. It documents standalone install on macOS/Linux/Windows, background terminals that outlive viewers, SSH machines, OSC 7501 status that is never inferred, and the open OpenRPC API. Repository metadata read with gh api shows it was created 2026-10-16, Apache-2.0, tags v0.1.11 to v0.1.20, no GitHub releases listed.

## Key passages

- [1] Intro: "`hc` runs programs and coding agents in terminals that stay alive after you leave." and "Core draws nothing. Use it from your shell, an agent, or your own app."
- [2] Install: "curl -fsSL https://releases.herdr.dev/core/install.sh | sh" for Linux and macOS; "Builds are available for Linux and macOS on x86_64 and aarch64, and Windows on x86_64." `hc update` updates; "Running terminals keep running."
- [3] Run it and come back: `hc run --bg --name web bun dev`, `hc ls`, `hc attach web` ("Ctrl+\ detaches"), `hc read web --lines 100`; "Closing your viewer does not end the program."
- [4] "For a terminal you want to keep even if its program is lost, use `hc run --keep`. Recovery starts a fresh shell, never reruns the task."
- [5] Every machine: `hc machine add my-ssh-host --name box`, `hc run --on box ...`, `hc attach box/t3`; "Programs and files stay on that machine. Your local core brings its terminals into the same list."
- [6] Status: "An agent can say it is working, done, blocked, or in error through OSC 7501, the Program Status Protocol. Core stores what it reports. It does not guess from screen text or recognize agent brands. A program that does not report status has none."
- [7] Build your own client: "`hc schema` prints the request/response API as OpenRPC with JSON Schema." "Use `hc connect` to carry the protocol over stdin and stdout, including through SSH."
- [8] Metadata via `gh api repos/herdrdev/herdr-core`: created 2026-10-16, pushed 2026-11-10, Apache-2.0, 600 stars; `gh api .../tags` lists v0.1.20 down to v0.1.11; `gh release list` returned nothing. `gh issue list --state open` returned 106 issues; the repository defines no p0/p1 labels (labels: bug, enhancement, question, etc.).
- [9] Windows/Linux/macOS terminal naming: `hc run --name` accepts 1-32 characters of a-z 0-9 - _ (docs/commands.md, read in hma-core-docs-commands-skill).

## Structural notes

Fetched with `gh api repos/herdrdev/herdr-core/readme` and repo/tag/label endpoints on 2026-11-10. Passage 9 is cross-reference text only; the 1-32 character rule is attested in hma-core-docs-commands-skill.
