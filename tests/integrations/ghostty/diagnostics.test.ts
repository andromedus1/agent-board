import assert from "node:assert/strict";
import { test } from "node:test";

import type { ProcessRequest, ProcessResult, ProcessRunner } from "../../../src/integrations/process-runner.js";
import { diagnoseGhostty } from "../../../src/integrations/ghostty/diagnostics.js";

class DiagnosticRunner implements ProcessRunner {
  readonly requests: ProcessRequest[] = [];
  async run(request: ProcessRequest): Promise<ProcessResult> {
    this.requests.push(request);
    if (request.command === "ghostty" && request.args[0] === "--version") return { stdout: "Ghostty 1.3.1 (build 1)\n", stderr: "", exitCode: 0 };
    if (request.command === "ghostty" && request.args[1] === "--default") return { stdout: "macos-applescript = true\nbell-features = title\ntitle = \n", stderr: "", exitCode: 0 };
    if (request.command === "ghostty") return { stdout: "", stderr: "", exitCode: 0 };
    return { stdout: "w\tt\tterm\n", stderr: "", exitCode: 0 };
  }
}

test("diagnostics overlays config and reports title bell warning", async () => {
  const runner = new DiagnosticRunner();
  const report = await diagnoseGhostty(runner);
  assert.equal(report.version, "1.3.1");
  assert.equal(report.automationReady, true);
  assert.equal(report.diagnostics.some((item) => item.code === "GHOSTTY_TITLE_BELL"), true);
  assert.deepEqual(runner.requests.slice(0, 3).map((request) => [request.command, ...request.args]), [
    ["ghostty", "--version"], ["ghostty", "+show-config", "--default"], ["ghostty", "+show-config"],
  ]);
});

test("diagnostics report version and config incompatibilities", async () => {
  class IncompatibleRunner extends DiagnosticRunner {
    override async run(request: ProcessRequest): Promise<ProcessResult> {
      this.requests.push(request);
      if (request.command === "ghostty" && request.args[0] === "--version") return { stdout: "Ghostty 1.2.9\n", stderr: "", exitCode: 0 };
      if (request.command === "ghostty" && request.args[1] === "--default") return { stdout: "macos-applescript = true\n", stderr: "", exitCode: 0 };
      if (request.command === "ghostty") return { stdout: "", stderr: "", exitCode: 0 };
      return { stdout: "w\tt\tterm\n", stderr: "", exitCode: 0 };
    }
  }
  const report = await diagnoseGhostty(new IncompatibleRunner());
  assert.equal(report.automationReady, true);
  assert.equal(report.diagnostics.some((item) => item.code === "GHOSTTY_VERSION_UNSUPPORTED"), true);
});

test("diagnostics reject disabled AppleScript and a fixed global title", async () => {
  class ConflictingConfigRunner extends DiagnosticRunner {
    override async run(request: ProcessRequest): Promise<ProcessResult> {
      this.requests.push(request);
      if (request.command === "ghostty" && request.args[0] === "--version") {
        return { stdout: "Ghostty 1.3.1\n", stderr: "", exitCode: 0 };
      }
      if (request.command === "ghostty" && request.args[1] === "--default") {
        return { stdout: "macos-applescript = true\ntitle = \n", stderr: "", exitCode: 0 };
      }
      if (request.command === "ghostty") {
        return { stdout: "macos-applescript = false\ntitle = fixed project\n", stderr: "", exitCode: 0 };
      }
      return { stdout: "w\tt\tterm\n", stderr: "", exitCode: 0 };
    }
  }

  const report = await diagnoseGhostty(new ConflictingConfigRunner());
  assert.equal(report.automationReady, true);
  assert.equal(report.diagnostics.some((item) => item.code === "GHOSTTY_APPLESCRIPT_DISABLED"), true);
  assert.equal(report.diagnostics.some((item) => item.code === "GHOSTTY_FIXED_TITLE"), true);
});
