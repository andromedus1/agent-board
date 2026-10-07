---
source_handle: herdr-integrations-docs
fetched: 2026-08-20
source_url: https://herdr.dev/docs/integrations/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr distinguishes complete lifecycle reporters from session-only integrations. The page lists Claude Code and Codex among session-identity integrations, whose state remains screen-manifest detection. Its Claude installer writes a hook that reports session identity on session start, and its Codex installer writes a hook, turns on Codex hooks, and also reports session identity; neither is documented as a lifecycle reporter. The same document defines a custom lifecycle reporting protocol and says session identity can be independent of lifecycle state, with automatic native restore requiring Herdr’s knowledge of how to launch and resume that agent.

## Key passages

- [1] Lines 87-89: Herdr says integrations are for native agent session restore, direct lifecycle reports, or both, and points readers to its status-authority model.
- [2] Lines 178-183: the integration table calls Pi, OMP, Kimi Code CLI, OpenCode, Kilo Code CLI, and MastraCode lifecycle authorities; it names Claude Code and Codex in the session-identity group whose state remains screen manifest detection.
- [3] Lines 188-218: a custom agent with lifecycle hooks can report `working`, `idle`, and `blocked` using a stable source, optional ordered sequence number, and release-on-exit behavior; session references can be sent independently and automatic restore also requires a known launch/resume path.
- [4] Lines 221-223: the page says current official integrations enable native session restoration for both Claude Code and Codex, and identifies their required integration versions.
- [5] Lines 275-286: `herdr integration install claude` writes a session-start hook under the Claude configuration directory; the text explicitly says Claude state comes from screen-manifest detection.
- [6] Lines 291-302: `herdr integration install codex` writes the Codex hook, updates `hooks.json`, ensures the Codex hooks feature is enabled, and explicitly says Codex state comes from screen-manifest detection.
- [7] Lines 530-572: integrations report semantic state separately from presentation; metadata and state labels are visual-only, while waits, notifications, and rollups retain semantic-state behavior.

## Structural notes

- Official documentation page, “Integrations,” fetched from the Herdr site on 2026-08-20.
- Relevant sections: How Herdr uses integrations, Integrate your own agent, Claude Code, Codex, and Custom status labels.
