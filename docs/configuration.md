---
name: agent-board-companion-configuration
description: Read this when configuring Ghostty tabs for Codex or Claude Code sessions and the Codex status line for the recommended Agent Board workflow.
type: design
kind: planning
status: locked
nav_priority: high
updated: 2026-09-12
summary: |
  Agent Board owns the compact Ghostty tab title for both Codex and Claude Code sessions, while Codex additionally owns a detailed in-tab status line. Minimal merge-only examples preserve Andrew's tab and prompt-navigation workflow without copying or mutating full personal configuration files.
decisions:
  - Agent Board owns the complete title of each registered Ghostty tab, regardless of which agent adapter manages it.
  - The Codex status line shows project, branch, model/reasoning, and context usage inside the active tab. This status-line guidance is Codex-specific; Claude Code sessions are not covered by it.
  - Copyable examples are merged manually and never overwrite a complete personal configuration.
  - The Ghostty manual-title prompt is not used for supervised tabs because it conflicts with machine title ownership.
---

# Companion terminal configuration

Agent Board and the agent running in a tab answer different questions:

```text
Ghostty tab title     ● data-platform
                      Which agent needs attention?

Codex status line     data-platform / feature/foo / gpt-5.6-sol medium / Context 23% used
                      What environment is active inside this tab?
```

Keep both surfaces. Agent Board owns the registered tab title for both Codex
and Claude Code sessions. Codex additionally owns a detailed status line
inside the terminal; the status-line guidance below is Codex-specific and does
not apply to Claude Code.

## Configure Ghostty

The copyable merge fragment is
[`examples/ghostty/agent-board.conf`](../examples/ghostty/agent-board.conf).

Merge that fragment into your active Ghostty configuration. Andrew's current
tab-workflow file is:

```text
~/.config/ghostty/config.ghostty
```

Edit it with:

```bash
nano ~/.config/ghostty/config.ghostty
```

In `nano`, use these keys:

```text
Ctrl+O    save
Enter     confirm filename
Ctrl+X    exit
```

If your Ghostty installation uses `~/.config/ghostty/config`, merge the fragment
there instead. Do not replace unrelated font, theme, padding, or scrollback
settings.

The fragment provides this workflow:

```text
⌘T       new project tab
⌘W       close the current surface
⌘1–9     jump directly to a project tab
⌘↑       jump to the previous shell or agent prompt
⌘↓       jump forward toward the current prompt
```

New tabs and splits inherit the current working directory. Ghostty displays tabs
in the macOS title bar.

### Title ownership and rename shortcut

Do not bind `cmd+shift+r` to Ghostty's `prompt_tab_title` for registered Agent
Board tabs. A manual Ghostty title override competes with Agent Board's
machine-rendered `<status> <project>` title. Ghostty supplies that native menu
shortcut by default on macOS, so merely omitting a binding is not enough.
Explicitly remove it so the Agent Board Service can receive the chord:

```text
keybind = cmd+shift+r=unbind
```

For a direct rename, pass one label:

```bash
agent-name data-platform
```

Inside a current session launched by `agent-codex` or `agent-claude`, the
launcher supplies the exact `AGENT_BOARD_SESSION_ID` to the owned agent
process. A Codex `!` shell escape, `agent-name data-platform`, and the agent's
own tool execution inherit that ID, rename only the bound session, and never
use current Ghostty focus for targeting.

Outside a managed session, run the one-label form interactively from the target
tab's normal shell prompt. This fallback resolves Ghostty focus. Agent Board
refuses a detached or non-TTY one-label call without a bound session ID before
focus resolution, with:

```text
CONFLICT: agent-name <label> must run in the target terminal; use the managed agent or a shell prompt
```

For a native macOS rename prompt, run `agent-name` with no label:

```bash
agent-name
```

Unlike the one-label form, this no-argument form is intentionally usable from a
noninteractive caller such as the macOS Shortcut. Agent Board captures the
focused registered Ghostty session before opening the dialog. Rename changes
only the stored project label and canonical title; it does not change session
identity, agent state, or terminal binding. Cancel is a silent successful no-op.
Passing more than one label prints:

```text
Usage: agent-name [label]
```

To bind the no-argument prompt to `⌘⇧R`, use a macOS Shortcut with a **Run
Shell Script** action. For the Homebrew installation, set the shell to
`/bin/zsh`, leave **Run as Administrator** off, and use:

