---
source_handle: hma-reboot-apple-security-filevault-volume
fetched: 2026-11-10
source_url: https://support.apple.com/guide/security/volume-encryption-with-filevault-sec4c6dc1b6e/web
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Apple Platform Security guide "Volume encryption with FileVault in macOS" (Published Date January 28, 2026). States how the volume key is protected on Apple silicon with FileVault on and off.

## Key passages

- [1] "On a Mac with Apple silicon and those with the T2 chip, all FileVault key handling occurs in the Secure Enclave; encryption keys are never directly exposed to the CPU. All APFS volumes are created with a volume encryption key by default."
- [2] "The KEK is protected by a combination of the user’s password and hardware UID when FileVault is turned on."
- [3] "If FileVault isn’t turned on in a Mac with Apple silicon or a Mac with the T2 chip during the initial Setup Assistant process, the volume is still encrypted but the volume encryption key is protected only by the hardware UID in the Secure Enclave."
- [4] "If FileVault is turned on later—a process that’s immediate because the data has already been encrypted—an anti-replay mechanism helps prevent the old key (based on hardware UID only) from being used to decrypt the volume."
- [5] "Without valid login credentials or a cryptographic recovery key, the internal APFS volumes remain encrypted and are protected from unauthorized access even if the physical storage device is removed and connected to another computer." (stated under "Internal storage with FileVault turned on").
- [6] "After a user turns on FileVault on a Mac, their credentials are required during the boot process."
- [7] "The recovery key can be used in recoveryOS or at the Login Window when pressing Shift-Option-Return instead of the user password to unlock FileVault."

## Structural notes

Fetched with curl and HTML-to-text extraction on 2026-11-10. The page does not enumerate what a person with the machine in hand can do to a FileVault-off volume while booted, and does not say when the FileVault-off volume key is released to the OS (inference from "protected only by the hardware UID").
