---
source_handle: symmetry-claude-local-cli-2.1.226
fetched: 2026-08-20
source_path: .research/source-captures/symmetry-claude-code-2.1.226/help.txt
provenance: source-direct
substrate_confidence: source-direct
---

# Local Claude Code 2.1.226 CLI surface

The installed executable identifies itself as Claude Code 2.1.226. Its help
states that the normal invocation opens an interactive session, while `-p` is
the non-interactive path. It exposes distinct flags for session continuation,
specific resume, session forking, display naming, background-agent launch, and
Remote Control.

## Key passages and anchors

- [1] `help.txt:4,6-7` — version and interactive-default / `-p` distinction.
- [2] `help.txt:9-14` — `--continue`, `--resume`, `--fork-session`, names, and
  explicit session IDs.
- [3] `help.txt:15-16` — Remote Control and generated-name prefix flags.
- [4] `help.txt:17-23` — permission-mode, plugin/MCP/settings, and bare-mode
  configuration boundaries.
- [5] `help.txt:24-29` — structured print-mode stream surfaces and available
  top-level administration commands.
