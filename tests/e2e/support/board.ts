import assert from "node:assert/strict";

import type { PackageHarness } from "./package-harness.js";

export interface PackagedBoardRow {
  readonly sessionId: string;
  readonly label: string;
  readonly glyph: string;
  readonly status: string;
  readonly agentMode: string;
  readonly adapter: string;
  readonly evidenceKind: string;
  readonly adapterCapabilities: {
    readonly workingWhileLauncherAlive: boolean;
    readonly observation: string;
    readonly semanticControl: string;
  };
  readonly titleRendered: boolean;
  readonly diagnostics: readonly string[];
}

export async function readBoardRows(harness: PackageHarness): Promise<PackagedBoardRow[]> {
  const result = await harness.run("agents", ["--json"]);
  assert.equal(result.code, 0, result.stderr);
  assert.notEqual(result.stdout, "", "agents --json exited successfully without output");
  return (JSON.parse(result.stdout) as { sessions: PackagedBoardRow[] }).sessions;
}

export async function waitForBoardRow(
  harness: PackageHarness,
  predicate: (row: PackagedBoardRow) => boolean,
  timeoutMs = 2_000,
): Promise<PackagedBoardRow> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = (await readBoardRows(harness)).find(predicate);
    if (match) return match;
    await new Promise<void>((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`Timed out waiting for board row: ${JSON.stringify(await readBoardRows(harness))}`);
}
