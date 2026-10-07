---
title: Ghostty title ownership, terminal identity, and session liveness
provenance: agent-synthesis
updated: 2026-08-14
source_handles:
  - ghostty-applescript
  - ghostty-actions-title
  - ghostty-config-title
  - ghostty-osc2
  - ghostty-zsh-title
  - ghostty-release-1-2
  - ghostty-release-1-3
  - ghostty-applescript-source-v1-3-1
  - ghostty-applescript-main
---

# Ghostty title ownership, terminal identity, and session liveness

## Finding

Ghostty 1.3 makes a narrower and more reliable V1 possible than the proposed
OSC-only design. Agent Board should require Ghostty 1.3 or later on macOS,
register the currently focused tab and terminal by their AppleScript IDs, and
render each state transition through a targeted `set_tab_title` action. This is
still full-title ownership—`<status> <project-name>` is rendered atomically
from separately stored fields—but the machine, rather than the user, maintains
Ghostty's tab-title override. {inferred: composed from the AppleScript action
transport and tab-title precedence} [ghostty-applescript]{1}
[ghostty-applescript]{2} [ghostty-applescript]{4}
[ghostty-actions-title]{1} [ghostty-actions-title]{3}

OSC 2 remains a useful compatibility fallback and diagnostic, not the default
ownership mechanism. Ghostty accepts a UTF-8 OSC 2 title, but its own zsh
integration emits OSC 2 at both prompt display and command execution. Any
other terminal application may also use the same sequence. Each accepted
write therefore owns the visible title only until another writer acts.
{inferred: convergence} [ghostty-osc2]{1} [ghostty-osc2]{2}
[ghostty-zsh-title]{1} [ghostty-zsh-title]{2}

## Title precedence and reset behavior

Ghostty exposes three materially different title mechanisms:

| Mechanism | Scope and precedence | V1 use |
| --- | --- | --- |
| OSC 2 | A terminal program changes its surface/window title; another program or shell hook can change it again. | Fallback only. |
| Surface-title override | Targets the focused surface; an empty title resets it. | Avoid: it competes with surface semantics and is narrower than the project tab. |
| Tab-title override | Overrides titles set by terminal programs, survives focus changes within a tab, and is cleared by setting an empty value. | Preferred renderer. |

The table's control and reset behavior is defined in Ghostty's title-action
reference. [ghostty-actions-title]{1} [ghostty-actions-title]{2}
[ghostty-actions-title]{3} The targeted transport is official too:
AppleScript's `perform action` runs the same action strings used by Ghostty
keybindings against a chosen terminal. [ghostty-applescript]{4}

Two configuration checks are required:

- A global `title` setting is incompatible with terminal-driven title updates
  because it forces one title and ignores program escape sequences. Agent Board
  should fail its setup check or explicitly explain the conflict if this option
  is present. [ghostty-config-title]{1}
- Ghostty's default bell-title feature prepends `🔔`, displacing Agent Board's
  status from the first character. A strict fixed-position status design must
  install or request `bell-features = no-title`; the attention bounce can
  remain enabled independently. [ghostty-config-title]{4}

Disabling Ghostty's shell-integration title feature is necessary for a pure
OSC implementation, but it is not necessary when the tab override is active,
because that override is documented to win over terminal-set titles.
{inferred: composition} [ghostty-config-title]{2}
[ghostty-actions-title]{1} This is useful: Agent Board can clear the override
on unregister and allow the operator's normal shell/application titles to
resume. [ghostty-actions-title]{3}

Agent Board should not enable CSI 21 t to verify its own rendering. Ghostty
disables title reporting by default and documents it as a security risk. The
renderer already receives a success/failure result from `perform action`, while
the board's source of truth remains the local state store, not a title readback.
{inferred: design consequence} [ghostty-config-title]{3}
[ghostty-applescript]{4}

## Registration and terminal identity

The explicit `agent-name` moment is the clean identity handshake. While the
operator is in the target tab, the command can resolve:

```text
front window -> selected tab -> focused terminal
```

and persist Ghostty window, tab, and terminal IDs alongside the project label,
repository path, and agent session ID. Ghostty documents the active-context
chain and exposes IDs on all three object types. [ghostty-applescript]{1}
[ghostty-applescript]{2}

