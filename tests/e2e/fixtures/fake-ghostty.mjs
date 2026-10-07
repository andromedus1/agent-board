#!/usr/bin/env node
import { readFileSync } from "node:fs";

const scenarioPath = process.env.AGENT_BOARD_E2E_SCENARIO;
const scenario = scenarioPath ? JSON.parse(readFileSync(scenarioPath, "utf8")) : {};
const args = process.argv.slice(2);
if (args[0] === "--version") {
  process.stdout.write(`${scenario.ghostty?.version ?? "Ghostty 1.3.1"}\n`);
  process.exit(scenario.ghostty?.versionExitCode ?? 0);
}
if (args[0] === "+show-config") {
  const config = args.includes("--default") ? scenario.ghostty?.defaultConfig : scenario.ghostty?.userConfig;
  process.stdout.write(`${config ?? "macos-applescript = true\nbell-features = no-title\n"}`);
  process.exit(scenario.ghostty?.configExitCode ?? 0);
}
process.stderr.write("unsupported Ghostty fixture request\n");
process.exit(2);
