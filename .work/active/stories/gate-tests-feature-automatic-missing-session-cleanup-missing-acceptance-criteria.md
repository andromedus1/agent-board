---
id: gate-tests-feature-automatic-missing-session-cleanup-missing-acceptance-criteria
kind: story
stage: done
tags: [testing, research-pipeline-extension]
parent: feature-adjudicate-acceptance-format-findings
depends_on: []
release_binding: null
gate_origin: tests
created: 2026-08-16
updated: 2026-08-16
---

# Normalize acceptance criteria for feature-automatic-missing-session-cleanup

## Priority

Medium

## Value evidence

Item: `feature-automatic-missing-session-cleanup`

Contract / risk / regression / maintenance cost: The hydrated full body contains nine checkboxes under bold acceptance labels; the current archive stub was not treated as the source body. Evidence: `795c945:.work/active/features/feature-automatic-missing-session-cleanup.md:101`.

## Gap type

missing-acceptance-criteria

## Recommended edit

When the item body is restored for amendment, convert the bold labels to recognized `### Acceptance Criteria` headings; do not treat terminal-tier pruning as missing content.

## Test location (suggested)

`795c945:.work/active/features/feature-automatic-missing-session-cleanup.md:101`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: archived historical record (`git_ref` is authoritative).
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
