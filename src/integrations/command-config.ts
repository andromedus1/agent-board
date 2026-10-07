import { isAbsolute } from "node:path";

import { AgentBoardError } from "../domain/errors.js";

/** Resolve an executable override without allowing shell fragments. */
export function configuredCommand(
  envName: string,
  fallback: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const value = env[envName]?.trim();
  if (value === undefined || value.length === 0) return fallback;
  if (!isAbsolute(value)) {
    throw new AgentBoardError("ADAPTER_FAILURE", `${envName} must be an absolute executable path`);
  }
  return value;
}
