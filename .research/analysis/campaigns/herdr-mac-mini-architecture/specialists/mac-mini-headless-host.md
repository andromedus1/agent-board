---
name: mac-mini-headless-host
description: Specialist brief on running an always-on Apple-silicon Mac mini (macOS 26) as a headless Herdr/agent host reached over Tailscale, with FileVault left on.
type: specialist-brief
kind: research
campaign: herdr-mac-mini-architecture
facet: mac-mini-headless-host
provenance: agent-synthesis
updated: 2026-11-10
---

# Mac mini headless host: FileVault, sessions, Tailscale, SSH, power

Scope: macOS 26 on an Apple-silicon Mac mini on wired Ethernet, reached from a MacBook Air and an Android phone. Local sandbox note: macOS 26 is the OS generation of the machine the man pages were read on; the Mac mini itself was not inspected.

## Headline

On macOS 26 with Apple silicon, FileVault stays locked after any restart until credentials are supplied, but Apple now documents unlocking it over SSH from the pre-boot state when Remote Login is on and a network connection exists [hma-host-apple-deploy-filevault-intro]{1} [hma-host-apple-security-filevault-managing]{1}. That makes "FileVault on, headless, recover after power loss" a documented path rather than a workaround. The catch for this stack is that the pre-boot SSH server is macOS's own, so the unlock step is reached on the home LAN, not through Tailscale {inferred: Tailscale's daemon lives on the locked data volume and has not started; see Q1 reasoning}.

## Q1. FileVault on Apple silicon after reboot

- Locked until credentials: "After a user turns on FileVault on a Mac, their credentials are required during the boot process." [hma-host-apple-deploy-filevault-intro]{1}
- Remote unlock exists in macOS 26: "FileVault can be unlocked over ssh after a restart if Remote Login is turned on and a network connection is available." [hma-host-apple-deploy-filevault-intro]{1} The Platform Security guide gives the same single sentence [hma-host-apple-security-filevault-managing]{1}. Apple's pages do not state which account types can unlock, how the unlock prompt looks, or whether a GUI session starts afterwards.
- Practitioner observation (one operator, confidence-marked {confidence: practitioner}): an Administrator password unlocked the Mac over pre-boot SSH, after which normal SSH and Screen Sharing worked [hma-host-geerling-filevault-ssh]{1} [hma-host-geerling-filevault-ssh]{2}. The same operator found Wi-Fi did not work pre-login but wired Ethernet did, and reported Wi-Fi working as of macOS 26.5 [hma-host-geerling-filevault-ssh]{3} [hma-host-geerling-filevault-ssh]{4}. This host is wired, which is the case that worked at 26.0.
- The Apple page that Apple's intro points to for "FileVault network requirements" is the Platform SSO page, and its content there concerns reaching an identity provider "without a VPN, network relay, or 802.1X authentication" [hma-host-apple-psso-filevault-network]{2}. I did not find Apple text stating the Ethernet/Wi-Fi conditions for SSH unlock in any fetched page (gap; see Gaps).
- Who can unlock: "Having a user be enabled to unlock FileVault requires that they have a secure token and, on a Mac with Apple silicon, that they be volume owners." [hma-host-apple-deploy-filevault-mgmt]{1} Other FileVault users "unlock the encrypted disk with their login password" at the screen [hma-host-apple-macos-fv-help]{3}. Whether a non-admin FileVault user can unlock over pre-boot SSH is not documented in fetched sources.
- Automatic login is off with FileVault: manual login is required when "FileVault is turned on." [hma-host-apple-autologin]{1} So a FileVault-on Mac never reaches a user session on its own after a reboot or power loss.
- Planned reboots: `fdesetup authrestart` "restarts the system, bypassing the initial unlock" [hma-host-man-fdesetup]{4}, at the cost that "FileVault protections are reduced during authenticated restarts" because an extra copy of the unlock key is held in memory and, on supported systems, the SMC [hma-host-man-fdesetup]{1} [hma-host-man-fdesetup]{2}. The man page says it "may not work on all systems" [hma-host-man-fdesetup]{4}; whether it works on a macOS 26 Apple-silicon Mac mini is not documented in my sources, and `fdesetup supportsauthrestart` is the local check [hma-host-man-fdesetup]{5}.
- Power loss: an unattended reboot after power loss lands at the FileVault unlock stage, because the credential is required during boot [hma-host-apple-deploy-filevault-intro]{1}; authrestart applies only to restarts the OS performs on a running system {inferred: authrestart cannot help when power disappears}. Recovery is therefore the SSH unlock step.
- Default state: on macOS 26.4 or later FileVault "is turned on during Setup Assistant by default" [hma-host-apple-deploy-filevault-mgmt]{2}; press coverage describes recovery-key storage in Passwords rather than iCloud [hma-host-tidbits-filevault-default]{3}. Keep the personal recovery key off the Mac itself; Apple warns that forgetting both password and recovery key loses the data [hma-host-apple-macos-fv-help]{4}, and there is one PRK per volume [hma-host-apple-deploy-filevault-mgmt]{4}.

