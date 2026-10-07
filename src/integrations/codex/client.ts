import { Buffer } from "node:buffer";
import { z } from "zod";

import { AgentBoardError } from "../../domain/errors.js";
import { parseAdvertisedEndpoint, type AppServerEndpoint } from "./endpoint.js";
import {
  JsonRpcNotificationSchema,
  JsonRpcResponseSchema,
  parseNotification,
  ThreadLoadedListResponseSchema,
  ThreadReadResponseSchema,
  type CodexNotification,
  type ThreadLoadedListResult,
} from "./protocol.js";
import { defaultWebSocketFactory, type WebSocketFactory, type WebSocketLike } from "./websocket-port.js";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_MESSAGE_BYTES = 8 * 1_048_576;
const DEFAULT_MAX_BUFFERED_NOTIFICATIONS = 256;
const DEFAULT_MAX_PENDING_REQUESTS = 128;

export interface AppServerClientOptions {
  requestTimeoutMs?: number;
  maxMessageBytes?: number;
  maxBufferedNotifications?: number;
  maxPendingRequests?: number;
  webSocketFactory?: WebSocketFactory;
}

interface PendingRequest<T> {
  method: string;
  schema: z.ZodType<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
  signal?: AbortSignal;
  abort?: () => void;
}

interface Waiter {
  resolve: (value: IteratorResult<CodexNotification>) => void;
  reject: (error: unknown) => void;
}

class NotificationSubscription implements AsyncIterable<CodexNotification>, AsyncIterator<CodexNotification> {
  private readonly queue: CodexNotification[] = [];
  private readonly waiters: Waiter[] = [];
  private ended = false;
  private failure: unknown;
  private readonly signal?: AbortSignal;
  private readonly abort?: () => void;

