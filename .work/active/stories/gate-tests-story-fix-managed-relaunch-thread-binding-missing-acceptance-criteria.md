---
id: gate-tests-story-fix-managed-relaunch-thread-binding-missing-acceptance-criteria
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

# Normalize acceptance criteria for story-fix-managed-relaunch-thread-binding

## Priority

Medium

## Value evidence

Item: `story-fix-managed-relaunch-thread-binding`

Contract / risk / regression / maintenance cost: The hydrated full body has no recognized acceptance-heading checkbox block. Evidence: `1e2c960:.work/active/stories/story-fix-managed-relaunch-thread-binding.md:2`.

## Gap type

missing-acceptance-criteria

## Recommended edit

When the item body is restored for amendment, add canonical checkbox acceptance criteria; do not treat terminal-tier pruning as missing content.

## Test location (suggested)

`1e2c960:.work/active/stories/story-fix-managed-relaunch-thread-binding.md:2`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: archived historical record (`git_ref` is authoritative).
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
