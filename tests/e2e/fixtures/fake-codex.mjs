#!/usr/bin/env node
import { createReadStream, readFileSync, watch } from "node:fs";
import { WebSocketServer } from "ws";

const scenarioPath = process.env.AGENT_BOARD_E2E_SCENARIO;
if (!scenarioPath) process.exit(2);
const load = () => JSON.parse(readFileSync(scenarioPath, "utf8"));
const args = process.argv.slice(2);

if (args[0] === "--version") {
  const scenario = load();
  process.stdout.write(`${scenario.codex?.version ?? "codex-cli 0.147.2"}\n`);
  process.exit(scenario.codex?.versionExitCode ?? 0);
}

if (args.includes("--remote")) {
  process.stdout.write("fake remote TUI ready\n");
  process.stdin.resume();
  process.on("SIGTERM", () => process.exit(143));
  process.on("SIGINT", () => process.exit(130));
  setInterval(() => undefined, 1_000);
  process.exitCode = 0;
} else if (args[0] === "app-server") {
  const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  const threadId = "fake-root-thread";
  let previousStatus;
  const status = () => load().codex?.status ?? "idle";
  const statusShape = (value) => value === "working"
    ? { type: "active", activeFlags: [] }
    : value === "input"
      ? { type: "active", activeFlags: ["waitingOnUserInput"] }
      : value === "error"
        ? { type: "systemError" }
        : { type: "idle" };
  const notify = (socket, value) => socket.send(JSON.stringify({ jsonrpc: "2.0", method: "thread/status/changed", params: { threadId, status: statusShape(value) } }));
  server.on("connection", (socket) => {
    socket.on("message", (raw) => {
      const request = JSON.parse(raw.toString());
      if (request.method === "initialize") socket.send(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: {} }));
      else if (request.method === "thread/loaded/list") socket.send(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: { data: [threadId] } }));
      else if (request.method === "thread/read") socket.send(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: { thread: { id: threadId, cwd: process.cwd(), parentThreadId: null, status: statusShape(status()) } } }));
      else socket.send(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: {} }));
    });
  });
  server.on("listening", () => {
    const address = server.address();
    process.stdout.write(`ws://127.0.0.1:${address.port}\n`);
    previousStatus = status();
  });
  const timer = setInterval(() => {
    if (load().codex?.killServer === true) {
      clearInterval(timer);
      for (const socket of server.clients) socket.close();
      server.close(() => process.exit(0));
      return;
    }
    const current = status();
    if (current === previousStatus) return;
    previousStatus = current;
    for (const socket of server.clients) if (socket.readyState === 1) notify(socket, current);
  }, 20);
  const close = () => { clearInterval(timer); server.close(() => process.exit(0)); };
  process.on("SIGTERM", close);
  process.on("SIGINT", close);
} else {
  process.stderr.write("unsupported Codex fixture request\n");
  process.exit(2);
}