### Where the pre-boot SSH connection can come from (composed)

Tailscale's open-source daemon can start at system boot before any user logs in [hma-host-tailscale-tailscaled-wiki]{3}, but with FileVault on the data volume holding `/Library/LaunchDaemons` is not available until unlock {inferred: Apple's credential-at-boot statement plus the wiki's launchd plist location}. Therefore pre-boot SSH must be reached on the LAN. Options that follow from the sources:

1. Unlock from the MacBook Air or another device on the home LAN {composed}.
2. Keep a second always-on LAN device on the tailnet as a subnet router so that the Android phone can reach the Mac mini's LAN address while away: subnet routers "act as gateways between your tailnet and physical subnets" [hma-host-tailscale-subnets]{1} and respect access control policies [hma-host-tailscale-subnets]{3} {composed: no source tests this specific pre-boot route}. The mini's LAN address should be a DHCP reservation {composed}.
3. A VPN/relay path to the Mac itself pre-unlock is not supported as a pattern by Apple's text for the related Platform SSO case [hma-host-apple-psso-filevault-network]{2}; it is not evidence about SSH unlock, so treat it only as a caution {ambiguous: Platform SSO text versus SSH unlock}.

### FileVault on versus off for a home server

- Off: automatic login becomes available (the setting is dimmed only while FileVault is on) [hma-host-apple-autologin]{1}, so a power loss can end in a running GUI session with no human. The cost is the loss of the boot protection FileVault adds against anyone with physical access, even though Apple-silicon storage is hardware-encrypted regardless [hma-host-tidbits-filevault-default]{4} [hma-host-apple-macos-fv-help]{1}.
- On: the remote-unlock step is a documented requirement after every restart or power loss, but data at rest is protected. Given the operator's constraint (no weakening of protections for convenience), this brief treats FileVault on as the default decision and builds the recovery path around SSH unlock {composed}.

## Q2. Login sessions, LaunchDaemons vs LaunchAgents, keychain

- A daemon is "a system-wide service of which there is one instance for all clients"; an agent "runs on a per-user basis" [hma-host-man-launchd]{1}. Daemons load from `/Library/LaunchDaemons` at boot, while per-user agents load when a user logs in [hma-host-apple-launchd-archive]{1} [hma-host-apple-launchd-archive]{2} (archive text; it does not define whether SSH counts as "logs in").
- A LaunchDaemon can run as another user via `UserName`, which applies to services in the privileged system domain [hma-host-man-launchd]{4}. But setuid/setgid alone do not give the full user environment, and "Running a service as a launchd agent or a per-user XPC service is the only way to run a process with a complete identity of that user." [hma-host-man-launchd]{2}
- Consequences for agents under a dedicated non-admin user (composed from the above):
  - With FileVault on there is no automatic login [hma-host-apple-autologin]{1}, so a per-user LaunchAgent that depends on a GUI login does not start after reboot {inferred}. A LaunchDaemon with `UserName` can start at boot (post-unlock) but without the full user identity [hma-host-man-launchd]{2}, which may matter for Keychain-dependent tools. Starting the Herdr server from an SSH session as that user is the third pattern; it dies with the reboot. I found no Herdr documentation of a macOS service setup in the pages fetched (gap; the Herdr lane owns this).
