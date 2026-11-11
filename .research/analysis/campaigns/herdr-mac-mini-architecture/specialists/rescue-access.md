---
name: rescue-access
description: Specialist brief on a LAN rescue device for an always-on FileVault Mac mini (macOS 26) - Pi jump host, subnet router, KVM-over-IP, smart plug, router/Apple TV foothold, outage alerting, Wake-on-LAN.
type: specialist-brief
kind: research
campaign: herdr-mac-mini-architecture
facet: rescue-access
provenance: agent-synthesis
updated: 2026-11-10
---

# Rescue access: recovering a FileVault Mac mini from away

Scope: an Apple-silicon Mac mini (2024 or later, macOS 26) at home, FileVault on, that after power loss or restart waits at the pre-boot stage. Apple documents that on Apple silicon with macOS 26 or later "FileVault can be unlocked over ssh after a restart if Remote Login is turned on and a network connection is available" [hma-host-apple-deploy-filevault-intro]{1}. One practitioner unlocked a Mini by SSH with an Administrator password and then used normal SSH or Screen Sharing [hma-host-geerling-filevault-ssh]{1} [hma-host-geerling-filevault-ssh]{2}; wired Ethernet worked at the time of the post and Wi-Fi worked as of 26.5 [hma-host-geerling-filevault-ssh]{3} [hma-host-geerling-filevault-ssh]{4}. Tailscale on the Mini is not running at that stage {inferred: the data volume holding the daemon is locked; no source tests this}, so the unlock connection has to originate on the home LAN. Everything below is about getting an operator-controlled connection onto that LAN.

Evidence-tier note: most vendor and docs pages were read through a tool that returns a processed extract, so their attestations are marked `search-summary`; two attestations are search-engine snippets only (`snippet-thin`) and are used as leads, not as findings.

## 1. Raspberry Pi (or similar SBC) as Tailscale node plus SSH jump host

- Install: Tailscale's Linux script lists Raspberry Pi OS among supported distributions, and the node is started with `sudo tailscale up` [hma-rescue-tailscale-install-linux]{1} [hma-rescue-tailscale-install-linux]{2}. The extract found no explicit statement that the script install enables the service at boot, so confirm `tailscaled` is enabled after a reboot test {composed}.
- Key expiry: Tailscale says continuously connected devices "such as servers, Raspberry Pis ... you can disable key expiry" [hma-rescue-tailscale-install-linux]{3}. Tagging a device authenticates it without a user and disables key expiry the first time it is tagged [hma-host-tailscale-tags]{2} [hma-host-tailscale-tags]{5}. A tagged device "can only SSH into other tagged devices; they cannot SSH into devices with a user-based identity" [hma-host-tailscale-tags]{4}; this matters only if Tailscale SSH is used, and plain OpenSSH on the Pi is not subject to it {inferred: the sentence is about Tailscale SSH policy}.
- Jump pattern: OpenSSH `ProxyJump` makes ssh "connect to the target host by first making an ssh(1) connection to the specified ProxyJump host and then establishing a TCP forwarding to the ultimate target from there" [hma-rescue-ssh-config-proxyjump]{2}. The unlock password therefore negotiates end-to-end with the Mini's pre-boot sshd and the Pi forwards ciphertext {inferred: standard TCP forwarding semantics}. The Pi does not need the Mini's credentials. Whether the Mini's pre-boot SSH accepts a forwarded connection like any other is untested in the sources {composed}.
- Android clients: Moshi documents jump host settings as available only "when the connection type is SSH" and says mosh "is usually not compatible with a simple SSH jump-host path" [hma-rescue-moshi-docs-jumphost]{1} [hma-rescue-moshi-docs-jumphost]{2}. The fetched page did not state whether the Android build has the same setting [hma-rescue-moshi-docs-jumphost]{4}. For a one-off unlock, plain SSH is enough, so losing mosh costs little here {composed}. Termius jump-host support on Android was not verified in this facet (page fetch failed).
- Power and storage: Raspberry Pi documentation lists recommended supplies by model (for example Pi 4B "5 V at 3 A" with the "15 W USB-C power supply"; Pi 5 "5 V at 5 A") [hma-rescue-rpi-getting-started]{1} [hma-rescue-rpi-getting-started]{2} and notes newer models can boot from USB mass storage or NVMe [hma-rescue-rpi-getting-started]{3}. The hardware documentation reads "All boards are powered by a stable 5 V DC input" [hma-rescue-rpi-hardware-docs]{2}. I found no official statement on SD-card wear or on graceful power-loss handling in the pages fetched [hma-rescue-rpi-hardware-docs]{3}; the PiKVM project, by contrast, mounts its filesystem read-only specifically "to prevent it from being damaged by a sudden power outage" [hma-rescue-pikvm-faq]{3}. {inferred: a general-purpose Pi OS install on SD that loses power repeatedly is the weak link; USB or NVMe boot and a UPS are the documented levers}.

