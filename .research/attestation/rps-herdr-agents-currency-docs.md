---
source_handle: rps-herdr-agents-currency-docs
fetched: 2026-10-26
source_url: https://herdr.dev/docs/agents/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Re-fetch on 2026-10-26 of Herdr's agents and integrations pages to check whether status authority for Claude Code and Codex changed since earlier attestations. Both pages still say state for Claude Code and Codex comes from screen-manifest detection while integrations report session identity. The agents page also documents a display-only rename for agent targets and state rollups.

## Key passages

- [1] Agents page, 'How status works': Herdr finds the agent's process in each pane and reads the live bottom of the pane; rules in a detection manifest decide idle, working or blocked; when an integration also reports state, Herdr uses those reports instead of reading the screen.
- [2] Agents page, 'State rollups': a blocked agent makes its pane, tab and workspace look blocked; a working agent makes the workspace look active; a done agent stays visible until viewed.
- [3] Agents page, 'Custom agent labels': 'herdr agent rename w1:p1 reviewer' renames an agent target for display, and 'herdr agent rename reviewer --clear' removes it; terminal IDs and bare agent-kind labels are not accepted.
- [4] Agents page, 'Custom status labels': integrations report lifecycle state as semantic state only; display customization is separate via pane metadata tokens.
- [5] Integrations page, Claude Code section: the hook reports Claude Code session identity to the local Herdr socket on session start, and 'Claude Code state comes from Herdr's screen manifest detection'.
- [6] Integrations page, Codex section: the Codex hook reports session identity through the socket API, and 'Codex state comes from Herdr's screen manifest detection'.
- [7] Integrations page, Kimi section: the Kimi hook reports session identity and lifecycle state for 'authoritative idle, working, and blocked status' (an example of an agent with lifecycle authority via hook).

## Structural notes

Additional URLs read: https://herdr.dev/docs/integrations/.

Two official documentation pages converted from raw HTML to text on 2026-10-26; passages are anchored by section heading because the extracted line numbers are not stable across pages.
