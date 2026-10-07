import assert from "node:assert/strict";
import test from "node:test";
import WebSocket, { WebSocketServer, type WebSocket as WebSocketConnection } from "ws";
import { z } from "zod";

import { AgentBoardError } from "../../../src/domain/errors.js";
import { AppServerClient } from "../../../src/integrations/codex/client.js";
import { parseAdvertisedEndpoint } from "../../../src/integrations/codex/endpoint.js";
import { ThreadLoadedListResponseSchema } from "../../../src/integrations/codex/protocol.js";
import type { WebSocketFactory } from "../../../src/integrations/codex/websocket-port.js";

function endpoint(port: number) {
  return parseAdvertisedEndpoint(`listening on: ws://127.0.0.1:${port}`);
}

async function withServer(handler: (socket: WebSocketConnection) => void, run: (port: number) => Promise<void>): Promise<void> {
  const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  server.on("connection", handler);
  try {
    await run(address.port);
  } finally {
    // Failure-path clients can close while a WebSocket handshake is still in
    // flight. Bound fixture teardown instead of letting server.close wait
    // forever for a peer that the assertion has already finished exercising.
    for (const socket of server.clients) socket.terminate();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

const defaultFactory: WebSocketFactory = (url) => {
  // The factory seam is exercised with an in-process loopback server; no Codex
  // process or external network is involved in the default suite.
  return new WebSocket(url);
};

test("correlates concurrent requests and delivers ordered notifications", async () => {
  const reads: Array<{ threadId?: string; includeTurns?: boolean }> = [];
  let notificationsSent = false;
  await withServer((socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as { id: number; method: string; params?: { threadId?: string; includeTurns?: boolean } };
      if (request.method === "initialize") socket.send(JSON.stringify({ id: request.id, result: { ok: true } }));
      else if (request.method === "thread/loaded/list") {
        if (!notificationsSent) {
          notificationsSent = true;
          socket.send(JSON.stringify({ method: "thread/status/changed", params: { threadId: "thread-1", status: { type: "active", activeFlags: [] } } }));
          socket.send(JSON.stringify({ method: "thread/status/changed", params: { threadId: "thread-1", status: { type: "idle" } } }));
        }
        setTimeout(() => socket.send(JSON.stringify({ id: request.id, result: { data: ["thread-1"] } })), request.id % 2 ? 15 : 1);
      } else if (request.method === "thread/read") {
        reads.push(request.params ?? {});
        socket.send(JSON.stringify({
          id: request.id,
          result: { thread: { id: "thread-1", status: { type: "idle" }, cwd: "/repo", parentThreadId: null } },
        }));
      }
    });
  }, async (port) => {
    const client = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory });
    try {
      await client.initialize({ name: "agent-board-test", version: "0.1.0" });
      const stream = client.notifications();
      const first = stream[Symbol.asyncIterator]().next();
      const [one, two] = await Promise.all([client.loadedThreads(), client.loadedThreads()]);
      assert.equal(one.data[0].id, "thread-1");
      assert.equal(two.data[0].id, "thread-1");
      assert.deepEqual(reads, [
        { threadId: "thread-1", includeTurns: false },
        { threadId: "thread-1", includeTurns: false },
      ]);
      assert.equal((await first).value.params.status.type, "active");
      assert.equal((await stream[Symbol.asyncIterator]().next()).value.params.status.type, "idle");
    } finally {
      await client.close();
    }
  });
});

test("loadedThreads fails closed for malformed list and mismatched thread/read responses", async () => {
  await withServer((socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as { id: number; method: string };
      if (request.method === "initialize") socket.send(JSON.stringify({ id: request.id, result: {} }));
      else if (request.method === "thread/loaded/list") {
        // The loaded-list contract contains thread IDs, not hydrated thread objects.
        socket.send(JSON.stringify({ id: request.id, result: { data: [{ id: "thread-1" }] } }));
      }
    });
  }, async (port) => {
    const client = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory });
    try {
      await client.initialize({ name: "agent-board-test", version: "0.1.0" });
      await assert.rejects(
        client.loadedThreads(),
        (error: unknown) => error instanceof AgentBoardError &&
          error.code === "ADAPTER_FAILURE" &&
          /response failed schema validation: thread\/loaded\/list/.test(error.message),
      );
    } finally {
      await client.close();
    }
  });

  await withServer((socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as { id: number; method: string };
      if (request.method === "initialize") socket.send(JSON.stringify({ id: request.id, result: {} }));
      else if (request.method === "thread/loaded/list") socket.send(JSON.stringify({ id: request.id, result: { data: ["thread-1"] } }));
      else if (request.method === "thread/read") {
        socket.send(JSON.stringify({
          id: request.id,
          result: { thread: { id: "thread-other", status: { type: "idle" }, cwd: "/repo", parentThreadId: null } },
        }));
      }
    });
  }, async (port) => {
    const client = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory });
    try {
      await client.initialize({ name: "agent-board-test", version: "0.1.0" });
      await assert.rejects(
        client.loadedThreads(),
        (error: unknown) => error instanceof AgentBoardError &&
          error.code === "ADAPTER_FAILURE" &&
          /thread\/read returned unexpected thread id thread-other/.test(error.message),
      );
    } finally {
      await client.close();
    }
  });
});

