import { randomUUID } from "node:crypto";
import { registerSession, type RegisterSessionDependencies } from "../application/register-session.js";
import { launchManagedCodex, type ManagedLaunchDependencies, type ManagedLaunchResult } from "../application/launch-managed-codex.js";
import { AppServerClient } from "../integrations/codex/client.js";
import { CodexProcessHost } from "../integrations/codex/process.js";
import { GitRepositoryContext } from "../integrations/git/repository-context.js";
import { GhosttyClient } from "../integrations/ghostty/client.js";
import { JsonSessionStore } from "../infrastructure/json-session-store.js";
import type { FocusedTerminalPort, LauncherLivenessPort, RegistrationStore, RegistrationTerminalPort, RepositoryContextPort, ReconciliationTerminalPort, SessionStore } from "../domain/ports.js";
import { configuredCommand } from "../integrations/command-config.js";
import { NodeLauncherLiveness } from "../integrations/launcher-liveness.js";

export interface AgentCodexCommand {
  launch(args: readonly string[], signal: AbortSignal): Promise<ManagedLaunchResult>;
}

export interface AgentCodexCompositionOptions {
  store?: RegistrationStore & SessionStore;
  terminal?: RegistrationTerminalPort & ReconciliationTerminalPort & FocusedTerminalPort;
  repositories?: RepositoryContextPort;
  processes?: ManagedLaunchDependencies["processes"];
  workingFreshForMs?: number;
  bindTimeoutMs?: number;
  focusPollIntervalMs?: number;
  launcher?: LauncherLivenessPort;
}

export function createAgentCodexCommand(options: AgentCodexCompositionOptions = {}): AgentCodexCommand {
  const store = options.store ?? new JsonSessionStore();
  const terminal = options.terminal ?? new GhosttyClient({ command: configuredCommand("AGENT_BOARD_OSASCRIPT_COMMAND", "/usr/bin/osascript") });
  const repositories = options.repositories ?? new GitRepositoryContext();
  const processes = options.processes ?? new CodexProcessHost({ command: configuredCommand("AGENT_BOARD_CODEX_COMMAND", "codex") });
  const registerDependencies: RegisterSessionDependencies = {
    adapter: "codex",
    store,
    terminal,
    repositories,
    clock: { now: () => new Date() },
    ids: { sessionId: () => randomUUID() },
    workingFreshForMs: options.workingFreshForMs ?? 60_000,
  };
  const dependencies: ManagedLaunchDependencies = {
    register: () => registerSession(registerDependencies),
    processes,
    connectClient: (endpoint) => AppServerClient.connect(endpoint),
    store,
    terminal,
    launcher: options.launcher ?? new NodeLauncherLiveness(),
    clock: registerDependencies.clock,
    workingFreshForMs: options.workingFreshForMs ?? 60_000,
    bindTimeoutMs: options.bindTimeoutMs ?? 10_000,
    focusPollIntervalMs: options.focusPollIntervalMs ?? 1_000,
  };
  return { launch: (args, signal) => launchManagedCodex(dependencies, args, signal) };
}
