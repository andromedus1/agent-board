---
source_handle: hma-herdr-projects-readme
fetched: 2026-11-10
source_url: https://github.com/eliasstravik/herdr-projects
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr Projects is a third-party (eliasstravik, MIT) work-board plugin for Herdr: a Coordinator agent turns requests into tasks, each task runs as an ordinary Herdr agent in its own space and git worktree, a second agent reviews it, and merge waits for the operator's approval. The 1.x line (README at tag v1.2.21, Herdr 0.9.3+, macOS and Linux) targets Herdr TUI; the repository has since been renamed Shepherdr and its current 3.x line targets the Herdr app / herdr-core instead.

## Key passages

- [1] README at tag v1.2.21: "Herdr Projects is mission control for Herdr: one list of tasks, yours and the ones you delegate ... the board's own agent, the Coordinator, turns it into tasks. Every delegated task runs as an ordinary Herdr agent in its own space and worktree, gets checked and reviewed by a second agent when it finishes, and waits for your yes before it merges." Badges: "Free, MIT licensed", "macOS and Linux, Herdr 0.9.3+".
- [2] README v1.2.21: board groups are `needs you`, `ready to approve`, `working`, `to do` and `done`; each agent starts "on Claude Code, Codex, pi or another agent herdr supports", in a worktree of its own; "Runs with no machine of yours switched on" is marked unsupported in the comparison table.
- [3] Repository metadata via `gh api` (2026-11-10): the repository `eliasstravik/herdr-projects` resolves to full name `eliasstravik/shepherdr`, description "Run many coding agents across machines from a phone, tablet or desktop. A herdr plugin.", created 2026-09-18, 1119 stars, MIT, latest release Shepherdr 3.1.31 (2026-11-10). Release list shows herdr-projects v1.2.27 on 2026-10-28 and Shepherdr 2.0.0 on 2026-10-28, 2.1.1 on 2026-11-03.
- [4] Current README (Shepherdr 3.1.31): "Shepherdr is mission control for herdr-core, as a layout for the Herdr app"; requirements "the Herdr app 0.1.12 or newer with herdr-core 0.1.17 or newer, Python 3.8+, Git, and Claude Code or Codex"; tasks are grouped Needs you, Ready, Merging, Working, Queued, Scheduled, To do, Done; "An agent that asks you something, wants a permission or a plan approved shows under Needs you ... a card you answer with a click".
- [5] wherdr docs/board.md (see hma-wherdr-docs): wherdr's Board supports herdr-projects 1.x from 1.2.1 only and refuses Shepherdr 2.x.

## Structural notes

Read via `gh api repos/eliasstravik/herdr-projects`, `gh release list -R eliasstravik/herdr-projects` and `gh api 'repos/eliasstravik/herdr-projects/readme?ref=v1.2.21'` on 2026-11-10. Docs files under docs/ in the repository were not read. The 1.x line's behaviour on Herdr TUI is inferred from the README's "Herdr 0.9.3+" and wherdr's pairing of 1.2.21 with Herdr >= 0.9.1; no independent run was made.
