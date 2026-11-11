---
source_handle: hma-host-man-launchd
fetched: 2026-11-10
source_path: .research/source-captures/hma-host-man/launchd.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Local launchd(8) and launchd.plist(5) manual pages. Define daemons (system-wide) versus agents (per-user), the five standard directories, and the UserName key.

## Key passages

- [1] launchd(8) NOTES: "a daemon is, by definition, a system-wide service of which there is one instance for all clients. An agent is a service that runs on a per-user basis. Daemons should not attempt to display UI or interact directly with a user's login session."
- [2] launchd(8) NOTES: "making the appropriate setuid(2) and setgid(2) system calls is not sufficient to completely assume the identity for a given user. Running a service as a launchd agent or a per-user XPC service is the only way to run a process with a complete identity of that user."
- [3] launchd(8) FILES: "~/Library/LaunchAgents Per-user agents provided by the user. /Library/LaunchAgents Per-user agents provided by the administrator. /Library/LaunchDaemons System-wide daemons provided by the administrator."
- [4] launchd.plist(5): "UserName ... specifies the user to run the job as. This key is only applicable for services that are loaded into the privileged system domain."
- [5] launchd.plist(5): "LimitLoadToSessionType ... This key only applies to jobs which are agents. There are no distinct sessions in the privileged system context."

## Structural notes

- Text captured from the local macOS 26 (Darwin 25.6.0) machine on 2026-11-10 into the source_path file.
- These pages do not state whether a per-user launchd domain exists for a user who has only logged in over SSH; see hma-host-apple-launchd-archive for the older Apple narrative.
