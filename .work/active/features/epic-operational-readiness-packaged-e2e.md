---
id: epic-operational-readiness-packaged-e2e
kind: feature
stage: done
tags: [e2e-test, integration]
parent: epic-operational-readiness
depends_on: [epic-operational-readiness-doctor-command]
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-16
---

# Packaged Vertical-Slice Proof

## Brief

Prove the V1 from its packed npm artifact, not source-only imports. Install the
tarball into a temporary prefix, invoke all four public bins, and use temporary
state plus deterministic fake Codex/Ghostty executable boundaries to exercise
registration, working, input-needed, completion-unread, idle, error, board/title
parity, acknowledgement, unregister, diagnosis, and cleanup.

Keep default tests hermetic and safe. Add separately named opt-in probes for the
installed Codex protocol and a disposable Ghostty surface; they must never touch
existing user tabs and must skip with an explicit reason when prerequisites are
absent. No release/deployment automation belongs here.

## Epic context

- Parent: `epic-operational-readiness`.
- Depends on the public doctor contract and validates the complete packaged V1.

## Foundation and research

- `docs/ARCHITECTURE.md` — packaging and contract-derived testing pyramid.
- `docs/SPEC.md` — five-state acceptance boundary and responsiveness.
- Runtime research briefs — installed protocol and safe Ghostty probe limits.

## Design decisions

- **Artifact under test**: build and `npm pack`, then install the tarball into a
  fresh temporary prefix. Every journey invokes the prefix's linked public bins;
  e2e assertions never import product source modules.
- **Out-of-process executable mocks**: Codex, Ghostty CLI, and AppleScript are
  local executable/process protocols, not network services. No off-the-shelf
  service mock can impersonate `/usr/bin/osascript` or a PTY-owned Codex process,
  and a container cannot replace a macOS host executable boundary. Use small
  deterministic Node executable services in the project's language, invoked by
  the real process runner. These are service-level mocks, not in-process stubs.
- **Explicit command seams**: add shell-free, absolute-path-validated executable
  overrides for the three external commands while retaining production defaults
  (`codex`, `ghostty`, `/usr/bin/osascript`). The packed test passes only those
  paths plus temporary state/scenario files; no generic command string or shell
  evaluation is introduced.
- **Determinism over timing guesses**: fake services coordinate through
  per-test scenario/control files and bounded polling. Lifecycle-to-state/title
  convergence must complete within 1,000 ms; fixtures expose readiness markers
  rather than relying on sleeps.
- **Taxonomy**: golden, failure, and deterministic chaos apply. Fuzzing does not:
  the e2e surface is a small command grammar plus already schema-tested JSON and
  protocol parsers, and adding a property framework here would duplicate stable
  lower-level contracts rather than assert a user journey.
- **Live probes are separate and opt-in**: default `npm test` never launches
  installed Codex or changes real Ghostty. Live tests require explicit env flags,
  use a newly created disposable Ghostty window when supported, and skip with an
  actionable reason before mutation if safe isolation cannot be proven.

## Mock-boundary plan

| External dependency | Boundary substitute | Rationale / contract |
| --- | --- | --- |
| Codex CLI/app-server/remote TUI | `tests/e2e/fixtures/fake-codex.mjs`, an out-of-process Node executable | No off-the-shelf mock exists for Codex's local process + WebSocket lifecycle. It implements only `--version`, ephemeral-loopback readiness, narrow JSON-RPC initialization/subscription/discovery, controlled lifecycle notifications, and remote-TUI exit/interrupt. Scenario state is reset per test. |
| `/usr/bin/osascript` → Ghostty AppleScript | `tests/e2e/fixtures/fake-osascript.mjs`, an out-of-process Node executable | The real boundary is a host executable with positional args, not a network service. It returns captured protocol rows for active/focused/snapshot/title/clear scripts and updates a private scenario JSON file so titles are externally inspectable. |
| Ghostty CLI version/config | `tests/e2e/fixtures/fake-ghostty.mjs`, an out-of-process Node executable | Implements only `--version` and `+show-config [--default]`, including incompatible/permission scenarios consumed by doctor. |
| Filesystem state | Real temporary filesystem | This is product-owned local state, so use the real packed store/locks/atomic writes, isolated by `AGENT_BOARD_STATE_DIR`; no mock. |
| npm package install | Real `npm pack` + temporary-prefix install | Exercises manifest, file inclusion, dependency resolution, shebangs, and links. Installation is shell-free and uses the cache populated by the project install; the test makes no application network calls. |

Docker Compose is intentionally not used. It would move the mocks away from the
actual macOS executable boundary, make `/usr/bin/osascript` replacement less
faithful, and add a daemon dependency to a local CLI project. The purpose-built
mock processes are the closest service-level substitute and run outside the
product process.

## Taxonomy plan

- **Golden: 4 journeys** — packed install/all bins; register/rename plus
  board/title parity; managed lifecycle through working, input-needed,
  completion-unread and clean idle; exact/focused ack and unregister across two
  independently identified sessions.