## 2. Tailscale subnet router versus jump host

- Subnet router: "Subnet routers let you extend your Tailscale network ... to include devices that don't or can't run the Tailscale client" [hma-host-tailscale-subnets]{1}; they use SNAT by default [hma-host-tailscale-subnets]{2}, respect access policies [hma-host-tailscale-subnets]{3}, and on Linux need IP forwarding enabled [hma-rescue-tailscale-subnets-detail]{5}. With a subnet router the phone's Tailscale app reaches the Mini's LAN address directly, so any SSH client works without jump-host support {composed}.
- Single-host scope: the route flag takes a comma-separated list of routes and the examples are CIDRs [hma-rescue-tailscale-subnets-detail]{1}; the page has no explicit /32 example. A /32 is a valid CIDR but this page does not demonstrate it, so treat `--advertise-routes=<mini-ip>/32` as expected to work and verify on the tailnet {composed}. Route approval is separate from access rules and can be automated with `autoApprovers` [hma-rescue-tailscale-subnets-detail]{2} [hma-rescue-tailscale-subnets-detail]{6} [hma-rescue-tailscale-acl-syntax]{3}.
- ACL scoping: rule destinations accept an IP or CIDR plus ports, such as "192.0.2.5:22" [hma-rescue-tailscale-acl-syntax]{1}, and a hosts alias can name the Mini's LAN address [hma-rescue-tailscale-acl-syntax]{2}. A policy that allows only the operator's devices to `<mini-ip>:22` limits what the route exposes inside the tailnet {composed}. The advertised route and the access rule are separate controls [hma-rescue-tailscale-subnets-detail]{6}, so both must be scoped.
- SNAT: default SNAT hides the original tailnet source from the Mini; it can be disabled with `--snat-subnet-routes=false` on Linux [hma-rescue-tailscale-subnets-detail]{4}. For this use (SSH to one host) the default is adequate {composed}.
- Exposure difference {inferred}: jump host exposes an SSH daemon on the Pi to the tailnet and reaches onward from the Pi's own LAN position; scoped subnet router exposes only one IP and port at the network layer, with no shell on the Pi. The jump host gives one more credential surface (Pi SSH keys, Pi patching); the subnet router relies on correct policy.

## 3. KVM-over-IP

What each documents (Mac-specific evidence is thin everywhere):

