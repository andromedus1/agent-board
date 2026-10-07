---
id: feature-companion-terminal-configuration
kind: feature
stage: done
tags: [prose]
parent: null
depends_on: [epic-operational-readiness]
release_binding: null
gate_origin: null
created: 2026-08-15
updated: 2026-08-15
---

# Companion Terminal Configuration

## Brief

Add copyable merge fragments for Andrew's Ghostty tab workflow and
Codex status line. Explain how the two surfaces divide responsibility: Agent
Board owns the registered tab title for swarm attention, while the Codex status
line shows project, branch, model/reasoning, and context usage inside the tab.

Preserve the tab creation, closure, direct navigation, prompt navigation,
working-directory inheritance, and macOS title-bar settings from Andrew's notes.
Add the Agent Board requirements for AppleScript and a fixed status-prefix-safe
bell configuration. Document that Ghostty's `prompt_tab_title` binding conflicts
with registered title ownership and that `agent-name` replaces it for supervised
tabs.

Include only minimal fragments and setup guidance. Do not copy Andrew's full
personal Ghostty or Codex files, mutate dotfiles, hard-code unrelated visual
preferences, or present the examples as automatically installed configuration.
Ground the Codex fragment in the installed `/statusline` result:

```toml
[tui]
status_line = ["project-name", "git-branch", "model-with-reasoning", "context-used"]
status_line_use_colors = true
```

## Simplification opportunity

Consolidate the scattered README setup hints and hand-off notes into one
copyable configuration directory plus a short README route. Retain
`agent-board doctor` as the verifier instead of adding an installer or a second
configuration parser.

## Outline

- `examples/ghostty/agent-board.conf`: minimal copyable Agent Board and tab
  workflow fragment, with the manual-title conflict removed.
- `examples/codex/status-line.toml`: the exact installed `/statusline` result.
- `docs/configuration.md`: ownership model, merge instructions, workflow,
  maintenance, verification, and rollback.
- `README.md`: link the detailed guide and examples from the main setup path.

## Implementation notes

- Execution capability: GPT-5.6 inline prose lane. The work is a bounded,
  no-code configuration and documentation addition.
- Files added: `examples/ghostty/agent-board.conf`,
  `examples/codex/status-line.toml`, and `docs/configuration.md`.
- File updated: `README.md` links the companion guide and examples.
- Grounding: the Ghostty fragment preserves Andrew's supplied workflow and the
  installed 1.3 defaults with title decoration disabled. The Codex fragment is
  copied from Andrew's installed `/statusline` result.
- Safety: examples are merge-only. No personal config was copied wholesale and
  no dotfile was changed.
- Verification: `ghostty +validate-config` accepts the example fragment;
  Markdown links and whitespace checks pass.
- Discrepancy from notes: the manual `prompt_tab_title` binding is documented as
  the earlier workflow but excluded from the recommended supervised-tab fragment
  because it conflicts with Agent Board title ownership.
- Adjacent issues parked: none.

## Review (2026-08-15)

**Verdict**: Approve with fixes.

**Blockers**: none.

**Important fixes**: standardized “copyable merge fragment” language so readers
do not mistake either example for a complete replacement file. Regenerated the
enforced knowledge index so the new configuration guide is discoverable.

**Nits adjudicated**: retained indexed planning frontmatter because the guide
locks a product-facing ownership decision; kept rollback and manual-merge
instructions explicit; verified all links and Ghostty syntax.

Standard review weight: one independent pass, receiver fixes, no re-review.
