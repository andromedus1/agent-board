---
id: story-license-and-backlog-refresh
kind: story
stage: done
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

## Implementation notes

- Added LICENSE from GitHub's standard MIT template, with Andrew Clark / 2026.
- Declared MIT in package.json and the lockfile root, and linked LICENSE in README.
- Updated only the confirmed clauses and dates in both backlog entries; both
  remain deferred, with their unfinished scope preserved.
- Simplification: removed obsolete Claude/rename future work and Doctor wording.
- No tests added. Updated the existing package-contents assertion to require
  LICENSE after CI caught its obsolete file list. No application changes,
  dependency changes, design discrepancies, or adjacent issues were introduced.

## Verification

- LICENSE exactly matches the GitHub licenses/mit API template after substituting
  only the selected copyright holder and year.
- Built an actual npm tarball in a disposable directory; its LICENSE matches
  byte-for-byte and its package.json declares MIT. Temporary artifact removed.
- Root package license values match, and parsed lockfile content is identical
  to main after removing the new root license field.
- All 19 local README links/anchors resolve; git diff --check passes.
- Knowledge/substrate lint: zero errors, five unchanged research metadata warnings.
- Required CI run 39169059174 passed on Node 22 and 26 at dffb702: each suite
  passed 247 tests with zero failures and three opt-in skips. The Node 26 job
  also passed the latest installed-Codex compatibility/schema probe (1/1).

## Review (2026-10-18)

**Verdict:** Approve. **Weight:** standard project default;
one bounded inline standalone-story pass, no independent/cross-model reviewer.

**Blockers:** none. **Important:** none. **Nits:** none. **Rejected:** none.

Verified user authorization, canonical license text, repository author identity,
package/lockfile agreement, packed-artifact inclusion, documentation links, and
the narrow confirmed backlog scope against the final diff. Both backlog items
retain their remaining intent. Application/runtime behavior is unchanged, so
runtime design/security lenses do not apply beyond the existing required CI.
Required CI passed after the documented stale-assertion correction. Acceptance
criteria are satisfied; no second review is needed. PR #7 retains final-commit
CI and merge evidence; normal merge preserves this full-body archival ref.

### CI test-debt correction

Run 39168870456 failed only the existing packaged-infrastructure file-list
assertion on both Node versions: the actual installed package correctly gained
LICENSE, but the expected list omitted it. Corrected the stale assertion to
require LICENSE alongside README, assets, dist, and package.json. This preserves
the source-free package boundary and strengthens its license-presence contract.
The isolated packaged-infrastructure test now passes locally (1/1), and
git diff --check remains clean. No production bug was exposed.
