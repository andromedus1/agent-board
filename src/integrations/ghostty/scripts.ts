/**
 * These scripts intentionally contain no user-provided values. All dynamic
 * values are read from osascript's positional argv array.
 */
export const ACTIVE_CONTEXT_SCRIPT = String.raw`on run argv
  tell application "Ghostty"
    set w to front window
    set t to selected tab of w
    set term to focused terminal of t
    return (id of w as text) & (ASCII character 9) & (id of t as text) & (ASCII character 9) & (id of term as text)
  end tell
end run`;

/** Return trustworthy focus evidence, or a sentinel when Ghostty is not frontmost. */
export const FOCUSED_TERMINAL_SCRIPT = String.raw`on run argv
  tell application "Ghostty"
    if frontmost is false then return "AGENT_BOARD_NOT_FRONTMOST"
    set w to front window
    set t to selected tab of w
    set term to focused terminal of t
    return "FRONTMOST" & (ASCII character 9) & (id of w as text) & (ASCII character 9) & (id of t as text) & (ASCII character 9) & (id of term as text)
  end tell
end run`;

export const HIERARCHY_SCRIPT = String.raw`on run argv
  tell application "Ghostty"
    set rows to ""
    repeat with windowRef in every window
      set w to contents of windowRef
      repeat with tabRef in every tab of w
        set t to contents of tabRef
        repeat with terminalRef in every terminal of t
          set term to contents of terminalRef
          set rows to rows & (id of w as text) & (ASCII character 9) & (id of t as text) & (ASCII character 9) & (id of term as text) & (ASCII character 10)
        end repeat
      end repeat
    end repeat
    return rows
  end tell
end run`;

/**
 * Emit one atomic view of both the visible hierarchy and Ghostty's
 * application-wide live-terminal collection.  The markers are deliberately
 * machine-readable; values are output data rather than interpolated script.
 */
export const SNAPSHOT_SCRIPT = String.raw`on run argv
  tell application "Ghostty"
    set rows to ""
    repeat with windowRef in every window
      set w to contents of windowRef
      repeat with tabRef in every tab of w
        set t to contents of tabRef
        repeat with terminalRef in every terminal of t
          set term to contents of terminalRef
          set rows to rows & "VISIBLE" & (ASCII character 9) & (id of w as text) & (ASCII character 9) & (id of t as text) & (ASCII character 9) & (id of term as text) & (ASCII character 10)
        end repeat
      end repeat
    end repeat
    repeat with terminalRef in every terminal
      set term to contents of terminalRef
      set rows to rows & "ENUMERABLE" & (ASCII character 9) & (id of term as text) & (ASCII character 10)
    end repeat
    return rows
  end tell
end run`;

export const WORKING_DIRECTORY_SCRIPT = String.raw`on run argv
  tell application "Ghostty"
    set term to terminal id (item 1 of argv)
    set directoryValue to working directory of term
    if directoryValue is missing value then return "AGENT_BOARD_NO_WORKING_DIRECTORY"
    return directoryValue as text
  end tell
end run`;

export const SET_TAB_TITLE_SCRIPT = String.raw`on run argv
  tell application "Ghostty"
    try
      set term to terminal id (item 1 of argv)
    on error
      return "MISSING_TARGET"
    end try
    try
      set resultValue to perform action ("set_tab_title:" & (item 2 of argv)) on term
      if resultValue is not true then return "AGENT_BOARD_ACTION_FAILED"
      return "OK:" & (item 1 of argv)
    on error
      return "MISSING_TARGET"
    end try
  end tell
end run`;

export const CLEAR_TAB_TITLE_SCRIPT = String.raw`on run argv
  tell application "Ghostty"
    try
      set term to terminal id (item 1 of argv)
    on error
      return "MISSING_TARGET"
    end try
    try
      set resultValue to perform action "set_tab_title:" on term
      if resultValue is not true then return "AGENT_BOARD_ACTION_FAILED"
      return "OK:" & (item 1 of argv)
    on error
      return "MISSING_TARGET"
    end try
  end tell
end run`;
