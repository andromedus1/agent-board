import assert from "node:assert/strict";
import { test } from "node:test";

import { NodeLauncherLiveness } from "../../src/integrations/launcher-liveness.js";

test("signal-zero success means the launcher exists without sending a destructive signal", async () => {
  const calls: Array<{ pid: number; signal: 0 }> = [];
  const liveness = new NodeLauncherLiveness({
    kill: ((pid: number, signal: 0) => {
      calls.push({ pid, signal });
    }) as typeof process.kill,
  });

  assert.equal(await liveness.isAlive(1234), true);
  assert.deepEqual(calls, [{ pid: 1234, signal: 0 }]);
});

test("missing, permission-denied, and unsafe launcher probes are mapped conservatively", async () => {
  const missing = new NodeLauncherLiveness({
    kill: (() => { throw Object.assign(new Error("gone"), { code: "ESRCH" }); }) as typeof process.kill,
  });
  const denied = new NodeLauncherLiveness({
    kill: (() => { throw Object.assign(new Error("protected"), { code: "EPERM" }); }) as typeof process.kill,
  });
  const unexpected = new NodeLauncherLiveness({
    kill: (() => { throw Object.assign(new Error("unknown"), { code: "EACCES" }); }) as typeof process.kill,
  });
  const unsafeCalls: number[] = [];
  const unsafe = new NodeLauncherLiveness({
    kill: ((pid: number) => { unsafeCalls.push(pid); }) as typeof process.kill,
  });

  assert.equal(await missing.isAlive(1234), false);
  assert.equal(await denied.isAlive(1234), true);
  assert.equal(await unexpected.isAlive(1234), false);
  assert.equal(await unsafe.isAlive(0), false);
  assert.equal(await unsafe.isAlive(-1), false);
  assert.equal(await unsafe.isAlive(Number.NaN), false);
  assert.deepEqual(unsafeCalls, []);
});
