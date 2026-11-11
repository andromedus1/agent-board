---
name: diy-persistent-mobile-stack
description: Prior-art facet brief on the generic composable stack (host multiplexer or session daemon, roaming transport, phone terminal client, always-on host) for supervising Codex and Claude Code sessions from a phone, with emphasis on window/tab naming and status-line mechanics.
type: research-specialist
kind: research
status: draft
updated: 2026-10-26
provenance: agent-synthesis
---

# Facet: diy-persistent-mobile-stack

Scope: the generic stack, surveyed without ranking. Mechanics are taken from primary documentation where it was fetched; vendor pages are marked as vendor claims. Composed claims carry `{inferred: ...}`. Where the fetched pages are silent, the brief says "not documented".

## Findings by layer

### Persistence (host side)

- **tmux.** Sessions are persistent and survive accidental disconnection such as an ssh timeout, and intentional detach [rps-tmux-manual]{1}. The manual describes survival across client disconnect only; reboot survival is not documented in the manual. Reboot survival is a plugin concern: tmux-resurrect saves sessions, windows, panes, layouts, working directories and a list of programs, bound to `prefix + Ctrl-s` / `Ctrl-r` [rps-tmux-resurrect]{2}[rps-tmux-resurrect]{3}; only a conservative default program list is restored (`vi vim nvim emacs man less more tail top htop irssi weechat mutt`) [rps-tmux-resurrect]{4}. tmux-continuum adds a 15-minute background save, optional start at machine boot, and restore only at tmux server start [rps-tmux-continuum]{1}[rps-tmux-continuum]{2}[rps-tmux-continuum]{3}; its autosave rides a hook in `status-right` and stops if another plugin overwrites that variable [rps-tmux-continuum]{5}. {inferred: neither README lists `claude` or `codex` among restored programs, so a restored window would at most recreate the layout and working directory, and any provider-side resume would be a separate step.}
- **zellij.** Sessions are serialized by default into the cache folder and can be recreated after an intentional quit or a crash [rps-zellij-resurrection]{1}. Layout (panes and tabs, in order) and the command in each pane are serialized; resurrected commands wait behind a "Press ENTER to run..." banner; viewport and scrollback serialization are opt-in; command discovery can be inaccurate inside wrappers [rps-zellij-resurrection]{2}[rps-zellij-resurrection]{3}[rps-zellij-resurrection]{4}. Whether tab names are serialized is not stated.
- **shpool.** A daemon owning named shell sessions so a dropped connection does not lose them; deliberately no splitting or tiling, so native scrollback and copy-paste are preserved [rps-shpool]{1}. Daemon runs under systemd, Homebrew services, or autodaemonization [rps-shpool]{6}. `shpool list --json` exposes sessions [rps-shpool]{5}. Reboot behavior of session contents is not documented; macOS is described as having failing tests [rps-shpool]{2}.
- **abduco / dtach.** Both run a program independent of its controlling terminal so it can be detached and reattached [rps-abduco]{1}[rps-dtach]{1}. dtach passes the raw output stream with no terminal emulation layer and handles only the detach and suspend keys [rps-dtach]{2}; sessions are Unix-domain sockets [rps-dtach]{4}. abduco lists sessions with markers for connected clients and terminated sessions [rps-abduco]{3}. Neither README documents titles, status rendering, or reboot survival.
- **Eternal Terminal's HTM.** The current ET README bundles `htm`/`htmd`, a multiplexer whose daemon "owns persistent multiplexer sessions" and which speaks tmux control mode [rps-eternal-terminal]{3}. Details beyond the README were not fetched.

### Transport

