---
source_handle: symmetry-claude-agent-sdk-user-input
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/agent-sdk/user-input
provenance: source-direct
substrate_confidence: source-direct
---

# Claude Agent SDK user-input handling

The Agent SDK gives the hosting application a `canUseTool` callback for two
different pauses: a tool requiring approval and a model-issued
`AskUserQuestion`. The host presents the request and returns allow or deny.

## Key passages and anchors

- [1] `user-input.md:9-15` — both approval and AskUserQuestion invoke the callback
  and pause execution; a pending callback may remain pending until the query is
  cancelled, or it can defer a tool call for later session resume.
- [2] `user-input.md:38-59, 67-75` — callback inputs distinguish a tool request
  from AskUserQuestion and include cancellation context; auto-approved tools
  do not reach the callback, while PreToolUse hooks are the all-tool-call
  control surface.
- [3] `user-input.md:207-247` — allow responses can retain or modify tool input;
  deny responses tell Claude why the tool did not run.
- [4] `user-input.md:421-453, 565-668` — AskUserQuestion carries model-authored
  multiple-choice questions; the host must return the original question array
  and an answer mapping. The host cannot add its own questions through this
  flow.
- [5] `user-input.md:837-860` — AskUserQuestion is unavailable to Agent-tool
  subagents; streaming input can interrupt or redirect a running agent, and
  custom tools can implement richer input workflows.
