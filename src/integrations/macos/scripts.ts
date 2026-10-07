/** Dynamic values are positional argv; no user text is interpolated here. */
export const PROJECT_RENAME_PROMPT_SCRIPT = String.raw`on run argv
  try
    set promptResult to display dialog "Rename project" default answer (item 1 of argv) buttons {"Cancel", "Rename"} default button "Rename" cancel button "Cancel" with title "Agent Board"
    return "AGENT_BOARD_RENAMED" & (ASCII character 30) & (text returned of promptResult)
  on error number -128
    return "AGENT_BOARD_CANCELLED"
  end try
end run`;
