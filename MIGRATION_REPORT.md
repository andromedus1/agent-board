# Agile-Workflow Bootstrap Report (Historical — completed)

> Historical migration record. Bootstrap and delivery are complete; current
> project truth lives in `AGENTS.md`, `docs/`, and `.work/`.

Date: 2026-08-14

## Source shape

Greenfield. Foundation, research, and architecture documents existed; there was
no source tree, tracking substrate, legacy roadmap, TODO file, task directory,
or overlapping project skill/rules catalog.

## Preserved foundation

- `docs/VISION.md`
- `docs/SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/PRINCIPLES.md`
- `docs/research-plan.md`
- `.research/`

## Substrate created

- `.work/active/{epics,features,stories}/`
- `.work/backlog/`
- `.work/releases/`
- `.work/archive/`
- `.work/bin/work-view` 0.16.14
- `.work/CONVENTIONS.md`
- `.agents/rules/agile-workflow.md`
- the managed agile-workflow section in `AGENTS.md`

No work items were seeded by conversion. Epic decomposition follows this
bootstrap.

## Decisions

- entrypoint model: `agents-canonical`
- release mapping: `tag-based`
- slugs: kebab-case with parent-prefixed children
- stage overrides: none
- terminal-tier retention: `delete-refs`
- review weight: `standard`
- binding guard: `warn`
- epic cohesion: `phased`
- cleanup scope: `preserve-only`

The tag taxonomy covers integration, CLI, state, security, performance,
refactor, prose, and research work. Agentic Research fields and routing are
enabled because this repository already owns a `.research/` corpus.

## Migration and cleanup

No legacy tracking artifacts, duplicate entrypoints, project skill roots, or
Claude rules were found. No convergence candidates, content moves, reference
rewrites, shims, deletions, or other cleanup actions were necessary.

## Historical outcome

The bootstrap substrate was subsequently populated, decomposed, implemented,
reviewed, and verified through the completed V1 delivery arc. Deferred ideas
remain in `.work/backlog/` for deliberate future promotion.
