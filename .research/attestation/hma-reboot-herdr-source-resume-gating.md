---
source_handle: hma-reboot-herdr-source-resume-gating
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/blob/master/src/app/agent_resume.rs
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr master source (commit ee5bfb5041bb3e4a49d591c72308aae3c81ecdde) for deferred native agent resume: resume is attempted from the foreground client's resize path and waits for a host terminal theme.

## Key passages

- [1] src/app/agent_resume.rs lines 226-239 (`start_pending_agent_resume`): `let host_terminal_theme = self.state.host_terminal_theme; if host_terminal_theme.is_empty() && !allow_empty_theme { return false; }`.
- [2] src/app/mod.rs line 43: `const PENDING_AGENT_RESUME_THEME_WAIT: Duration = Duration::from_millis(750);` and src/app/agent_resume.rs lines 25-40: `sync_pending_agent_resume_deadline` sets a deadline of `now + PENDING_AGENT_RESUME_THEME_WAIT`.
- [3] src/server/headless.rs lines 736-748 (`resize_shared_runtime_to_effective_size_with_pending_agent_resumes`): `let Some(client_id) = self.foreground_client_id else { return; };` precedes the call at line 782 `self.app.start_pending_agent_resumes(now, self.app.pending_agent_resume_due(now))`; line 774-777 clears the deadline when `start_pending_agent_resumes` is false.
- [4] src/server/headless.rs lines 3371-3378: the periodic path calls `start_pending_agent_resumes` only when `geometry_dirty` is false, otherwise it clears the deadline.

## Structural notes

Read via `gh api repos/herdrdev/herdr/contents/...` on 2026-11-10 (captures herdr-agent_resume.rs, herdr-headless.rs, herdr-app-mod.rs). Only the named lines were read; the call graph beyond these files was not traced, so whether a non-TUI client (for example a socket-API shell client) counts as `foreground_client_id` is not established. Consistent with the docs sentence "After a client attaches and provides terminal size and theme context" in hma-lead-herdr-tui-state-api.
