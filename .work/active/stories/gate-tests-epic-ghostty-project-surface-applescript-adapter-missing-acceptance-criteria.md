---
id: gate-tests-epic-ghostty-project-surface-applescript-adapter-missing-acceptance-criteria
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

# Normalize acceptance criteria for epic-ghostty-project-surface-applescript-adapter

## Priority

Medium

## Value evidence

Item: `epic-ghostty-project-surface-applescript-adapter`

Contract / risk / regression / maintenance cost: Ten checkboxes are under bold `**Acceptance Criteria**:` labels, which the deterministic heading parser does not recognize. Evidence: `.work/active/features/epic-ghostty-project-surface-applescript-adapter.md:92`.

## Gap type

missing-acceptance-criteria

## Recommended edit

Convert the bold labels to recognized `### Acceptance Criteria` headings while preserving the checkboxes.

## Test location (suggested)

`.work/active/features/epic-ghostty-project-surface-applescript-adapter.md:92`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: current completed record.
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
