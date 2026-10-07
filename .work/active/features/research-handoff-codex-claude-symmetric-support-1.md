---
id: research-handoff-codex-claude-symmetric-support-1
kind: feature
stage: done
tags: [integration, state]
parent: epic-codex-claude-symmetric-support
depends_on: []
release_binding: null
gate_origin: null
research_origin: codex-claude-symmetric-support
created: 2026-08-20
updated: 2026-08-20
---

# Provider-neutral adapter identity and capability contract

## Finding

Extend Agent Board's session and adapter boundary so Codex and Claude can share
normalized state transitions, glyph meanings, acknowledgement behavior, and
terminal projection while retaining provider-native identity, binding data,
evidence kind, confidence, and capabilities.

The common contract must distinguish observation capabilities from semantic
control capabilities. Unsupported or stale evidence projects diagnostic `?`
rather than a convenient primary state.

## Simplification opportunity

Generalize the existing provider discriminator and binding boundary in place;
do not introduce a parallel Claude session model or a second projection policy.

## Research grounding

**Source**: `.research/analysis/campaigns/codex-claude-symmetric-support/parent.md`
(slug: `codex-claude-symmetric-support`)

The shared product boundary already exists above the current Codex adapter; it
needs plural provider identity and capability metadata before a Claude adapter
can join it honestly.

## Design

### Architectural choice

Define one closed adapter registry (`codex`, `claude`) as the single source of
truth for provider identity and observation capabilities. Extend the existing
agent observation in place with a provider-neutral `nativeSessionId`; keep
`nativeThreadId` as an optional Codex binding so existing durable records remain
readable without a user-approved migration. Registration receives the adapter
explicitly from each launcher. Projection consults the registry before treating
launcher liveness as durable working evidence: Codex may do so, Claude may not.

Rejected alternatives are parallel provider record schemas, which would fork
transitions and projection, and a persisted free-form capability array, which
could drift from the installed adapter implementation. Capabilities are static
code metadata; records retain provider, evidence kind, confidence, and native
binding evidence.

### Implementation units

1. `src/domain/registries.ts`: add `AGENT_ADAPTERS`, `AgentAdapter`, and immutable
   adapter capability metadata including `workingWhileLauncherAlive` and native
   observation/control descriptions.
2. `src/domain/session.ts`: accept either adapter, add optional
   `nativeSessionId`, and enforce provider-specific binding ownership while
   continuing to parse existing Codex records.
3. `src/application/register-session.ts` and composition callers: require the
   registering adapter and persist it atomically on creation; reject reuse of a
   terminal already registered to another provider.
4. `src/domain/projection.ts`: gate the verified-launcher working exemption on
   adapter capability. All glyph precedence and labels remain shared.

### Testing and acceptance

- Domain tests prove old Codex JSON remains valid, Claude identity is valid,
  invalid cross-provider bindings fail, and the registry is exhaustive.
- Registration tests prove provider identity is explicit and a mismatched
  provider cannot silently claim an existing terminal.
- Projection tests prove equivalent fresh states have identical glyphs while a
  stale Claude working hook becomes `?` even if its launcher PID is alive.
- No second transition reducer, projection function, or provider-specific glyph
  vocabulary is introduced.

No child stories are needed; this is one small shared-contract change.

## Implementation notes

- Added the closed adapter/capability registry and provider-specific native
  binding validation without changing schema version or invalidating existing
  Codex records.
- Registration now owns an explicit adapter identity, atomically adopts an
  ordinary pre-named tab for its managed provider, and rejects a conflicting
  managed provider claim under the registration lock.
- Projection keeps one glyph policy while allowing only Codex's authoritative
  stream topology to extend working evidence through launcher liveness.
- Focused build and 23 domain/registration tests pass.

## Review (2026-08-20)

Standard-weight review used one fresh-context cross-model pass with Claude
Opus. The reviewer approved the shared registry, additive persistence contract,
and one projection vocabulary, but found that an ordinary tab pre-named with
`agent-name` could not be adopted by `agent-claude`, and that inferred managed
evidence could initially project a false idle glyph.

Receiver fixes made ordinary cross-provider pre-registration atomically
adoptable while retaining collision protection for managed sessions, and made
inferred managed evidence project diagnostic `?` until provider-native evidence
arrives. Focused regressions, typecheck, build, and the serialized 231-test suite
pass. Per standard policy, this feature closes after the one pass and verified
fixes without re-review.
