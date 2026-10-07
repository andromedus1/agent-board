---
source_handle: app-server-protocol
fetched: 2026-08-14
source_url: https://learn.chatgpt.com/docs/app-server
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The Codex app-server documentation presents app-server as the deep integration interface that powers rich clients such as the VS Code extension. It documents a separate terminal-UI client mode where `codex --remote` connects a TUI to an app-server endpoint, describes JSON-RPC communication over `stdio`, WebSocket, and Unix domain sockets, and notes that remote WebSocket support is still experimental and unsupported for production workloads. The page also distinguishes persisted thread inspection from in-memory loaded threads within the app-server process.

## Key passages

- [1] Lines 768-768: app-server is the interface Codex uses to power rich clients and is positioned for “deep integration” inside another product.
- [2] Lines 772-784: “Remote terminal UI mode” is documented as starting app-server first and then connecting the Codex terminal UI with `codex --remote ...`; the accepted endpoint forms are `ws://`, `wss://`, `unix://`, and `unix://PATH`.
- [3] Lines 787-792: app-server starts a local Code Mode host by default, `--listen` controls how clients connect to app-server, and every thread in the same app-server process shares the selected Code Mode host connection; the app-server command and WebSocket transport are experimental and unsupported for production workloads.
- [4] Lines 832-835: the “current wire format” is version-specific and the page points readers to generated TypeScript bindings and generated JSON schemas.
- [5] Lines 968-972: app-server distinguishes stored-thread inspection from the loaded in-memory thread set: `thread/read` reads stored threads, `thread/list` pages stored logs, and `thread/loaded/list` returns the thread ids currently loaded in memory.
- [6] Lines 1150-1160 and 1230-1230: `thread/resume` continues a stored session by thread id, while `thread/read` reads stored thread data without resuming it, loading it into memory, or emitting `thread/started`.
- [7] Lines 1225-1228 and 1310-1319: returned thread objects include runtime `status` values `notLoaded`, `idle`, `systemError`, or `active` with `activeFlags`, and `thread/status/changed` emits those runtime status transitions for loaded threads.
- [8] Lines 1321-1344: `thread/loaded/list` returns thread IDs currently loaded in memory, and after the last subscriber leaves and 30 minutes pass with no activity, app-server unloads the thread, emits `thread/status/changed` to `notLoaded`, and then emits `thread/closed`.
- [9] Lines 1787-1789: permission approvals are server-initiated requests keyed to thread and turn context; the built-in `request_permissions` tool sends `item/permissions/requestApproval` with thread, turn, item, environment, cwd, and requested permissions.
- [10] Lines 900-900 and 1698-1700: app-server finishes turns with `turn/completed`; `turn.status` can be `completed`, `interrupted`, or `failed`, and failed turns carry structured error data.

## Structural notes

- Relevant sections: “Usage patterns”, “Protocol status”, “Track thread status changes”, “Unsubscribe from a loaded thread”, “Approvals”, “Errors”.
- The page frames app-server as the native contract for external clients, not merely an internal detail.