- **mosh.** Roams across networks and survives laptop sleep [rps-mosh-site]{1}[rps-mosh-site]{2}. Login is via SSH, then a UDP session on ports 60001-60999 [rps-mosh-site]{3}[rps-mosh-site]{4}; "you'll need working UDP" [rps-mosh-site]{6}. It synchronizes only the visible terminal state, so scrollback is incomplete; the stated workaround is tmux or screen on the remote side [rps-mosh-site]{5}. Moshi's documentation repeats this and adds that mosh does not keep the remote shell alive after the remote process exits [rps-moshi-docs-sessions]{3}[rps-moshi-docs-sessions]{4}. Behavior of OSC 0/2 titles through mosh is not documented on the mosh pages fetched; Blink's documentation states only that "some sequences are not supported in Mosh" without naming them [rps-blink-notifications]{3}.
- **Eternal Terminal.** SSH-authenticated, then a reconnecting TCP session via `etserver` on port 2022 [rps-eternal-terminal]{2}[rps-eternal-terminal]{4}; reattachment credentials are stored in `~/.et/sessions` so a client crash or reboot can return to a still-running remote shell; port forwards, agent forwarding and jumphosts are not restored [rps-eternal-terminal]{7}. It can stand in as the Remote-SSH transport for editors [rps-eternal-terminal]{6}. Phone-client support for ET: the Moshi home page lists SSH, Mosh and ET [rps-moshi-marketing]{7}.
- **Plain SSH.** Works anywhere TCP SSH works, but the phone-side TCP session is exposed to iOS backgrounding (below) [rps-moshi-docs-sessions]{2}[rps-termius-ios-background]{1}.
- **Tailscale overlay.** Moshi documents that SSH or mosh over a tailnet behaves like a LAN, with both the SSH bootstrap and the UDP session riding the tunnel, and no public IP needed [rps-moshi-docs-tailscale]{1}[rps-moshi-docs-tailscale]{5}. Tailscale SSH is a separate mode: Tailscale claims port 22 on its tailnet address and routes to its own SSH server [rps-tailscale-ssh-kb]{1}; it runs only on Linux and open-source macOS `tailscaled` hosts, restarting `tailscaled` stops existing Tailscale SSH sessions, and port 22 is fixed [rps-tailscale-ssh-kb]{2}[rps-tailscale-ssh-kb]{3}[rps-tailscale-ssh-kb]{4}. See Contradictions for the divergent documentation on Tailscale SSH plus mosh. A closed-lid Mac host can stop answering UDP after idle; Moshi's documentation suggests keeping the lid open or blocking sleep with Amphetamine or `caffeinate`, and says its client sends a wake-up probe on new mosh connections [rps-moshi-docs-tailscale]{6}.

### Phone clients

- **Blink Shell (iOS/iPadOS).** Described as open source (GPL-3.0), Mosh-native [rps-moshi-marketing]{1} (vendor-competitor statement). Its own documentation: BEL, OSC 9 and OSC 777 `notify` raise device notifications [rps-blink-notifications]{1}[rps-blink-notifications]{2}; iOS "can kill the remote connection after some time" when backgrounded, and a `geo` command is documented to keep the connection [rps-blink-notifications]{4}. A documented Tailscale walkthrough uses `mosh --install-static` [rps-blink-tailscale-mosh]{3}. Display of OSC 0/2 titles is not documented in the pages fetched.
- **Moshi (iOS; Android listed).** A phone terminal for coding agents; connects directly to the user's host over SSH, Mosh or ET and states there is no session relay for the terminal path [rps-moshi-marketing]{7}. It integrates with tmux, Zellij and Herdr: tmux is the recommended host workspace [rps-moshi-docs-sessions]{5}; on app kill, the Pro tier auto-reattaches the same tmux session, but Zellij is not restored after reconnect [rps-moshi-docs-sessions]{4}[rps-moshi-docs-multiplexer]{1}. A host daemon, `moshi-hook`, installs hook entries for Claude Code (`~/.claude/settings.json`) and others, serves a local gateway and keeps a WebSocket to Moshi [rps-moshi-docs-hooks]{1}[rps-moshi-docs-hooks]{4}[rps-moshi-docs-hooks]{5}; Claude Code and Codex are listed in its native-chat tier [rps-moshi-docs-hooks]{2}. Its Jump To sheet lists tmux sessions and windows live from the host; status dots and a "waiting" count are documented for Herdr rows, while the tmux tree is described as sessions and windows only [rps-moshi-docs-multiplexer]{5}[rps-moshi-docs-multiplexer]{3}. Push is from the hook daemon path, and a generic webhook fallback exists for other agents [rps-moshi-marketing]{5}[rps-moshi-docs-hooks]{3}. These are vendor statements.
- **Termius (iOS/iPadOS).** The vendor FAQ says background activity stops within roughly 20 to 30 seconds on recent iOS, lists location tracking, Split View and screen/tmux as mitigations, and notes tmux does not help if the app is backgrounded while port forwarding is active [rps-termius-ios-background]{1}[rps-termius-ios-background]{2}[rps-termius-ios-background]{3}. Title and notification handling not documented in the pages fetched.
- **Not covered by fetched primary pages:** a-Shell, Prompt, Secure ShellFish, JuiceSSH, Termux. A Termux and a Termius mosh page were searched for; no usable primary page was obtained (see acquisition candidates).

