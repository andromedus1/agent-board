---
source_handle: hma-android-wherdr-docs-conversation
fetched: 2026-11-10
source_url: https://github.com/afloury/wherdr/blob/main/docs/conversation.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

wherdr documentation of conversation view, including interactive agent screens and how yes/no replies are written.

## Key passages

- [1] "Interactive agent screens: in a conversation, an uncertain menu or panel opens the pane's real terminal in a modal window, with arrows, Enter, Escape, Tab, digits and y/n." Existing native questions, approvals and menus "keep their controls. The window is a fallback after those recognizers."
- [2] A closed yes/no question gets Yes and No buttons; "nothing is sent" on tap: it writes the answer under the quoted question in the message field, and the rule is cautious, offering only Reply when in doubt.

## Structural notes

- Project documentation. How a native approval is delivered to the agent (keys versus a structured channel) is not stated on the page read.
