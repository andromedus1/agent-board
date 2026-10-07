import { acknowledgeCompletion } from "./acknowledge.js";
import type { Clock, FocusedTerminalPort, SessionStore } from "../domain/ports.js";
import type { SessionRecord, TerminalIdentity } from "../domain/session.js";

export interface CompletionFocusWatcherDependencies {
  readonly store: SessionStore;
  readonly terminal: FocusedTerminalPort;
  readonly clock: Clock;
  readonly pollIntervalMs: number;
  readonly sleep?: (milliseconds: number, signal: AbortSignal) => Promise<void>;
  readonly onRecord?: (record: SessionRecord) => Promise<void> | void;
}

function sameTerminal(left: TerminalIdentity, right: TerminalIdentity): boolean {
  return left.adapter === right.adapter && left.windowId === right.windowId &&
    left.tabId === right.tabId && left.terminalId === right.terminalId;
}

function defaultSleep(milliseconds: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(new Error("aborted"));
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(new Error("aborted"));
    };
    signal.addEventListener("abort", abort, { once: true });
    timer.unref?.();
  });
}

function validPollInterval(value: number): void {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error("Completion focus poll interval must be a positive safe integer");
}

export async function watchCompletionFocus(
  dependencies: CompletionFocusWatcherDependencies,
  sessionId: string,
  signal: AbortSignal,
): Promise<void> {
  validPollInterval(dependencies.pollIntervalMs);
  const sleep = dependencies.sleep ?? defaultSleep;
  while (!signal.aborted) {
    const current = await dependencies.store.get(sessionId);
    if (current === null || signal.aborted) return;
    if (current.agent.attention === "completion_unread") {
      try {
        const focused = await dependencies.terminal.focused();
        if (focused !== null && sameTerminal(current.terminal, focused)) {
          const observedAt = dependencies.clock.now().toISOString();
          const acknowledged = await acknowledgeCompletion(dependencies.store, sessionId, "ghostty-focus", observedAt);
          if (acknowledged.agent.attention === "none") await dependencies.onRecord?.(acknowledged);
        }
      } catch {
        // Focus evidence is advisory. A permission/automation/target failure
        // must preserve unread attention for explicit `agent-board ack`.
      }
    }
    try { await sleep(dependencies.pollIntervalMs, signal); }
    catch { if (signal.aborted) return; }
  }
}
