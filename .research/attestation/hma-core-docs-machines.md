---
source_handle: hma-core-docs-machines
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core/blob/main/docs/machines.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

How one herdr-core connects to others over SSH or a custom connection command, where programs live, and how reconnects work.

## Key passages

- [1] "Run a program on another machine and come back to it from here. The program lives there. Losing your connection does not end it."
- [2] Targets: `user@host`, `user@host:2222`, `ssh://...`, or a Host from `~/.ssh/config` (its user, port and key). "The other machine needs hc. In an interactive terminal, add asks before copying hc there if it is missing or too old"; `--install` allows the copy without asking.
- [3] Custom connection: `hc machine add --name box --via 'ssh -i key -o ProxyJump=bastion user@host'`; the command "must carry stdin and stdout unchanged and ask no questions".
- [4] "Your local core keeps the machine connection and combines terminal lists and events. The remote core owns its programs, terminal history, and files."
- [5] "Once a machine is added, core retries a lost connection. Reattach after it returns."
- [6] Troubleshooting: "If SSH needs a password or code again, run `hc machine login box` in a terminal." "If the connection closes at once, check that the remote login prints no extra text to stdout."
- [7] "Forgetting a machine ... does not stop its remote terminals." (`hc machine rm`).

## Structural notes

Fetched with `gh api repos/herdrdev/herdr-core/contents/docs/machines.md`. Tailscale is not mentioned in this file.
