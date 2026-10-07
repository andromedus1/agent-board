import { listSessions, type BoardRow, type ListSessionsDependencies } from "../application/list-sessions.js";
import type { LauncherLivenessPort, ReconciliationTerminalPort, SessionStore } from "../domain/ports.js";
import { JsonSessionStore } from "../infrastructure/json-session-store.js";
import { GhosttyClient } from "../integrations/ghostty/client.js";
import { configuredCommand } from "../integrations/command-config.js";
import { NodeLauncherLiveness } from "../integrations/launcher-liveness.js";

export interface AgentsCommand {
  readonly list: () => Promise<readonly BoardRow[]>;
}

export interface AgentsCompositionOptions {
  readonly store?: SessionStore;
  readonly terminal?: ReconciliationTerminalPort;
  readonly launcher?: LauncherLivenessPort;
  readonly workingFreshForMs?: number;
}

export function createAgentsCommand(options: AgentsCompositionOptions = {}): AgentsCommand {
  const dependencies: ListSessionsDependencies = {
    store: options.store ?? new JsonSessionStore(),
    terminal: options.terminal ?? new GhosttyClient({ command: configuredCommand("AGENT_BOARD_OSASCRIPT_COMMAND", "/usr/bin/osascript") }),
    launcher: options.launcher ?? new NodeLauncherLiveness(),
    clock: { now: () => new Date() },
    workingFreshForMs: options.workingFreshForMs ?? 60_000,
  };
  return { list: () => listSessions(dependencies) };
}
