---
source_handle: herdr-agents-docs
fetched: 2026-08-20
source_url: https://herdr.dev/docs/agents/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr places coding agents in terminal panes that it owns and supervises. Its published support table puts both Claude Code and Codex in the same category: automatic process identification plus screen-manifest status detection, with an integration that supplies session identity rather than lifecycle state. A pane has one status authority; for these two agents, Herdr reads the live bottom-buffer snapshot and evaluates it against agent-specific TOML rules. Blocked is intentionally conservative: a known live approval, question, or permission UI must match; an unmatched known-agent screen becomes idle with a labelled fallback. Pane states roll up to tabs and workspaces.

## Key passages

- [1] Lines 63-65: Herdr says agents remain in real terminal panes and that it tracks their panes and rolls state up to tabs and workspaces.
- [2] Lines 72-94: the supported-agent table names both Claude Code and Codex, giving each `screen manifest` as state authority and `session` as integration role.
- [3] Lines 100-104: a pane has one authority; agents without complete lifecycle hooks are classified from foreground-process identification and a live bottom-buffer snapshot against TOML manifests; session integrations intentionally do not become lifecycle authorities because their hooks can miss transitions.
- [4] Lines 108-110: a host-visible wrapper can hide the actual agent; `HERDR_AGENT=<agent>` selects an existing screen manifest, while the child-groups inference mode is explicitly best effort.
- [5] Lines 112-117: blocked is set only when a live bottom-buffer snapshot matches known approval/question/permission UI; unmatched known-agent screens fall back to idle and the effect is limited to visible status and waits, not automated input or destructive action.
- [6] Lines 122-144: bundled, remote, and local manifest precedence is documented, along with automatic valid remote updates and `herdr agent explain` evidence about the active rule, manifest source, and fallback. A local override wins; remote updates patch agents already recognized by the binary, while recognition of a newly added agent still requires a binary update.
- [7] Lines 146-154: blocked makes pane, tab, and workspace blocked; working makes the workspace active; a done agent remains visible until viewed.
- [8] Lines 159-170: official integrations are installed per agent; the custom-integration route can report lifecycle state without native support.
- [9] Lines 192-218: semantic lifecycle state drives waits, notifications, and rollups, while metadata such as summary and terminal title is display-only and title values are separate from semantic state.

## Structural notes

- Official documentation page, “Agents,” fetched from the Herdr site on 2026-08-20.
- Relevant sections: Supported agents, Status authority, VMs and sandbox wrappers, Blocked state, Detection manifests, State rollups, Direct integrations, and Custom status labels.