- **Failure: 5 journeys** — invalid command/unsafe label; incompatible Codex and
  Ghostty doctor results; unavailable AppleScript snapshot degradation; managed
  app-server/turn failure projected as error; clear-title failure retains the
  registration.
- **Chaos: 3 deterministic journeys** — kill the fake app-server mid-turn;
  remove then restore Ghostty snapshot availability; send termination while the
  remote TUI is active. Each asserts visible degradation/recovery and no corrupt
  session JSON or orphaned owned process.
- **Fuzz: not applicable** — parser/validator properties belong to the existing
  domain/protocol suites; packaged e2e adds value only through real user-visible
  workflows.
- **Live: 2 opt-in probes** — installed Codex version/narrow schema contract and
  disposable Ghostty create/set/clear/close identity contract.

## Implementation units

### Unit 1: Package harness and executable services

**Files**: `tests/e2e/support/package-harness.ts`,
`tests/e2e/support/board.ts`, `tests/e2e/fixtures/fake-codex.mjs`,
`tests/e2e/fixtures/fake-osascript.mjs`,
`tests/e2e/fixtures/fake-ghostty.mjs`, plus the small production command-config
seam.

**Story**: `epic-operational-readiness-packaged-e2e-infra`

**Invariant**: A tarball installed into an empty prefix exposes four executable
commands that communicate only with the configured out-of-process services and
temporary state.

The harness uses `node:test`, `spawn`/`execFile` with argv arrays, one temp root
per test, bounded stdout/stderr, readiness polling, and cleanup that terminates
owned child process groups before removing only the recorded temp root. It
records the installed prefix, bin paths, state root, mock service paths, and
scenario file. It must verify every resolved destructive cleanup target is a
child of its fresh temp directory.

The planned scenario responsibility is consolidated in
`tests/e2e/support/package-harness.ts`: that file owns the `Scenario` type,
default scenario creation, the private scenario path, reads, and atomic
temp-file-to-rename writes. `tests/e2e/support/board.ts` owns strict board JSON
reads and bounded row convergence. There is no separate scenario-support
artifact.

### Unit 2: Packaged golden journeys

**File**: `tests/e2e/packaged-golden.test.ts`

**Story**: `epic-operational-readiness-packaged-e2e-golden`

**Invariants**:

1. After packed installation, each named bin executes its public grammar; doctor
   reports all four components and the package contains no tests/source-only
   entry dependency.
2. After naming two fake Ghostty terminals, `agents` shows both stable labels and
   the fake service records matching canonical titles; a rename changes only its
   label/session revision.
3. A managed fake Codex turn makes the public board and title converge through
   `●`, `!`, `✓`, then `○` within 1,000 ms per event without visiting another
   tab.
4. Frontmost focus or an exact full ID acknowledges completion; unregister clears
   the fake title before the session disappears, while the other session remains.

Assertions target exit codes, stdout/stderr, installed JSON state, and the
external scenario service's observed title—not internal calls. Teardown stops
owned children, verifies no canonical partial file, and removes the temp prefix.

### Unit 3: Packaged failure journeys

**File**: `tests/e2e/packaged-failure.test.ts`

**Story**: `epic-operational-readiness-packaged-e2e-failure`

**Invariants**:

1. Invalid grammar/unsafe labels exit nonzero with stable actionable output and
   create no session.
2. Incompatible Codex, old/config-conflicted Ghostty, and denied Automation all
   appear as distinct doctor error codes while independent checks still render.
3. Snapshot loss changes registered rows to diagnostic rather than idle/error and
   preserves readable records.
4. Fake Codex system/app-server failure becomes `× error` with bounded evidence
   and no false completion.
5. Title-clear failure makes unregister exit nonzero, leaves the record and
   managed title available for retry, and a later healthy retry removes both.

### Unit 4: Deterministic degradation and recovery

**File**: `tests/e2e/packaged-chaos.test.ts`

**Story**: `epic-operational-readiness-packaged-e2e-chaos`

**Invariants**:

1. Killing the owned fake app-server mid-turn produces a visible bounded failure,
   terminates its paired TUI, and leaves valid diagnostic/error state.
2. Losing then restoring the fake Ghostty snapshot first yields `?` diagnostics
   and then repairs the canonical title/visible row without data loss.
3. Terminating `agent-codex` while its fake TUI is active performs bounded child
   cleanup and records authoritative interruption rather than completion/error.

Chaos inputs are scenario-file state changes or signals at explicit readiness
markers, never randomness. The suite asserts final public output/state and
owned-process exit, not fixture invocation counts.

### Unit 5: Opt-in installed compatibility probes

**Files**: `tests/integration/installed-codex.test.ts`,
`tests/integration/disposable-ghostty.test.ts`, and package scripts
`test:integration:codex` / `test:integration:ghostty`.

**Story**: `epic-operational-readiness-packaged-e2e-live`

**Invariants**:

1. With `AGENT_BOARD_LIVE_CODEX=1`, the installed Codex version and consumed
   narrow app-server shapes remain compatible; otherwise the test reports an
   explicit skip reason before spawning Codex.