The terminal ID should be the rendering and future-focus target; the tab ID
should be retained to enforce the V1 invariant of one supervised agent per tab
and to detect when two registered terminals share a tab. {inferred: design
consequence} Ghostty's 1.3.1 implementation supports resolving
`terminal id "..."` back to a live surface UUID even after window/tab ordering
changes. [ghostty-applescript-source-v1-3-1]{1}
[ghostty-applescript-source-v1-3-1]{2}

Registration requires AppleScript to be enabled and macOS Automation (TCC)
permission to be granted to the invoking application. These are deploy-time
conditions, not silent fallbacks: Ghostty enables AppleScript by default, but a
user may disable it, and macOS may prompt before permitting control.
[ghostty-applescript]{5} [ghostty-config-title]{5}

A lifecycle callback that fires after the operator has focused another tab
must never rediscover “current terminal”; it must address the terminal ID
captured during registration. {inferred: consequence of targeted identity}
This implies that the Codex adapter must carry or recover Agent Board's
registration/session key when delivering events. Project path alone is not a
safe join key because several agents may operate in the same repository.

## Liveness and stale cleanup

Use Ghostty's object hierarchy as the terminal-surface liveness authority and
agent events as the agent-state authority. On every `agents` read and every
state update, reconcile stored terminal/tab IDs against Ghostty's current
AppleScript objects. Ghostty 1.3.1 implements terminal enumeration and UUID
lookup over what its source calls “currently alive terminal surfaces.”
[ghostty-applescript-source-v1-3-1]{1}
[ghostty-applescript-source-v1-3-1]{2}
[ghostty-applescript-source-v1-3-1]{3}

Do not equate `kill(pid, 0)` or the continued existence of a shell/Codex
process with an active tab. Ghostty's undo-close implementation deliberately
keeps recently closed terminal processes alive but hidden for a bounded
interval. [ghostty-release-1-2]{1} {inferred: design consequence} A registry
entry missing from the current window/tab hierarchy should therefore become a
`disconnected` tombstone immediately and be pruned after a short grace period;
process liveness may qualify that judgment but does not override it.

There is one unresolved edge: Ghostty's source describes its AppleScript
terminal collection as “currently alive,” while undo-close temporarily keeps a
closed surface alive. The sources do not establish whether such a hidden undo
surface remains enumerable. {ambiguous: AppleScript enumeration during the
undo-close interval} The conservative policy is the same either way: reconcile
both the tab hierarchy and terminal ID, mark disappearance rather than showing
the previous working/attention state, retain a bounded tombstone, and reattach
only if the same IDs reappear before expiry.

This reconciliation can be opportunistic in V1; it does not require a daemon.
{inferred: architectural consequence} Stale entries are corrected whenever the
board is read or an adapter event arrives. A resident watcher becomes justified
only when the product promises proactive cleanup or notifications while no
command is running.

## Focus and control implications

Future “jump to agent” behavior does not need keystroke simulation. Ghostty's
official API can focus a terminal, activate a window, and select a tab by
object. [ghostty-applescript]{3} This meets the product guardrail that generic
keystrokes must not masquerade as semantic control.

Ghostty's current post-1.3.1 main branch has added foreground PID and TTY to the
AppleScript terminal object, but those fields are absent from the stable 1.3.1
dictionary. [ghostty-applescript-main]{1} [ghostty-applescript-main]{2}
[ghostty-applescript-main]{3} They can eventually strengthen automatic
registration and process correlation, but V1 must not depend on unreleased
surface metadata. {inferred: release-boundary consequence}

## Minimal migration implications

1. Set Ghostty 1.3+ and enabled AppleScript as explicit V1 platform
   requirements; add a setup probe that reports TCC/config conflicts.
2. Make registration an explicit active-tab handshake that records window,
   tab, and terminal IDs plus independent project and agent-session identity.
3. Render the whole tab label through targeted
   `perform action "set_tab_title:<rendered>" on <terminal-id>` after every
   state or name change. Escape AppleScript arguments and reject control
   characters in display names. {inferred: implementation constraint}
4. Disable Ghostty's title bell decoration so the status glyph remains in the
   first position. Do not require disabling the rest of shell integration.
5. Clear the tab override on explicit unregister; on unexpected disappearance,
   keep only a bounded disconnected tombstone in the state store.
6. Reconcile terminal and tab IDs opportunistically in the `agents` command
   and state-update path. Defer a daemon until a later requirement needs
   proactive behavior.
7. Treat split-bearing tabs as unsupported or diagnostically ambiguous in V1:
   a tab override is one value shared across the tab, while Ghostty exposes
   multiple terminal surfaces per tab. {inferred: object-model consequence}
   [ghostty-applescript]{1}

