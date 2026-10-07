import { randomUUID } from "node:crypto";
import { FileHandle, mkdir, open, readFile, rename, rm } from "node:fs/promises";
import { dirname, basename } from "node:path";

import { AgentBoardError } from "../domain/errors.js";
import { parseSessionRecord, type SessionRecord } from "../domain/session.js";

const MAX_PATH_CONTEXT = 240;
const UNSUPPORTED_DIRECTORY_SYNC_ERRORS = new Set(["EBADF", "EISDIR", "EINVAL", "ENOTSUP"]);

function boundedPath(path: string): string {
  if (path.length <= MAX_PATH_CONTEXT) return path;
  return `…${path.slice(-(MAX_PATH_CONTEXT - 1))}`;
}

function withFileContext(error: unknown, path: string, fallbackCode: "INVALID_RECORD" | "ADAPTER_FAILURE"): AgentBoardError {
  if (error instanceof AgentBoardError) {
    return new AgentBoardError(error.code, `${error.message} [${boundedPath(path)}]`, { cause: error });
  }
  const message = error instanceof Error ? error.message : String(error);
  return new AgentBoardError(fallbackCode, `${message} [${boundedPath(path)}]`, { cause: error });
}

async function syncDirectory(path: string): Promise<void> {
  let handle: FileHandle | undefined;
  try {
    handle = await open(path, "r");
    await handle.sync();
  } catch (error) {
    const code = (error as { code?: unknown } | null)?.code;
    if (!UNSUPPORTED_DIRECTORY_SYNC_ERRORS.has(String(code))) throw error;
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

export async function readSessionFile(path: string): Promise<SessionRecord | null> {
  let contents: string;
  try {
    contents = await readFile(path, "utf8");
  } catch (error) {
    if ((error as { code?: unknown } | null)?.code === "ENOENT") return null;
    throw withFileContext(error, path, "ADAPTER_FAILURE");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (error) {
    throw withFileContext(error, path, "INVALID_RECORD");
  }

  try {
    return parseSessionRecord(parsed);
  } catch (error) {
    throw withFileContext(error, path, "INVALID_RECORD");
  }
}

export async function writeSessionFileAtomic(path: string, record: SessionRecord): Promise<void> {
  let validated: SessionRecord;
  try {
    validated = parseSessionRecord(record);
  } catch (error) {
    throw withFileContext(error, path, "INVALID_RECORD");
  }

  const tempPath = `${dirname(path)}/.${basename(path)}.${process.pid}.${randomUUID()}.tmp`;
  let handle: FileHandle | undefined;
  try {
    await mkdir(dirname(path), { recursive: true });
    handle = await open(tempPath, "wx", 0o600);
    await handle.writeFile(`${JSON.stringify(validated)}\n`, "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(tempPath, path);
    await syncDirectory(dirname(path));
  } catch (error) {
    await handle?.close().catch(() => undefined);
    await rm(tempPath, { force: true }).catch(() => undefined);
    throw withFileContext(error, path, "ADAPTER_FAILURE");
  }
}
