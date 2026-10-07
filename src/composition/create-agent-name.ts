import { randomUUID } from "node:crypto";

import { registerSession, type RegisterSessionDependencies } from "../application/register-session.js";
import type { RegisterSessionInput, RegisterSessionResult } from "../application/register-session.js";
import { promptRenameSession, type PromptRenameSessionResult } from "../application/prompt-rename-session.js";
import type { FocusedTerminalPort, ProjectRenamePromptPort, RegistrationStore, RegistrationTerminalPort, RepositoryContextPort } from "../domain/ports.js";
import { JsonSessionStore } from "../infrastructure/json-session-store.js";
import { GitRepositoryContext } from "../integrations/git/repository-context.js";
import { GhosttyClient } from "../integrations/ghostty/client.js";
import { configuredCommand } from "../integrations/command-config.js";
import { MacOSRenamePrompt } from "../integrations/macos/rename-prompt.js";

export interface AgentNameCommand {
  register(input: RegisterSessionInput): Promise<RegisterSessionResult>;
  promptRename(): Promise<PromptRenameSessionResult>;
}

export interface AgentNameCompositionOptions {
  store?: RegistrationStore;
  terminal?: RegistrationTerminalPort & FocusedTerminalPort;
  repositories?: RepositoryContextPort;
  prompt?: ProjectRenamePromptPort;
  workingFreshForMs?: number;
}

export function createAgentNameCommand(options: AgentNameCompositionOptions = {}): AgentNameCommand {
  const osascriptCommand = configuredCommand("AGENT_BOARD_OSASCRIPT_COMMAND", "/usr/bin/osascript");
  const store = options.store ?? new JsonSessionStore();
  const terminal = options.terminal ?? new GhosttyClient({ command: osascriptCommand });
  const clock = { now: () => new Date() };
  const workingFreshForMs = options.workingFreshForMs ?? 60_000;
  const dependencies: RegisterSessionDependencies = {
    adapter: "codex",
    store,
    terminal,
    repositories: options.repositories ?? new GitRepositoryContext(),
    clock,
    ids: { sessionId: () => randomUUID() },
    workingFreshForMs,
  };
  return {
    register: (input) => registerSession(dependencies, input),
    promptRename: () => promptRenameSession({
      store,
      terminal,
      prompt: options.prompt ?? new MacOSRenamePrompt({ command: osascriptCommand }),
      clock,
      workingFreshForMs,
    }),
  };
}
