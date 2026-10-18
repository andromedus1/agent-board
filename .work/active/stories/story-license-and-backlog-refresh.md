---
id: story-license-and-backlog-refresh
kind: story
stage: implementing
tags: [prose]
parent: null
depends_on: []
release_binding: null
gate_origin: null
research_refs: []
research_origin: null
review_weight: standard
created: 2026-10-18
updated: 2026-10-18
---

# Add MIT licensing and refresh confirmed backlog wording

## Brief

Apply Andrew's explicit MIT license choice and the two backlog edits confirmed
after the 2026-10-18 hygiene check. This is a bounded documentation and package
metadata change; no application behavior or architecture changes are required.

## Strategic decisions

- Andrew selected MIT and authorized both partial-backlog corrections.
- Use copyright year 2026 and Andrew Clark, matching the repository's authorship.
- Retain both backlog items: only their already-delivered clauses are obsolete.

## Acceptance criteria

- A root LICENSE contains the standard MIT text with the selected holder/year.
- package.json and the lockfile's root package declare the MIT SPDX identifier;
  npm's packed artifact includes LICENSE and the updated package metadata.
- README links to LICENSE.
- The deferred roadmap describes additional providers beyond Codex and Claude
  and retains richer activity metadata without presenting hotkey rename as future work.
- The architecture-precision backlog item drops the obsolete Doctor clause while
  retaining the remaining documentation work. Both entries get current dates.
- Relevant checks, bounded inline review, and required PR CI pass before merge.

## Design and verification

Use GitHub's standard MIT template (https://choosealicense.com/licenses/mit/ and
the GitHub licenses/mit API). Preserve its grant, notice requirement, and
disclaimer verbatim. Synchronize package metadata without dependency changes.
Verify the actual npm tarball's LICENSE and package.json, README links, diff
scope, and knowledge/substrate lint. Existing required CI covers the package
installation and CLI suite; add no tests for these prose/metadata edits.

The confirmed backlog evidence is the delivered Claude provider and hotkey
rename flow documented in README, and docs/ARCHITECTURE.md's assertion that
Doctor uses the same capability check as managed launch.

## Simplification opportunity

Remove obsolete future-work clauses while preserving the remaining backlog
intent. Keep one canonical license file and link to it from README.

## Execution

One inline owner in prose mode. Standard project review weight, bounded inline
standalone-story review; no independent or cross-model reviewer.
