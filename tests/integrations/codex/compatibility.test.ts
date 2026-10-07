import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";

import { CodexProcessHost } from "../../../src/integrations/codex/process.js";
import type { ProcessRequest, ProcessRunner } from "../../../src/integrations/process-runner.js";

// Reduced from the installed Codex 0.160.1 generator; the live test uses its full output.
const fixture = JSON.parse(await readFile(new URL("../../fixtures/codex-capabilities.json", import.meta.url), "utf8"));

function probe(version: string, options: { remote?: boolean; schemas?: typeof fixture; exitCode?: number } = {}) {
  const requests: ProcessRequest[] = [];
  let outputRoot: string | undefined;
  const runner: ProcessRunner = { run: async (request) => {
    requests.push(request);
    let stdout = "";
    let exitCode = 0;
    if (request.args[0] === "--version") stdout = `codex-cli ${version}`;
    else if (request.args[0] === "--help") stdout = options.remote === false ? "Usage: codex" : "--remote <ADDR>";
    else if (request.args[1] === "--help") stdout = "--listen <URL>";
    else if (request.args[1] === "generate-json-schema") {
      outputRoot = request.args[request.args.indexOf("--out") + 1]!;
      for (const [name, schema] of Object.entries(options.schemas ?? fixture)) {
        const path = join(outputRoot, name);
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, JSON.stringify(schema));
      }
      exitCode = options.exitCode ?? 0;
    } else assert.fail(`Unexpected probe: ${request.args.join(" ")}`);
    return { stdout, stderr: "", exitCode };
  } };
  return { host: new CodexProcessHost({ runner }), requests, outputRoot: () => outputRoot };
}

test("upgraded and future Codex versions launch when their capabilities still match", async () => {
  for (const version of ["0.160.1", "0.999.0", "1.0.0"]) {
    const candidate = probe(version);
    assert.equal(await candidate.host.version(), version);
    assert.ok(candidate.requests.some((request) => request.args.includes("generate-json-schema")));
    for (const request of candidate.requests) {
      assert.ok(request.timeoutMs > 0);
      assert.ok(request.maxOutputBytes > 0);
    }
    await assert.rejects(access(candidate.outputRoot()!), { code: "ENOENT" });
  }
});

test("an upgrade missing remote TUI support fails visibly", async () => {
  const candidate = probe("0.160.1", { remote: false });
  await assert.rejects(candidate.host.version(), /remote/u);
});

test("incompatible generated contracts and failed generators remain blocked and clean up", async () => {
  const changed = structuredClone(fixture);
  changed["v2/ThreadLoadedListResponse.json"].properties.data.items.type = "object";
  const changedFlags = structuredClone(fixture);
  changedFlags["ServerNotification.json"].definitions.ThreadActiveFlag.enum.push("newMeaning");
  for (const options of [{ schemas: changed }, { schemas: changedFlags }, { exitCode: 2 }, { schemas: {} }]) {
    const candidate = probe("0.160.1", options);
    const result = await candidate.host.compatibility();
    assert.equal(result.compatible, false);
    assert.equal(result.reasonCode, "capabilities");
    await assert.rejects(access(candidate.outputRoot()!), { code: "ENOENT" });
  }
});
