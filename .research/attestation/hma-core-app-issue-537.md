---
source_handle: hma-core-app-issue-537
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-app/issues/537
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdr-app issue #537 (open, reported 2026-11-04, comment 2026-11-05) on Claude Code panes not becoming agents under herdr-core. The thread documents that Claude Code reports OSC 7501 itself via a one-shot startup probe, that a slow `--resume` start can make it skip reporting, and that the TUI's Claude hook does nothing under herdr-core. A commenter validated a hook-writes-OSC-7501 workaround and its event mapping.

## Key passages

- [1] Original report (Herdr.app 0.1.12, herdr-core 0.1.17, herdr 0.9.5): "`herdr integration install claude` installs `herdr-agent-state.sh` (v11). It exits unless `HERDR_ENV`, `HERDR_SOCKET_PATH` and `HERDR_PANE_ID` are set. Herdr.app panes get `HC_TERMINAL_ID` / `HC_TERMINAL_SOCKET` / `HC_SCOPE` instead, so the hook silently does nothing."
- [2] Commenter toiroakr (2026-11-05; Herdr.app/herdr-core 0.1.18, Claude Code 2.1.317-2.1.318, macOS): "Claude Code does send OSC 7501 by itself, with no hook. Claude Code probes at startup ... and if the terminal answers, it reports status for the rest of the session." Table: `hc run --bg claude` gives `programStatus=yes (probe: OSC 7501 reply)` and `status: done`.
- [3] Same comment: "The probe is a one-shot decision. If Claude is slow to start, it gives up and never reports for that session." With a ~1.1 MB transcript `--resume` startup took ~9 s; debug log `programStatus=no`; `hc get` shows `reported: false`, "the pane is never in the Agents list for the lifetime of that Claude process." "Claude's wait for the reply is 2 s".
- [4] Same comment: the herdr TUI "decides agent status by screen detection; its Claude hook only calls `pane.report_agent_session` on SessionStart"; "herdr-core is the opposite by design ... So a Claude that skipped the probe stays invisible even though the screen clearly shows an idle Claude prompt."
- [5] Same comment, workaround verified: "Claude Code hooks writing OSC 7501 to the pane's tty". On a pane stuck at `reported: false`, writing `ESC ] 7501 ; : state=idle : app=claude-code ESC \` to the Claude process's tty flipped it to `reported: true`.
- [6] Same comment, hook mapping: "SessionStart / UserPromptSubmit / Stop / Notification(permission_prompt, idle_prompt) / SessionEnd to idle / working / done / blocked / idle / clear"; "a hook has no controlling tty, so `$(tty)` fails" so it walks up to the first ancestor with a tty; "`permission_prompt` gives `blocked` (kind=permission), the next PostToolUse gives `working`"; a per-tool-call hook costs ~0.33 s, ~0.025 s with a marker file.

## Structural notes

Read via `gh issue view 537 -R herdrdev/herdr-app --json ...` on 2026-11-10; the full first comment was read, other comments not. Issue #538 is titled identically (duplicate). Third-party account; no maintainer comment seen in the part read.
