import type { SessionStore } from "../domain/ports.js";
import type { SessionRecord } from "../domain/session.js";
import {
  applyAgentTransition,
  parseAgentTransition,
  type AgentTransition,
} from "../domain/transitions.js";

export interface ObserveAgentCommand {
  sessionId: string;
  transition: AgentTransition;
}

export async function observeAgent(
  store: SessionStore,
  command: ObserveAgentCommand,
): Promise<SessionRecord> {
  const transition = parseAgentTransition(command.transition);
  return store.mutate(command.sessionId, (current) => applyAgentTransition(current, transition));
}
