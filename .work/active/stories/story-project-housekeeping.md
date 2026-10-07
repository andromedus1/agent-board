---
id: story-project-housekeeping
kind: story
stage: implementing
parent: null
depends_on: []
tags: []
created: 2026-10-06
updated: 2026-10-06
release_binding: null
research_refs: []
research_origin: null
review_weight: standard
---

# Complete project housekeeping

## Scope

Close the session's verified hygiene gaps: missing GitHub CI, 93 completed
unbound items left in active delivery state, three documentation findings, and
merged branch accumulation. One owner handles this bounded maintenance change;
the documentation-update workflow delegates its prose edits and audit. No
application behavior or unrelated product backlog is included.

Absorbs `.work/backlog/idea-provider-observation-docs.md` (full original at
`75442eddb21d2ba5c95a4c4efbb55654ad9ebabd`), covering ordinary-Codex diagnostic
registration and provider-specific working freshness. The third documentation
finding is the previous Mac's absolute canonical process paths in `AGENTS.md`.

## Acceptance criteria

- GitHub Actions runs type checking and the complete hermetic suite on macOS
  with Node 22 and 26 for PRs and main; a weekly/manual run also detects upstream
  drift. Node 26 probes the latest installed Codex's public compatibility
  surfaces without credentials or a model turn. Actions are SHA-pinned with
  read-only repository permission. Main requires successful checks before merge.
- Archive the 93 already-done unbound items using the configured `delete-refs`
  retention; preserve metadata, dependency identities, and resolvable Git refs
  to every complete pre-archive body.
- Fix all three documented findings and confirm a fresh documentation audit
  has no remaining findings. Regenerate the knowledge index from source data.
- Merge the reviewed change through a PR after its final checks pass; verify
  main CI, synchronize the local checkout, prune merged local/origin branches,
  and enable automatic merged-branch deletion. Leave unrelated backlog deferred.

## Verification plan

Use actual macOS GitHub Actions runs and local typecheck/full suite; verify every
archived item's metadata and body through Git, graph identities, generated
index counts, documentation audit, and clean/synchronized Git state. No tests
that merely mirror workflow YAML or reversible prose changes are needed.

## Execution

Capability: inline maintenance owner, scoped documentation worker, delegated
documentation audit, and bounded inline standalone-story review.
