---
source_handle: rps-ttyd-readme
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/tsl0922/ttyd/main/README.md
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

ttyd shares a command's terminal over a web socket to a browser using xterm.js. It is read-only by default, supports basic auth, an auth-proxy header, SSL and origin checks, and has a --once option; it is a transport, not a session manager.

## Key passages

- [1] Title: 'ttyd - Share your terminal over the web'; built on libuv and WebGL2.
- [2] Options: `-c, --credential` basic authentication (username:password); `-H, --auth-header` lets an HTTP reverse proxy handle authentication.
- [3] Options: `-W, --writable` allows clients to write to the TTY (readonly by default).
- [4] Options: `-O, --check-origin` disallows websocket connections from a different origin.
- [5] Options: `-o, --once` accepts only one client and exits on disconnection.
- [6] Options: `-S, --ssl`, `-C, --ssl-cert`, `-K, --ssl-key`, `-A, --ssl-ca` for SSL and client-certificate verification.
- [7] License: MIT badge (WebFetch-processed page extract).

## Structural notes

- Raw README. GitHub API reported pushed_at 2026-08-12, not archived.
- Session persistence of the launched command beyond a client disconnect is not described in the README text; the --once option implies the default does not exit on disconnect {inferred reading, not stated}.
