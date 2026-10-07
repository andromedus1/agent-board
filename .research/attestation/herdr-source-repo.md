---
source_handle: herdr-source-repo
fetched: 2026-08-20
source_path: .research/source-captures/herdr-source-2026-08-20
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

The fetched `herdrdev/herdr` repository at commit `2c042bb2ce845ca4c7fbe03df3e7eb041abd0252` implements Claude and Codex as screen-manifest agents and ships distinct manifests for each. Their official integration shell hooks send only `pane.report_agent_session`, not lifecycle state. The native-resume planner maps each stored official session identity to provider-specific argv. The workspace rollup is an attention-priority aggregation of pane states. Tests assert that the hooks omit `state`, that the Codex hook rejects an unpersisted or mismatched nested session, and that Claude subagent events do not revive a parent lifecycle state.

## Key passages

- [1] `src/detect/mod.rs:9-37` defines the four state values as `Idle`, `Working`, `Blocked`, and `Unknown`, and describes screen-derived confidence metadata including visible blocker/working evidence.
- [2] `src/detect/mod.rs:94-114` includes both `Claude` and `Codex` in `SCREEN_MANIFEST_AGENTS`.
- [3] `src/detect/mod.rs:252-288` routes an identified agent’s current screen plus OSC title/progress through the manifest detector; no identified agent yields `Unknown`.
- [4] `src/detect/mod.rs:295-309` enumerates full-lifecycle hook authorities, and the list does not contain Claude or Codex; its session-identity-only helper separately names other integrations.
- [5] `src/detect/manifests/claude.toml:1-189` is a versioned Claude manifest with distinct working, blocked, idle, transcript-viewer, and permission UI rules.
- [6] `src/detect/manifests/codex.toml:1-89` is a versioned Codex manifest with distinct OSC, directory-trust, strong/weak blocker, working fallback, and idle rules.
- [7] `src/integration/assets/claude/herdr-agent-state.sh:1-101` accepts only the `session` action, rejects subagent and `SubagentStop` inputs, and sends `pane.report_agent_session` with a session id rather than a state.
- [8] `src/integration/assets/codex/herdr-agent-state.sh:1-96` accepts session start, requires a transcript path, rejects a different inherited `CODEX_THREAD_ID`, and sends `pane.report_agent_session` with a session id rather than a state.
- [9] `tests/cli/hooks.rs:113-151` verifies Claude hook state actions and subagent completion reports produce no request, while a Claude session start produces `pane.report_agent_session` without `state`.
- [10] `tests/cli/hooks.rs:154-201` verifies the Codex hook reports a persisted root session, accepts a matching inherited session id, and ignores a session without a transcript path or a mismatched nested session; the emitted request has no `state`.
- [11] `src/agent_resume.rs:47-157` only accepts official source/agent pairs for persisted session references and maps Claude to `claude --resume <id>` and Codex to `codex resume <id>`.
- [12] `src/workspace/aggregate.rs:55-87` ranks pane attention as blocked first, then unseen idle, working, seen idle, and unknown; workspace aggregation returns the maximum priority pane state.
- [13] `src/app/api/agents.rs:420-453` tests that prompting an already-blocked agent returns a blocked result without writing terminal input.

## Structural notes

- Source repository: `https://github.com/herdrdev/herdr` (origin recorded by the fetched local Git capture).
- Fetched with a depth-one clone on 2026-08-20; HEAD commit was `2c042bb2ce845ca4c7fbe03df3e7eb041abd0252` with subject `test: use native path in docs parity assertion (#3043)`.
- Relevant source areas: `src/detect`, `src/integration/assets/{claude,codex}`, `src/agent_resume.rs`, `src/workspace/aggregate.rs`, and `tests/cli/hooks.rs`.
