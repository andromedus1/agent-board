---
source_handle: rps-blink-notifications
fetched: 2026-10-26
source_url: https://docs.blink.sh/basics/notifications
source_path: .research/source-captures/rps-blink-notifications/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Blink Shell documentation page on terminal notifications. Blink raises device notifications from the BEL character and from OSC 9 / OSC 777 sequences, and documents that iOS may kill a backgrounded connection and that some sequences are unsupported under Mosh.

## Key passages

- [1] Settings: "Play Sound on active shell" (BEL beep), "Notification on background shell" (alert when BEL is received and the terminal is in the background or out of focus), haptic feedback on iPhone, and "'Notify' notifications": "Blink supports standard OSC sequences & iTerm2 notifications."
- [2] OSC Sequences: OSC 9 is an iTerm2 Growl-style notification shown as `echo -e "\033]9;Text to show\a"`; OSC 777 with the `notify` argument displays a title and body: `echo -e "\033]777;notify;Title;Body of the notification\a"`.
- [3] Considerations: "Bear in mind that some sequences are not supported in Mosh."
- [4] Considerations: "When Blink is sent to the background the system can kill the remote connection after some time"; the `geo` command is documented to bypass the system's background resources to persist the connection and receive notifications; "Not doing this doesn't guarantee your session will stay up as long as necessary."

## Structural notes

- The page does not say which sequences are unsupported under Mosh, and does not mention OSC 0/2 window titles.
