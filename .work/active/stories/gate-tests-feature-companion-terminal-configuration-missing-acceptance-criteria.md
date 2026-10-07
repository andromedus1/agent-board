---
id: gate-tests-feature-companion-terminal-configuration-missing-acceptance-criteria
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

# Normalize acceptance criteria for feature-companion-terminal-configuration

## Priority

Medium

## Value evidence

Item: `feature-companion-terminal-configuration`

Contract / risk / regression / maintenance cost: The complete prose item has no recognized acceptance-heading checkbox block. Evidence: `.work/active/features/feature-companion-terminal-configuration.md:2`.

## Gap type

missing-acceptance-criteria

## Recommended edit

Add `## Acceptance Criteria` with at least one `- [ ]` criterion.

## Test location (suggested)

`.work/active/features/feature-companion-terminal-configuration.md:2`

## Adjudication

- Result: false positive from a retroactive parser-format rule, not a product defect.
- Source: current completed record.
- Evidence: delivery and verification already existed in the referenced record before the stricter parser grammar was introduced.
- Action: no source or history rewrite.
