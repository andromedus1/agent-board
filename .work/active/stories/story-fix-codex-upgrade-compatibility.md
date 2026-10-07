---
id: story-fix-codex-upgrade-compatibility
kind: story
stage: done
tags: [bug, integration, cli]
parent: null
depends_on: []
release_binding: null
gate_origin: null
created: 2026-10-06
updated: 2026-10-06
---

# Keep managed Codex launches working across compatible upgrades

## Symptom

After upgrading Codex, Agent Board returns to the command prompt without starting
the agent. Installed Codex is 0.160.1. The shared compatibility check rejects it:
`Codex 0.160.1 is unsupported; managed observation requires 0.147.x, 0.148.x,
0.149.x, 0.150.x, 0.152.x, 0.153.x, or 0.154.x`.

## Root cause

The version allowlist rejects every new minor before trying the adapter. Six
previous fixes extended that list. The installed 0.160.1 generated-schema probe
passes, so its version number is not evidence of incompatible capabilities.

## Fix approach

Retain the previously tested version fast path, minimum 0.147 floor, and explicit
0.151 exclusion. For unfamiliar later versions, check remote TUI and app-server
listen flags and generate the installed binary's schema in a temporary directory.
Check the narrow discovery and lifecycle contract before permitting launch.
Runtime response and event validation remain authoritative. Doctor distinguishes
capability-probed versions from previously tested families and gives a specific
capability error when probing fails. No schema cache or persistent mutation.

## Regression test

`tests/integrations/codex/compatibility.test.ts` failed before implementation:
0.160.1 is rejected before the capability probe. Cover future minor/major releases,
missing CLI support, changed discovery/status contracts, generator failure, and
temporary-directory cleanup. Extend the installed probe and packaged journey to
exercise the same launch gate.

## Acceptance Criteria

- [x] Installed Codex 0.160.1 passes the actual launch compatibility gate and live
      app-server initialization/discovery without a model turn.
- [x] A future compatible version passes without editing a version list.
- [x] Incompatible capabilities, old versions, and excluded 0.151 remain blocked.
- [x] Doctor reports capability evidence and failures clearly.
- [x] Typecheck, full tests, installed probe, and bounded inline review pass.
- [x] Linked local commands are rebuilt; changes are prepared on a PR branch.

## Implementation notes

Execution capability: one local owner for this focused adapter fix; bounded inline
standalone-story review. Documentation edits and the required cross-document audit
use the documentation skill's separate workers, not independent code reviewers.

- Added a bounded, shell-free capability probe for unfamiliar versions, retaining
  runtime response/event validation and the known-version fast path.
- Both doctor and managed launch use `CodexProcessHost.compatibility`; a successful
  capability probe is identified explicitly in doctor output.
- Added capability regression fixtures/tests, doctor evidence/failure coverage,
  and a future-version packaged golden journey. The installed test now exercises
  the actual production compatibility gate as well as generated-schema assertions.
- Updated operator, architecture, research-plan assertion, and example guidance.

## Verification

- Before implementation, all three new capability tests failed; 0.160.1 was
  rejected solely by the stale version allowlist.
- `npm run typecheck`: passed.
- `AGENT_BOARD_LIVE_CODEX=1 npm test`: 235 tests, 233 passed, zero failures,
  two intentional opt-in skips (installed Claude and disposable Ghostty).
- The regression verifies compatible 0.160.1, future 0.999.0, and future 1.0.0;
  missing remote TUI support, changed discovery/status schema, absent schema
  files, and generator failure remain rejected with temporary-output cleanup.
- Real installed Codex 0.160.1: capability gate passed; private loopback app-server
  started; WebSocket initialization and loaded-thread discovery succeeded; the
  owned app-server shut down cleanly. No model turn or visual TUI check ran.
- Rebuilt linked commands: `agent-board doctor --json` reports `CODEX_COMPATIBLE`
  and the successful capability probe. Ghostty is ready. Its only error is
  intentionally missing Claude, confirmed by the user after migrating Macs.
- The packaged golden journey passes with simulated Codex 0.999.0 and checks the
  doctor, managed launch, board/title state convergence, and shutdown.

The [official app-server documentation](https://learn.chatgpt.com/docs/app-server#message-schema)
describes generating schemas from the installed CLI. The probe remains deliberately
narrow: it does not promise arbitrary future semantic or generated-schema-format
changes are compatible. Runtime validators still report incompatible event shapes.

No unrelated production bug appeared during verification. GitHub delivery targets
`andromedus1/agent-board`, as explicitly requested by the user; authentication on the
new Mac is being established before pushing the verified branch.

## Review (2026-10-06)

Verdict: approve. Effective weight: standard; one bounded inline standalone-story
pass in the implementation context, with no independent or cross-model reviewer.
Correctness, regression evidence, temporary-resource cleanup, shell-free bounded
execution, compatibility behavior, and foundation assertions were checked against
the final diff. No material code blockers remain. The separate documentation
consistency audit returned zero Critical/High findings; its pre-existing Medium
findings are outside this repair.

The capability probe is a narrow preflight, not a universal schema-equivalence
checker. Runtime validation remains necessary and tested. Compatible future
versions no longer require a manual allowlist edit; real capability drift still
fails closed. No persistent schema cache can outlive a Codex binary upgrade.

GitHub authentication is now established as `andromedus1` through GitHub CLI using
macOS keyring storage and HTTPS Git credentials. This repository defaults to its
existing `andromedus1` remote, and local main tracks `andromedus1/main`. That remote
main is an ancestor 320 commits behind the previously reviewed local main; delivery
will use a pull request to synchronize current application history and this fix.
