---
source_handle: hma-core-api-schema
fetched: 2026-11-10
source_url: https://github.com/herdrdev/herdr-core/blob/main/schema/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

herdr-core API README and OpenRPC method list. The API is a preview (protocol generation 1, version 0.x). Status is an event stream of OSC 7501 records; the method list has no call to set a terminal's status other than writing OSC 7501 into the terminal; labels and opaque documents are settable.

## Key passages

- [1] "Status: preview (protocol generation 1, version 0.x)."
- [2] Events: `status` events carry `{status, records, reported}`; `labels` events carry all labels; a `turn` counter and `title` events exist; a heartbeat arrives every 15 s.
- [3] Status section: "A terminal's status is whatever its program reported through OSC 7501, the Program Status Protocol (`idle`, `working`, `done`, `blocked`, `error`, ...), stored as reported. hc never infers status from the screen. Programs that don't speak 7501 have no status."
- [4] Documents: `doc.get`/`doc.set` store opaque JSON (1 MiB) that "survive restart and handover"; "Names follow the terminal name rules." These are "API-only, with no CLI verb".
- [5] `hc.openrpc.json` (info.version 0.1.20) methods read: hello, server.status/stop/restart, terminal.run/list/get/kill/rm/keep/label/read/attach/send/wait/keys/interrupt/put, templates.list, machine.exec/add/list/connect/rename/rm, file.read/write/edit, doc.get/doc.set, events.subscribe, rpc.discover. No method named for reporting or setting a terminal status.
- [6] `terminal.label`: "Set or remove labels (free-form `key=value`, never interpreted)."; `terminal.keep`: restarts a live terminal as a shell after loss; `terminal.interrupt`: "Press the stop key (esc if it reports status, else ctrl+c)".
- [7] `terminal.send` doc: "Paste text and press Enter after a person sends or clears their draft (at most 60 s since their last key)"; `terminal.keys`: "Press named keys, encoded for the program's current keyboard modes".
- [8] Attach streams: "The last active viewer sets the size (active: it attached, typed, resized or gained focus); `observe` viewers never type or resize." Status records: the `Status` struct (status.rs) carries `state`, optional `kind` (permission, question or auth), `progress`, `app`, `title`, `msg`; records can have an `id` and `state=clear` removes a record and its children; a root report ending `working` increments a `turn` counter.

## Structural notes

Fetched with `gh api repos/herdrdev/herdr-core/contents/schema/README.md` and `.../schema/hc.openrpc.json` (method names printed with Python). Passage 8 is from crates/herdr-core/src/status.rs (read via gh api). The method list was read in full; descriptions only partly (first ~110 characters each).
