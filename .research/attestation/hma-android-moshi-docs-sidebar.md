---
source_handle: hma-android-moshi-docs-sidebar
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/sidebar
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation of the Sidebar (formerly the Jump to sheet): a live tree of workspaces, tabs and agents on the host, an Agents view grouped by status, search, pinning, rename and management actions.

## Key passages

- [1] "It lists every workspace, tab and agent on the host, fetched live, with each agent's status." Workspaces view: for Herdr, workspaces and their tabs; linked Herdr worktrees nest under their repository.
- [2] Agents view: "every agent on the host in one list, grouped as Waiting, Done, Working and Idle, and sorted within each group by how long the agent has been in that state." Agent rows "are named after the agent's conversation, or the name you gave it."
- [3] Search covers workspace, tab, pane or conversation name; "Agents are ranked by status, so the ones waiting on you come first." Long-press Pin to keep favourites in a Pinned section.
- [4] Rename: "rename a workspace, tab or pane on the host. On an agent row, it gives the agent a name of your own in Moshi; with Use tab names on, it renames the tab on the host instead."
- [5] Requirements: "The Sidebar reads the host's layout from moshi-hook, so it needs the hook daemon running"; works in tmux, Herdr and Rex; "Agent status comes from the agents' hooks, so install them for each agent you run."
- [6] "The Sidebar is a Pro feature. Opening it, browsing and searching are always free, and so are your first 10 jumps. After that, jumping asks for Pro."
- [7] Settings include Sort workspaces ("workspaces needing attention first"), Show agent details (model and context) and Use tab names ("show multiplexer names instead of agent titles").

## Structural notes

- Vendor documentation; page marked updated 2 weeks ago. It describes docking on iPad and foldable-class screens and does not state Android behaviour separately.
