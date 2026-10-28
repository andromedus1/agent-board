---
source_handle: rps-herdr-connecting-machines-docs
fetched: 2026-10-26
source_url: https://herdr.dev/docs/connecting-machines/
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Herdr can save SSH machines and show Local plus remote workspaces and an aggregated agent list in one client window. Each machine keeps its own server; connection loss shows cached, dimmed state and retries with backoff. Aside from the client UI, auth stays with OpenSSH. The page mentions a mobile workspace switcher.

## Key passages

- [1] Lines 3-4: save an SSH machine once and switch between its workspaces and Local without another client; the agent list includes connected machines so the operator can see which agent needs an answer; each machine keeps its own Herdr server, sessions and processes, and losing one connection does not disconnect others.
- [2] Line 33: the selected machine receives pane input and terminal size; other connected machines keep updating workspace information, agent states and notifications without streaming pane screens.
- [3] Line 35: workspace navigation across machines; 'On desktop, navigation wraps at the ends; the mobile switcher stops at the first or last workspace.'
- [4] Line 38: when a connection is lost, the last workspace and agent state remains visible but dimmed and is described as cached information, not live state; input into those cached panes stays disabled until a fresh connection and matching screen arrive.
- [5] Line 53: Herdr retries automatically after a network interruption, sleep or SSH failure; repeated failures increase the delay up to two minutes; SSH connections are probed when quiet so a broken connection does not stay Online indefinitely.
- [6] Line 56: saved-machine connections close their remote bridge after a minute without traffic, and sleep counts toward that deadline; the cleanup leaves the remote server, sessions and pane processes running.
- [7] Line 68: workspace, tab, pane IDs and agent names are scoped to one server, so two machines may both contain w1:p1 or an agent named reviewer; remote automation uses herdr --machine <label-or-id> agent list.
- [8] Line 71: saved profiles contain only an opaque ID, label, SSH target, explicit remote session and enabled state; no passwords or keys are stored; authentication stays with OpenSSH.

## Structural notes

Official documentation page 'Connecting machines', converted from raw HTML to text; line numbers refer to the extracted text.