```bash
export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
exec /opt/homebrew/bin/agent-name
```

The Shortcut Input setting may remain at its default; passing input to stdin is
fine. If `agent-name` is installed elsewhere, replace the executable path with
the path from `command -v agent-name` and include its containing `bin`
directory in `PATH`. This is required because the linked executable invokes
Node through `/usr/bin/env`.

In **Shortcut Details**, enable **Services Menu**. Then open **System Settings
→ Keyboard → Keyboard Shortcuts → Services**, find **Rename Agent Tab**, enable
it, and assign `⌘⇧R`. The Shortcuts editor's **Add Keyboard Shortcut** can
intercept that chord as Repeat, so treat it as an optional first attempt rather
than the preferred method. Shortcuts saves automatically.

Reload Ghostty's configuration, then open **Ghostty → Services**. **Rename
Agent Tab** should display `⌘⇧R`; Ghostty's **View → Change Tab Title...** should
not. Pressing the chord should open a dialog titled **Agent Board** with the
prompt **Rename project**. After Rename, the tab keeps its status glyph and the
new stored label. A plain title with no glyph means Ghostty's native manual
title prompt still owns the chord.

Under Shortcuts **Advanced**, only **Allow Running Scripts** is required; do
not enable large-data or deletion permissions. The first invocation may show a
separate macOS Automation permission prompt; grant it to let the
Shortcut-launched command inspect and retitle Ghostty.

The direct shell command remains available when the Shortcut is inconvenient;
outside a managed session, run it interactively from the focused target tab.
Within a managed Codex or Claude session, shell escapes and agent tool calls
use the launcher's exact session identity. Agent Board then retains the label
while status changes update only the leading glyph.

After installing an update that adds managed session targeting, exit every
already-running managed Codex or Claude session and restart it once with
`agent-codex` or `agent-claude`. Only newly launched agent processes inherit
`AGENT_BOARD_SESSION_ID`.

### Required integration values

Ghostty AppleScript must remain enabled:

```text
macos-applescript = true
```

The status glyph must remain the first title character. The example starts from
Ghostty 1.3's bell defaults and replaces title decoration with `no-title`:

```text
bell-features = no-system,no-audio,attention,no-title,no-border
```

Preserve any different bell choices you prefer, but keep `no-title` and omit
`title`.

## Configure the Codex status line

This section is Codex-specific. Claude Code sessions get the same Agent
Board tab-title ownership described above, but this guide does not curate a
Claude Code status line.

The copyable merge fragment is
[`examples/codex/status-line.toml`](../examples/codex/status-line.toml).

The safest setup path uses Codex itself:

1. Start Codex.
2. Enter `/statusline`.
3. Select these fields in order:

   ```text
   project-name
   git-branch
   model-with-reasoning
   context-used
   ```

4. Enable status-line colors if desired.

Agent Board supports the tested Codex 0.147.x, 0.148.x, 0.149.x, 0.150.x,
0.152.x, 0.153.x, and 0.154.x families. The installed `codex-cli` `0.154.0`
passed the narrow generated-schema contract and lifecycle-value probe in
`tests/integration/installed-codex.test.ts`. This checks managed observation
compatibility; it does not validate status-line visual rendering. Codex 0.151.x
remains explicitly excluded until it is verified separately. The recommended
status-line configuration is:

```toml
[tui]
status_line = ["project-name", "git-branch", "model-with-reasoning", "context-used"]
status_line_use_colors = true
```

If you edit `~/.codex/config.toml` manually, merge these keys into its existing
`[tui]` table. TOML does not permit duplicate table declarations.

## Verify the setup

Restart Ghostty after changing its configuration. Then open a project tab and
run:

```bash
agent-board doctor
agent-name agent-board
agent-codex
```

Repeat with `agent-claude` in place of `agent-codex` in another tab to verify
the Claude Code workflow; skip the status-line check below for that tab, since
it is Codex-specific.

Confirm these results:

- The tab starts with one Agent Board status glyph.
- The project label remains stable across status changes.
- The Codex status line shows project, branch, model/reasoning, and context.
- `agents` shows the same state as the tab title.

## Roll back

Unregister the tab before removing the configuration:

```bash
agent-board unregister
```

Remove the merged Agent Board lines if you no longer want this workflow. Delete
the Shortcut if it is no longer wanted. You may restore
`cmd+shift+r=prompt_tab_title` only after Agent Board no longer owns the tab.
