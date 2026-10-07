import WebSocket from "ws";

export interface WebSocketLike {
  on(event: "open", listener: () => void): this;
  on(event: "message", listener: (data: unknown, isBinary?: boolean) => void): this;
  on(event: "error", listener: (error: unknown) => void): this;
  on(event: "close", listener: () => void): this;
  off(event: "open", listener: () => void): this;
  off(event: "message", listener: (data: unknown, isBinary?: boolean) => void): this;
  off(event: "error", listener: (error: unknown) => void): this;
  off(event: "close", listener: () => void): this;
  send(data: string): void;
  close(): void;
}

export type WebSocketFactory = (url: string) => WebSocketLike;

export const defaultWebSocketFactory: WebSocketFactory = (url) => new WebSocket(url);
