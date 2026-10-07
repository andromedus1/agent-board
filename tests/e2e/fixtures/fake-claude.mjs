#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const scenarioPath = process.env.AGENT_BOARD_E2E_SCENARIO;
if (!scenarioPath) process.exit(2);
const load = () => JSON.parse(readFileSync(scenarioPath, "utf8"));
const args = process.argv.slice(2);

if (args[0] === "--version") {
  const scenario = load();
  process.stdout.write(`${scenario.claude?.version ?? "2.1.226 (Claude Code)"}\n`);
  process.exit(scenario.claude?.versionExitCode ?? 0);
}

if (args[0] === "plugin" && args[1] === "validate") {
  const root = args[2];
  const valid = root && existsSync(`${root}/.claude-plugin/plugin.json`) && existsSync(`${root}/hooks/hooks.json`);
  process.exit(valid && load().claude?.pluginValid !== false ? 0 : 1);
}

const pluginIndex = args.indexOf("--plugin-dir");
const pluginRoot = pluginIndex >= 0 ? args[pluginIndex + 1] : undefined;
if (!pluginRoot) {
  process.stderr.write("Agent Board plugin was not supplied\n");
  process.exit(2);
}
const hookConfiguration = JSON.parse(readFileSync(`${pluginRoot}/hooks/hooks.json`, "utf8"));
let sequence = -1;
function emit(event, fields = {}) {
  const input = JSON.stringify({ session_id: "fake-claude-session", hook_event_name: event, cwd: process.cwd(), transcript_path: "/fake/transcript", ...fields });
  const handler = hookConfiguration.hooks?.[event]?.[0]?.hooks?.[0];
  if (!handler || handler.type !== "command" || !Array.isArray(handler.args)) {
    process.stderr.write(`No packaged hook handler for ${event}\n`);
    process.exit(2);
  }
  const substitute = (value) => value.replaceAll("${CLAUDE_PLUGIN_ROOT}", pluginRoot);
  const command = substitute(handler.command);
  const hookArgs = handler.args.map(substitute);
  const result = spawnSync(command, hookArgs, { env: process.env, input, encoding: "utf8", maxBuffer: 2 ** 20 });
  if (result.status !== 0) process.stderr.write(result.stderr || "hook failed\n");
}
emit("SessionStart");
const timer = setInterval(() => {
  const claude = load().claude ?? {};
  if (claude.hook && claude.hook.sequence !== sequence) {
    sequence = claude.hook.sequence;
    emit(claude.hook.event, claude.hook.fields ?? {});
  }
  if (claude.exitCode !== undefined) {
    clearInterval(timer);
    process.exit(claude.exitCode);
  }
}, 20);
process.on("SIGTERM", () => { clearInterval(timer); process.exit(143); });
process.on("SIGINT", () => { clearInterval(timer); process.exit(130); });
