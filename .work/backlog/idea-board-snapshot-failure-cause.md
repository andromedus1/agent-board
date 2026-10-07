---
id: idea-board-snapshot-failure-cause
created: 2026-08-14
updated: 2026-08-14
tags: [cli, integration]
---

Preserve the swarm-level cause when `agents` cannot obtain its one Ghostty
snapshot. V1 truthfully degrades every row to `terminal is unknown`, but the
shared Automation/availability error is not printed, so the operator cannot
distinguish one failed snapshot from individually uncertain terminals. Consider
a board-level diagnostic or one terse stderr notice after real usage settles how
normal output and `--json` should carry command-wide evidence. Keep the current
degrade-and-render behavior; do not turn one adapter outage into a hidden board.
