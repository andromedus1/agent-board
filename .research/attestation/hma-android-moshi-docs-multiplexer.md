---
source_handle: hma-android-moshi-docs-multiplexer
fetched: 2026-11-10
source_url: https://getmoshi.app/docs/multiplexer
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Moshi documentation on multiplexer support (tmux, Zellij, Herdr, and experimental Rex) and how remote approvals are carried. Captured as HTML and text-extracted; the check-mark matrix cells did not survive extraction, but the prose rows below did.

## Key passages

- [1] Tiers: "Herdr and tmux get the deepest integration — automatic reattach after a full reconnect, remote approvals from the Inbox, the Sidebar, session deep links"; Zellij covers detection, picker, initial auto-attach, remote approvals and a shortcut panel but "sits out reconnect auto-attach and the navigation extras".
- [2] Approval mechanism: "Remote approve / deny from the Inbox — tapping Approve or Deny on a pending agent action injects the right keys into the exact pane, after moshi-hook has re-captured the screen and verified the prompt is still the one you saw. All four multiplexers expose the capture and send-keys primitives this needs."
- [3] "Answering on the host clears the phone — if you answer an approval directly in the terminal instead, the daemon notices the prompt disappear and closes the pending action (and Live Activity) on the phone."
- [4] Herdr row: Hook integration surfaces kind=herdr plus session, workspace and tab in inbox events, and "Herdr's own agent awareness feeds blocked/working/done status into the Sidebar." "The only gap versus tmux is a moshi DIR project-launcher equivalent. Everything else — remote approvals, question answering, image paste, the Sidebar, workspace deep links, the tab 1–20 quick-access row, the Hide tab selector toggle — is at parity."
- [5] Guidance for agent-heavy workflows: "pick Herdr. You give up only the moshi DIR launcher; you keep prefix customization, the tab quick-access row, remote approvals, the Sidebar with live agent status, workspace deep links, and full hook context."
- [6] "Auto-attach same session after reconnect — if the phone kills Moshi or the connection has to start fresh, Pro remembers the tmux session or Herdr session and workspace behind that terminal card and attaches it again automatically."

## Structural notes

- Vendor documentation. The approval-carriage statement is the vendor's; it was not tested here. The page does not distinguish Claude Code from Codex in the approval-carriage row.