test("times out and aborts requests independently", async () => {
  await withServer((socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as { id: number; method: string };
      if (request.method === "initialize") socket.send(JSON.stringify({ id: request.id, result: {} }));
    });
  }, async (port) => {
    const client = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory, requestTimeoutMs: 25 });
    await client.initialize({ name: "agent-board-test", version: "0.1.0" });
    await assert.rejects(client.loadedThreads(), /timed out/);
    const controller = new AbortController();
    const pending = client.request("never", {}, ThreadLoadedListResponseSchema, controller.signal);
    controller.abort();
    await assert.rejects(pending, /aborted/);
    await client.close();
  });
});

test("a late timed-out response does not close unrelated client work", async () => {
  await withServer((socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as { id: number; method: string };
      if (request.method === "initialize") socket.send(JSON.stringify({ id: request.id, result: {} }));
      else if (request.method === "slow") {
        setTimeout(() => socket.send(JSON.stringify({ id: request.id, result: { late: true } })), 35);
      } else if (request.method === "thread/loaded/list") {
        socket.send(JSON.stringify({ id: request.id, result: { data: [] } }));
      }
    });
  }, async (port) => {
    const client = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory, requestTimeoutMs: 20 });
    await client.initialize({ name: "agent-board-test", version: "0.1.0" });
    await assert.rejects(client.request("slow", {}, z.unknown()), /timed out/);
    await new Promise((resolve) => setTimeout(resolve, 25));
    assert.deepEqual((await client.loadedThreads()).data, []);
    await client.close();
  });
});

test("disconnect rejects pending requests and notification iterators", async () => {
  await withServer((socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as { id: number; method: string };
      if (request.method === "initialize") socket.send(JSON.stringify({ id: request.id, result: {} }));
      else setTimeout(() => socket.close(), 5);
    });
  }, async (port) => {
    const client = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory, requestTimeoutMs: 200 });
    await client.initialize({ name: "agent-board-test", version: "0.1.0" });
    const stream = client.notifications();
    const next = stream[Symbol.asyncIterator]().next();
    await assert.rejects(client.loadedThreads(), (error: unknown) => error instanceof AgentBoardError && error.code === "ADAPTER_FAILURE");
    await assert.rejects(next, (error: unknown) => error instanceof AgentBoardError && error.code === "ADAPTER_FAILURE");
  });
});

test("default limit accepts a production-sized ignored notification", async () => {
  await withServer((socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as { id: number; method: string };
      if (request.method === "initialize") socket.send(JSON.stringify({ id: request.id, result: {} }));
      else if (request.method === "emit-large-notification") {
        socket.send(JSON.stringify({ method: "app/list/updated", params: { catalog: "x".repeat(4 * 1_048_576) } }));
        socket.send(JSON.stringify({ id: request.id, result: { ok: true } }));
      }
    });
  }, async (port) => {
    const client = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory });
    await client.initialize({ name: "agent-board-test", version: "0.1.0" });
    assert.deepEqual(await client.request("emit-large-notification", {}, z.unknown()), { ok: true });
    await client.close();
  });
});

test("rejects notification buffer overflow, oversized, and binary messages", async () => {
  await withServer((socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as { id: number; method: string };
      if (request.method === "initialize") socket.send(JSON.stringify({ id: request.id, result: {} }));
      else if (request.method === "oversized") socket.send("x".repeat(10_000));
      else if (request.method === "binary") socket.send(Buffer.from("binary"), { binary: true });
      else if (request.method === "overflow") {
        socket.send(JSON.stringify({ method: "thread/status/changed", params: { threadId: "thread-1", status: { type: "idle" } } }));
        socket.send(JSON.stringify({ method: "thread/status/changed", params: { threadId: "thread-1", status: { type: "idle" } } }));
        socket.send(JSON.stringify({ id: request.id, result: {} }));
      }
    });
  }, async (port) => {
    const client = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory, maxBufferedNotifications: 1, maxMessageBytes: 100 });
    await client.initialize({ name: "agent-board-test", version: "0.1.0" });
    const stream = client.notifications();
    await client.request("overflow", {}, z.unknown());
    await assert.rejects(stream[Symbol.asyncIterator]().next(), /buffer overflow/);
    await client.close();

    const oversized = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory, maxMessageBytes: 100 });
    await oversized.initialize({ name: "agent-board-test", version: "0.1.0" });
    await assert.rejects(oversized.request("oversized", {}, z.unknown()), /message exceeds/);
    await oversized.close();

    const binary = await AppServerClient.connect(endpoint(port), { webSocketFactory: defaultFactory });
    await binary.initialize({ name: "agent-board-test", version: "0.1.0" });
    await assert.rejects(binary.request("binary", {}, z.unknown()), /binary WebSocket message/);
    await binary.close();
  });
});
