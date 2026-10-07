import { AgentBoardError } from "../domain/errors.js";
import type { Clock, SessionStore } from "../domain/ports.js";
import type { Observation, SessionRecord } from "../domain/session.js";
import { observeAgent } from "./observe-agent.js";
import { bindCodexThread, type ThreadBindingClient } from "../integrations/codex/thread-binding.js";
import {
  mapCodexNotification,
  mapInitialCodexStatus,
  type CodexLifecycleContext,
} from "../integrations/codex/lifecycle.js";

export interface ObserveManagedCodexDependencies {
  readonly client: ThreadBindingClient;
  readonly store: SessionStore;
  readonly clock: Clock;
  readonly bindTimeoutMs: number;
  readonly onRecord?: (record: SessionRecord) => Promise<void> | void;
}

export interface ObserveManagedCodexInput {
  readonly sessionId: string;
  readonly expectedWorkingDirectory?: string;
}

function timestamp(clock: Clock): string {
  const now = clock.now();
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new AgentBoardError("INVALID_RECORD", "Clock returned an invalid Date");
  }
  return now.toISOString();
}

function adapterFailure(message: string, cause?: unknown): AgentBoardError {
  return new AgentBoardError("ADAPTER_FAILURE", message, { cause });
}

async function notify(
  callback: ObserveManagedCodexDependencies["onRecord"],
  record: SessionRecord,
): Promise<void> {
  if (callback !== undefined) await callback(record);
}

async function recordFailure(
  dependencies: ObserveManagedCodexDependencies,
  sessionId: string,
  cause: unknown,
): Promise<void> {
  let observedAt: string;
  try { observedAt = timestamp(dependencies.clock); } catch { return; }
  try {
    const record = await observeAgent(dependencies.store, {
      sessionId,
      transition: {
        type: "error",
        observedAt,
        evidenceKind: "codex.adapter.failure",
        confidence: "corroborated",
        detail: "Codex lifecycle adapter failed; inspect diagnostics",
      },
    });
    await notify(dependencies.onRecord, record);
  } catch {
    // The original adapter failure is more actionable than a missing session,
    // concurrent cleanup, or a renderer failure during best-effort reporting.
    void cause;
  }
}

function initialContext(threadId: string, status: CodexLifecycleContext["previousStatus"]): CodexLifecycleContext {
  return {
    threadId,
    previousStatus: status,
    waiting: false,
  };
}

export async function observeManagedCodex(
  dependencies: ObserveManagedCodexDependencies,
  input: ObserveManagedCodexInput,
  signal: AbortSignal,
): Promise<void> {
  let iterator: AsyncIterator<import("../integrations/codex/protocol.js").CodexNotification> | undefined;
  try {
    const bound = await bindCodexThread(dependencies.client, {
      expectedWorkingDirectory: input.expectedWorkingDirectory,
      timeoutMs: dependencies.bindTimeoutMs,
      signal,
    });
    iterator = bound.notifications;

    const boundRecord = await dependencies.store.mutate(input.sessionId, (current) => {
      const existingThread = current.agent.nativeThreadId;
      if (existingThread !== undefined && existingThread !== bound.threadId) {
        throw new AgentBoardError("CONFLICT", "Session is already bound to a different Codex thread");
      }
      return {
        ...current,
        agent: {
          ...current.agent,
          mode: "managed" as const,
          nativeThreadId: bound.threadId,
        },
      };
    });
    await notify(dependencies.onRecord, boundRecord);
    if (signal.aborted) return;

    const initialObservedAt = timestamp(dependencies.clock);
    const initialObservation: Observation = {
      observedAt: initialObservedAt,
      evidenceKind: `codex.thread.loaded.status.${bound.initialStatus.type}`,
      confidence: bound.confidence,
    };
    const initial = mapInitialCodexStatus(bound.initialStatus, initialObservation);
    let context: CodexLifecycleContext = {
      ...initialContext(bound.threadId, initial.nextStatus),
      waiting: initial.waiting,
    };
    if (initial.transition !== undefined) {
      const record = await observeAgent(dependencies.store, { sessionId: input.sessionId, transition: initial.transition });
      await notify(dependencies.onRecord, record);
    }

    while (!signal.aborted) {
      const next = await iterator.next();
      if (next.done) throw adapterFailure("Codex notification stream closed unexpectedly");
      if (signal.aborted) return;
      const mapped = mapCodexNotification(next.value, context, timestamp(dependencies.clock));
      context = {
        threadId: bound.threadId,
        ...(mapped.nextStatus === undefined
          ? (context.previousStatus === undefined ? {} : { previousStatus: context.previousStatus })
          : { previousStatus: mapped.nextStatus }),
        waiting: mapped.waiting,
      };
      if (mapped.transition === undefined) continue;
      const record = await observeAgent(dependencies.store, { sessionId: input.sessionId, transition: mapped.transition });
      await notify(dependencies.onRecord, record);
    }
  } catch (error) {
    if (signal.aborted) return;
    await recordFailure(dependencies, input.sessionId, error);
    throw error;
  } finally {
    if (signal.aborted || iterator !== undefined) {
      try { await iterator?.return?.(); } catch { /* cleanup must not mask lifecycle failure */ }
    }
  }
}