## Disconfirming analysis

The proposed assumption that Agent Board can reliably own `<status>
<project-name>` by writing OSC 2 is not supported. Ghostty's own default-capable
zsh integration writes titles at prompt and pre-execution boundaries, and the
global title option can suppress program title sequences entirely.
[ghostty-zsh-title]{1} [ghostty-zsh-title]{2}
[ghostty-config-title]{1} Even if shell title integration is disabled, OSC 2 is
an open terminal protocol rather than an exclusive Agent Board channel.
[ghostty-osc2]{1}

The counterevidence does not defeat full-title ownership; it changes the
mechanism. A targeted tab override is specifically documented to take
precedence over terminal titles and can itself be updated programmatically
through AppleScript. [ghostty-actions-title]{1}
[ghostty-applescript]{4} The original warning against the operator's manual
rename workflow remains valid, but the same override state is suitable when
Agent Board—not the operator—continuously renders the complete value.
{inferred: sublation}

The assumption that a live PID proves a live tab is also contradicted by
Ghostty's undo-close behavior: closed terminals can remain running while
hidden. [ghostty-release-1-2]{1} PID-only cleanup is therefore insufficient.

Finally, “one tab equals one agent” is not an invariant of Ghostty itself. Its
object model allows several terminal surfaces in one tab. [ghostty-applescript]{1}
Agent Board must make this a declared V1 constraint or define a tab-level
aggregation rule; silently letting two sessions overwrite one title would
recreate the ambiguity the product is meant to remove.

## Contradictions

| Relationship | Position A | Position B | Consequence |
| --- | --- | --- | --- |
| `contradicts` | OSC 2 appears to let a child own the complete title. [ghostty-osc2]{1} | Ghostty's zsh integration also writes OSC 2 at prompt and command start. [ghostty-zsh-title]{1} [ghostty-zsh-title]{2} | OSC is last-writer behavior, not exclusive ownership. |
| `qualifies` | Manual tab titles block terminal-driven dynamic updates. [ghostty-actions-title]{1} | AppleScript can invoke Ghostty actions on a chosen terminal, and `set_tab_title` is itself updateable and clearable. [ghostty-applescript]{4} [ghostty-actions-title]{3} | A user-maintained override is unsuitable, but a machine-maintained full-title override is viable. |
| `tension` | The AppleScript source enumerates “currently alive” terminal surfaces. [ghostty-applescript-source-v1-3-1]{3} | Undo-close keeps a closed surface process alive but hidden for a bounded interval. [ghostty-release-1-2]{1} | Absence/presence during the undo window needs a prototype; retain tombstones and do not use process liveness alone. |
| `qualifies` | The current main dictionary exposes terminal PID and TTY. [ghostty-applescript-main]{2} | Stable Ghostty 1.3.1 does not expose those fields. [ghostty-applescript-main]{3} | Treat PID/TTY correlation as future enhancement, not V1 substrate. |

## Acquisition candidates

- Track the Ghostty release containing commit `9a9002202b`, because the
  main-branch scripting dictionary identifies PID/TTY as canonical terminal
  properties once shipped. This can replace some explicit registration joins,
  but should not delay V1. [ghostty-applescript-main]{2}
  [ghostty-applescript-main]{3}
- At implementation time, reacquire the installed app's bundled
  `Ghostty.sdef`; Ghostty's official documentation names that file as the API's
  source of truth. This is the version-accurate contract and avoids assuming
  main-branch fields exist locally. [ghostty-applescript]{1}

No additional external source is blocking this facet. The remaining liveness
ambiguity is best resolved by a bounded integration test against the supported
Ghostty release, not by substituting another terminal or adding tmux.

## Revisit if

- Ghostty ships the PID/TTY AppleScript fields in a stable release.
- Ghostty introduces its planned cross-platform scripting API, which the 1.2
  release notes distinguish from macOS Shortcuts. [ghostty-release-1-2]{2}
- V1 allows multiple supervised agents or splits in one tab.
- The product needs proactive stale cleanup or notifications while no Agent
  Board command is running.
- Testing shows undo-closed surfaces remain in the AppleScript tab hierarchy
  or tab IDs change across supported restore/reorder operations.
- Agent Board must support Ghostty older than 1.3 or non-macOS terminals; OSC 2
  then becomes a compatibility adapter with explicitly lower confidence.
