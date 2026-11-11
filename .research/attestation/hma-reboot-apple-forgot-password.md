---
source_handle: hma-reboot-apple-forgot-password
fetched: 2026-11-10
source_url: https://support.apple.com/en-us/102633
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Support article "If you forgot your Mac login password" (Published Date September 22, 2026). Describes Recovery-based password reset and erase, with the FileVault recovery key scoped to FileVault-on Macs.

## Key passages

- [1] "If you couldn’t reset your password using reset options in the login window, you might be able to reset your password from macOS Recovery." Steps: "When asked to select a user you know the password for, click \"Forgot all passwords?\"" then "If asked to sign in to the Apple Account previously used with this Mac, enter the email or phone number of that Apple Account, then enter its password. If asked to enter your recovery key, enter the letters and numbers of the recovery key."
- [2] "From the Utilities menu in the menu bar, choose Terminal. In the window that opens, type resetpassword, then press Return."
- [3] "If no other solution works, you can regain access to your Mac by erasing it. This permanently removes each user account, its password, and its data from your Mac." Erase path: "Start up from macOS Recovery. When asked to select a user you know the password for, choose Erase Mac from the Recovery Assistant menu".
- [4] "If your Mac starts up to an Activate Mac window: ... Enter your Apple Account information (not your login name or password) when asked."

## Structural notes

Fetched with curl on 2026-11-10. The page is a consumer recovery procedure; it does not state what data access recoveryOS grants when FileVault is off, which is the gap behind the exposure analysis.
