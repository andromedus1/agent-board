---
id: idea-managed-terminal-screen-cleanup
created: 2026-10-18
updated: 2026-10-18
tags: [bug, integration, cli]
---

Andrew reported that a failed plain `agent-codex` launch leaves a strange
terminal display rather than the normal shell. Investigation of
`story-fix-codex-launch-directory` reproduced this with installed Codex 0.160.1 in a
disposable controlling PTY, using the production process host and
`runAgentCodexWithSignals`, without touching a live Ghostty tab.

After a root-thread binding timeout, the launcher stopped the real remote TUI
and private app-server and emitted its existing keyboard-reporting reset.
Captured terminal output nevertheless left alternate-screen mode 1049,
bracketed paste 2004, focus reporting 1004, and mouse reporting
1000/1002/1003/1006 enabled; the timeout run also left the cursor hidden. A
second probe that successfully bound before forced cleanup likewise left the
alternate screen and reporting modes enabled.

`SttyTerminalMode.restore` restores termios and resets CSI-u/modifyOtherKeys,
but does not clear these terminal-emulator modes. Existing
`tests/integration/terminal-restoration.test.ts` exercises a synthetic child
that changes termios, so it does not expose the real TUI's display/reporting
state after forced shutdown. Investigate complete cleanup of modes the
managed TUI enables, retaining normal shell behavior after a launcher failure.
