---
source_handle: symmetry-claude-interactive-mode
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/interactive-mode
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Code interactive-mode reference

The interactive terminal owns input, interruption, permission-mode cycling,
backgrounding, and the in-terminal task display. Shortcuts may vary with the
terminal and platform.

## Key passages and anchors

- [1] `interactive-mode.md:10-31` — `Ctrl+C` interrupts a running operation;
  `Esc` stops a current response or tool call mid-turn while retaining work so
  far, but closes a permission dialog instead of interrupting when that dialog
  has focus. `Shift+Tab` cycles permission modes and `Ctrl+B` backgrounds Bash
  commands and agents.
- [2] `interactive-mode.md:259-280` — background Bash returns a task ID; output is
  retrievable, and tasks are cleaned up at exit or handed to a background
  session when the session itself is backgrounded. Output-size and platform
  pressure limits can terminate tasks.
- [3] `interactive-mode.md:313-330` — messages typed during a running turn queue
  rather than interrupt it; `Esc` interrupts and sends queued messages.
- [4] `interactive-mode.md:518-522` — Claude’s to-do checklist is separate from
  the background-task view; `/tasks` shows running shells and subagents.
