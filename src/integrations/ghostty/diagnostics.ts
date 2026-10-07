import type { ProcessRunner } from "../process-runner.js";
import { NodeProcessRunner } from "../process-runner.js";
import { GhosttyAdapterError } from "./protocol.js";
import { GhosttyClient } from "./client.js";

export type DiagnosticSeverity = "error" | "warning" | "info";

export interface IntegrationDiagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  remediation?: string;
}

export interface GhosttyDiagnosticReport {
  version?: string;
  automationReady: boolean;
  diagnostics: readonly IntegrationDiagnostic[];
}

const DEFAULT_COMMAND = "ghostty";
const PROCESS_TIMEOUT_MS = 2_000;
const MAX_OUTPUT_BYTES = 256 * 1024;

function diagnostic(code: string, severity: DiagnosticSeverity, message: string, remediation?: string): IntegrationDiagnostic {
  return remediation ? { code, severity, message, remediation } : { code, severity, message };
}

function parseVersion(output: string): string | undefined {
  return output.match(/\b(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z.-]+)?\b/u)?.[0];
}

function versionSupported(version: string): boolean {
  const [major, minor] = version.split(".").map(Number);
  return major > 1 || (major === 1 && minor >= 3);
}

function parseConfig(output: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const line of output.split(/\r?\n/u)) {
    const match = /^\s*([A-Za-z0-9_-]+)\s*=\s*(.*?)\s*$/u.exec(line);
    if (match) values.set(match[1], match[2]);
  }
  return values;
}

function configBool(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (/^(?:true|yes|on)$/iu.test(value)) return true;
  if (/^(?:false|no|off)$/iu.test(value)) return false;
  return undefined;
}

export interface GhosttyDiagnosticsOptions {
  readonly command?: string;
  readonly runner?: ProcessRunner;
  readonly clientCommand?: string;
}

async function run(runner: ProcessRunner, command: string, args: readonly string[]) {
  return runner.run({ command, args, timeoutMs: PROCESS_TIMEOUT_MS, maxOutputBytes: MAX_OUTPUT_BYTES });
}

export async function diagnoseGhostty(
  runnerOrOptions: ProcessRunner | GhosttyDiagnosticsOptions = new NodeProcessRunner(),
): Promise<GhosttyDiagnosticReport> {
  const options = "run" in runnerOrOptions ? { runner: runnerOrOptions } : runnerOrOptions;
  const runner = options.runner ?? new NodeProcessRunner();
  const command = options.command ?? DEFAULT_COMMAND;
  const clientCommand = options.clientCommand ?? "/usr/bin/osascript";
  const diagnostics: IntegrationDiagnostic[] = [];
  let version: string | undefined;
  let automationReady = false;

  try {
    const versionResult = await run(runner, command, ["--version"]);
    if (versionResult.exitCode !== 0) {
      diagnostics.push(diagnostic("GHOSTTY_NOT_INSTALLED", "error", "Ghostty could not report its installed version", "Install Ghostty 1.3 or later and ensure the ghostty executable is on PATH."));
    } else {
      version = parseVersion(versionResult.stdout);
      if (!version) {
        diagnostics.push(diagnostic("GHOSTTY_VERSION_UNKNOWN", "error", "Ghostty returned an unrecognizable version", "Run ghostty --version and verify the installed release."));
      } else if (!versionSupported(version)) {
        diagnostics.push(diagnostic("GHOSTTY_VERSION_UNSUPPORTED", "error", `Ghostty ${version} is unsupported; version 1.3.0 or later is required`, "Upgrade Ghostty to 1.3 or later."));
      }
    }
  } catch {
    diagnostics.push(diagnostic("GHOSTTY_NOT_INSTALLED", "error", "Ghostty executable could not be started", "Install Ghostty 1.3 or later and ensure the ghostty executable is on PATH."));
  }

  const defaults = new Map<string, string>();
  const user = new Map<string, string>();
  try {
    const result = await run(runner, command, ["+show-config", "--default"]);
    if (result.exitCode === 0) for (const [key, value] of parseConfig(result.stdout)) defaults.set(key, value);
  } catch { /* config diagnostics remain useful when the executable is absent */ }
  try {
    const result = await run(runner, command, ["+show-config"]);
    if (result.exitCode === 0) for (const [key, value] of parseConfig(result.stdout)) user.set(key, value);
  } catch { /* reported by the version probe */ }
  const config = new Map(defaults);
  for (const [key, value] of user) config.set(key, value);

  if (configBool(config.get("macos-applescript")) === false) {
    diagnostics.push(diagnostic("GHOSTTY_APPLESCRIPT_DISABLED", "error", "Ghostty AppleScript support is disabled", "Set macos-applescript = true in Ghostty configuration and restart Ghostty."));
  }
  const fixedTitle = config.get("title");
  if (fixedTitle !== undefined && fixedTitle.trim() !== "" && !/^(?:null|none)$/iu.test(fixedTitle.trim())) {
    diagnostics.push(diagnostic("GHOSTTY_FIXED_TITLE", "error", "Ghostty has a fixed global title that overrides tab titles", "Remove the title setting from Ghostty configuration."));
  }
  const bellFeatures = config.get("bell-features") ?? "";
  const bellTokens = bellFeatures.split(/[\s,]+/u).filter(Boolean);
  if (bellTokens.includes("title") && !bellTokens.includes("no-title")) {
    diagnostics.push(diagnostic("GHOSTTY_TITLE_BELL", "warning", "Ghostty title bell decoration can displace Agent Board's status prefix", "Add no-title to bell-features in Ghostty configuration."));
  }

  try {
    await new GhosttyClient({ runner, command: clientCommand }).current();
    automationReady = true;
  } catch (error) {
    if (error instanceof GhosttyAdapterError && error.ghosttyCode === "GHOSTTY_PERMISSION_DENIED") {
      diagnostics.push(diagnostic("GHOSTTY_AUTOMATION_DENIED", "error", "macOS Automation permission for Ghostty was denied", "Allow Agent Board to control Ghostty in System Settings > Privacy & Security > Automation."));
    } else if (error instanceof GhosttyAdapterError && error.ghosttyCode === "GHOSTTY_TARGET_NOT_FOUND") {
      diagnostics.push(diagnostic("GHOSTTY_NO_ACTIVE_TERMINAL", "error", "Ghostty has no usable active terminal", "Open a Ghostty window and terminal before registering an agent."));
    } else {
      diagnostics.push(diagnostic("GHOSTTY_AUTOMATION_UNAVAILABLE", "error", "Ghostty AppleScript could not discover the active terminal", "Ensure Ghostty is running, AppleScript is enabled, and Automation permission is granted."));
    }
  }

  return { version, automationReady, diagnostics };
}

export { parseConfig, parseVersion, versionSupported };
