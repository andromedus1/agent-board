import assert from "node:assert/strict";
import { test } from "node:test";

import { diagnoseSystem, type DoctorDependencies } from "../../src/application/doctor.js";
import type { GhosttyDiagnosticReport } from "../../src/integrations/ghostty/diagnostics.js";

const cleanGhostty: GhosttyDiagnosticReport = {
  version: "1.3.1",
  automationReady: true,
  diagnostics: [],
};

function dependencies(overrides: Partial<DoctorDependencies> = {}): DoctorDependencies {
  return {
    clock: { now: () => new Date("2026-08-15T00:00:00.000Z") },
    nodeVersion: "22.12.0",
    state: { probe: async () => "/private/state" },
    codex: { compatibility: async () => ({ compatible: true, version: "0.147.2" }) },
    claude: { compatibility: async () => ({ compatible: true, version: "2.1.226", tested: true }), validatePlugin: async () => undefined },
    ghostty: async () => cleanGhostty,
    ...overrides,
  };
}

test("diagnoseSystem runs every component, orders evidence, and freezes the report", async () => {
  const calls: string[] = [];
  const report = await diagnoseSystem(dependencies({
    state: { probe: async () => { calls.push("state"); throw new Error("permission denied"); } },
    codex: { compatibility: async () => { calls.push("codex"); throw new Error("codex missing"); } },
    ghostty: async () => { calls.push("ghostty"); return cleanGhostty; },
  }));

  assert.deepEqual(calls, ["state", "codex", "ghostty"]);
  assert.equal(report.ready, false);
  assert.deepEqual(report.checks.map((item) => item.component), ["runtime", "state", "codex", "claude", "claude", "ghostty", "ghostty"]);
  assert.deepEqual(report.checks.map((item) => item.code), [
    "RUNTIME_SUPPORTED",
    "STATE_DIRECTORY_UNAVAILABLE",
    "CODEX_UNAVAILABLE",
    "CLAUDE_COMPATIBLE",
    "CLAUDE_PLUGIN_VALID",
    "GHOSTTY_AUTOMATION_READY",
    "GHOSTTY_VERSION_SUPPORTED",
  ]);
  assert.equal(Object.isFrozen(report), true);
  assert.equal(Object.isFrozen(report.checks), true);
  assert.equal(Object.isFrozen(report.checks[0]), true);
});

test("diagnoseSystem maps Ghostty diagnostics and keeps warnings ready", async () => {
  const report = await diagnoseSystem(dependencies({
    ghostty: async () => ({
      version: "1.3.1",
      automationReady: true,
      diagnostics: [{
        code: "GHOSTTY_TITLE_BELL",
        severity: "warning",
        message: "Title bell decoration is enabled",
        remediation: "Add no-title to bell-features.",
      }],
    }),
  }));
  assert.equal(report.ready, true);
  assert.deepEqual(report.checks.filter((item) => item.component === "ghostty").map((item) => item.code), [
    "GHOSTTY_AUTOMATION_READY",
    "GHOSTTY_TITLE_BELL",
    "GHOSTTY_VERSION_SUPPORTED",
  ]);
});

test("diagnoseSystem rejects invalid clock and boundary report shapes", async () => {
  await assert.rejects(
    diagnoseSystem(dependencies({ clock: { now: () => new Date("invalid") } })),
    /valid Date/u,
  );
  await assert.rejects(
    diagnoseSystem(dependencies({ ghostty: async () => ({ automationReady: true, diagnostics: "bad" } as unknown as GhosttyDiagnosticReport) })),
    /invalid shape/u,
  );
});

test("diagnoseSystem maps runtime and typed Codex compatibility branches", async () => {
  const oldRuntime = await diagnoseSystem(dependencies({ nodeVersion: "20.19.0" }));
  assert.equal(oldRuntime.checks[0]?.code, "RUNTIME_VERSION_UNSUPPORTED");
  const unknownRuntime = await diagnoseSystem(dependencies({ nodeVersion: "development" }));
  assert.equal(unknownRuntime.checks[0]?.code, "RUNTIME_VERSION_UNKNOWN");

  const unsupported = await diagnoseSystem(dependencies({
    codex: { compatibility: async () => ({ compatible: false, version: "0.149.0", reasonCode: "unsupported" }) },
  }));
  assert.equal(unsupported.checks.find((item) => item.component === "codex")?.code, "CODEX_VERSION_UNSUPPORTED");

  const unrecognized = await diagnoseSystem(dependencies({
    codex: { compatibility: async () => ({ compatible: false, reasonCode: "unrecognized" }) },
  }));
  assert.equal(unrecognized.checks.find((item) => item.component === "codex")?.code, "CODEX_VERSION_UNKNOWN");
});

test("diagnoseSystem reports Claude compatibility and packaged-plugin failures", async () => {
  const unsupported = await diagnoseSystem(dependencies({
    claude: { compatibility: async () => ({ compatible: false, version: "2.1.100", reasonCode: "unsupported" }), validatePlugin: async () => undefined },
  }));
  assert.equal(unsupported.checks.find((item) => item.component === "claude")?.code, "CLAUDE_VERSION_UNSUPPORTED");

  const invalidPlugin = await diagnoseSystem(dependencies({
    claude: { compatibility: async () => ({ compatible: true, version: "2.1.226", tested: true }), validatePlugin: async () => { throw new Error("blocked"); } },
  }));
  assert.equal(invalidPlugin.ready, false);
  assert.deepEqual(invalidPlugin.checks.filter((item) => item.component === "claude").map((item) => item.code), ["CLAUDE_COMPATIBLE", "CLAUDE_PLUGIN_UNAVAILABLE"]);
});

test("newer Claude families are warning-level when the plugin still validates", async () => {
  const report = await diagnoseSystem(dependencies({
    claude: { compatibility: async () => ({ compatible: true, version: "2.2.0", tested: false }), validatePlugin: async () => undefined },
  }));
  assert.equal(report.ready, true);
  assert.equal(report.checks.find((item) => item.code === "CLAUDE_VERSION_UNTESTED")?.severity, "warning");
});

test("Ghostty config errors do not fabricate an Automation failure", async () => {
  const report = await diagnoseSystem(dependencies({
    ghostty: async () => ({
      version: "1.3.1",
      automationReady: true,
      diagnostics: [{
        code: "GHOSTTY_FIXED_TITLE",
        severity: "error",
        message: "Ghostty has a fixed global title",
        remediation: "Remove the fixed title.",
      }],
    }),
  }));
  assert.equal(report.ready, false);
  assert.equal(report.checks.some((item) => item.code === "GHOSTTY_AUTOMATION_UNAVAILABLE"), false);
});
