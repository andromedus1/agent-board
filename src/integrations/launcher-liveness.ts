import type { LauncherLivenessPort } from "../domain/ports.js";

export interface NodeLauncherLivenessOptions {
  readonly kill?: typeof process.kill;
}

/**
 * Uses signal zero to test local process existence without delivering a
 * terminating signal. The adapter deliberately reports uncertainty as dead so
 * callers retain conservative diagnostic behavior.
 */
export class NodeLauncherLiveness implements LauncherLivenessPort {
  private readonly kill: typeof process.kill;

  constructor(options: NodeLauncherLivenessOptions = {}) {
    this.kill = options.kill ?? process.kill;
  }

  async isAlive(pid: number): Promise<boolean> {
    if (!Number.isSafeInteger(pid) || pid <= 0) return false;
    try {
      this.kill(pid, 0);
      return true;
    } catch (error) {
      return typeof error === "object" && error !== null &&
        (error as { code?: unknown }).code === "EPERM";
    }
  }
}
