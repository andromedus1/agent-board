# Agent-Board project guidance

Agent-Board uses Andrew's retained workflow:

- `agile-workflow` owns durable delivery state in `.work/`;
- `research-pipeline` owns project discovery, prior art, architecture, knowledge,
  and quality orchestration; and
- `agentic-research` owns grounded research execution and `.research/`.

Canonical process references:

- `/Users/andrewclark/dev/skills-v2/AGENTS.md`
- `/Users/andrewclark/dev/skills-v2/plugins/research-pipeline/docs/build-process.md`
- `/Users/andrewclark/dev/skills-v2/plugins/research-pipeline/docs/research-composition.md`
- `/Users/andrewclark/dev/skills-v2/plugins/agile-workflow/docs/ARCHITECTURE.md`

Workbench is prior art only. Do not create Workbench-owned `.work`, `.research`,
or `.knowledge` state in this project. Ideas such as outcome-first routing,
proportional ceremony, semantic autonomy, and review weight may be adopted
individually through the retained workflow.

## Current state

This repository has completed foundation ideation, a verified prior-art Scout,
the two blocking runtime engagements, and the Codex-Claude symmetric-support
campaign. Managed Codex app-server plus remote TUI and managed ordinary Claude
with bundled per-run observation hooks are the accepted provider topologies;
the Ghostty 1.3+ AppleScript contract is validated, and
`docs/ARCHITECTURE.md` is locked.

The terminal V1 and mixed-provider delivery arcs are complete: the
dependency-linked work items have been implemented, reviewed, and verified,
including packaged end-to-end journeys, the operator doctor, and shared glyph
support for concurrent `agent-codex` and `agent-claude` tabs. Deferred product
ideas remain preserved in the backlog for deliberate promotion. Use Agentic
Research only when a consequential unresolved question would change a future
delivery decision; do not reopen settled research by default.

## Product guardrails

- The product is an attention router for supervising agents, not a faster input
  device or terminal-specific macro pad.
- Vendor neutrality is a product requirement, but the first implementation may
  be intentionally narrow.
- Generic keystrokes must never imply semantic approval.
- State confidence and adapter capability must remain visible; inferred process
  state must not masquerade as native agent state.
- Software control-plane learning precedes custom PCB, battery, radio, and
  enclosure commitments.
- Local-first operation and meaningful offline behavior are foundational.

## Durable state

Git owns history. Foundation docs own current product truth. `.research/` owns
evidence. `.work/` items own delivery once created. Chat history is not an
authoritative project artifact.

<!-- agile-workflow:start -->
## Agile-Workflow Substrate

Work tracked in `.work/` as markdown items with YAML frontmatter
(`kind, stage, tags, parent, depends_on, release_binding, research_refs,
research_origin`; a `[research]` item also carries the commissioning
`research_dials` block).
Layout: `.work/active/{epics,features,stories}/`, `.work/backlog/`,
`.work/releases/<version>/`, `.work/archive/`.

**Primary query tool:** `.work/bin/work-view` filters by stage, tag, kind,
parent, and dependency. Common patterns:

- `work-view --ready` — items ready to work (deps satisfied)
- `work-view --stage review` — items awaiting an agent review pass (`/agile-workflow:review`)
- `work-view --parent <id>` / `--blocking <id>` — hierarchy / sequencing
- `work-view --scope all` — include terminal tiers: `releases/` (one summary doc per version) and
  `archive/` (bodyless ref stubs). Full bodies live in git history. By default work-view shows only
  active + backlog; `--release` / `--gate` auto-widen to all tiers.
- `work-view --help` for the full flag set

Foundation docs in `docs/` describe the system's current state or intended
future state, never the past; git history is the audit trail. Review existing
assertions only: missing coverage and unimplemented future intent are not drift;
flag only false, stale, or contradictory claims. Item files are the durable
state: update the body with implementation discoveries, review findings,
blockers, and decisions instead of relying on chat history.

Reusable code patterns live in `.agents/skills/patterns/` (load the `patterns`
skill for detail). Project agent rules live in `.agents/rules/*.md`
(plugin-managed rules in `.agents/rules/agile-workflow.md`); do not maintain
`.claude/rules/*.md` as a source of truth. The `.work/` ↔ `.research/` handoff follows
`plugins/agentic-research/docs/HANDOFF.md`.

**Before designing, implementing, or reviewing, read `.agents/rules/*.md`.**
The agile-workflow hook auto-loads these at session start and after compaction;
read them directly when working without the hook. Do not rely on
UserPromptSubmit for rules or queue snapshots; query `work-view` when queue
state is needed.

Project-specific refactor style conventions belong in this file under
`## Refactor Style Conventions`. Detailed refactor convention references belong
in `.agents/skills/refactor-conventions/` and extend `refactor-design`'s
defaults; they do not replace the built-in scan and they do not create
standalone plan docs.

<!-- agile-workflow:end -->
