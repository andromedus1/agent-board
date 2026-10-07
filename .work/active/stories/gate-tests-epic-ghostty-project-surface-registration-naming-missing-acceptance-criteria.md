---
id: gate-tests-epic-ghostty-project-surface-registration-naming-missing-acceptance-criteria
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

# Normalize acceptance criteria for epic-ghostty-project-surface-registration-naming

## Priority

Medium

## Value evidence

Item: `epic-ghostty-project-surface-registration-naming`

Contract / risk / regression / maintenance cost: Four bold acceptance labels contain fourteen checkboxes outside recognized Markdown acceptance headings. Evidence: `.work/active/features/epic-ghostty-project-surface-registration-naming.md:113`.

## Gap type

missing-acceptance-criteria

## Recommended edit

Convert the bold labels to recognized `### Acceptance Criteria` headings while preserving the checkboxes.

## Test location (suggested)

`.work/active/features/epic-ghostty-project-surface-registration-naming.md:113`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: current completed record.
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
