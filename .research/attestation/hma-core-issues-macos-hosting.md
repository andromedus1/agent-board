---
source_handle: hma-core-issues-macos-hosting
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core/issues/104
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdr-core open issues about how the core is hosted on macOS: SSH-started core in a Background security session (Keychain failure), saved remote connections auto-starting a stopped core with a bare environment, short PATH, and the Dock 'Running in Background' coalition kill. Reporter accounts; status as of 2026-11-10.

## Key passages

- [1] herdr-core #104 (open; 2026-11-03; macOS 27.0.1, hc 0.1.17): an SSH connection started the default core while the user was on the desktop; commands in managed terminals "ran in the SSH background security session, and reading an existing Keychain password failed" (`manager=Background`, `password_exit=36`); after "restarting the core from the graphical desktop session" it passed (`manager=Aqua`).
- [2] herdr-core #12 (open; updated 2026-11-08): "Right now a saved remote-machine connection runs `hc connect`, which can start a core if none is listening. So if I deliberately stop a core and a remote client is still reconnecting, it can come right back." Comment (kevin-nous, hc 0.1.16): macOS `serve` started from `sshd-session` got `PATH=/usr/bin:/bin:/usr/sbin:/sbin`; "Restarting the core from a login shell fixes it."
- [3] herdr-core #12 comment (takealook97, hc 0.1.18, macOS 26): when started from inside `sshd-session` "the core still runs in sshd's Background session rather than the login's Aqua session."
- [4] herdr-core #203 (open; 2026-11-08; hc 0.1.19, macOS 26.5.2): programs from `hc run` get the core's environment; with the core started from an SSH session PATH was "~/.cargo/bin:/usr/bin:/bin:/usr/sbin:/sbin" so "`cannot start codex: No such file or directory`".
- [5] herdr-core #140 (open; 2026-11-06; hc 0.1.18): a GUI app started from an hc terminal shares the core's coalition; quitting its Dock 'Running in Background' entry "ends the whole coalition: the core, the holder and the programs in every terminal"; 0.1.20 changelog lists a fix with the caveat for older terminals (see hma-core-changelog).
- [6] The thread titles of core #86 'An autostarted core passes the starting command's environment to every terminal' and #83 'macOS: starting the core through launchd makes herdr-core ask for every privacy permission again' (both open in the search listing) were read as titles only.
- [7] herdrdev/herdr #5784 comment (0trm, 2026-11-08; macOS 27.0.1, Herdr.app 0.1.13, herdr-core 0.1.18): "here the whole session goes down, not only Chrome ... In the same millisecond every process in every Herdr terminal exits (4 to 6 Claude Code agents each ti" (text truncated in the read).

## Structural notes

Read via `gh issue view <n> -R herdrdev/herdr-core --json ...` for 104, 12, 203, 140 on 2026-11-10 (bodies truncated to ~2200 chars, comments to ~700-900 chars). herdr-core has no p0/p1 labels, so severity is not maintainer-triaged there. Maintainer responses were not seen in the portions read.
