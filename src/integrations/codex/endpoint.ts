import { AgentBoardError } from "../../domain/errors.js";

export interface AppServerEndpoint {
  websocketUrl: URL;
  readinessUrl?: URL;
  healthUrl?: URL;
}

function adapterFailure(message: string, cause?: unknown): AgentBoardError {
  return new AgentBoardError("ADAPTER_FAILURE", message, { cause });
}

function urlFrom(value: string, kind: "websocket" | "http"): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    throw adapterFailure(`Codex advertised ${kind} endpoint is not a URL`, error);
  }

  if (kind === "websocket" && url.protocol !== "ws:") {
    throw adapterFailure("Codex app-server endpoint must use ws://");
  }
  if (kind === "http" && url.protocol !== "http:") {
    throw adapterFailure("Codex readiness endpoint must use http://");
  }
  if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
    throw adapterFailure(`Codex app-server endpoint is not loopback: ${url.hostname}`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw adapterFailure("Codex app-server endpoint must not contain credentials, query, or hash");
  }
  if (kind === "websocket" && url.pathname !== "/") {
    throw adapterFailure("Codex WebSocket endpoint must not contain a path");
  }
  if (url.port === "") {
    throw adapterFailure("Codex app-server endpoint must include a port");
  }
  const port = Number(url.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw adapterFailure("Codex app-server endpoint must advertise a nonzero port");
  }
  return url;
}

function endpointMatches(a: URL, b: URL): boolean {
  return a.hostname === b.hostname && a.port === b.port;
}

function findSingle(output: string, expression: RegExp, label: string): string | undefined {
  const values = [...output.matchAll(expression)].map((match) => match[1]);
  if (values.length === 0) return undefined;
  const unique = [...new Set(values)];
  if (unique.length !== 1) {
    throw adapterFailure(`Codex advertised conflicting ${label} endpoints`);
  }
  return unique[0];
}

export function parseAdvertisedEndpoint(output: string): AppServerEndpoint {
  const websocketText = findSingle(
    output,
    /(?:listening\s+on|WebSockets?\s+(?:at|on)):\s*(ws:\/\/[^\s,]+)/giu,
    "WebSocket",
  ) ?? findSingle(output, /(ws:\/\/[^\s,]+)/giu, "WebSocket");

  if (!websocketText) {
    throw adapterFailure("Codex app-server output did not advertise a WebSocket endpoint");
  }
  const websocketUrl = urlFrom(websocketText.replace(/[).]+$/u, ""), "websocket");

  const readinessText = findSingle(output, /\breadyz:\s*(https?:\/\/[^\s,]+)/giu, "readiness")
    ?? findSingle(output, /\breadiness:\s*(https?:\/\/[^\s,]+)/giu, "readiness");
  const healthText = findSingle(output, /\bhealthz:\s*(https?:\/\/[^\s,]+)/giu, "health");

  const parseRelated = (value: string | undefined, expectedPath: string): URL | undefined => {
    if (!value) return undefined;
    const url = urlFrom(value.replace(/[).]+$/u, ""), "http");
    if (url.pathname !== expectedPath) {
      throw adapterFailure(`Codex ${expectedPath.slice(1)} endpoint has an unexpected path`);
    }
    if (!endpointMatches(websocketUrl, url)) {
      throw adapterFailure(`Codex ${expectedPath.slice(1)} endpoint does not match WebSocket port`);
    }
    return url;
  };

  return {
    websocketUrl,
    readinessUrl: parseRelated(readinessText, "/readyz"),
    healthUrl: parseRelated(healthText, "/healthz"),
  };
}
