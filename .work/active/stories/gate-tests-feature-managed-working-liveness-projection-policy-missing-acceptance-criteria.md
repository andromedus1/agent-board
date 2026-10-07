---
id: gate-tests-feature-managed-working-liveness-projection-policy-missing-acceptance-criteria
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

# Normalize acceptance criteria for feature-managed-working-liveness-projection-policy

## Priority

Medium

## Value evidence

Item: `feature-managed-working-liveness-projection-policy`

Contract / risk / regression / maintenance cost: The item contains `## Acceptance evidence`, not a recognized criteria heading, and its bullets are not checkboxes. Evidence: `.work/active/stories/feature-managed-working-liveness-projection-policy.md:21`.

## Gap type

missing-acceptance-criteria

## Recommended edit

Add `## Acceptance Criteria` with checkbox criteria.

## Test location (suggested)

`.work/active/stories/feature-managed-working-liveness-projection-policy.md:21`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: current completed record.
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