- PiKVM: open-source KVM-over-IP; handbook covers V4 Mini and Plus, V3 and DIY [hma-rescue-pikvm-docs-home]{1}; the product site lists 1920x1200 at 60 Hz and "Power on/off, reboot" (ATX-style) features, with no prices on the page [hma-rescue-pikvm-site]{2} [hma-rescue-pikvm-site]{3}. Tailscale is installed as a package; the handbook says "You likely want to disable key expiry!" and "Do not update Tailscale if you don't have access to PiKVM without VPN" [hma-rescue-pikvm-tailscale]{2} [hma-rescue-pikvm-tailscale]{3}. The FAQ has an explicit entry that on macOS "my mouse/keyboard does not work", with fixes of a USB-C to USB-A cable and adapter and "You may need to allow new accessories to connect" [hma-rescue-pikvm-faq]{1}. For V4 it states "2K/4K resolutions will not work" and to use "1920x1200@60hz" [hma-rescue-pikvm-faq]{2}; EDID tuning is documented [hma-rescue-pikvm-docs-home]{3}.
- JetKVM: HDMI plus USB, "Works without a running operating system" [hma-rescue-jetkvm-site]{3}; "Anything with HDMI out and USB works, from the BIOS onwards" [hma-rescue-jetkvm-faq]{1}; Tailscale built in on the Mini model and by script on the standard model [hma-rescue-jetkvm-faq]{3}; remote access via an opt-in Google-signed cloud or via the operator's own tailnet [hma-rescue-jetkvm-remote-access]{1} [hma-rescue-jetkvm-remote-access]{2}; EDID presets exist for black-screen-in-UEFI cases [hma-rescue-jetkvm-edid]{1} [hma-rescue-jetkvm-edid]{2}. No Mac statement and no price appeared on the fetched pages [hma-rescue-jetkvm-faq]{5}.
- GL.iNet Comet: Tailscale is bound from the device's Apps Center, removing the need for the vendor app or cloud [hma-rescue-glinet-comet-tailscale]{1} [hma-rescue-glinet-comet-tailscale]{3}. The vendor product pages returned only navigation text; a search summary gives $89.99 US for the GL-RM1 and no subscription fees {confidence: snippet-thin} [hma-rescue-glinet-comet-price-search]{1}.
- Apple silicon pre-boot input is the unresolved point. Apple's accessory page says new USB accessories on "Mac laptop with Apple silicon" prompt for approval, with options from "Always ask" to "Always allow", and "If your Mac is locked, you need to unlock it before you can allow an accessory to connect" [hma-rescue-apple-accessories]{1} [hma-rescue-apple-accessories]{2} [hma-rescue-apple-accessories]{3}. The page names laptops, not the Mac mini, and does not describe the pre-boot FileVault screen. Community search summaries suggest USB access may be blocked at that screen and that unplugging and replugging the cable or setting "always allow" may help {confidence: snippet-thin} [hma-rescue-search-kvm-apple-filevault]{1} [hma-rescue-search-kvm-apple-filevault]{2}. No source-direct statement confirms keyboard emulation at the Mac mini FileVault screen for any of the three devices.
- Power control: PiKVM and JetKVM document ATX power control, and JetKVM adds DC power control and Wake on LAN [hma-rescue-jetkvm-faq]{4}. A Mac mini has no ATX header, so these do not apply {inferred}. A Raspberry Pi magazine feature on a 16-Mac-mini PiKVM rig drove the physical power buttons with servos because "the only way to reboot it is to physically press its power button" [hma-rescue-magpi-kvmac16]{2} [hma-rescue-magpi-kvmac16]{3}.
- Value relative to SSH unlock: a KVM reaches states SSH cannot (a hung Mini, a stuck update, Recovery) {inferred}, but for the documented unlock path SSH from the LAN is sufficient [hma-host-apple-deploy-filevault-intro]{1}. A KVM is also another tailnet node and cloud-optional device to patch [hma-rescue-pikvm-tailscale]{3}.

## 4. Smart plug and remote power cycle

- Apple's page: on a Mac mini introduced in 2024 or later with macOS 26.5 or later, choose Energy "Start up when power is connected" = Always [hma-host-apple-poweron-mini]{1} [hma-host-apple-poweron-mini]{2}; the Mac then turns on "when power is restored after a power failure" [hma-host-apple-poweron-mini]{3}, and Apple suggests waiting about 30 seconds between disconnecting and reconnecting power [hma-host-apple-poweron-mini]{4}. A switched plug that cuts and restores power is therefore a power-on path for a hung or powered-off Mini {inferred}.
- It lands the Mini at the FileVault stage, not at a running session [hma-host-apple-deploy-filevault-intro]{1}, so a plug cycle must be followed by the SSH unlock.
- Risks {composed, no source fetched}: cutting power to a running Mac is an unclean shutdown; a plug controlled by a vendor cloud or by Wi-Fi is another dependency; the plug itself needs to be on the rescue device's control path (local API or the same LAN) to work during an internet or tailnet outage. The sources do not cover plug products, so no model is recommended.

