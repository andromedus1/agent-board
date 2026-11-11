---
source_handle: rps-herdr-remote-issues-followup
fetched: 2026-10-26
source_url: https://github.com/herdrdev/herdr/issues/5170
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Follow-up read of Herdr GitHub issue threads bearing on remote persistence: the
state and triage labels of #5170 (remote panes dying with the SSH client), the
closure reason of #1779 (mosh transport request), the resolved server-exit bug
#3324 (cgroup PID exhaustion), and the open memory-growth bug #5471 triggered by
a connected client that stops reading, including a ttyd web terminal in a
backgrounded browser tab and an SSH client on a sleeping laptop.

## Key passages

- [1] #5170, metadata as of fetch: state OPEN; labels `maintainer-needed`, `p1`, `linux`, `remote`, `sessions`, `triaged`; one comment; last updated 2026-10-11.
- [2] #5170, sole comment (collaborator `ogulcancelik`, 2026-10-11): "i couldn't reproduce this over tailscale ssh with KillUserProcesses=false" and asks for the `loginctl show-user $USER -p KillUserProcesses` output and whether plain OpenSSH also kills the panes. No reply from the reporter in the fetched thread.
- [3] #1779, closure: closed 2026-07-23 with state reason NOT_PLANNED by the `kangal-bot` collaborator account because it did not use the bug template; the bot says feature requests and ideas belong in Discussions. The closure does not address the mosh proposal on its merits.
- [4] #3324, title and body: "Remote server exits and sends SIGHUP to all panes when user slice reaches TasksMax" — on Herdr 0.8.2 with `herdr --remote`, every pane received SIGHUP and the remote server exited; the saved layout remained but all pane processes were lost; this happened twice.
- [5] #3324, comments: a second reporter reproduced it on a local Linux server with 0.9.0; another captured a panic ("failed to spawn thread ... Resource temporarily unavailable") and notes the server's stderr goes to /dev/null when spawned by the TUI client, so `herdr-server.log` shows no originating error.
- [6] #3324, resolution: state CLOSED, reason COMPLETED (2026-10-05); bot comments record release on the preview channel 2026-10-12 and in v0.9.4 on 2026-10-13.
- [7] #5471, title and labels: "Server memory grows without bound while a TUI client is connected but stops reading (16 GB RSS after 3.5 days; reproduced on 0.9.3 and master)"; state OPEN; labels `bug`, `maintainer-needed`, `p1`, `linux`, `remote`, `performance`, `triaged`; no comments.
- [8] #5471, body: growth of about 4 MB per minute while a stalled client is attached versus RSS levelling at 60-90 MB without one; the reporter's stalled client is the `herdr` TUI under ttyd whose browser tab is backgrounded, and the body states "A TUI attached over SSH from a laptop that goes to sleep behaves the same way."
- [9] Search of open issues matching remote/ssh/drop at fetch time also returned #4391, "Detaching a working --remote session (Prefix+q) on macOS prints ConnectionReset and leaves the terminal unrestored" (open); title only was read.

## Structural notes

Read via the GitHub CLI (`gh issue view --json`, `gh api search/issues`) on
2026-10-26 against `herdrdev/herdr` (repository last pushed 2026-10-23; master
head `5608de0608918aba2f9d501e7793b984a0ca9cfa`). Additional URLs:
https://github.com/herdrdev/herdr/issues/1779,
https://github.com/herdrdev/herdr/issues/3324,
https://github.com/herdrdev/herdr/issues/5471,
https://github.com/herdrdev/herdr/issues/4391. Issue bodies are reporter
accounts; causes stated in them are reporter hypotheses unless a maintainer
comment or release note confirms them. Issue state is as of fetch.