- Credentials: Claude Code on macOS stores credentials in the Keychain, and when the Keychain rejects the write, "such as when it's locked in an SSH session", falls back to `~/.claude/.credentials.json` with mode 0600 [hma-host-claude-code-auth]{1}. Codex caches in `~/.codex/auth.json` or the OS credential store, with `cli_auth_credentials_store` set to `file`, `keyring`, `auto` or `ephemeral`; `keyring` "fails if it is unavailable" [hma-host-codex-auth]{1} [hma-host-codex-auth]{2}. Codex offers `codex login --device-auth` for headless sign-in [hma-host-codex-auth]{3}.
- A practitioner reports the login keychain "sits locked forever" on a Mac only ever logged into over SSH, that Claude Code refused to start in that state, and that "There is no other unlock path that Apple ships" for the login keychain [hma-host-projectinsomnia-keychain]{1} [hma-host-projectinsomnia-keychain]{2} [hma-host-projectinsomnia-keychain]{3} {confidence: practitioner}. The official Claude Code text describes a file fallback instead; see Contradictions.
- Composed recommendation: set `cli_auth_credentials_store = "file"` for Codex so it never depends on a keychain that an SSH-only user cannot unlock; accept Claude Code's file fallback and protect the 0600 files with the account's FileVault-backed home directory {composed}.

## Q3. Tailscale on macOS

Variant facts, all from the Tailscale variants page [hma-host-tailscale-macos-variants]{3}:

| Aspect | App Store | Standalone | open-source tailscaled |
|---|---|---|---|
| Run before login | no; sandboxed | no | yes |
| Tailscale SSH server | no | no | yes |
| Auto-updates | App Store | in-app (Sparkle) | no |
| Funnel | no | no | yes |

Further points:

- Tailscale recommends the Standalone variant in general [hma-host-tailscale-macos-variants]{1}. It describes the open-source `tailscaled` as "only recommended for unattended installs managed by experienced macOS system administrators" [hma-host-tailscale-macos-variants]{2}. Tailscale gives no further "headless Mac" recommendation than that in the pages I fetched.
- Do not run App Store and Standalone together [hma-host-tailscale-macos-variants]{7}. Standalone runs through a system extension that "run[s] with root privileges but remain[s] within a sandbox" [hma-host-tailscale-macos-variants]{8}.
- `tailscaled` as a launchd system daemon: `tailscaled install-system-daemon` installs `/Library/LaunchDaemons/com.tailscale.tailscaled.plist` and starts it; it "can run at system boot before any user has logged in (e.g. letting you VNC to your computer after a power outage)" [hma-host-tailscale-tailscaled-wiki]{2} [hma-host-tailscale-tailscaled-wiki]{3}. The wiki also says it is "less tested" and MagicDNS needs a manual DNS setting [hma-host-tailscale-tailscaled-wiki]{4}. Homebrew install is offered [hma-host-tailscale-tailscaled-wiki]{5}.
- Serve: "serving files and directories is limited to the open source variant" on macOS because of app sandbox limits; forwarding a port needs no root [hma-host-tailscale-serve]{1} [hma-host-tailscale-serve]{2}. Funnel is not available on the Standalone variant [hma-host-tailscale-macos-variants]{6}.
- Auto-update: Standalone updates in-app and `tailscaled` has no auto-update [hma-host-tailscale-macos-variants]{5}; restarting `tailscaled` (for example an upgrade) ends Tailscale SSH sessions [hma-host-tailscale-ssh-kb]{4}.
- Key expiry: default 180 days, expired keys stop connections [hma-host-tailscale-key-expiry]{1}; Tailscale suggests disabling expiry for trusted servers [hma-host-tailscale-key-expiry]{2}. A tagged device gets expiry disabled the first time it is authenticated with the tag [hma-host-tailscale-key-expiry]{4} [hma-host-tailscale-tags]{5}. Avoid `tailscale up --force-reauth` over a remote session without a fallback [hma-host-tailscale-key-expiry]{3}.
- Tags and ACLs: tags identify "non-user devices, such as servers" [hma-host-tailscale-tags]{1}, applying a tag "removes any user-based authentication" [hma-host-tailscale-tags]{2}, and tags are defined by owners in `tagOwners` [hma-host-tailscale-tags]{3}. Tailscale says not to tag laptops or phones [hma-host-tailscale-tags]{6}. So the Mac mini is a tag candidate and the MacBook Air and phone remain user devices {composed: an ACL granting only the owner's devices access to the mini's SSH port; ACL syntax not fetched}.
- "Run unattended" is Windows-only; the KB says on macOS "The Tailscale client runs within the user login session" and a standalone system daemon "is not currently supported" [hma-host-tailscale-run-unattended]{1} [hma-host-tailscale-run-unattended]{3}. See Contradictions.

