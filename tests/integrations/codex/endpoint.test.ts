import assert from "node:assert/strict";
import test from "node:test";

import { AgentBoardError } from "../../../src/domain/errors.js";
import { checkCodexCompatibility, parseCodexVersion } from "../../../src/integrations/codex/compatibility.js";
import { parseAdvertisedEndpoint } from "../../../src/integrations/codex/endpoint.js";

test("parses Codex's advertised ephemeral loopback endpoint", () => {
  const endpoint = parseAdvertisedEndpoint(`
codex app-server (WebSockets)
  listening on: ws://127.0.0.1:51380
  readyz: http://127.0.0.1:51380/readyz
  healthz: http://127.0.0.1:51380/healthz
`);
  assert.equal(endpoint.websocketUrl.href, "ws://127.0.0.1:51380/");
  assert.equal(endpoint.readinessUrl?.pathname, "/readyz");
  assert.equal(endpoint.healthUrl?.pathname, "/healthz");
});

for (const [name, output] of [
  ["port zero", "listening on: ws://127.0.0.1:0"],
  ["remote host", "listening on: ws://192.0.2.10:4000"],
  ["credentials", "listening on: ws://user:pass@127.0.0.1:4000"],
  ["path", "listening on: ws://127.0.0.1:4000/socket"],
  ["query", "listening on: ws://127.0.0.1:4000?token=secret"],
  ["conflict", "listening on: ws://127.0.0.1:4000\nlistening on: ws://127.0.0.1:4001"],
] as const) {
  test(`rejects unsafe or ambiguous endpoint: ${name}`, () => {
    assert.throws(() => parseAdvertisedEndpoint(output), (error: unknown) =>
      error instanceof AgentBoardError && error.code === "ADAPTER_FAILURE");
  });
}

test("parses and gates the installed Codex protocol family", () => {
  assert.equal(parseCodexVersion("codex-cli 0.147.0"), "0.147.0");
  assert.deepEqual(checkCodexCompatibility("codex-cli 0.147.2"), { compatible: true, version: "0.147.2" });
  assert.deepEqual(checkCodexCompatibility("codex-cli 0.148.0"), { compatible: true, version: "0.148.0" });
  assert.deepEqual(checkCodexCompatibility("codex-cli 0.149.1"), { compatible: true, version: "0.149.1" });
  assert.deepEqual(checkCodexCompatibility("codex-cli 0.150.1"), { compatible: true, version: "0.150.1" });
  assert.deepEqual(checkCodexCompatibility("codex-cli 0.152.0"), { compatible: true, version: "0.152.0" });
  assert.deepEqual(checkCodexCompatibility("codex-cli 0.153.4"), { compatible: true, version: "0.153.4" });
  assert.deepEqual(checkCodexCompatibility("codex-cli 0.154.0"), { compatible: true, version: "0.154.0" });
  assert.equal(checkCodexCompatibility("codex-cli 0.151.0").reasonCode, "unsupported");
  assert.equal(checkCodexCompatibility("codex-cli 0.155.0").reasonCode, "unsupported");
  assert.equal(checkCodexCompatibility("not a version").reasonCode, "unrecognized");
});
