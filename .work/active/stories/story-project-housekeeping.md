---
id: story-project-housekeeping
kind: story
stage: review
parent: null
depends_on: []
tags: []
created: 2026-10-06
updated: 2026-10-06
release_binding: null
gate_origin: null
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

## Simplification opportunity

Clear completed bodies from the active queue while retaining recovery refs,
remove the absorbed backlog duplicate, and prune merged branch clutter.

## Execution

Capability: inline maintenance owner, scoped documentation worker, delegated
documentation audit, and bounded inline standalone-story review.

## Implementation notes

- Added `.github/workflows/ci.yml`: macOS 15, Node 22/26, pull-request/main,
  manual, and weekly checks. Official checkout/setup-node releases are pinned
  by commit; the token has read-only contents permission and checkout does not
  persist credentials. The Node 26 job tests latest Codex without credentials.
- Archived all 93 previously completed items at full-body ref
  `a093c1df8e25752c01f8e26ab00d7ecd6c057daf`. Verified originals byte-for-byte,
  preserved metadata/relationships, parent eligibility, and title-only stubs.
  The full graph has 129 unique items and no missing parent/dependency targets.
- Fixed all three documentation findings and regenerated the three knowledge
  indexes. Fresh delegated full audit `1e7e216` reports zero findings and
  independently resolves all 116 archive refs, including the 23 existing stubs.
- Initial CI exposed missing npm registry metadata in cold caches: `npm ci`
  caches locked tarballs, while the packed harness resolved new dependency
  ranges. Reproduced in a private empty cache; seed each isolated prefix from
  the project manifest/lock with offline production `npm ci`, then install the
  actual tarball offline. Both offline guarantees and source-free package
  assertions remain in place. No application code changed.
- The local golden test exposed a startup race: managed registration precedes
  native idle evidence. Wait for the public idle state before checking its
  glyph. Keep all glyph/title, independent identity, and one-second lifecycle
  assertions. An intermediate evidence-name predicate was corrected to the
  public state after verification exposed its wrong assumption.
- Configured main protection to require PRs and both GitHub Actions checks,
  strict up-to-date branches, and enforcement for administrators; force pushes
  and deletion are disabled. No additional human approval is required for this
  solo-maintainer repository.
- Enabled automatic deletion after merge; removed three merged local branches
  and three merged origin branches after ancestry/open-PR checks. Old-account
  upstream branches were outside the cleanup scope.

## Verification

- `npm run typecheck`: pass.
- `npm test`: 235 total, 232 passed, zero failures, 3 opt-in live probes skipped.
- A private empty-cache reproduction first failed the original packed install,
  then passed locked offline seeding plus the actual packed offline install.
- Fresh full documentation audit: 0 Critical/High/Medium/Low/Info; all 26 local
  Markdown links, 25 indexed documents, four canonical process references,
  and six completed epic outputs verified.
- `git diff --check`, generated-index lint, archive body/metadata/graph checks:
  pass. Generated navigator now reports 12 deferred backlog items.
- Hosted CI run `37559525870` passed on both Node 22 and 26, including the
  latest installed Codex compatibility/schema probe on Node 26. All executable
  changes are covered by this run; remaining changes are audit/work records.
  PR #4 will require another green run at its final commit before merge.
