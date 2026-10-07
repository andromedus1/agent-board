---
id: gate-tests-story-fix-terminal-keyboard-mode-restoration-missing-acceptance-criteria
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

# Normalize acceptance criteria for story-fix-terminal-keyboard-mode-restoration

## Priority

Medium

## Value evidence

Item: `story-fix-terminal-keyboard-mode-restoration`

Contract / risk / regression / maintenance cost: The hydrated full body has recognized `## Acceptance`, but its criteria at lines 51–55 are bare bullets. Evidence: `af155e6:.work/active/stories/story-fix-terminal-keyboard-mode-restoration.md:49`.

## Gap type

missing-acceptance-criteria

## Recommended edit

When the item body is restored for amendment, convert the acceptance bullets to `- [ ]` checkboxes; do not treat terminal-tier pruning as missing content.

## Test location (suggested)

`af155e6:.work/active/stories/story-fix-terminal-keyboard-mode-restoration.md:49`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: archived historical record (`git_ref` is authoritative).
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
