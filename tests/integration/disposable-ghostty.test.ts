import { test } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const enabled = process.env.AGENT_BOARD_LIVE_GHOSTTY === "1";
const osascript = "/usr/bin/osascript";

const PREFLIGHT = String.raw`tell application "Ghostty" to count windows`;
const PROBE = String.raw`on run argv
  set marker to item 1 of argv
  set probeWindow to missing value
  try
    tell application "Ghostty"
      set originalWindow to front window
      set originalTerminal to focused terminal of (selected tab of originalWindow)
      set originalId to id of originalTerminal as text

      set probeWindow to new window
      set probeTab to selected tab of probeWindow
      set probeTerminal to focused terminal of probeTab
      set probeId to id of probeTerminal as text
      if probeId is originalId then error "Disposable Ghostty terminal reused the active terminal"

      set setActionResult to perform action ("set_tab_title:" & marker) on probeTerminal
      set clearActionResult to perform action "set_tab_title:" on probeTerminal
      close window probeWindow
      return originalId & (ASCII character 9) & probeId & (ASCII character 9) & setActionResult & (ASCII character 9) & clearActionResult
    end tell
  on error messageText number errorNumber
    try
      tell application "Ghostty"
        if probeWindow is not missing value then close window probeWindow
      end tell
    end try
    error messageText number errorNumber
  end try
end run`;

test("Ghostty disposable surface preserves the existing terminal and cleans up", { skip: !enabled ? "Set AGENT_BOARD_LIVE_GHOSTTY=1 to opt into the Ghostty probe" : false }, async (context) => {
  if (process.platform !== "darwin") {
    context.skip("Skipping before mutation: Ghostty disposable probes require macOS");
    return;
  }
  try {
    await access(osascript);
  } catch {
    context.skip("Skipping before mutation: /usr/bin/osascript is unavailable");
    return;
  }

  try {
    await execFileAsync(osascript, ["-e", PREFLIGHT], { timeout: 2_000, maxBuffer: 16 * 1024 });
  } catch (error) {
    context.skip(`Skipping before mutation: Ghostty has no usable Automation surface (${error instanceof Error ? error.message : String(error)})`);
    return;
  }

  const marker = `agent-board-live-${Date.now()}`;
  const result = await execFileAsync(osascript, ["-e", PROBE, "--", marker], { timeout: 10_000, maxBuffer: 32 * 1024 });
  const [originalId, probeId, titled, cleared] = result.stdout.trim().split("\t");
  assert.ok(originalId);
  assert.ok(probeId);
  assert.notEqual(originalId, probeId);
  assert.equal(titled, "true");
  assert.equal(cleared, "true");
});
