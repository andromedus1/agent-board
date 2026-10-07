---
id: gate-tests-epic-swarm-attention-board-operator-controls-missing-acceptance-criteria
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

# Normalize acceptance criteria for epic-swarm-attention-board-operator-controls

## Priority

Medium

## Value evidence

Item: `epic-swarm-attention-board-operator-controls`

Contract / risk / regression / maintenance cost: The recognized acceptance heading contains only bare bullets at lines 196–205. Evidence: `.work/active/features/epic-swarm-attention-board-operator-controls.md:194`.

## Gap type

missing-acceptance-criteria

## Recommended edit

Convert the acceptance bullets to `- [ ]` checkboxes.

## Test location (suggested)

`.work/active/features/epic-swarm-attention-board-operator-controls.md:194`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: current completed record.
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
