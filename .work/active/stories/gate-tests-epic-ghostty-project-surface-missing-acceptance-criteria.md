---
id: gate-tests-epic-ghostty-project-surface-missing-acceptance-criteria
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

# Normalize acceptance criteria for epic-ghostty-project-surface

## Priority

Medium

## Value evidence

Item: `epic-ghostty-project-surface`

Contract / risk / regression / maintenance cost: The complete item has no recognized acceptance heading containing checkbox criteria. Evidence: `.work/active/epics/epic-ghostty-project-surface.md:2`.

## Gap type

missing-acceptance-criteria

## Recommended edit

Add `## Acceptance Criteria` with at least one `- [ ]` criterion.

## Test location (suggested)

`.work/active/epics/epic-ghostty-project-surface.md:2`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: current completed record.
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
