---
source_handle: hma-rescue-ssh-config-proxyjump
fetched: 2026-11-10
source_url: https://man.openbsd.org/ssh_config#ProxyJump
provenance: source-direct
substrate_confidence: search-summary
---

## Summary

OpenBSD ssh_config manual, ProxyJump keyword.

## Key passages

- [1] "Specifies one or more jump proxies as either [user@]host[:port] or an ssh URI. Multiple proxies may be separated by comma characters and will be visited sequentially."
- [2] "Setting this option will cause ssh(1) to connect to the target host by first making an ssh(1) connection to the specified ProxyJump host and then establishing a TCP forwarding to the ultimate target from there."

## Structural notes

- Fetched through a tool that returns a model-processed extract of the page, not raw page text; quotes are as returned.
