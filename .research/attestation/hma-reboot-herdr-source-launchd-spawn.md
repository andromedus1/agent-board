---
source_handle: hma-reboot-herdr-source-launchd-spawn
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr/blob/master/src/platform/macos/launchd_spawn.rs
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr master source (commit ee5bfb5041bb3e4a49d591c72308aae3c81ecdde) for the macOS launchd one-shot spawn. Confirms the SSH fallback and the gui/<uid> domain requirement.

## Key passages

- [1] Module comment lines 8-11: "The daemon is therefore submitted as a one-shot job in the user's GUI launchd domain, which gives it a coalition of its own. The job immediately forks the real server and exits, so the server is not a running GUI job that logout would stop; it keeps the lifetime a directly spawned server had."
- [2] Lines 28-37, `spawn_launchd_job` doc comment: "Fails, so the caller can spawn directly, when there is no GUI domain or the command cannot be represented exactly in a launchd job."; the first statement is `if std::env::var_os("SSH_CONNECTION").is_some()` returning `Err(io::Error::other("started over SSH"))` with the comment "SSH logins already run outside any terminal app; keep them out of the desktop session too."; line 39: `let domain = format!("gui/{uid}");`.
- [3] Lines 452-456 (test helper): `gui_domain_available` is `launchctl(&["print", &format!("gui/{uid}")]).is_ok() && std::env::var_os("SSH_CONNECTION").is_none()`; tests at lines 470 and 524 are commented "Needs a GUI login session".

## Structural notes

Read via `gh api repos/herdrdev/herdr/contents/src/platform/macos/launchd_spawn.rs` on 2026-11-10 (capture herdr-launchd_spawn.rs). Only the fallback condition and domain string were checked; the file was not audited in full. That a gui/<uid> domain exists only after a GUI login is not stated in this file; it follows from the test comment and the tests' skip condition.
