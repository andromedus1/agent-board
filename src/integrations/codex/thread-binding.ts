import { resolve } from "node:path";

import { AgentBoardError } from "../../domain/errors.js";
import {
  type CodexNotification,
  type ThreadLoadedListResult,
  type ThreadStartedParams,
} from "./protocol.js";

export interface ThreadBindingClient {
  loadedThreads(signal?: AbortSignal): Promise<ThreadLoadedListResult>;
  notifications(signal?: AbortSignal): AsyncIterable<CodexNotification>;
}

export interface BindCodexThreadOptions {
  readonly expectedWorkingDirectory?: string;
  readonly timeoutMs: number;
  readonly signal?: AbortSignal;
}

export interface BoundCodexThread {
  readonly threadId: string;
  readonly initialStatus: ThreadLoadedListResult["data"][number]["status"];
  readonly confidence: "authoritative" | "corroborated";
  readonly notifications: AsyncIterator<CodexNotification>;
}

type LoadedThread = ThreadLoadedListResult["data"][number];

function failure(message: string, cause?: unknown): AgentBoardError {
  return new AgentBoardError("ADAPTER_FAILURE", message, { cause });
}

function validateTimeout(timeoutMs: number): void {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) {
    throw failure("Codex thread binding timeout must be a positive safe integer");
  }
}

function normalizedPath(value: string): string {
  return resolve(value);
}

function viable(thread: LoadedThread, expectedWorkingDirectory: string | undefined): boolean {
  // A parentThreadId is explicit evidence that this is not the dedicated TUI's
  // root. Never use array order or timing to choose a child thread.
  if (thread.parentThreadId !== undefined && thread.parentThreadId !== null) return false;
  if (expectedWorkingDirectory !== undefined && thread.cwd !== undefined) {
    return normalizedPath(thread.cwd) === expectedWorkingDirectory;
  }
  return true;
}

function confidenceFor(
  thread: LoadedThread,
  expectedWorkingDirectory: string | undefined,
): "authoritative" | "corroborated" {
  return expectedWorkingDirectory !== undefined &&
    thread.cwd !== undefined &&
    normalizedPath(thread.cwd) === expectedWorkingDirectory &&
    thread.parentThreadId === null
    ? "authoritative"
    : "corroborated";
}

function candidates(threads: readonly LoadedThread[], expectedWorkingDirectory: string | undefined): LoadedThread[] {
  const unique = new Map<string, LoadedThread>();
  for (const thread of threads) {
    if (viable(thread, expectedWorkingDirectory) && !unique.has(thread.id)) unique.set(thread.id, thread);
  }
  return [...unique.values()];
}

function fromStarted(notification: CodexNotification): LoadedThread | undefined {
  if (notification.method !== "thread/started") return undefined;
  return notification.params.thread;
}

function remaining(deadline: number): number {
  return Math.max(0, deadline - Date.now());
}

async function bounded<T>(promise: Promise<T>, deadline: number, signal: AbortSignal): Promise<T> {
  const time = remaining(deadline);
  if (time <= 0) throw failure("Timed out binding Codex root thread");
  return new Promise<T>((resolvePromise, reject) => {
    const timer = setTimeout(() => reject(failure("Timed out binding Codex root thread")), time);
    const abort = () => reject(failure("Codex root-thread binding aborted"));
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolvePromise, reject).finally(() => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
    }).catch(() => undefined);
  });
}

async function nextBounded(
  iterator: AsyncIterator<CodexNotification>,
  deadline: number,
  signal: AbortSignal,
): Promise<IteratorResult<CodexNotification>> {
  return bounded(iterator.next(), deadline, signal);
}

export async function bindCodexThread(
  client: ThreadBindingClient,
  options: BindCodexThreadOptions,
): Promise<BoundCodexThread> {
  validateTimeout(options.timeoutMs);
  const expectedWorkingDirectory = options.expectedWorkingDirectory === undefined
    ? undefined
    : normalizedPath(options.expectedWorkingDirectory);
  const deadline = Date.now() + options.timeoutMs;
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  const stream = client.notifications(controller.signal);
  const iterator = stream[Symbol.asyncIterator]();
  let bound = false;

  // The production subscription has no iterator.return(). This wrapper keeps
  // the caller's abort linked for the full observation lifetime and provides a
  // single release seam regardless of the underlying iterator shape.
  const linkedIterator: AsyncIterator<CodexNotification> = {
    next: () => iterator.next(),
    return: async () => {
      options.signal?.removeEventListener("abort", abort);
      controller.abort();
      try {
        return await iterator.return?.() ?? { done: true, value: undefined };
      } catch {
        return { done: true, value: undefined };
      }
    },
  };

  const finish = (thread: LoadedThread): BoundCodexThread => {
    bound = true;
    return {
      threadId: thread.id,
      initialStatus: thread.status,
      confidence: confidenceFor(thread, expectedWorkingDirectory),
      notifications: linkedIterator,
    };
  };

  try {
    if (options.signal?.aborted) throw failure("Codex root-thread binding aborted");
    // Subscription must be established before discovery: a root started during
    // thread/loaded/list remains queued on this exact iterator for the caller.
    let loaded = await bounded(client.loadedThreads(controller.signal), deadline, controller.signal);
    while (true) {
      const roots = candidates(loaded.data, expectedWorkingDirectory);
      if (roots.length > 1) throw failure(`Ambiguous Codex root-thread binding (${roots.length} viable candidates)`);
      if (roots.length === 1) return finish(roots[0]);

      const event = await nextBounded(iterator, deadline, controller.signal);
      if (event.done) throw failure("Codex notification stream closed before root-thread binding");
      const started = fromStarted(event.value);
      if (started !== undefined) {
        if (viable(started, expectedWorkingDirectory)) {
          const startedRoots = candidates([started], expectedWorkingDirectory);
          if (startedRoots.length === 1) return finish(startedRoots[0]);
        }
        continue;
      }

      if (event.value.method === "thread/status/changed") {
        // A status event for an unknown thread may be the only evidence emitted
        // by a version that races thread/started. Refresh once per observation;
        // the outer deadline is the bound against an event storm.
        const known = loaded.data.some((thread) => thread.id === event.value.params.threadId);
        if (!known) loaded = await bounded(client.loadedThreads(controller.signal), deadline, controller.signal);
      }
    }
  } catch (error) {
    if (error instanceof AgentBoardError) throw error;
    throw failure("Codex root-thread binding failed", error);
  } finally {
    if (!bound) {
      options.signal?.removeEventListener("abort", abort);
      controller.abort();
      try { await iterator.return?.(); } catch { /* cleanup must not mask binding failure */ }
    }
  }
}

export type { ThreadStartedParams };
