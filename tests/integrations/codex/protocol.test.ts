import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  parseNotification,
  ThreadLoadedListResponseSchema,
  ThreadReadResponseSchema,
  ThreadStatusChangedParamsSchema,
} from "../../../src/integrations/codex/protocol.js";

test("parses captured lifecycle notifications and tolerates additive fields", async () => {
  const fixture = await readFile(fileURLToPath(new URL("../../fixtures/codex/app-server.jsonl", import.meta.url)), "utf8");
  const messages = fixture.trim().split("\n").map((line) => JSON.parse(line) as { method: string; params: unknown });
  const notifications = messages.map((message) => parseNotification(message.method, message.params));
  assert.equal(notifications[0]?.method, "thread/status/changed");
  assert.equal((notifications[1] as { params: { status: { type: string } } }).params.status.type, "idle");
  assert.equal((notifications[2] as { params: { turn: { status: string } } }).params.turn.status, "completed");

  const parsed = ThreadStatusChangedParamsSchema.parse({
    threadId: "thread-1",
    status: { type: "active", activeFlags: ["waitingOnUserInput"], futureField: true },
    futureField: "allowed",
  });
  assert.equal(parsed.status.type, "active");
});

test("rejects changed required status and turn semantics", () => {
  assert.throws(() => ThreadStatusChangedParamsSchema.parse({ threadId: "thread-1", status: { type: "active" } }));
  assert.throws(() => parseNotification("turn/completed", { threadId: "thread-1", turn: { id: "turn-1", status: "unknown" } }));
  assert.equal(parseNotification("future/notification", {}), null);
});

test("validates loaded thread discovery shape", () => {
  const result = ThreadLoadedListResponseSchema.parse({
    data: ["thread-1"],
    nextCursor: null,
  });
  assert.equal(result.data[0], "thread-1");
  assert.throws(() => ThreadLoadedListResponseSchema.parse({ data: [{ id: "thread-1" }] }));

  const read = ThreadReadResponseSchema.parse({
    thread: { id: "thread-1", status: { type: "idle" }, cwd: "/tmp/project", parentThreadId: null, future: 1 },
  });
  assert.equal(read.thread.id, "thread-1");
  assert.throws(() => ThreadReadResponseSchema.parse({ thread: { id: "thread-1", status: { type: "active" } } }));
});