## 5. Router-based Tailscale and Apple TV as the LAN foothold

- GL.iNet routers: Tailscale ships in firmware v4.2 and later, though "some models ... do not support Tailscale due to insufficient memory" [hma-rescue-glinet-router-tailscale]{3}. "Allow Remote Access LAN" exposes LAN-side resources, with routes still approved in the admin console [hma-rescue-glinet-router-tailscale]{1} [hma-rescue-glinet-router-tailscale]{2}. This makes the router a subnet router for the whole LAN, which the ACL then has to narrow {inferred}. The doc warns against running it alongside several other VPN features [hma-rescue-glinet-router-tailscale]{4}. UniFi and OpenWrt were not verified (page fetch failed or returned an index only).
- Benefit {inferred}: the router is already the always-on device that must be up for the Mini's pre-boot networking, so it removes one device from the failure chain. Cost: no scriptable host for a watchdog unless the router supports one, and the router's Tailscale is tied to firmware limits.
- Apple TV: Tailscale documents Apple TV as "a subnet router" and exit node, with tvOS 17.0 or later required and the device set as a home hub [hma-rescue-tailscale-appletv]{1} [hma-rescue-tailscale-appletv]{2}; an Apple TV that is asleep may be unreachable if it is not a home hub [hma-rescue-tailscale-appletv]{4}. The extract found no SSH or shell capability for Apple TV [hma-rescue-tailscale-appletv]{3}. Used as a subnet router advertising the Mini's address, the phone could open SSH to the Mini for the unlock without any shell on the Apple TV {inferred}. It cannot run a watchdog, so alerting needs another host.

## 6. Outage alerting

- ntfy sends push notifications "via scripts from any computer, using simple HTTP PUT or POST requests", with Android and F-Droid apps and self-hosting; on the public service "topic names are public" [hma-rescue-ntfy-docs]{1} [hma-rescue-ntfy-docs]{2} [hma-rescue-ntfy-docs]{3}.
- Healthchecks.io is a dead-man's-switch: it "keeps silent as long as pings arrive on time" and "raises an alert as soon as a ping does not arrive on time", with a grace period [hma-rescue-healthchecks-docs]{1} [hma-rescue-healthchecks-docs]{2}. It sits outside the home, so it also alerts when the whole house loses power or internet, a case no in-house watchdog can report {inferred}.
- Uptime Kuma is self-hosted and supports TCP, ping and push monitors with "90+ notification services" [hma-rescue-uptime-kuma]{1} [hma-rescue-uptime-kuma]{2}.
- Distinguishing states (composed; no source tests these signals):

| Probe from the rescue device | Mini LAN :22 | Mini tailnet address | Reading |
|---|---|---|---|
| Normal | answers | answers | up |
| Pre-boot waiting | answers | silent | locked at FileVault, or Tailscale/tailscaled down after unlock |
| Off, hung, or unplugged | silent | silent | needs power-cycle or KVM |
| Rescue device silent to Healthchecks | n/a | n/a | rescue device, LAN, power or internet is down |

  The table's second row cannot separate "pre-boot" from "booted but Tailscale failed" {inferred}; distinguishing them would need a banner or login-window probe that no fetched source documents. Healthchecks, ntfy and Kuma documentation do not cover this specific pairing.

## 7. Wake-on-LAN relevance

