---
source_handle: rps-tmux-manual
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/tmux/tmux/master/tmux.1
source_path: .research/source-captures/rps-tmux-manual/tmux.1
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The tmux manual page source (master branch roff, 9563 lines, captured by curl; tmux is not installed locally, so no version string was available). It documents session persistence across client disconnect, window naming (explicit name, escape-sequence name, automatic-rename), the distinct pane-title and client-title (set-titles) mechanisms, user options prefixed with `@`, format strings usable in the status line, hooks, bell monitoring, passthrough, and command-prompt-driven key bindings.

## Key passages

- [1] Line 75 (DESCRIPTION): each session is persistent and survives accidental disconnection (such as an ssh connection timeout) or intentional detaching (`C-b d`).
- [2] Lines 4773-4781 (OPTIONS): user options are prefixed with `@`, may have any name, and may be set to any string; example `tmux set -wq @foo "abc123"` then `tmux show -wv @foo`.
- [3] Lines 8025-8062 (NAMES AND TITLES): windows do not have titles; a window's title is the title of its active pane. A window's name is set by a command argument (`-n`), by an escape sequence `printf '\033kWINDOW_NAME\033\\'` if `allow-rename` is on, or by automatic renaming (name = active command in the active pane). A pane's title starts as the hostname and can be set by `printf '\033]2;My Title\033\\'`.
- [4] Lines 5931-5950 (automatic-rename): when enabled tmux renames the window using `automatic-rename-format`; the flag is automatically disabled for an individual window when a name is specified at creation, later with `rename-window`, or with a terminal escape sequence; can be switched off globally with `set-option -wg automatic-rename off`.
- [5] Lines 6498-6510 (allow-rename, allow-set-title): `allow-rename` lets programs in the pane change the window name with `\ek...\e\\`; `allow-set-title` lets programs change the pane title with `\e]2;...` or `\e]0;...`.
- [6] Lines 5678-5698 (set-titles, set-titles-string): `set-titles` attempts to set the client terminal title via terminfo tsl/fsl, automatically the `\e]0;...\007` sequence if the terminal appears to be xterm; off by default. `set-titles-string` is the format-expanded string used for it.
- [7] Lines 6421-6426 and 6410 (window-status-format, window-status-current-format): the format in which each window is displayed in the status-line window list; the current window uses `window-status-current-format`.
- [8] Lines 7340-7376 (FORMATS): `#{W:#{E:window-status-format} ,#{E:window-status-current-format} }` lists windows as the status line does; within the `W:` loop user options of neighbouring windows are available via `next_`/`prev_` prefixes (e.g. `next_@color`).
- [9] Lines 7006-7012 (FORMATS conditionals): `#{?cond,a,b}` conditional form; `#{?automatic-rename,yes,no}` given as an example of testing an option.
- [10] Lines 7681 and 7758 (format variable table): `pane_title` (`#T`) is "Title of pane (can be set by application)"; `window_flags` (`#F`).
- [11] Lines 6485-6495 (allow-passthrough): programs in the pane may bypass tmux using `\ePtmux;...\e\\` when set to `on` (only if pane visible) or `all` (even if invisible).
- [12] Lines 6149-6154 and 5886-5891 (monitor-bell, bell-action) and 6400 (window-status-bell-style): `monitor-bell` highlights windows with a bell in the status line; styled by `window-status-bell-style`; `bell-action` governs which windows' bells are acted on; alert-bell hook runs on bell (line 6680).
- [13] Lines 6758-6786 (hooks): `pane-title-changed` runs when a pane title changes; `window-renamed` runs when a window is renamed; `set-hook` at 6799.
- [14] Lines 3968-3976 (rename-window): `rename-window [-t target-window] new-name` renames the window.
- [15] Lines 8231-8250 (command-prompt): opens the command prompt in a client; if a template is given it is used as the command; `-I inputs` supplies initial text, `-p prompts` supplies prompts (flags listed in synopsis); examples at lines 9557-9558 show `bind-key S command-prompt "new-window -n %1 'ssh %1'"`.
- [16] Lines 7449-7456 (FORMATS shell): `#(command)` in status/format strings runs a shell command and inserts its output.
- [17] Lines 5755-5766 (status-format): `status-format[]` arrays can be extended by saving and re-expanding the old value in a user option (`@old_status_format1`).
- [18] Lines 6545-6560 (remain-on-exit): a pane with the flag is not destroyed when its program exits (values on, off, failed, key, failed-key).

## Structural notes

- Master-branch man page source, not a release-tagged man page; options may differ in older tmux releases.
- Line numbers refer to the captured file. Roff escapes (`\-`) appear in the source text.
- The manual documents no persistence across host reboot; session survival is described only for client disconnect.