2. With `AGENT_BOARD_LIVE_GHOSTTY=1`, the harness creates a new disposable
   Ghostty window, captures its IDs, sets/reads/clears only that title, closes the
   same window, and proves the previously active terminal was never targeted. If
   the installed dictionary cannot create/identify a disposable surface, skip
   before title mutation with remediation rather than borrowing a user tab.

Live teardown is `try/finally`, targets only captured disposable IDs, and is
idempotent. These scripts are absent from default `npm test`.

## Implementation order

1. `epic-operational-readiness-packaged-e2e-infra`
2. `epic-operational-readiness-packaged-e2e-golden`
3. `epic-operational-readiness-packaged-e2e-failure`
4. `epic-operational-readiness-packaged-e2e-chaos`
5. `epic-operational-readiness-packaged-e2e-live`

One feature owner should implement the stories sequentially because all journeys
share the package installation and process-service harness. Stories are design
and acceptance checkpoints, not separate worker units.

## Test integrity

If a specified journey exposes a real production bug, park it, retain the
failing test as a linked skip with a one-line reason, and continue; never weaken
the invariant. Fix stale fixtures/mocks in-session. Never assert only that a
mock was invoked, mirror production algorithms, accept empty/default output, or
change an expected value to whatever the current product emits.

## Risks

- **Mock fidelity**: the custom Codex service is the weakest boundary because it
  implements a stateful WebSocket/process protocol. Keep messages copied from
  validated fixtures, version the scenario vocabulary only inside tests, and
  pin it with the opt-in installed contract probe.
- **Package-install isolation**: npm may consult its cache while installing
  runtime dependencies. Run offline after the project's normal dependency
  install and fail clearly if the cache cannot satisfy the already-locked graph;
  never silently fall back to network during the e2e command.
- **Process leaks**: every spawned process belongs to the harness, exposes a
  readiness marker, and is tracked for bounded TERM→KILL teardown. Avoid PID
  guesses and machine-wide cleanup.
- **Timing flakes**: event convergence uses readiness/control files plus bounded
  polling; the 1,000 ms contract starts only after the fake service confirms
  emission. No fixed sleeps.
- **Live safety**: Ghostty probes stop before mutation unless a newly created,
  uniquely captured surface exists. A failed precondition is a skip, never
  permission to use the active user tab.

## Review plan

Standard weight: child stories close directly on verification; the completed
feature receives one independent review pass, receiver fixes/adjudication, then
done without re-review.

## Implementation notes
- Execution capability: GPT-5.6 inline feature owner; five child checkpoints implemented sequentially because all journeys share one package/process harness.
- Review weight: standard; one independent cross-model pass completed.
- Files changed: `src/integrations/command-config.ts`; command composition and Ghostty command seams; `tests/e2e/support/package-harness.ts`; three out-of-process executable fixtures; four packaged e2e suites; two opt-in integration probes; package scripts; five child story records.
- Tests added: packed install/source-free prefix, all four bins, title/board parity, managed lifecycle, acknowledgement/unregister, doctor/failure/degradation, deterministic chaos, installed Codex schema compatibility, and disposable Ghostty identity/title safety.
- Simplification: no Docker daemon, tmux, shell evaluation, source imports in product assertions, random chaos, PID guesses, or broad cleanup; fixture processes use argv and private scenario files.
- Discrepancies from design: Docker Compose was replaced by executable-process mocks because the external boundaries are local macOS processes; Codex completion after input explicitly includes the input-resolved edge; Ghostty clear-title verification checks marker removal because shell-derived title restoration is expected.
- Adjacent issue discovered and drained: `story-fix-lock-contention-silent-exit`.

## Integrated verification
- `npm run typecheck` passes.
- `npm run build` passes.
- Focused packaged e2e plus lock regression passes: 8 passed.
- Uncontended full suite passes: 159 passed, 0 failed, 2 explicit opt-in skips.
- Child checkpoints `epic-operational-readiness-packaged-e2e-infra`, `...-golden`, `...-failure`, `...-chaos`, and `...-live` are all `stage: done` with acceptance evidence.

## Review (2026-08-14)

**Verdict**: Approve with fixes.

**Blockers resolved**:

- The packaged suite exposed a real production lock bug. The focused standalone
  repair now keeps retry timers referenced, enforces a finite acquisition bound,
  and proves a contending process reports `LOCK_TIMEOUT` instead of exiting zero
  without output.
- Removed the chaos helper's blanket catch and consolidated packaged board reads
  into one strict helper that rejects empty successful output.

**Important fixes**:

- Scenario writers now publish through temp-file rename, preventing fixture
  readers from observing torn JSON.
- `npm test` rebuilds first, so `npm pack` cannot validate stale `dist` output.
- Harness creation removes its private temp root when pack or install setup
  fails; ordinary teardown retains bounded TERM-to-KILL ownership.
- The packaged doctor assertion now covers runtime, state, Codex, and Ghostty.
- Test finalizers delegate process shutdown to the bounded harness rather than
  awaiting a child indefinitely before cleanup.

**Nits adjudicated**: direct-child signaling is sufficient because the product
launcher owns and cleans its descendants; retained compact harness error-code
normalization because it is test-only and all asserted failures include bounded
stderr. Standard review weight: one pass, receiver fixes, no re-review.