Apple lists "Wake for network access" under Energy on desktop Macs, described as letting the Mac "wake briefly so users can access shared services" [hma-rescue-apple-mac-wake-settings]{1}. That is a wake-from-sleep setting, not power-on from off {inferred: the page describes waking}. Forum posts quoting vendor support say Apple silicon Macs "do not reliably support third-party Wake-on-LAN while sleeping" and that preventing automatic sleep avoided the need for WoL {confidence: community} [hma-rescue-tidbits-wol-applesilicon]{1} [hma-rescue-tidbits-wol-applesilicon]{2}. For a never-sleep host WoL is not a recovery tool; it does not touch the FileVault stage {inferred}.

## Comparison grid

Cost class is given only where a fetched page states it; "not stated" means no fetched vendor page gave a price.

| Option | Solves | Does not solve | Security exposure | Extra failure points | Survives power outage unaided | Cost class |
|---|---|---|---|---|---|---|
| Pi as tailnet node + SSH jump host + watchdog | Remote pre-boot unlock (SSH via ProxyJump, SSH-mode client); alerting host | Hung Mini with no OS; no power-on | SSH daemon on Pi reachable by tailnet; no Mini credentials stored if end-to-end | Pi, its PSU, SD/SSD, Tailscale service enabled at boot | Boots on power return if the service is enabled {composed}; SD corruption risk {inferred}; UPS covers Pi and Mini | not stated |
| Pi as scoped subnet router (/32 + ACL) + watchdog | Remote pre-boot unlock from any SSH client; alerting host | Same | Network-layer reach to one IP:port if policy scoped; no shell on Pi if SSH there is disabled | Pi, PSU, route approval, IP forwarding setting | As above | not stated |
| KVM-over-IP (PiKVM / JetKVM / Comet) | Hung Mini, Recovery, boot-screen view; unlock if USB input works at pre-boot | Power-on of a Mini (no ATX); Apple silicon pre-boot input unverified | Another device on tailnet or vendor cloud (JetKVM cloud is opt-in) | Device, HDMI/USB cabling, accessory approval behaviour | PiKVM read-only FS designed for outages; others not stated | Comet $89.99 (snippet-thin); others not stated |
| Smart plug + "Start up when power is connected" | Power-on of off or hung Mini | Does not unlock FileVault; unclean power cut | Plug vendor cloud or LAN API | Plug, its control path | Plug state after outage not covered by sources | not covered |
| GL.iNet router with Tailscale ("Allow Remote Access LAN") | Foothold with no extra box; reach Mini LAN IP | No scriptable watchdog documented here; model memory limits | Whole LAN advertised unless ACL narrows it | Router firmware/model support | Router must already be up for Mini networking | not stated |
| Apple TV as subnet router | Foothold for SSH unlock to Mini IP | No shell, watchdog or scripting documented; needs home hub | Subnet route, ACL-scoped | Apple TV sleep/home-hub state | not covered by sources | not stated |
| External heartbeat/alert (Healthchecks, ntfy, Kuma) | Alerts for Mini down, pre-boot, or home offline | Does not recover anything | ntfy public topics are guessable if named poorly | Alert service, phone app, Pi pinger | Heartbeat absence itself signals an outage | not stated |
| Wake-on-LAN | Wake from sleep | Power-on from off; FileVault | LAN broadcast | Sleep reliability on Apple silicon | n/a | n/a |

A UPS covers the rescue device, router, and Mini together; none of the fetched sources test UPS sizing, so it is only noted here {composed}.

## Disconfirming analysis

