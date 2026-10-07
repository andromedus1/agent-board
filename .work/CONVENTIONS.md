# Project Conventions

## Foundation docs

- `docs/VISION.md`
- `docs/SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/PRINCIPLES.md`

## Release mapping

tag-based

## Tag taxonomy

- integration — an external-process or platform boundary such as Codex or Ghostty
- cli — a user-facing terminal command or command-line workflow
- ui — a user-facing visual or native interaction surface
- state — normalized domain state, persistence, reconciliation, or projection
- security — validation, secrets, permissions, process boundaries, or supply chain
- perf — throughput, latency, or memory work; routes to perf-design
- refactor — behavior-preserving structural change only; routes to refactor-design
- prose — a no-code deliverable such as documentation or conventions; routes to prose-author
- research — a grounded research input; routes cross-plugin to agentic-research:research-orchestrator, carries `research_dials`, does not bind to a release, and runs its gates inline

## Slug conventions

Use kebab-case. Prefix active items with `epic-`, `feature-`, or `story-` as
appropriate; child item slugs begin with their parent id.

## Stage overrides

None.

## Terminal-tier retention

delete-refs

## Gate config

gates_for_release: [security, tests, cruft, docs, patterns]
gate_finding_routing:
  critical: implementing
  high: implementing
  medium: drafting
  low: backlog
  info: skip
gate_refactor_scan_library_roots:
  - .agents/skills
  - .claude/skills
binding_guard: warn
epic_cohesion: phased
review_weight: standard
backlog_staleness_days: 90