### Naming and status mechanics (load-bearing)

**tmux.**
- A window has a name; a window has no title of its own, its "title" is the title of its active pane. The name is set by `-n`, by the escape `\033k...\033\\` when `allow-rename` is on, or by automatic renaming (the active command) [rps-tmux-manual]{3}. The pane title is set by `\033]2;...` / `\033]0;...` when `allow-set-title` is on, and is available as `#T` / `pane_title` [rps-tmux-manual]{3}[rps-tmux-manual]{5}[rps-tmux-manual]{10}.
- `automatic-rename` is disabled for a window once a name is given at creation, via `rename-window`, or via a terminal escape sequence [rps-tmux-manual]{4}. So a user rename discards automatic naming for that window. {inferred: if a glyph were embedded in the automatic name, a plain `rename-window` would drop the glyph along with the automatic format.}
- A user option `@name` can hold any string and is set per window with `set -w` [rps-tmux-manual]{2}. `window-status-format` / `window-status-current-format` control how each window appears in the status line; format strings support conditionals and `#()` shell expansion [rps-tmux-manual]{7}[rps-tmux-manual]{9}[rps-tmux-manual]{16}, and the `W:` loop exposes neighbouring windows' user options [rps-tmux-manual]{8}.
- A rename hotkey is expressible via `bind-key` plus `command-prompt` with a template and initial text `-I` [rps-tmux-manual]{15}. {inferred: composing these, a binding that prompts for a label, stores it in `@label`, and a status format of `#{@glyph} #{@label}` would keep the glyph separate from the human-entered label; this combination is not shown in the manual, only its parts.} Because `rename-window` is never called in that arrangement, automatic-rename's disabling [rps-tmux-manual]{4} is not triggered; {inferred: whether the window's real name would then still be automatic is a user-choice, not a requirement}.
- Push-in hooks: any process can `tmux set -w -t <target> @status ...` (user options, [rps-tmux-manual]{2}); `rename-window -t` is available [rps-tmux-manual]{14}; `pane-title-changed` and `window-renamed` hooks exist [rps-tmux-manual]{13}; `monitor-bell` highlights windows with a bell in the status line [rps-tmux-manual]{12}. How quickly a changed option is re-rendered in a status line is not attested in the manual passages read.
- Outer-terminal title: `set-titles` plus `set-titles-string` (format-expanded) set the client terminal title, off by default [rps-tmux-manual]{6}; `allow-passthrough` lets programs bypass tmux with `\ePtmux;...\e\\` [rps-tmux-manual]{11}. {inferred: an inner program's OSC 2 reaches `pane_title` and can reach the outer terminal only via a `set-titles-string` that references `#T`, not directly.}

**zellij.**
- Tab name and pane name are separate: `rename-tab` / `rename-tab-by-id` (with `undo-rename-tab`), `rename-pane` ("title will appear on the pane frame"), `rename-session` [rps-zellij-cli-actions]{1}[rps-zellij-cli-actions]{2}[rps-zellij-cli-actions]{3}[rps-zellij-cli-actions]{4}[rps-zellij-cli-actions]{5}; `query-tab-names` and `current-tab-info` read them back [rps-zellij-cli-actions]{6}.
- A tab exposes a single `name` string in the plugin event example [rps-zellij-plugin-api]{3}. Plugins can rename tabs by position or stable id with ChangeApplicationState permission, read pane running command and cwd, and are driven from the CLI through `zellij action pipe` [rps-zellij-plugin-api]{1}[rps-zellij-plugin-api]{4}[rps-zellij-cli-actions]{7} or from a key via `MessagePlugin` [rps-zellij-keybind-actions]{3}.
- The default rename key flow uses `RenameTab` mode and `TabNameInput` (byte input) [rps-zellij-keybind-actions]{1}. {inferred: that flow edits the one tab-name string, so a glyph-preserving rename in zellij would need a plugin or wrapper that holds the label and glyph separately and calls `rename_tab_with_id`; no separate status field on tabs was found in the passages read.}
- Whether program OSC titles change tab names or pane titles is not documented in the pages fetched.

### Always-on hosts

- A Mac or Linux machine, WSL box or VPS is the documented target of Moshi [rps-moshi-marketing]{7}; a Mac host needs Remote Login enabled and may sleep (above) [rps-moshi-docs-tailscale]{2}[rps-moshi-docs-tailscale]{6}. No page fetched documents Mac mini or VPS hardening specifically.
- **GitHub Codespaces:** a codespace stops after inactivity (default 30 minutes, adjustable 5-240), and terminal input or output counts as activity [rps-codespaces-timeout]{1}[rps-codespaces-timeout]{2}; reachable from a browser, VS Code or GitHub CLI [rps-codespaces-timeout]{3}. Whether a tmux server survives a stop is not documented in the pages read.
- **Coder:** self-hosted workspaces that automatically shut down when idle [rps-coder-readme]{1}. Phone access and persistence across shutdown not documented in the README.
- devpod and Gitpod-class environments: not documented in sources fetched here.

## Grid

| Component | 1. Where sessions live / survives | 2. Phone connects | 3. Glyph in name, survives rename | 4. Status authority / push-in hooks | 5. Provider coverage | 6. Failure modes |
|---|---|---|---|---|---|---|
| tmux | Host tmux server; survives client disconnect [rps-tmux-manual]{1}; reboot only via plugins [rps-tmux-resurrect]{2}[rps-tmux-continuum]{1} | Any SSH/mosh/ET client; Moshi/Blink/Termius | In-name glyph lost on `rename-window` [rps-tmux-manual]{4}; separate `@` option + status format possible {inferred: from [rps-tmux-manual]{2}[rps-tmux-manual]{7}} | None native; `set -w @opt`, `rename-window -t`, hooks [rps-tmux-manual]{2}[rps-tmux-manual]{13}[rps-tmux-manual]{14}; confidence not modeled | Agnostic | automatic-rename shows process name (a Claude Code issue mirror reports the version string as window name, closed not planned [rps-claude-issue-process-title]{1}); continuum autosave breakage [rps-tmux-continuum]{5} |
| zellij | Host server; layout and commands serialized, restart behind ENTER [rps-zellij-resurrection]{1}[rps-zellij-resurrection]{2}[rps-zellij-resurrection]{3} | Same | Tab name is one string [rps-zellij-plugin-api]{3}; separation needs a plugin {inferred} | CLI `rename-tab`, `pipe` to plugin [rps-zellij-cli-actions]{1}[rps-zellij-cli-actions]{7} | Agnostic | Moshi does not auto-reattach Zellij after reconnect [rps-moshi-docs-sessions]{4}; command discovery inaccuracies [rps-zellij-resurrection]{4} |
| shpool | Daemon-owned shells; survives connection drop [rps-shpool]{1} | SSH RemoteCommand [rps-shpool]{8} | Not applicable (no windows/tabs) [rps-shpool]{1} | `shpool list --json` [rps-shpool]{5}; no push | Agnostic | Stuck-terminal detach [rps-shpool]{4} |
| abduco / dtach | Detached process; survives terminal loss [rps-abduco]{1}[rps-dtach]{1} | Via SSH | Not applicable | None documented | Agnostic | Not documented |
| mosh | Not a session host; roams and survives sleep [rps-mosh-site]{2} | UDP 60001-60999 after SSH [rps-mosh-site]{4} | Title passthrough not documented; Blink says some sequences unsupported [rps-blink-notifications]{3} | None | Agnostic | Visible-state-only scrollback [rps-mosh-site]{5}; needs UDP |
| Eternal Terminal | `etserver` TCP 2022; credentials in `~/.et/sessions` [rps-eternal-terminal]{4}[rps-eternal-terminal]{7} | SSH then ET; supported by Moshi [rps-moshi-marketing]{7} | Not documented | None | Agnostic | Forwards not restored [rps-eternal-terminal]{7} |
| Tailscale SSH | Not a session host | Any Tailscale client; server Linux/macOS CLI only [rps-tailscale-ssh-kb]{2} | Not applicable | None | Agnostic | Port 22 taken; daemon restart ends sessions [rps-tailscale-ssh-kb]{3}[rps-tailscale-ssh-kb]{4} |
| Blink | Client only | iOS native | OSC 0/2 not documented; OSC 9/777 and BEL notify [rps-blink-notifications]{1}[rps-blink-notifications]{2} | Escape-driven only | Agnostic | Backgrounding kills connection [rps-blink-notifications]{4} |
| Moshi | Client plus optional host daemon; terminal path direct [rps-moshi-marketing]{7} | iOS/Android | Not documented for window names | `moshi-hook` hook-event inbox for Claude Code and Codex [rps-moshi-docs-hooks]{2}[rps-moshi-docs-hooks]{4}; status dots documented for Herdr rows only [rps-moshi-docs-multiplexer]{5} | Claude, Codex and others [rps-moshi-docs-hooks]{2} | Vendor-reported; Tailscale SSH conflicts [rps-moshi-docs-tailscale]{3} |
| Termius | Client only | iOS/Android | Not documented | Not documented | Agnostic | Backgrounding stops in about 20-30 s [rps-termius-ios-background]{1} |
| Codespaces | Cloud VM container; stops on inactivity [rps-codespaces-timeout]{1} | Browser/VS Code/gh [rps-codespaces-timeout]{3} | Not documented | Not documented | Not documented | Idle stop |
| Coder | Self-hosted workspace; idle auto-shutdown [rps-coder-readme]{1} | Not documented | Not documented | Not documented | Not documented | Not documented |

## Disconfirming analysis

- Claim: a glyph embedded in a window name survives rename. Searched the tmux manual: `rename-window` and escape-sequence renames disable `automatic-rename` for that window [rps-tmux-manual]{4}, and the name is replaced; the claim fails for in-name glyphs, so the separate user-option route is the mechanism in the manual that keeps the two apart {inferred}. No fetched source documents anyone doing this combination.
- Claim: phone clients display window titles and glyphs. Searched Blink and Moshi docs: Blink documents notifications from BEL/OSC 9/OSC 777 but not title display [rps-blink-notifications]{1}[rps-blink-notifications]{2}; Moshi's Jump To shows tmux windows, with agent status shown for Herdr rows only [rps-moshi-docs-multiplexer]{5}. No disconfirming or confirming evidence for glyph display; marked not documented.
- Claim: sessions survive host reboot. tmux-resurrect restores layout and a short list of programs [rps-tmux-resurrect]{4}; zellij restores commands behind a prompt [rps-zellij-resurrection]{3}; neither documents restoring an interactive coding-agent conversation. Live-process survival across reboot is not available in any fetched source.
- Claim: mosh keeps everything alive. Moshi's own documentation says it does not keep the remote shell alive after the remote process exits [rps-moshi-docs-sessions]{4}; Blink says iOS may kill backgrounded connections [rps-blink-notifications]{4}; mosh is session transport, not host persistence.

## Contradictions

- Tailscale SSH plus mosh. Blink documents: advertise `tailscale up --ssh`, `ssh` using tailnet identity, then `mosh --install-static` to install mosh-server [rps-blink-tailscale-mosh]{1}[rps-blink-tailscale-mosh]{2}[rps-blink-tailscale-mosh]{3}. Moshi documents: with Tailscale SSH on, "mosh cannot bootstrap through Tailscale SSH because it is not real OpenSSH" and key auth stalls [rps-moshi-docs-tailscale]{3}[rps-moshi-docs-tailscale]{4}. Relationship: tension {ambiguous: the two vendors may describe different client flows (Blink's built-in ssh/mosh client versus Moshi's key-based pairing); no source tests both on one host}.
- Relay-free terminal path. Moshi's home page states there is no session relay [rps-moshi-marketing]{7}; its hooks page says `moshi-hook` maintains a WebSocket connection back to Moshi for approvals and status [rps-moshi-docs-hooks]{1}. Relationship: qualifies; the first appears to refer to the terminal path and the second to the event path {inferred: both pages read together}.
- Restore completeness. tmux-resurrect's intro states the aim "You should feel like you never quit tmux" [rps-tmux-resurrect]{1}; its default restores only a conservative program list [rps-tmux-resurrect]{4}. Relationship: qualifies.

## Revisit if

- A surveyed phone client documents OSC 0/2 title display, window-name display, or a status field (Blink, Moshi, Termius).
- Moshi extends status dots from Herdr rows to tmux or Zellij rows [rps-moshi-docs-multiplexer]{5}, or documents a way to feed status into tmux user options.
- tmux or zellij documents a separate status field per window or tab, or a persistence guarantee across reboot for running programs.
- Mosh documents OSC title or notification passthrough behavior.
- Codespaces, Coder or devpod document persistence of background processes across stop, or a mobile terminal path.
- Tailscale or Blink/Moshi change their Tailscale SSH plus mosh guidance.

## Sources

1. `rps-tmux-manual` — tmux manual page source, master branch (https://raw.githubusercontent.com/tmux/tmux/master/tmux.1)
2. `rps-tmux-resurrect` — tmux-resurrect README (https://raw.githubusercontent.com/tmux-plugins/tmux-resurrect/master/README.md)
3. `rps-tmux-continuum` — tmux-continuum README (https://raw.githubusercontent.com/tmux-plugins/tmux-continuum/master/README.md)
4. `rps-shpool` — shpool README (https://raw.githubusercontent.com/shell-pool/shpool/master/README.md)
5. `rps-abduco` — abduco README (https://raw.githubusercontent.com/martanne/abduco/master/README.md)
6. `rps-dtach` — dtach README (https://raw.githubusercontent.com/crigler/dtach/master/README)
7. `rps-eternal-terminal` — Eternal Terminal README (https://raw.githubusercontent.com/MisterTea/EternalTerminal/master/README.md)
8. `rps-mosh-site` — mosh.org home page and FAQ (https://mosh.org/)
9. `rps-zellij-cli-actions` — Zellij CLI actions (https://zellij.dev/documentation/cli-actions.html)
10. `rps-zellij-plugin-api` — Zellij plugin API commands (https://zellij.dev/documentation/plugin-api-commands.html)
11. `rps-zellij-resurrection` — Zellij session resurrection (https://zellij.dev/documentation/session-resurrection.html)
12. `rps-zellij-keybind-actions` — Zellij keybinding actions (https://zellij.dev/documentation/keybindings-possible-actions.html)
13. `rps-tailscale-ssh-kb` — Tailscale SSH (https://tailscale.com/kb/1193/tailscale-ssh)
14. `rps-blink-notifications` — Blink Shell notifications (https://docs.blink.sh/basics/notifications)
15. `rps-blink-tailscale-mosh` — Blink Shell Tailscale + Mosh (https://docs.blink.sh/integrations/tailscale+mosh)
16. `rps-moshi-marketing` — Blink Shell vs Moshi (https://getmoshi.app/compare/blink)
17. `rps-moshi-docs-sessions` — Moshi terminal sessions and tmux docs (https://getmoshi.app/docs/terminal-sessions)
18. `rps-moshi-docs-multiplexer` — Moshi multiplexers and Jump to docs (https://getmoshi.app/docs/multiplexer)
19. `rps-moshi-docs-tailscale` — Moshi Tailscale docs (https://getmoshi.app/docs/tailscale)
20. `rps-moshi-docs-hooks` — Moshi hooks docs (https://getmoshi.app/docs/hooks)
21. `rps-termius-ios-background` — Termius iOS background FAQ (https://docs.termius.com/help-center/faq/how-can-i-keep-termius-sessions-alive-in-the-background-on-ios-ipados)
22. `rps-codespaces-timeout` — GitHub Codespaces timeout (https://docs.github.com/en/codespaces/setting-your-user-preferences/setting-your-timeout-period-for-github-codespaces)
23. `rps-coder-readme` — Coder README (https://raw.githubusercontent.com/coder/coder/main/README.md)
24. `rps-claude-issue-process-title` — Claude Code issue #49852 mirror (https://claudeissues.com/issue/49852-process-title-is-set-to-version-number-instead-of-claude-breaking-tmux-window-na)
