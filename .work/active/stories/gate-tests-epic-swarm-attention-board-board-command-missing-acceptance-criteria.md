---
id: gate-tests-epic-swarm-attention-board-board-command-missing-acceptance-criteria
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

# Normalize acceptance criteria for epic-swarm-attention-board-board-command

## Priority

Medium

## Value evidence

Item: `epic-swarm-attention-board-board-command`

Contract / risk / regression / maintenance cost: Ten checked criteria are under bold acceptance labels that the deterministic heading parser does not recognize. Evidence: `.work/active/features/epic-swarm-attention-board-board-command.md:156`.

## Gap type

missing-acceptance-criteria

## Recommended edit

Convert the bold labels to recognized `### Acceptance Criteria` headings while preserving the checkboxes.

## Test location (suggested)

`.work/active/features/epic-swarm-attention-board-board-command.md:156`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: current completed record.
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
