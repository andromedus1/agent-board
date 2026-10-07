import { basename } from "node:path";

import { AgentBoardError } from "../domain/errors.js";
import type { AgentAdapter } from "../domain/registries.js";
import type {
  Clock,
  IdGenerator,
  RegistrationStore,
  RegistrationTerminalPort,
  RepositoryContextPort,
} from "../domain/ports.js";
import { parseProjectLabel, type SessionRecord } from "../domain/session.js";
import { renderSessionTitle } from "./render-title.js";

export interface RegisterSessionInput {
  readonly projectLabel?: string;
  readonly targetSessionId?: string;
}

export interface RegisterSessionResult {
  readonly record: SessionRecord;
  readonly created: boolean;
}

export interface RegisterSessionDependencies {
  readonly adapter: AgentAdapter;
  readonly store: RegistrationStore;
  readonly terminal: RegistrationTerminalPort;
  readonly repositories: RepositoryContextPort;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly workingFreshForMs: number;
}

function timestamp(clock: Clock): string {
  const now = clock.now();
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new AgentBoardError("INVALID_RECORD", "Clock returned an invalid Date");
  }
  return now.toISOString();
}

function derivedLabel(value: string | undefined): string | undefined {
  if (value === undefined || value.length === 0) return undefined;
  const candidate = basename(value);
  if (candidate.length === 0) return undefined;
  try {
    return parseProjectLabel(candidate);
  } catch {
    return undefined;
  }
}

function chooseLabel(repositoryPath: string | undefined, workingDirectory: string | undefined): string {
  return derivedLabel(repositoryPath) ?? derivedLabel(workingDirectory) ?? "agent-board";
}

function isSameTerminal(record: SessionRecord, terminalId: string): boolean {
  return record.terminal.terminalId === terminalId;
}

function terminalIdentity(record: SessionRecord) {
  return {
    adapter: record.terminal.adapter,
    windowId: record.terminal.windowId,
    tabId: record.terminal.tabId,
    terminalId: record.terminal.terminalId,
  } as const;
}

export async function registerSession(
  dependencies: RegisterSessionDependencies,
  input: RegisterSessionInput = {},
): Promise<RegisterSessionResult> {
  // This is intentionally the first operation: invalid names must not cause
  // Ghostty, Git, state-store, or title side effects.
  const explicitLabel = input.projectLabel === undefined
    ? undefined
    : parseProjectLabel(input.projectLabel);

  if (input.targetSessionId !== undefined) {
    if (explicitLabel === undefined) {
      throw new AgentBoardError("INVALID_LABEL", "An explicit session rename requires a project label");
    }
    const renamed = await dependencies.store.mutate(input.targetSessionId, (current) => ({
      ...current,
      identity: { ...current.identity, projectLabel: explicitLabel },
    }));
    const record = await renderSessionTitle(dependencies, renamed.sessionId, {
      expectedIdentity: terminalIdentity(renamed),
    });
    return { record, created: false };
  }

  // Capture one focused snapshot. In particular, do not re-query after Git
  // discovery: the user may change focus while these bounded probes run.
  const focused = await dependencies.terminal.current();
  const repository = await dependencies.repositories.discover(focused.workingDirectory);
  const label = explicitLabel ?? chooseLabel(repository.repoPath, focused.workingDirectory);
  const observedAt = timestamp(dependencies.clock);

  const outcome = await dependencies.store.withRegistrationLock(async () => {
    const records = await dependencies.store.list();
    const matches = records.filter((record) => isSameTerminal(record, focused.terminalId));
    if (matches.length > 1) {
      throw new AgentBoardError("CONFLICT", `Multiple sessions are registered for terminal ${focused.terminalId}`);
    }

    const existing = matches[0];
    if (existing !== undefined) {
      if (existing.agent.adapter !== dependencies.adapter) {
        if (existing.agent.mode !== "ordinary") {
          throw new AgentBoardError("CONFLICT", `Terminal ${focused.terminalId} is already managed by ${existing.agent.adapter}`);
        }
        const adopted = await dependencies.store.mutate(existing.sessionId, (current) => {
          if (current.agent.mode !== "ordinary") {
            throw new AgentBoardError("CONFLICT", `Terminal ${focused.terminalId} became managed during provider adoption`);
          }
          const { nativeThreadId: _thread, nativeSessionId: _nativeSession, ...agent } = current.agent;
          return {
            ...current,
            identity: explicitLabel === undefined ? current.identity : { ...current.identity, projectLabel: explicitLabel },
            agent: { ...agent, adapter: dependencies.adapter },
          };
        });
        return { record: adopted, created: false };
      }
      if (explicitLabel === undefined) return { record: existing, created: false };
      const record = await dependencies.store.mutate(existing.sessionId, (current) => ({
        ...current,
        identity: { ...current.identity, projectLabel: explicitLabel },
      }));
      return { record, created: false };
    }

    const record: SessionRecord = {
      schemaVersion: 1,
      revision: 0,
      sessionId: dependencies.ids.sessionId(),
      identity: {
        projectLabel: label,
        ...(repository.repoPath === undefined ? {} : { repoPath: repository.repoPath }),
        ...(repository.gitBranch === undefined ? {} : { gitBranch: repository.gitBranch }),
        createdAt: observedAt,
      },
      terminal: {
        adapter: focused.adapter,
        windowId: focused.windowId,
        tabId: focused.tabId,
        terminalId: focused.terminalId,
        presence: "visible",
        observedAt,
      },
      agent: {
        adapter: dependencies.adapter,
        mode: "ordinary",
        activity: "idle",
        attention: "none",
        health: "live",
        observedAt,
        evidenceKind: "registration",
        confidence: "inferred",
      },
    };
    const created = await dependencies.store.create(record);
    return { record: created, created: true };
  });

  // Persistence is authoritative. This fresh read also means a concurrent
  // lifecycle update cannot be overwritten by a stale title projection.
  const record = await renderSessionTitle(
    dependencies,
    outcome.record.sessionId,
  );
  return { record, created: outcome.created };
}
