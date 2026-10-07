#!/usr/bin/env node
import { readFileSync, renameSync, writeFileSync } from "node:fs";

const scenarioPath = process.env.AGENT_BOARD_E2E_SCENARIO;
if (!scenarioPath) {
  process.stderr.write("scenario path is required\n");
  process.exit(2);
}

function load() {
  return JSON.parse(readFileSync(scenarioPath, "utf8"));
}

function save(value) {
  const temporary = `${scenarioPath}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value)}\n`, "utf8");
  renameSync(temporary, scenarioPath);
}

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

const args = process.argv.slice(2);
const script = args[1] ?? "";
const separator = args.indexOf("--");
const values = separator < 0 ? [] : args.slice(separator + 1);
const scenario = load();
if (scenario.ghostty?.automationDenied === true) fail("Not authorized to send Apple events");
if (scenario.ghostty?.snapshotAvailable === false && script.includes("every window")) fail("snapshot unavailable");

const terminals = scenario.ghostty?.terminals ?? {};
const focused = scenario.ghostty?.focusedTerminalId ?? Object.keys(terminals)[0];
const terminal = focused ? terminals[focused] : undefined;

if (script.includes("display dialog \"Rename project\"")) {
  if (scenario.renamePrompt?.cancel === true) process.stdout.write("AGENT_BOARD_CANCELLED\n");
  else process.stdout.write(`AGENT_BOARD_RENAMED\u001e${scenario.renamePrompt?.response ?? values[0] ?? ""}\n`);
} else if (script.includes("frontmost is false")) {
  if (scenario.ghostty?.frontmost === false) process.stdout.write("AGENT_BOARD_NOT_FRONTMOST\n");
  else if (!terminal) fail("application isn't running");
  else process.stdout.write(`FRONTMOST\t${terminal.windowId}\t${terminal.tabId}\t${terminal.terminalId}\n`);
} else if (script.includes("set w to front window")) {
  if (!terminal) fail("application isn't running");
  process.stdout.write(`${terminal.windowId}\t${terminal.tabId}\t${terminal.terminalId}\n`);
} else if (script.includes("set rows to \"\"")) {
  const rows = [];
  if (script.includes('"VISIBLE"')) {
    for (const item of Object.values(terminals)) {
      if (item.visible !== false) rows.push(`VISIBLE\t${item.windowId}\t${item.tabId}\t${item.terminalId}`);
    }
    for (const item of Object.values(terminals)) if (item.enumerable !== false) rows.push(`ENUMERABLE\t${item.terminalId}`);
  } else {
    for (const item of Object.values(terminals)) {
      if (item.visible !== false) rows.push(`${item.windowId}\t${item.tabId}\t${item.terminalId}`);
    }
  }
  process.stdout.write(rows.length === 0 ? "" : `${rows.join("\n")}\n`);
} else if (script.includes("working directory of term")) {
  const id = values[0];
  const item = terminals[id];
  if (!item) fail("missing value");
  process.stdout.write(`${item.workingDirectory ?? "AGENT_BOARD_NO_WORKING_DIRECTORY"}\n`);
} else if (script.includes("set_tab_title:")) {
  const id = values[0];
  const item = terminals[id];
  if (!item) process.stdout.write("MISSING_TARGET\n");
  else if (scenario.ghostty?.titleActionFails === true) process.stdout.write("AGENT_BOARD_ACTION_FAILED\n");
  else {
    const title = values[1] ?? "";
    item.title = title;
    save(scenario);
    process.stdout.write(`OK:${id}\n`);
  }
} else {
  fail("unsupported AppleScript fixture request", 2);
}
