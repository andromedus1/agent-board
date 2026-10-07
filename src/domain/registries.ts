export const ACTIVITIES = ["unknown", "idle", "working"] as const;
export const ATTENTIONS = ["none", "completion_unread", "input_required"] as const;
export const HEALTH_STATES = ["live", "stale", "error"] as const;
export const TERMINAL_PRESENCES = ["visible", "hidden", "missing", "unknown"] as const;
export const CONFIDENCE_LEVELS = ["authoritative", "corroborated", "inferred"] as const;
export const AGENT_MODES = ["managed", "ordinary"] as const;
export const AGENT_ADAPTERS = ["codex", "claude"] as const;

export type Activity = (typeof ACTIVITIES)[number];
export type Attention = (typeof ATTENTIONS)[number];
export type HealthState = (typeof HEALTH_STATES)[number];
export type TerminalPresence = (typeof TERMINAL_PRESENCES)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type AgentMode = (typeof AGENT_MODES)[number];
export type AgentAdapter = (typeof AGENT_ADAPTERS)[number];

export interface AgentAdapterCapabilities {
  readonly workingWhileLauncherAlive: boolean;
  readonly observation: "native-stream" | "native-hooks";
  readonly semanticControl: "none";
}

export const AGENT_ADAPTER_CAPABILITIES: Readonly<Record<AgentAdapter, AgentAdapterCapabilities>> =
  Object.freeze({
    codex: Object.freeze({ workingWhileLauncherAlive: true, observation: "native-stream", semanticControl: "none" }),
    claude: Object.freeze({ workingWhileLauncherAlive: false, observation: "native-hooks", semanticControl: "none" }),
  });
