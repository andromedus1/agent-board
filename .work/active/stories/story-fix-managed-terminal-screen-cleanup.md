---
id: story-fix-managed-terminal-screen-cleanup
kind: story
stage: done
tags: [bug, integration, cli]
parent: null
depends_on: []
release_binding: null
gate_origin: null
created: 2026-10-18
updated: 2026-10-18
---

# Restore shell screen and reporting modes after managed shutdown

## Symptom
Forced Codex shutdown leaves the alternate screen, hidden cursor and input reporting modes active even though termios and keyboard reporting were restored. Promoted from `idea-managed-terminal-screen-cleanup`, whose Git history records the real Codex 0.160.1 reproduction.

## Root cause
`SttyTerminalMode.restore` only resets termios and CSI-u/modifyOtherKeys; these do not reset terminal-emulator screen, cursor, mouse, focus or paste modes.

## Fix approach
Extend shared terminal cleanup with targeted resets for modes observed in the real TUI, leave the alternate screen and show the cursor. Preserve exact termios restoration and avoid a destructive full terminal reset. Shared cleanup covers both launchers.

## Regression test
`tests/integration/terminal-restoration.test.ts`: a controlling PTY enables the modes observed in the real Codex failure, forces each managed launcher to terminate, and checks final mode state and exact termios. Both providers fail on the original code: terminal mode 1049 remains enabled.

## Implementation notes

- Execution: host Codex, focused standalone repair with bounded inline review.
- Extended the shared restoration sequence to disable observed mouse modes
  1000/1002/1003/1006, focus 1004 and bracketed paste 2004, leave alternate screen
  1049 and show cursor 25. Existing termios and keyboard cleanup remain intact.
  No full terminal reset, new dependency or terminal-specific input injection.
- Mode definitions were checked against [Ghostty’s mode implementation](https://github.com/ghostty-org/ghostty/blob/main/src/terminal/modes.zig).
- A controlling-PTY regression enables the modes captured in the original real
  Codex failure, then terminates each launcher and checks the final mode state.
  Both provider cases failed before the fix (1049 remained enabled) and pass now,
  along with exact termios restoration and existing keyboard cleanup checks.
- Full local suite: 244 passed, 3 opt-in probes skipped. Typecheck passed.
- Real Codex 0.160.1 was left at its unanswered trust prompt for 13 seconds, then
  force-stopped through the production launcher. Captured output confirmed all
  listed screen/reporting modes disabled and cursor visible; both child processes
  were gone. Input settings matched the captured mode except macOS’s PENDIN
  bookkeeping bit (0x20000000). An agent-free raw-to-canonical stty roundtrip
  reproduced that exact difference, and the local SDK marks PENDIN as pending
  input state. The live probe compares all settings while accounting for only
  that kernel-managed bit; no production or regression-test behavior was changed
  to conceal it.
- README recovery instructions now describe the cleanup and retain manual reset
  guidance for cases where the launcher cannot complete restoration.
- Adjacent issues: none newly parked. Required CI pending.

## Review (2026-10-18)

**Verdict**: Approve after verified correction.
**Blockers**: Initial unconditional `1049l` could restore a stale saved cursor
when the TUI had already returned to the primary screen. Fixed by saving the
current screen’s cursor with `ESC 7` before leaving alternate. Ghostty maintains
separate save slots for primary and alternate screens, so this preserves normal
exit output and still restores the pre-TUI primary cursor after forced shutdown.
See [Ghostty cursor and screen-switch implementation](https://github.com/ghostty-org/ghostty/blob/main/src/terminal/Terminal.zig).
**Important / Nits / Rejected**: None.

Bounded inline standalone-story review, one host pass plus correction
verification; no independent/cross-model reviewer or repeat review. The new
protocol-state regression failed before the correction (primary cursor moved
from 12 to stale saved position 3); both primary and alternate cases now pass.
Controlling-PTY tests pass for both launchers; typecheck passes. Reviewed normal
exit, launch failure, forced shutdown, non-TTY skip and reporting-write failure.
No full reset or new input query, dependency, schema, or public argument.
README is current; no contradictory foundation assertion found. Required CI
will verify the complete final patch before closure.

## Completion

Required CI passed on macOS Node 22 and Node 26 at commit `ee1809c`:
[run 39167107362](https://github.com/andromedus1/agent-board/actions/runs/39167107362).
Both jobs passed typecheck and the complete final suite; the Node 26 job also
passed the latest-Codex capability/schema probe. The bounded review approval is
complete, with no unresolved blockers. This supersedes the earlier pending-CI
notes. No additional independent review was run.
