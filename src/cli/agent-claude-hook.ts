#!/usr/bin/env node

import { createClaudeHookCommand } from "../composition/create-agent-claude.js";
import { isMain } from "./is-main.js";

const MAX_INPUT_BYTES = 64 * 1024;

export async function readHookInput(stream: NodeJS.ReadableStream): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    bytes += buffer.byteLength;
    if (bytes > MAX_INPUT_BYTES) throw new Error(`Claude hook input exceeded ${MAX_INPUT_BYTES} bytes`);
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function runClaudeHook(
  input: unknown,
  sessionId: string | undefined,
  observe: (sessionId: string, value: unknown) => Promise<void>,
  stderr: Pick<NodeJS.WriteStream, "write">,
): Promise<number> {
  try {
    if (sessionId === undefined || sessionId.length === 0) throw new Error("AGENT_BOARD_SESSION_ID is unavailable");
    await observe(sessionId, input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown failure";
    stderr.write(`Agent Board Claude observation skipped: ${message}\n`);
  }
  return 0;
}

export async function main(): Promise<number> {
  let input: unknown;
  try { input = await readHookInput(process.stdin); }
  catch (error) {
    const message = error instanceof Error ? error.message : "invalid input";
    process.stderr.write(`Agent Board Claude observation skipped: ${message}\n`);
    return 0;
  }
  const command = createClaudeHookCommand();
  return runClaudeHook(input, process.env.AGENT_BOARD_SESSION_ID, command.observe, process.stderr);
}

if (isMain(import.meta.url, process.argv[1])) {
  main().then((code) => { process.exitCode = code; }).catch(() => { process.exitCode = 0; });
}
