---
source_handle: hma-reboot-man-launchd-plist
fetched: 2026-11-10
source_path: .research/source-captures/hma-reboot/launchd.plist.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Local launchd.plist(5) manual page. Relevant to running a service as a specific user at boot: UserName applies only in the system domain, and "no distinct sessions" exist in the privileged system context.

## Key passages

- [1] "UserName <string> This optional key specifies the user to run the job as. This key is only applicable for services that are loaded into the privileged system domain."
- [2] "LimitLoadToSessionType ... This key only applies to jobs which are agents. There are no distinct sessions in the privileged system context."
- [3] "KeepAlive ... The use of this key implicitly implies RunAtLoad, causing launchd to speculatively launch the job." with sub-key "SuccessfulExit ... If false, the job will be restarted in the inverse condition."
- [4] "SessionCreate <boolean> This key specifies that the job should be spawned into a new security audit session rather than the default session for the context is belongs to."

## Structural notes

Captured with `man launchd.plist | col -b` on the local macOS 26.6 machine on 2026-11-10. See also hma-host-man-launchd and hma-host-apple-launchd-archive for the daemon-versus-agent boot semantics; this page adds the UserName/system-domain rule.
