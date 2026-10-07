export type AgentBoardErrorCode =
  | "INVALID_RECORD"
  | "UNSUPPORTED_SCHEMA"
  | "INVALID_LABEL"
  | "NOT_FOUND"
  | "CONFLICT"
  | "LOCK_TIMEOUT"
  | "ADAPTER_FAILURE";

export class AgentBoardError extends Error {
  readonly code: AgentBoardErrorCode;
  readonly cause?: unknown;

  constructor(
    code: AgentBoardErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "AgentBoardError";
    this.code = code;
    this.cause = options?.cause;
  }
}
