---
source_handle: claude-code-cli-reference
fetched: 2026-08-20
source_url: https://code.claude.com/docs/en/cli-reference
provenance: source-direct
substrate_confidence: source-direct
source_class: official-documentation
---

# Claude Code CLI reference

## Summary

Anthropic's CLI reference separates the ordinary interactive terminal command
from print/SDK mode and documents per-run plugin loading.

## Key passages

1. `claude` starts an interactive session, whereas `claude -p` queries through
   the SDK and exits. (Section “CLI commands”.)
2. Stream JSON input/output and hook lifecycle events are print-mode surfaces;
   `--include-hook-events` requires stream JSON output. They are not a direct
   event stream for the ordinary interactive TUI. (Section “CLI flags”.)
3. `--plugin-dir` loads a plugin from a directory or archive for the current
   session only and can be repeated. (Section “CLI flags”.)
4. `--name` sets the session's display name and terminal title, while
   `--resume` accepts a session ID or name. (Section “CLI flags”.)
5. `claude agents --json` exposes active background sessions for scripting, but
   the command is specifically the background-agent view rather than a status
   API for every ordinary interactive session. (Section “CLI commands”.)

## Structural metadata

Official Anthropic Claude Code CLI reference fetched on 2026-08-20.

## Substrate test

Source-direct product documentation. It supports CLI capability claims, not an
assumption that undocumented flags or event streams exist.