Implication {inferred: variants table + run-unattended + FileVault-on login behaviour}: with FileVault on and no automatic login, the Standalone and App Store variants have no GUI session to run in after a reboot, whereas the open-source `tailscaled` daemon does not need one. Whether a GUI session starts after the pre-boot SSH unlock is not documented, so a design that depends on it is unverified.

## Q4. SSH: Remote Login vs Tailscale SSH

- Pre-boot FileVault unlock needs macOS Remote Login on [hma-host-apple-deploy-filevault-intro]{1}, regardless of what else is chosen. Tailscale SSH server needs the open-source `tailscaled` variant on macOS [hma-host-tailscale-ssh-kb]{1} [hma-host-tailscale-ssh-kb]{2}, assumes port 22 and cannot use another port [hma-host-tailscale-ssh-kb]{3}. Whether Tailscale SSH on 22 and macOS Remote Login on 22 coexist is not stated in fetched sources.
- Tailscale SSH gives policy-managed authorization that can be revoked centrally, optional check mode and a 12-hour default re-auth period [hma-host-tailscale-ssh-kb]{5} [hma-host-tailscale-ssh-kb]{6} [hma-host-tailscale-ssh-kb]{7}.
- Remote Login can be limited to selected users: "Only these users" [hma-host-apple-macos-remote-login]{2}, with a warning that it can make the Mac less secure [hma-host-apple-macos-remote-login]{4}. Leave "full disk access for remote users" off unless needed [hma-host-apple-macos-remote-login]{3}.
- Hardening on macOS: stock config includes `/etc/ssh/sshd_config.d/*` and `100-macos.conf` sets `UsePAM yes` [hma-host-man-sshd-config]{1} [hma-host-man-sshd-config]{2}; password and keyboard-interactive authentication default to yes [hma-host-man-sshd-config]{3} [hma-host-man-sshd-config]{4}. Included files are processed in lexical order [hma-host-man-sshd-config]{5}, so a drop-in with `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, and `AllowUsers` [hma-host-man-sshd-config]{6} named to sort before `100-macos.conf` is the minimal hardening {composed; first-value-wins semantics are standard OpenSSH but not quoted in my sources}. Binding with `ListenAddress` [hma-host-man-sshd-config]{7} to the tailnet address is possible, but binding to an address that appears only after Tailscale starts could fail at boot, and it would also remove the LAN listener that pre-boot unlock relies on if the setting carried over {composed caution; pre-boot sshd's relation to sshd_config is not documented}.
- Important unknown: the practitioner reports the pre-boot step accepts an Administrator password [hma-host-geerling-filevault-ssh]{1}. Whether the pre-boot server honours the main `sshd_config` (including `PasswordAuthentication no`) is not documented. Test it before assuming hardening and unlock are compatible.
- macOS 26 Remote Login changes: the only change found is the FileVault unlock capability [hma-host-apple-security-filevault-managing]{1}.
- Mosh: nothing in this facet's sources; the android-access lane owns it.

## Q5. Power and sleep

- `pmset`: `sleep` and `disksleep` take minutes, 0 disables [hma-host-man-pmset]{1}; `womp` is "Wake for network access" [hma-host-man-pmset]{2}; `autorestart` is automatic restart on power loss [hma-host-man-pmset]{3}; `ttyskeepawake` prevents idle sleep while a tty such as a remote login session is active [hma-host-man-pmset]{4}.
- Power restore: on a Mac mini introduced in 2024 or later with macOS 26.5 or later, Energy settings offer "Start up when power is connected" = Always, which also starts the Mac "when power is restored after a power failure" [hma-host-apple-poweron-mini]{1} [hma-host-apple-poweron-mini]{2} [hma-host-apple-poweron-mini]{3}. Wait about 30 seconds between unplug and replug [hma-host-apple-poweron-mini]{4}. I did not fetch Apple text for the older "Start up automatically after a power failure" label on earlier macOS; the `pmset autorestart` key is the documented CLI counterpart [hma-host-man-pmset]{3}.
- FileVault key and standby: by default FileVault keys are retained through standby; `destroyfvkeyonstandby 1` would force a password on wake [hma-host-man-pmset]{5}. Leave the default.
- Automatic updates: they can install overnight while asleep and powered, over Ethernet [hma-host-apple-platform-support-updates]{1}; Background Security Improvements apply by default and "may require a Mac restart" [hma-host-apple-platform-support-updates]{2}. Whether such a restart bypasses the FileVault unlock is not documented; plan for it to land at the unlock screen and decide update timing deliberately (manual install plus authrestart, or accepting the SSH unlock) {composed}.
- Headless display: vendor material says M1-and-later minis create a virtual display and default to 1920x1080, and that Apple Screen Sharing and VNC lack virtual-display support [hma-host-astropad-dummy-plug]{1} [hma-host-astropad-dummy-plug]{2} [hma-host-astropad-dummy-plug]{3} {confidence: vendor-interested}. No Apple statement found. For a terminal/SSH workload this is a minor point; use a dummy plug only if Screen Sharing resolution matters.

## Q6. UPS

- `pmset -u` takes `haltlevel`, `haltafter` and `haltremain` for emergency shutdown on UPS battery, valid on desktops [hma-host-man-pmset]{6} [hma-host-man-pmset]{7}, and `pmset -g ps` reports UPS status [hma-host-man-pmset]{8}. The USB HID mechanism is not described in my sources.
- A UPS-triggered shutdown followed by power return still ends at the FileVault unlock stage [hma-host-apple-deploy-filevault-intro]{1}; the practitioner who set up NUT UPS management found a FileVault Mac "would not allow remote access until I was physically present" before macOS 26 [hma-host-geerling-filevault-ssh]{5}.

## Phase-1 host-prep sequence (composed unless cited)

1. Confirm FileVault is on and record the personal recovery key off the Mac [hma-host-apple-deploy-filevault-mgmt]{2} [hma-host-apple-macos-fv-help]{4}. Decision point D1: FileVault on (recommended here) versus off (enables automatic login) [hma-host-apple-autologin]{1}.
2. Create two accounts: an admin account that is FileVault-enabled and used for unlock and maintenance, and a standard agent user. A FileVault-enabled user needs a secure token [hma-host-apple-deploy-filevault-mgmt]{1}. Unlock over SSH is documented with an admin password only [hma-host-geerling-filevault-ssh]{1}.
3. Enable Remote Login for specific users only [hma-host-apple-macos-remote-login]{2}; add a lexically early sshd drop-in disabling password and keyboard-interactive auth [hma-host-man-sshd-config]{5}; install the Android and MacBook public keys for the agent user.
4. Set power: Energy "Start up when power is connected" = Always if eligible [hma-host-apple-poweron-mini]{2}, `pmset` sleep 0 and `ttyskeepawake` as needed [hma-host-man-pmset]{1} [hma-host-man-pmset]{4}.
5. Decision point D2, Tailscale variant: Standalone (vendor-recommended; no pre-login operation) versus open-source `tailscaled` as a LaunchDaemon (pre-login capable, Tailscale SSH capable, Serve files capable, no auto-update, less tested) [hma-host-tailscale-macos-variants]{3} [hma-host-tailscale-tailscaled-wiki]{4}. With FileVault on and no GUI login, `tailscaled` is the only variant the sources show running without a user session.
6. In the admin console: tag the mini, confirm key expiry is disabled [hma-host-tailscale-tags]{5} [hma-host-tailscale-key-expiry]{2}, restrict who can reach its SSH port {composed}.
7. Decision point D3, LAN reach for pre-boot unlock: reserve the mini's LAN address and put a subnet router on the LAN if phone-side unlock while away is required [hma-host-tailscale-subnets]{1}.
8. Credentials: set Codex to file storage [hma-host-codex-auth]{2}; log in once to Claude Code over SSH and confirm which store it used [hma-host-claude-code-auth]{1}.
9. Run the agent processes as the agent user from SSH or a LaunchDaemon with `UserName` [hma-host-man-launchd]{4}.
10. Test the whole loop: `shutdown`, power-cycle, confirm the machine returns to the pre-boot state, SSH-unlock from the LAN, then confirm Tailscale, Herdr and agent availability without any GUI login.
11. Optional: UPS with `pmset -u` thresholds [hma-host-man-pmset]{6}.

## Disconfirming analysis

- Claim "FileVault blocks all remote access after reboot": Disconfirmed for macOS 26 Apple silicon. Apple documents SSH unlock [hma-host-apple-deploy-filevault-intro]{1}; one practitioner reproduced it [hma-host-geerling-filevault-ssh]{1}. The older practitioner experience of needing a physical password applied before macOS 26 [hma-host-geerling-filevault-ssh]{5}.
- Claim "Tailscale is reachable before the unlock": searched for any statement that Tailscale runs at the pre-boot stage; none found. The wiki's "before any user has logged in" [hma-host-tailscale-tailscaled-wiki]{3} refers to user login, not to FileVault unlock; the "VNC after a power outage" example reads as a non-FileVault setup {inferred}. No source tests tailscaled with FileVault on.
- Claim "a headless Mac needs an HDMI dummy plug": the only source found says it does not [hma-host-astropad-dummy-plug]{1}, and it is vendor-interested.
- Claim "Claude Code cannot run over SSH-only because the keychain is locked": contradicted by the official doc [hma-host-claude-code-auth]{1}.
- Claim "FileVault on is incompatible with an unattended home server": not supported; the cost is a manual unlock after restarts, mitigable via LAN SSH unlock.
- Searched fetched Apple pages for text that automatic updates avoid the unlock screen: none found.

## Contradictions

- Tailscale on macOS before login. Variants page: `tailscaled` runs before login, Standalone and App Store do not [hma-host-tailscale-macos-variants]{3}; wiki: `tailscaled` runs at boot before any user logs in [hma-host-tailscale-tailscaled-wiki]{3}. KB run-unattended page: on macOS the client runs within the user login session and a standalone system daemon "is not currently supported" [hma-host-tailscale-run-unattended]{3}. {ambiguous: the run-unattended page does not name the variant; the two readings are compatible only if it refers to the GUI variants.}
- Claude Code credential storage in an SSH-only session. Practitioner: Claude Code refused to start because the locked keychain held its token [hma-host-projectinsomnia-keychain]{2}. Official docs: it falls back to `~/.claude/.credentials.json` when the Keychain is locked in an SSH session [hma-host-claude-code-auth]{1}. {ambiguous: possibly a version difference; the practitioner post's date was not captured.}
- Tailscale recommendation. Tailscale "always" recommends Standalone [hma-host-tailscale-macos-variants]{1}; the same page says Standalone does not run before login [hma-host-tailscale-macos-variants]{3}, and only `tailscaled` is described for unattended installs [hma-host-tailscale-macos-variants]{2}. {contested: which to prefer for a headless host is left to the operator.}

## Gaps (not documented in fetched sources)

- Apple text for the Ethernet/Wi-Fi conditions of SSH unlock (only a search-engine paraphrase was seen; not cited).
- Whether a GUI session starts after the SSH unlock; whether standard users can unlock via SSH; whether the pre-boot SSH honours `sshd_config`.
- Whether `fdesetup authrestart` works on this Mac mini model on macOS 26; whether an OS-initiated update restart bypasses unlock.
- Whether Tailscale SSH and macOS Remote Login can both occupy port 22.
- Herdr service/launchd setup guidance; mosh over this host; USB HID UPS mechanics.

## Revisit if

- Apple documents pre-boot network conditions, account scope or post-unlock session behaviour for SSH unlock, or changes it in a 26.x/27 release.
- Tailscale ships a macOS system-daemon mode (the run-unattended page tracks GitHub issue #987) or changes the variants table [hma-host-tailscale-run-unattended]{3}.
- The operator decides on FileVault off, a different host OS, or a hosted Mac.
- Herdr documents macOS service setup or a restore-on-boot behaviour.
- Claude Code or Codex change credential storage behaviour on macOS.
