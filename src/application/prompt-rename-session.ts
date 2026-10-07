import { AgentBoardError } from "../domain/errors.js";
import type {
  Clock,
  FocusedTerminalPort,
  ProjectRenamePromptPort,
  RegistrationTerminalPort,
  SessionStore,
} from "../domain/ports.js";
import { parseProjectLabel, type SessionRecord, type TerminalIdentity } from "../domain/session.js";
import { renderSessionTitle } from "./render-title.js";
import { resolveSessionTarget } from "./resolve-session-target.js";

export interface PromptRenameSessionDependencies {
  readonly store: SessionStore;
  readonly terminal: FocusedTerminalPort & Pick<RegistrationTerminalPort, "setTitle">;
  readonly prompt: ProjectRenamePromptPort;
  readonly clock: Clock;
  readonly workingFreshForMs: number;
}

export type PromptRenameSessionResult =
  | { readonly status: "cancelled" }
  | { readonly status: "renamed"; readonly record: SessionRecord };

function terminalIdentity(record: SessionRecord): TerminalIdentity {
  return {
    adapter: record.terminal.adapter,
    windowId: record.terminal.windowId,
    tabId: record.terminal.tabId,
    terminalId: record.terminal.terminalId,
  };
}

function sameIdentity(record: SessionRecord, expected: TerminalIdentity): boolean {
  return record.terminal.adapter === expected.adapter &&
    record.terminal.windowId === expected.windowId &&
    record.terminal.tabId === expected.tabId &&
    record.terminal.terminalId === expected.terminalId;
}

export async function promptRenameSession(
  dependencies: PromptRenameSessionDependencies,
): Promise<PromptRenameSessionResult> {
  // Resolve before the dialog appears: the native prompt becomes frontmost and
  // therefore cannot be used as evidence for which Ghostty tab was selected.
  const target = await resolveSessionTarget(dependencies.store, dependencies.terminal);
  const expectedIdentity = terminalIdentity(target);
  const requestedLabel = await dependencies.prompt.prompt(target.identity.projectLabel);
  if (requestedLabel === null) return { status: "cancelled" };

  const projectLabel = parseProjectLabel(requestedLabel);
  const renamed = await dependencies.store.mutate(target.sessionId, (current) => {
    if (!sameIdentity(current, expectedIdentity)) {
      throw new AgentBoardError(
        "CONFLICT",
        `Session ${target.sessionId} no longer matches the focused Ghostty terminal`,
      );
    }
    return {
      ...current,
      identity: { ...current.identity, projectLabel },
    };
  });

  const record = await renderSessionTitle(dependencies, renamed.sessionId, { expectedIdentity });
  return { status: "renamed", record };
}
