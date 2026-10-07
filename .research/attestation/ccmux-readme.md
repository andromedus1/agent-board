---
source_handle: ccmux-readme
fetched: 2026-08-14
source_url: https://github.com/epilande/ccmux
provenance: source-direct
substrate_confidence: source-direct
source_class: project-repository
---

# ccmux README

## Summary

The ccmux project describes a tmux-dependent supervisor for several coding-agent CLIs. A background daemon merges hooks, process discovery, transcript parsing, and terminal-pattern evidence, then exposes session state through a TUI, CLI, local HTTP API, and SSE stream. It also supports notifications and pane navigation/control.

## Key passages

1. The README defines its core session states as `idle` (waiting for user input), `working` (processing), and `waiting` (permission, plan approval, or question), and says the status machine also checks process liveness for crashed sessions. (Sections “Features” and “Architecture → Session states”; lines 187–205 and fetched search excerpt.)
2. Hooks write PID marker files at session start, turn completion, and approval requests; the daemon watches those files, while matching prioritizes direct PID/TTY/session identity and declines to guess when candidates are ambiguous. (Section “Session Matching with Hooks”; fetched search excerpt.)
3. The daemon provides REST and SSE locally, and the TUI reacts to streamed changes. `ccmux show --json` and `ccmux status` expose non-interactive views of the same monitored sessions. (Sections “Commands” and “Architecture”; lines 251–282 and fetched search excerpt.)
4. Notifications fire on `waiting` and `finished`, and focusing a session clears its notification. The notification layer can carry an approval, denial, or reply, but the README explicitly says these controls map to keystrokes and withholds them when one pane aggregates multiple waiting sessions because the keystroke could reach the wrong dialog. (Section “Notifications”; lines 337–368.)
5. ccmux supports a compact sidebar, project grouping, project/branch/path search, direct pane switching, and multiple agent adapters; tmux is a prerequisite. (Sections “Features”, “Prerequisites”, and “Sidebar Mode”; lines 187–213 and 319–336.)

## Structural metadata

GitHub repository README for `epilande/ccmux`, fetched from the repository landing page on 2026-08-14. Relevant sections: Why, Features, Commands, Session Matching with Hooks, Notifications, Architecture, and Session states.
