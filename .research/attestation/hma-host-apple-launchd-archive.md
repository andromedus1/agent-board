---
source_handle: hma-host-apple-launchd-archive
fetched: 2026-11-10
source_url: https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple archived documentation "Creating Launch Daemons and Agents". Describes system-level daemon loading at boot versus per-user agent loading at user login. Archive documentation; may predate current macOS behaviour.

## Key passages

- [1] "After the system is booted and the kernel is running, launchd is run to finish the system initialization. ... It loads the parameters for each launch-on-demand system-level daemon from the property list files found in /System/Library/LaunchDaemons/ and /Library/LaunchDaemons/."
- [2] "The process for per-user agents is similar. When a user logs in, a per-user launchd is started. It does the following: It loads the parameters for each launch-on-demand user agent from the property list files found in /System/Library/LaunchAgents, /Library/LaunchAgents, and the user's individual Library/LaunchAgents directory."
- [3] "When the user logs out, it sends a SIGTERM signal to all of the user agents that it started."
- [4] User Logins: "In general, a daemon should not care whether a user is logged in, and user agents should be used to provide per-user functionality."

## Structural notes

- Archive document; "logs in" is not defined as GUI versus SSH.
