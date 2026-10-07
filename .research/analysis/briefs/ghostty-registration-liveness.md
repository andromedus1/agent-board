---
name: ghostty-registration-liveness
description: Read this before implementing Ghostty identity, title rendering, reconciliation, or stale-session cleanup.
type: technical-brief
kind: research
status: locked
updated: 2026-08-14
summary: |
  Ghostty 1.3.1 stable IDs and targeted tab-title overrides are suitable for V1 registration and rendering. Closed tabs remain alive and enumerable during undo-close, so liveness must combine current tab hierarchy, explicit lifecycle evidence, and staleness rather than equating enumeration with visibility.
key_findings:
  - Targeted set_tab_title updates and clearing worked without changing captured IDs.
  - Closing a whole temporary window removed its terminal from live enumeration.
  - Closing a tab left its terminal enumerable; undo restored the same tab and terminal IDs.
  - Ghostty 1.3+ AppleScript should be the minimum supported integration and OSC should be diagnostic fallback only.
  - Reorder, window movement, and live bell decoration remain implementation-time checks, not blockers to the vertical slice.
research_method: /research
provenance: agent-synthesis
---

# Ghostty registration and liveness contract

## Decision position

Register the current Ghostty window, tab, and terminal IDs explicitly, then use
the terminal ID for targeted `set_tab_title` actions. The installed build kept
all three IDs stable while setting, updating, and clearing the tab title, and
clearing restored normal shell-derived naming.[ghostty-local-runtime-probe]{2}
This matches Ghostty's documented stable-ID object model and override-clearing
behavior.[ghostty-applescript]{1} [ghostty-actions-title]{1}
[ghostty-actions-title]{3}

Do not define liveness as “terminal ID is enumerable.” A closed tab remained in
the application-wide terminal collection during the undo window, and `undo`
restored the same tab and terminal IDs.[ghostty-local-runtime-probe]{4} By
contrast, closing the entire temporary probe window removed its terminal from
enumeration.[ghostty-local-runtime-probe]{3}

## Registration contract

At explicit registration, capture:

- Ghostty version and Automation readiness;
- window, tab, and terminal stable IDs;
- project label and current repo path;
- the terminal's reported working directory; and
- current tab index as a hint, never as identity.

Ghostty exposes stable IDs, active context, tab selection, focus, working
directory, and targeted action execution in the official AppleScript model.
[ghostty-applescript]{1} [ghostty-applescript]{3}
[ghostty-applescript]{4}

## Reconciliation contract

Use a conservative hierarchy check:

1. Resolve the registered window and inspect its current tabs.
2. Resolve the registered tab under that window and its terminal set.
3. Treat an application-wide terminal match without the expected visible
   window/tab ancestry as hidden/undoable evidence, not active visibility.
4. Combine that evidence with adapter state, last observation time, and explicit
   unregister/agent exit.
5. Clear the managed title when unregistering a still-visible tab.

This keeps Ghostty visibility/liveness separate from Codex activity and from
Board-owned unread acknowledgement. The local close/undo result is precisely why
those dimensions should not collapse into one stored status.
[ghostty-local-runtime-probe]{4}

## Configuration diagnostics

- Require a Ghostty release with the official AppleScript object model and
  verify the installed dictionary at setup.[ghostty-applescript]{1}
- Detect missing macOS Automation permission and provide one actionable command;
  the current machine allowed enumeration, but first-run permission remains an
  installation concern.[ghostty-local-runtime-probe]{1}
- Detect a conflicting global fixed `title` and require its removal or explicit
  opt-out.[ghostty-config-title]{1}
- Recommend disabling title bell decoration so the leftmost status glyph stays
  visually fixed.[ghostty-config-title]{3}
- Coordinate Codex's default terminal-title writer, but rely on Ghostty's tab
  override rather than racing OSC writes. The local configs currently leave
  Codex's default writer active.[ghostty-local-runtime-probe]{5}

## Limits and implementation-time tests

The installed AppleScript dictionary does not expose direct window geometry or
a direct tab-move command, so this probe did not automate window movement or tab
reordering.[ghostty-local-runtime-probe]{6} Because identity is ID-based rather
than index-based, these become integration tests during implementation rather
than architecture blockers. Live bell decoration should also be verified once
the installer applies its recommended config.

OSC 2 remains a diagnostic fallback only. Ghostty shell integration writes
terminal titles at prompt and pre-execution boundaries, making OSC ownership a
race with the normal workflow.[ghostty-zsh-title]{1}
