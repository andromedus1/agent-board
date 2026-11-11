---
source_handle: hma-core-docs-commands-skill
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core/blob/main/crates/herdr-core/src/SKILL.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The agent-facing skill text shipped in herdr-core (printed by `hc --skill`) together with the generated command reference docs/commands.md. It documents status semantics (blocked, error), keep/recovery after loss or reboot, how the macOS core is started (launchd for desktop starts, direct for SSH starts), environment inheritance, and label/name commands.

## Key passages

- [1] Status: "State is `live` or `finished`. Status comes from the program's OSC 7501 reports: `idle`, `working`, `done`, `blocked`, `error`; plain programs report none. Do not guess status from screen text."
- [2] "`blocked` means a person is needed (permission or a question): read the screen and ask your user. `send` refuses unless `--force`; don't use it to bypass a permission decision. `error`: read why, then send or kill."
- [3] "On Unix, status clears when the root interactive shell returns to the foreground."
- [4] Keep/recovery: "`hc keep <t>` (or `run --keep`) replaces a lost program with a shell, never reruns a task." "After a grace delay, recovery runs on every OS, including after a host shutdown."
- [5] macOS start: "On macOS, desktop starts use a one-shot launchd job so quitting the launching app doesn't end terminals." "SSH starts stay direct. If launchd fails, startup falls back to a direct child and logs the reason in `core.log`; that core may end with its launching app."
- [6] "Reopening Herdr after logout/login refreshes an older GUI core's login context while keeping surviving terminals. New terminals use the new login; existing programs retain their original OS context." "Viewing a healthy SSH core does not replace it, and lock/unlock does not rotate holders."
- [7] macOS install layout: the bundle lives at `~/.local/share/herdr-core/active/Herdr Core.app` with `hc` and `herdr-core` links in `~/.local/bin`; "Startup never downloads updates."
- [8] "Codex must run with `--no-daemon` (including templates), or its commands execute outside hc."
- [9] Labels: "`hc label <t> key=value` adds labels." docs/commands.md: `hc label` usage "Set labels (key=value; key= removes)"; `hc run --name`: "Name, unique among live terminals: 1-32 of a-z 0-9 - _".
- [10] docs/commands.md `hc server`: subcommands `start|stop|status|restart`; `hc machine add|ls|login|update|rename|rm`. No subcommand for installing a login item or boot-time service appears in the command list read.

## Structural notes

Fetched with `gh api repos/herdrdev/herdr-core/contents/crates/herdr-core/src/SKILL.md` and `.../docs/commands.md`. The absence of a service-install command in passage 10 is an absence in the portions grepped and listed, not an exhaustive statement; a boot-time headless launchd recipe is not documented in the files read.
