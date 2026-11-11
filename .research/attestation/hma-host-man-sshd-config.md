---
source_handle: hma-host-man-sshd-config
fetched: 2026-11-10
source_path: .research/source-captures/hma-host-man/sshd_config.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Local sshd_config(5) manual page plus the stock macOS sshd configuration files. The stock config includes /etc/ssh/sshd_config.d/* and sets UsePAM yes; password and keyboard-interactive defaults are yes.

## Key passages

- [1] /etc/ssh/sshd_config (stock, non-comment lines): "Include /etc/ssh/sshd_config.d/*", "AuthorizedKeysFile .ssh/authorized_keys", "Subsystem sftp /usr/libexec/sftp-server".
- [2] /etc/ssh/sshd_config.d/100-macos.conf: "# Options set by macOS that differ from the OpenSSH defaults. UsePAM yes; AcceptEnv LANG LC_*; Include /etc/ssh/crypto.conf".
- [3] sshd_config(5) PasswordAuthentication: "Specifies whether password authentication is allowed. The default is yes."
- [4] sshd_config(5) KbdInteractiveAuthentication: "The default is yes."
- [5] sshd_config(5) Include: "Multiple pathnames may be specified and each pathname may contain glob(7) wildcards that will be expanded and processed in lexical order."
- [6] sshd_config(5) AllowUsers: "If specified, login is allowed only for user names that match one of the patterns."
- [7] sshd_config(5) ListenAddress: "Specifies the local addresses sshd(8) should listen on."

## Structural notes

- Text captured from the local macOS 26 (Darwin 25.6.0) machine on 2026-11-10 into the source_path file.
- Read from the MacBook Air operator machine (same OS generation) as a proxy for the Mac mini defaults; the Mac mini itself was not inspected. Lexical processing order of Include plus first-obtained-value semantics are standard sshd behaviour but the first-value rule is not quoted here.
