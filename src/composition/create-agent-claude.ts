import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import { launchManagedClaude, type ManagedClaudeLaunchDependencies, type ManagedClaudeLaunchResult } from "../application/launch-managed-claude.js";
import { observeClaudeHook, type ObserveClaudeHookDependencies } from "../application/observe-claude-hook.js";
import { registerSession, type RegisterSessionDependencies } from "../application/register-session.js";
import type { FocusedTerminalPort, LauncherLivenessPort, RegistrationStore, RegistrationTerminalPort, RepositoryContextPort, ReconciliationTerminalPort, SessionStore } from "../domain/ports.js";
import { ClaudeProcessHost } from "../integrations/claude/process.js";
import { configuredCommand } from "../integrations/command-config.js";
import { GitRepositoryContext } from "../integrations/git/repository-context.js";
import { GhosttyClient } from "../integrations/ghostty/client.js";
import { NodeLauncherLiveness } from "../integrations/launcher-liveness.js";
import { JsonSessionStore } from "../infrastructure/json-session-store.js";

export interface AgentClaudeCommand {
  launch(args: readonly string[], signal: AbortSignal): Promise<ManagedClaudeLaunchResult>;
}

export interface AgentClaudeCompositionOptions {
  readonly store?: RegistrationStore & SessionStore;
  readonly terminal?: RegistrationTerminalPort & ReconciliationTerminalPort & FocusedTerminalPort;
  readonly repositories?: RepositoryContextPort;
  readonly processes?: ManagedClaudeLaunchDependencies["processes"];
  readonly launcher?: LauncherLivenessPort;
  readonly pluginRoot?: string;
  readonly workingFreshForMs?: number;
  readonly focusPollIntervalMs?: number;
  readonly hookReadyTimeoutMs?: number;
}

export function agentClaudePluginRoot(): string {
  return fileURLToPath(new URL("../../assets/claude-plugin", import.meta.url));
}

function shared(options: AgentClaudeCompositionOptions) {
  const store = options.store ?? new JsonSessionStore();
  const terminal = options.terminal ?? new GhosttyClient({ command: configuredCommand("AGENT_BOARD_OSASCRIPT_COMMAND", "/usr/bin/osascript") });
  const clock = { now: () => new Date() };
  const launcher = options.launcher ?? new NodeLauncherLiveness();
  const workingFreshForMs = options.workingFreshForMs ?? 60_000;
  return { store, terminal, clock, launcher, workingFreshForMs };
}

export function createAgentClaudeCommand(options: AgentClaudeCompositionOptions = {}): AgentClaudeCommand {
  const dependencies = shared(options);
  const repositories = options.repositories ?? new GitRepositoryContext();
  const registerDependencies: RegisterSessionDependencies = {
    adapter: "claude",
    store: dependencies.store,
    terminal: dependencies.terminal,
    repositories,
    clock: dependencies.clock,
    ids: { sessionId: () => randomUUID() },
    workingFreshForMs: dependencies.workingFreshForMs,
  };
  const launchDependencies: ManagedClaudeLaunchDependencies = {
    register: () => registerSession(registerDependencies),
    processes: options.processes ?? new ClaudeProcessHost({ command: configuredCommand("AGENT_BOARD_CLAUDE_COMMAND", "claude") }),
    pluginRoot: options.pluginRoot ?? agentClaudePluginRoot(),
    ...dependencies,
    focusPollIntervalMs: options.focusPollIntervalMs ?? 1_000,
    hookReadyTimeoutMs: options.hookReadyTimeoutMs ?? 3_000,
  };
  return { launch: (args, signal) => launchManagedClaude(launchDependencies, args, signal) };
}

export interface ClaudeHookCommand {
  observe(sessionId: string, input: unknown): Promise<void>;
}

export function createClaudeHookCommand(options: AgentClaudeCompositionOptions = {}): ClaudeHookCommand {
  const dependencies: ObserveClaudeHookDependencies = shared(options);
  return { observe: (sessionId, input) => observeClaudeHook(dependencies, sessionId, input) };
}
