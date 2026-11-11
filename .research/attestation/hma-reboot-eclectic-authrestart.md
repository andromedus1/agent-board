---
source_handle: hma-reboot-eclectic-authrestart
fetched: 2026-11-10
source_url: https://eclecticlight.co/2023/02/20/macos-13-2-1-authenticated-restart-and-fdesetup/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Practitioner article (Howard Oakley, 20 February 2023) on authenticated restart in macOS updates and `fdesetup authrestart`. Third-party, 2023, macOS 13; the only fetched text that states how Apple silicon handles the authorising token.

## Key passages

- [1] "Apple uses authenticated restarts because they make updates more seamless. Now that an Apple silicon Mac can install a macOS update in just a few minutes, this final touch minimises their downtime and user interaction. They’re also highly secure: on Apple silicon and T2 Intel Macs, they’re handled by the Secure Enclave. The only significant difference there is that the token used to authorise them on Apple silicon models can only be used once."
- [2] "Provided that FileVault is enabled on the current boot volume group, the command sudo fdesetup authrestart -delayminutes 0 restarts the system immediately, bypassing the normal initial unlock. Before the restart can occur, you also have to provide the short username and password for a user entitled to unlock FileVault."
- [3] "macOS updates don’t just use an authenticated restart to appear so seamless. They also log the current user back in automatically, and temporarily mute the startup chime. As far as I’m aware, unlike authenticated restarts, those tricks aren’t made available to mere users."
- [4] Failure case: an update on macOS 13.2/13.2.1 "bounced the Mac into Recovery ... and asked for the password" when "authenticated restart didn’t work properly".

## Structural notes

Fetched with curl and article extraction on 2026-11-10. The article is a practitioner report, not an Apple statement; it predates macOS 26. Its claims about the Secure Enclave and one-time token are the author's, uncited to Apple in the text.
