import { AgentBoardError } from "../domain/errors.js";
import { ObservationSchema, type SessionRecord } from "../domain/session.js";
import type { SessionStore } from "../domain/ports.js";

export type AcknowledgementSource = "explicit" | "ghostty-focus";

function validateAcknowledgement(source: unknown, observedAt: unknown): asserts source is AcknowledgementSource {
  if (source !== "explicit" && source !== "ghostty-focus") {
    throw new AgentBoardError("INVALID_RECORD", "Invalid acknowledgement source");
  }
  const result = ObservationSchema.safeParse({
    observedAt,
    evidenceKind: "board.acknowledgement",
    confidence: "authoritative",
  });
  if (!result.success) {
    throw new AgentBoardError("INVALID_RECORD", "Invalid acknowledgement timestamp", {
      cause: result.error,
    });
  }
}

function timestamp(value: string): number {
  return Date.parse(value);
}

export async function acknowledgeCompletion(
  store: SessionStore,
  sessionId: string,
  source: AcknowledgementSource,
  observedAt: string,
): Promise<SessionRecord> {
  validateAcknowledgement(source, observedAt);

  const current = await store.get(sessionId);
  if (current === null) {
    throw new AgentBoardError("NOT_FOUND", `Session not found: ${sessionId}`);
  }
  if (current.agent.attention !== "completion_unread") return current;

  return store.mutate(sessionId, (latest) => {
    if (
      latest.agent.attention !== "completion_unread" ||
      latest.agent.completionObservedAt === undefined ||
      timestamp(observedAt) < timestamp(latest.agent.completionObservedAt)
    ) {
      return latest;
    }

    const {
      detail: _detail,
      completionObservedAt: _completionObservedAt,
      ...agentWithoutAttentionEvidence
    } = latest.agent;
    return {
      ...latest,
      agent: {
        ...agentWithoutAttentionEvidence,
        attention: "none",
        observedAt,
        evidenceKind: "board.acknowledgement",
        confidence: "authoritative",
        detail: `${source} acknowledgement`,
      },
    };
  });
}
