import type {
  SessionRecord,
  TerminalIdentity,
  TerminalObservation,
} from "./session.js";

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  sessionId(): string;
}

export type SessionMutation = (
  current: Readonly<SessionRecord>,
) => SessionRecord;

export interface SessionStore {
  get(sessionId: string): Promise<SessionRecord | null>;
  list(): Promise<readonly SessionRecord[]>;
  create(record: SessionRecord): Promise<SessionRecord>;
  mutate(sessionId: string, mutation: SessionMutation): Promise<SessionRecord>;
  remove(sessionId: string): Promise<void>;
}

/** The focused terminal snapshot used when a session is first registered. */
export type FocusedTerminalContext = TerminalIdentity & {
  readonly workingDirectory?: string;
};

/** Serializes terminal-ID lookup/create across all store instances. */
export interface RegistrationStore extends SessionStore {
  withRegistrationLock<T>(operation: () => Promise<T>): Promise<T>;
}

/** The small terminal surface required by registration and title rendering. */
export interface RegistrationTerminalPort {
  current(): Promise<FocusedTerminalContext>;
  setTitle(identity: TerminalIdentity, title: string): Promise<void>;
}

/** Returns a terminal only when Ghostty itself is the frontmost application. */
export interface FocusedTerminalPort {
  focused(): Promise<TerminalIdentity | null>;
}

/** One atomic view of the current Ghostty hierarchy and live terminals. */
export interface TerminalSnapshot {
  readonly visible: readonly TerminalIdentity[];
  readonly enumerableTerminalIds: readonly string[];
}

/** Terminal operations used by reconciliation and explicit unregister. */
export interface ReconciliationTerminalPort {
  snapshot(): Promise<TerminalSnapshot>;
  setTitle(identity: TerminalIdentity, title: string): Promise<void>;
  clearTitle(identity: TerminalIdentity): Promise<void>;
}

export interface RepositoryContext {
  readonly repoPath?: string;
  readonly gitBranch?: string;
}

export interface RepositoryContextPort {
  discover(workingDirectory?: string): Promise<RepositoryContext>;
}

/** Native user interaction for editing a project label. Null means Cancel. */
export interface ProjectRenamePromptPort {
  prompt(currentLabel: string): Promise<string | null>;
}

export interface TerminalPort {
  current(): Promise<TerminalObservation>;
  inspect(identity: TerminalIdentity): Promise<TerminalObservation>;
  setTitle(identity: TerminalIdentity, title: string): Promise<void>;
  clearTitle(identity: TerminalIdentity): Promise<void>;
}

export interface AgentObservationSource {
  observations(signal: AbortSignal): AsyncIterable<unknown>;
}

/** Establishes whether a managed launcher process still exists. */
export interface LauncherLivenessPort {
  isAlive(pid: number): Promise<boolean>;
}