- "A Pi jump host works from Android": searched for jump-host support in Moshi and Termius. Moshi documents it for SSH mode only and does not say which platform [hma-rescue-moshi-docs-jumphost]{1} [hma-rescue-moshi-docs-jumphost]{4}; Termius not verified. The claim stands only for Moshi SSH mode, platform unconfirmed. A subnet router removes the dependency on client jump-host support {composed}.
- "A /32 subnet route works": searched the subnet-router and policy pages for a single-host example. Neither gives one; both show CIDRs [hma-rescue-tailscale-subnets-detail]{1} [hma-rescue-tailscale-acl-syntax]{1}. Held as expected-to-work, not confirmed.
- "A KVM can enter the FileVault password on Apple silicon": searched vendor docs and Apple's accessory page. No vendor page confirms; PiKVM's own FAQ lists Mac input problems [hma-rescue-pikvm-faq]{1}; JetKVM claims broad HDMI+USB compatibility without a Mac mention [hma-rescue-jetkvm-faq]{1}; Apple's page speaks of laptops and a need to unlock before allowing accessories [hma-rescue-apple-accessories]{3}. Unverified; a purchase should be conditional on a return window or a trial {composed}.
- "A rescue device is needed at all": searched for a path that avoids it. Unlocking from the MacBook Air on the home LAN needs the operator at home [hma-host-apple-deploy-filevault-intro]{1}; FileVault off removes the pre-boot stage but is the host brief's decision, not this facet's. No fetched source gives a remote pre-boot path without a LAN foothold {inferred}.
- "Wake-on-LAN can recover the Mini": contradicted for off-state and doubtful on Apple silicon sleep [hma-rescue-apple-mac-wake-settings]{1} [hma-rescue-tidbits-wol-applesilicon]{1}.
- "A smart plug is enough": the plug restarts the Mini only to the FileVault stage [hma-host-apple-poweron-mini]{3} [hma-host-apple-deploy-filevault-intro]{1}; unlock is still required.
- "Wi-Fi is acceptable for the Mini": one practitioner reports Wi-Fi unlock only as of 26.5 [hma-host-geerling-filevault-ssh]{4}; prefer wired {composed}.

## Contradictions

- KVM compatibility on macOS. JetKVM FAQ: "Anything with HDMI out and USB works, from the BIOS onwards" [hma-rescue-jetkvm-faq]{1}. PiKVM FAQ: on macOS the mouse/keyboard may not work until a cable change and accessory approval [hma-rescue-pikvm-faq]{1}. Apple: a locked Mac requires unlocking before an accessory is allowed [hma-rescue-apple-accessories]{3}. {contested: whether USB HID emulation works at the Apple silicon FileVault screen; no source-direct test.}
- Power on without a button. Apple: a Mac mini 2024 or later with macOS 26.5 starts when power is restored [hma-host-apple-poweron-mini]{3}. Raspberry Pi magazine: reboot after failure needed the physical power button, solved with servos [hma-rescue-magpi-kvmac16]{2} [hma-rescue-magpi-kvmac16]{3}. {ambiguous: the article concerns Macs of unstated model and macOS version; the Apple setting needs 26.5 and a 2024 or later Mini.}
- Jump host versus mosh. Moshi's connection design favours mosh/Auto, while its jump-host setting requires SSH mode and calls mosh incompatible with a simple jump path [hma-rescue-moshi-docs-jumphost]{1} [hma-rescue-moshi-docs-jumphost]{2}. {qualifies: the rescue use is a one-off SSH session, so SSH mode is acceptable.}

## Gaps

- No source-direct confirmation that any KVM types at the Mac mini FileVault screen, or that the Mini's pre-boot SSH works through a jump host or subnet route.
- Moshi Android jump-host availability; Termius jump hosts; UniFi and OpenWrt Tailscale; smart plug products; Pi SD wear and power-loss guidance; whether the Linux script install enables `tailscaled` at boot.
- Vendor prices for PiKVM, JetKVM and the Comet product page (only a snippet for the Comet).

## Revisit if

- Apple documents how USB accessories are handled at the pre-boot FileVault stage on a Mac mini, or changes the SSH unlock conditions in 26.x or 27.
- Tailscale ships a pre-login macOS daemon for the Mini (making the LAN foothold unnecessary for unlock).
- A vendor or practitioner source reports a tested KVM-at-FileVault result on Apple silicon.
- Moshi documents Android jump hosts or ProxyJump for mosh.
- The operator chooses FileVault off, a UPS, or a hosted Mac, any of which reshapes the need for a rescue device.