  constructor(private readonly maxQueue: number, private readonly onEnd: (subscription: NotificationSubscription) => void, signal?: AbortSignal) {
    this.signal = signal;
    if (signal) {
      if (signal.aborted) this.end(new AgentBoardError("ADAPTER_FAILURE", "Codex notification stream aborted"));
      else {
        this.abort = () => this.end(new AgentBoardError("ADAPTER_FAILURE", "Codex notification stream aborted"));
        signal.addEventListener("abort", this.abort, { once: true });
      }
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<CodexNotification> { return this; }

  next(): Promise<IteratorResult<CodexNotification>> {
    if (this.queue.length > 0) return Promise.resolve({ done: false, value: this.queue.shift()! });
    if (this.failure) return Promise.reject(this.failure);
    if (this.ended) return Promise.resolve({ done: true, value: undefined });
    return new Promise((resolve, reject) => this.waiters.push({ resolve, reject }));
  }

  push(notification: CodexNotification): void {
    if (this.ended) return;
    const waiter = this.waiters.shift();
    if (waiter) waiter.resolve({ done: false, value: notification });
    else {
      this.queue.push(notification);
      if (this.queue.length > this.maxQueue) {
        this.end(new AgentBoardError("ADAPTER_FAILURE", "Codex notification buffer overflow"));
      }
    }
  }

  end(error?: unknown): void {
    if (this.ended) return;
    this.ended = true;
    this.failure = error;
    if (this.signal && this.abort) this.signal.removeEventListener("abort", this.abort);
    if (error) this.queue.splice(0);
    this.onEnd(this);
    for (const waiter of this.waiters.splice(0)) {
      if (error) waiter.reject(error);
      else waiter.resolve({ done: true, value: undefined });
    }
  }
}

function failure(message: string, cause?: unknown): AgentBoardError {
  return new AgentBoardError("ADAPTER_FAILURE", message, { cause });
}

function validPositiveOption(name: string, value: number | undefined, fallback: number): number {
  const resolved = value ?? fallback;
  if (!Number.isSafeInteger(resolved) || resolved < 1) throw failure(`${name} must be a positive safe integer`);
  return resolved;
}

function messageText(data: unknown, isBinary: boolean | undefined, maxBytes: number): string {
  if (isBinary) throw failure("Codex app-server sent a binary WebSocket message");
  let text: string;
  if (typeof data === "string") text = data;
  else if (Buffer.isBuffer(data)) text = data.toString("utf8");
  else if (data instanceof Uint8Array) text = Buffer.from(data).toString("utf8");
  else throw failure("Codex app-server sent an unsupported WebSocket message");
  if (Buffer.byteLength(text, "utf8") > maxBytes) throw failure("Codex app-server message exceeds configured limit");
  return text;
}

export class AppServerClient {
  private readonly pending = new Map<number, PendingRequest<unknown>>();
  private readonly subscriptions = new Set<NotificationSubscription>();
  private nextId = 1;
  private initialized = false;
  private closed = false;
  private terminalFailure: unknown;
  private constructor(
    private readonly socket: WebSocketLike,
    private readonly timeoutMs: number,
    private readonly maxMessageBytes: number,
    private readonly maxBufferedNotifications: number,
    private readonly maxPendingRequests: number,
  ) {
    socket.on("message", (data, isBinary) => this.receive(data, isBinary));
    socket.on("error", (error) => this.fail(failure("Codex app-server WebSocket error", error)));
    socket.on("close", () => this.fail(failure("Codex app-server WebSocket closed")));
  }

  static async connect(endpoint: AppServerEndpoint, options: AppServerClientOptions = {}): Promise<AppServerClient> {
    const timeoutMs = validPositiveOption("requestTimeoutMs", options.requestTimeoutMs, DEFAULT_TIMEOUT_MS);
    const maxMessageBytes = validPositiveOption("maxMessageBytes", options.maxMessageBytes, DEFAULT_MAX_MESSAGE_BYTES);
    const maxBufferedNotifications = validPositiveOption("maxBufferedNotifications", options.maxBufferedNotifications, DEFAULT_MAX_BUFFERED_NOTIFICATIONS);
    const maxPendingRequests = validPositiveOption("maxPendingRequests", options.maxPendingRequests, DEFAULT_MAX_PENDING_REQUESTS);
    const url = endpoint.websocketUrl;
    if (url.protocol !== "ws:" || (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") || !url.port || Number(url.port) === 0) {
      throw failure("Codex app-server client requires a nonzero loopback ws:// endpoint");
    }
    const factory = options.webSocketFactory ?? defaultWebSocketFactory;
    let socket: WebSocketLike;
    try { socket = factory(url.toString()); } catch (error) { throw failure("Unable to create Codex app-server WebSocket", error); }
    const client = new AppServerClient(socket, timeoutMs, maxMessageBytes, maxBufferedNotifications, maxPendingRequests);
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const cleanup = (): void => {
        clearTimeout(timer);
        socket.off("open", onOpen);
        socket.off("error", onError);
        socket.off("close", onClose);
      };
      const onOpen = (): void => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const onError = (error: unknown): void => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(failure("Unable to connect to Codex app-server", error));
      };
      const onClose = (): void => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(failure("Codex app-server closed before connection"));
      };
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          client.fail(failure("Timed out connecting to Codex app-server"));
          reject(client.terminalFailure);
        }
      }, timeoutMs);
      socket.on("open", onOpen);
      socket.on("error", onError);
      socket.on("close", onClose);
    });
    return client;
  }

  async initialize(clientInfo: { name: string; version: string }): Promise<void> {
    if (this.initialized) throw failure("Codex app-server client is already initialized");
    if (!clientInfo.name || !clientInfo.version) throw failure("Codex client identity must include name and version");
    await this.sendRequest("initialize", { clientInfo }, z.unknown(), undefined);
    this.initialized = true;
  }

  async request<T>(method: string, params: unknown, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
    if (!this.initialized) throw failure("Codex app-server client must be initialized before requests");
    return this.sendRequest(method, params, schema, signal);
  }

  async loadedThreads(signal?: AbortSignal): Promise<ThreadLoadedListResult> {
    const loaded = await this.request("thread/loaded/list", {}, ThreadLoadedListResponseSchema, signal);
    const data: ThreadLoadedListResult["data"] = [];
    for (const threadId of loaded.data) {
      const response = await this.request(
        "thread/read",
        { threadId, includeTurns: false },
        ThreadReadResponseSchema,
        signal,
      );
      if (response.thread.id !== threadId) {
        throw failure(`Codex thread/read returned unexpected thread id ${response.thread.id}`);
      }
      data.push(response.thread);
    }
    return { data };
  }

  notifications(signal?: AbortSignal): AsyncIterable<CodexNotification> {
    if (this.closed) {
      const ended = new NotificationSubscription(this.maxBufferedNotifications, () => undefined, signal);
      ended.end(this.terminalFailure ?? failure("Codex app-server client is closed"));
      return ended;
    }
    const subscription = new NotificationSubscription(this.maxBufferedNotifications, (item) => this.subscriptions.delete(item), signal);
    this.subscriptions.add(subscription);
    return subscription;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.rejectPending(failure("Codex app-server client closed"));
    for (const subscription of [...this.subscriptions]) subscription.end();
    this.subscriptions.clear();
    try { this.socket.close(); } catch { /* close is intentionally idempotent */ }
  }

  private sendRequest<T>(method: string, params: unknown, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
    if (this.closed) return Promise.reject(this.terminalFailure ?? failure("Codex app-server client is closed"));
    if (this.pending.size >= this.maxPendingRequests) return Promise.reject(failure("Codex app-server pending request limit exceeded"));
    if (signal?.aborted) return Promise.reject(failure("Codex app-server request aborted"));
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        const current = this.pending.get(id);
        if (!current) return;
        this.pending.delete(id);
        this.cleanupPending(current);
        reject(failure(`Codex app-server request timed out: ${method}`));
      }, this.timeoutMs);
      const pending: PendingRequest<T> = { method, schema, resolve, reject, timer, signal };
      this.pending.set(id, pending as PendingRequest<unknown>);
      const abort = () => {
        const current = this.pending.get(id);
        if (!current) return;
        this.pending.delete(id);
        this.cleanupPending(current);
        reject(failure(`Codex app-server request aborted: ${method}`));
      };
      pending.abort = abort;
      if (signal) signal.addEventListener("abort", pending.abort, { once: true });
      try { this.socket.send(JSON.stringify({ jsonrpc: "2.0", id, method, params })); }
      catch (error) {
        this.pending.delete(id);
        this.cleanupPending(pending);
        reject(failure(`Unable to send Codex app-server request: ${method}`, error));
      }
    });
  }

  private receive(data: unknown, isBinary?: boolean): void {
    if (this.closed) return;
    let parsed: unknown;
    try { parsed = JSON.parse(messageText(data, Boolean(isBinary), this.maxMessageBytes)); }
    catch (error) { this.fail(error instanceof AgentBoardError ? error : failure("Invalid Codex app-server JSON", error)); return; }

    const response = JsonRpcResponseSchema.safeParse(parsed);
    if (response.success) {
      this.resolveResponse(response.data.id, response.data);
      return;
    }
    const notification = JsonRpcNotificationSchema.safeParse(parsed);
    if (!notification.success) {
      this.fail(failure("Invalid Codex app-server JSON-RPC message", notification.error));
      return;
    }
    try {
      const known = parseNotification(notification.data.method, notification.data.params);
      if (known) for (const subscription of this.subscriptions) subscription.push(known);
    } catch (error) { this.fail(error); }
  }

  private resolveResponse(id: number, response: { result?: unknown; error?: { code: number; message: string; data?: unknown } }): void {
    const pending = this.pending.get(id);
    // Responses may legitimately arrive after their caller timed out or
    // aborted. IDs below nextId were issued by this client and are safe to
    // discard once no longer pending; never let one late response tear down
    // unrelated requests and notification streams.
    if (!pending) {
      if (id < this.nextId) return;
      this.fail(failure(`Codex app-server returned unknown response id ${id}`));
      return;
    }
    this.pending.delete(id);
    this.cleanupPending(pending);
    if (response.error) {
      pending.reject(failure(`Codex app-server request failed (${response.error.code}): ${response.error.message}`, response.error.data));
      return;
    }
    const result = pending.schema.safeParse(response.result);
    if (!result.success) pending.reject(failure(`Codex app-server response failed schema validation: ${pending.method}`, result.error));
    else pending.resolve(result.data);
  }

  private fail(error: unknown): void {
    if (this.closed) return;
    this.closed = true;
    this.terminalFailure = error instanceof AgentBoardError ? error : failure("Codex app-server connection failed", error);
    this.rejectPending(this.terminalFailure);
    for (const subscription of [...this.subscriptions]) subscription.end(this.terminalFailure);
    this.subscriptions.clear();
    try { this.socket.close(); } catch { /* the transport may already be closed */ }
  }

  private rejectPending(error: unknown): void {
    for (const [id, pending] of this.pending) {
      this.pending.delete(id);
      this.cleanupPending(pending);
      pending.reject(error);
    }
  }

  private cleanupPending<T>(pending: PendingRequest<T>): void {
    clearTimeout(pending.timer);
    if (pending.signal && pending.abort) {
      pending.signal.removeEventListener("abort", pending.abort);
    }
  }
}

export { parseAdvertisedEndpoint };
