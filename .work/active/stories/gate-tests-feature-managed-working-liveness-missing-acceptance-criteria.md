---
id: gate-tests-feature-managed-working-liveness-missing-acceptance-criteria
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

# Normalize acceptance criteria for feature-managed-working-liveness

## Priority

Medium

## Value evidence

Item: `feature-managed-working-liveness`

Contract / risk / regression / maintenance cost: The hydrated full body contains eight checkboxes under bold acceptance labels; the current archive stub was not treated as the source body. Evidence: `8e55567:.work/active/features/feature-managed-working-liveness.md:118`.

## Gap type

missing-acceptance-criteria

## Recommended edit

When the item body is restored for amendment, convert the bold labels to recognized `### Acceptance Criteria` headings; do not treat terminal-tier pruning as missing content.

## Test location (suggested)

`8e55567:.work/active/features/feature-managed-working-liveness.md:118`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: archived historical record (`git_ref` is authoritative).
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
