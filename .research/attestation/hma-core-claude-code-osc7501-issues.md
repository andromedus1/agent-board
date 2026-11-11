---
source_handle: hma-core-claude-code-osc7501-issues
fetched: 2026-11-10
source_url: https://github.com/anthropics/claude-code/issues/106772
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Claude Code issue reports (several authors, 2026-10-17 to 2026-11-09) about its OSC 7501 Program Status Protocol support. They show Claude Code sends 7501 natively (since 2.1.295) only after a startup probe is answered, and list reported gaps: late probe replies, background sessions, agent view, continuation. Reporter accounts, not maintainer statements; all listed issues are open.

## Key passages

- [1] #103022 (open, enhancement; 2026-10-17): "Claude Code 2.1.295 added OSC 7501 (Program Status Protocol) so terminals can show whether Claude Code is working, waiting on the user, or done. It turns on only when the terminal answers the ESC ] 7501 ; ? BEL probe within about 2 s. tmux does not answer it, so Claude Code running in a tmux pane never sends 7501".
- [2] #103022 same body: "Hooks cover most state changes, but Esc, rewound turns and cancelled dialogs fire no hook, so these tools fall back to reading the screen".
- [3] #105534 (open, bug, has repro; 2026-10-27): at startup Claude Code sends the 7501 probe then DA1 as a sentinel; "If the DA1 reply arrives before the 7501 reply, `programStatus` is settled to `no` for the session." A debug line shows `programStatus=yes (probe: OSC 7501 reply)` and then `state=idle:app=claude-code`.
- [4] #106772 (open, bug, area:agent-view; 2026-11-02; author says they work on herdr): "when a conversation moves to the background (press <- to open the agents view, then enter to reopen it), claude code sends `state=clear` and then never reports again, even after the conversation is reopened in the same pane." Claude Code 2.1.316, linux, "also seen on macos".
- [5] #108555 (open, bug, platform:macos; 2026-11-09): inside Herdr (herdr-core) on Claude Code 2.1.311, after choosing 'Background anyway' or a `continued-in` session continuation, "no more status sequences are emitted. The claude process stays in the foreground and keeps working ... but the host sees no status, so the agent disappears from the host's agent list." "Only /exit and `claude --resume` restores it."
- [6] #106605 (open; 2026-11-01; macOS 26.7.2, Claude Code 2.1.316): "a fresh `claude` reports `app=claude-code state=idle` as soon as it starts"; after pressing <- to open agent view and Esc back, "The records stay empty. A session in this state runs whole turns without sending `working`, `blocked` or `idle`."
- [7] #103022 asks for a documented list of the states: "working, blocked:kind=permission|question, done, idle, error, the per-subagent entries" and notes "today they can only be read from the code" (the request, not a vendor statement).

## Structural notes

Read via `gh issue view <n> -R anthropics/claude-code --json ...` for 103022, 105534, 106772, 108555, 106605 on 2026-11-10; body text truncated to ~1800 characters each and comment threads not read in full (103022 has 4 comments, 106772 has 4). No Anthropic-published documentation page for OSC 7501 was found or fetched in this lane.
