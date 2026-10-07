---
id: epic-operational-readiness-doctor-command
kind: feature
stage: done
tags: [cli, integration]
parent: epic-operational-readiness
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Actionable Doctor Command

## Brief

Deliver `agent-board doctor [--json]` from one typed diagnostic report covering
the supported runtime, Codex compatibility, Ghostty version/config/Automation
contract, and Agent Board state-directory access. Human and JSON output must
carry stable codes, severity, and remediation; diagnosed errors return nonzero
without hiding the rest of the report.

Reuse the existing bounded process and Ghostty diagnostic boundaries. The check
may make and remove a private probe inside Agent Board's state directory but
must not rename tabs, start an agent, modify configuration, or touch repositories.
Extend the command registry without weakening `ack`/`unregister` grammar.

## Epic context

- Parent: `epic-operational-readiness`.
- First arc; supplies a public health contract used by packaged proof and docs.

## Foundation and research

- `docs/SPEC.md` — setup diagnostics and platform constraints.
- `docs/ARCHITECTURE.md` — doctor surface, JSON convention, dependencies.
- `.research/analysis/briefs/codex-detector-topology.md` — compatibility gate.
- `.research/analysis/briefs/ghostty-registration-liveness.md` — version,
  config, dictionary, and Automation requirements.

## Design

### Canonical report

Add `src/application/doctor.ts` with a closed V1 component registry and one
immutable report:

```ts
export type DoctorComponent = "runtime" | "state" | "codex" | "ghostty";
export type DoctorSeverity = "info" | "warning" | "error";

export interface DoctorCheck {
  readonly component: DoctorComponent;
  readonly code: string;
  readonly severity: DoctorSeverity;
  readonly message: string;
  readonly remediation?: string;
}

export interface DoctorReport {
  readonly schemaVersion: 1;
  readonly checkedAt: string;
  readonly ready: boolean;
  readonly checks: readonly DoctorCheck[];
}

export async function diagnoseSystem(
  dependencies: DoctorDependencies,
): Promise<DoctorReport>;
```

The application service runs every component check even when one fails, orders
checks by the registry above and then stable code, and sets `ready` only when no
error exists. It validates the clock and freezes the report/checks. Expected
external failures become error checks with bounded messages and remediation;
programmer/boundary-shape errors remain thrown failures rather than being hidden
inside a nominal report.

Runtime checks use the injected Node version and require Node 22+. Codex uses a
narrow `version(): Promise<string>` port backed by `CodexProcessHost`, retaining
the already-tested 0.147.x gate. Ghostty uses `diagnoseGhostty` and maps its
existing stable diagnostics; a clean report adds explicit version/Automation
info checks so silence never looks like a skipped probe.

### State-directory probe

Add `src/infrastructure/state-diagnostics.ts` with an injected `StateProbePort`
for the application layer. The production probe resolves the existing state
paths, creates only Agent Board's root/sessions/locks directories, writes a
unique mode-0600 probe file with exclusive creation, closes it, and removes it
in `finally`. It returns the resolved root on success. Symlinks or filesystem
paths follow the same intentional-directory policy as the real store; invalid or
unwritable filesystem targets fail visibly. It never reads or modifies session
records and never touches repositories. Tests use a temporary root and verify
cleanup and bounded failure behavior.

### Rendering and command registry

Add `src/cli/doctor-output.ts`:

- Human output starts `AGENT BOARD DOCTOR`, prints one `[ok]`, `[warn]`, or
  `[error]` line per check grouped in canonical order, indents remediation, and
  ends with `Ready.` or `Not ready.`.
- JSON is the newline-terminated `DoctorReport` itself; its `schemaVersion` is
  already part of the canonical report, so do not wrap it again.
- Both paths use already-validated terminal-safe text and never include process
  environment values, prompt content, tokens, raw stacks, or full stderr dumps.

Refactor `src/cli/agent-board.ts`'s registry into real command definitions that
own argument parsing and execution:

```text
ack [session-id]
unregister [session-id]
doctor [--json]
```

Each definition receives only its tail arguments and returns `{ output,
exitCode }`. Unknown commands or invalid per-command grammar print one
three-command usage block to stderr and return 2 before any operation. Doctor
prints its report to stdout and returns 0 when ready, 1 when not ready; thrown
boundary failures retain shared error formatting and exit 1. Ack/unregister
behavior and grammar remain byte-for-byte stable.

### Composition

Extend `createAgentBoardCommand` with `doctor(): Promise<DoctorReport>` and
injectable doctor dependencies. Production composition shares no mutable session
operation with the diagnostic probe: it creates a `CodexProcessHost`, calls the
existing Ghostty diagnostic service, provides the real Node version/clock, and
uses the state probe. Tests inject every port and never call installed tools.

### Implementation units

1. `doctor.ts` — aggregate, normalize, order, and freeze diagnostic evidence.
2. `state-diagnostics.ts` — private state-root write/remove probe.
3. `doctor-output.ts` — stable human and JSON projection.
4. `agent-board.ts` and `create-agent-board.ts` — per-command registry grammar
   and production wiring.
5. Focused application, infrastructure, renderer, and CLI tests.

No child stories are needed; the report, renderers, and router extension form one
public command contract and fit one implementation stride.

## Test strategy

- Application tests inject clean, warning, incompatible, absent, and thrown
  component results; prove all components run, order is deterministic, ready
  derives only from errors, external failures are bounded/actionable, invalid
  clocks/shapes fail, and output is immutable.
- State tests use `AGENT_BOARD_STATE_DIR` under a fresh temporary directory;
  prove the expected directories are created, the probe is removed, existing
  session files are untouched, and unwritable/invalid roots fail without
  broad cleanup.
- Renderer fixtures cover clean and mixed-severity human reports, remediation,
  Unicode safety, exact JSON, and no raw causes.
- Router tests pin `doctor`, `doctor --json`, readiness exit 0/1, invalid flags
  and operands, and unchanged ack/unregister forms. No real process or Ghostty
  call occurs.
- Composition tests inject ports. Run focused tests, typecheck, build, then the
  uncontended full suite and smoke-test the built installed-style bin guard.

## Risks and boundaries

- Doctor is diagnostic, not an installer: it reports config/permission issues
  but never changes Ghostty, shell files, or macOS settings.
- A state write probe is necessary to prove later operations can persist; its
  scope and cleanup are deliberately narrower than a generic temp-file cleanup.
- The Codex app-server API remains experimental. Version readiness is truthful
  only for the locked tested family and does not promise future compatibility.
- JSON is a public automation surface; keep its schema small and derived from the
  same report as human output.

## Acceptance criteria

- `agent-board doctor [--json]` reports runtime, state, Codex, and Ghostty checks
  with stable severity/codes/remediation and truthful exit status.
- One component failure never prevents independent checks from running.
- The state probe confines writes/removal to the resolved Agent Board root.
- Ack/unregister grammar/output remains stable while the command registry gains
  doctor without generic execution or arbitrary flags.
- Typecheck, build, focused tests, and full tests pass; the built bin executes.

## Review plan

Standard weight: one independent feature pass, receiver adjudication/fixes,
green verification, then done without re-review.

## Implementation notes

- Execution capability: GPT-5.6 Luna, high reasoning; cohesive application/infrastructure/CLI feature with bounded external seams.
- Review weight: standard (project convention).
- Files changed: `src/application/doctor.ts`, `src/infrastructure/state-diagnostics.ts`, `src/cli/doctor-output.ts`, `src/cli/agent-board.ts`, `src/composition/create-agent-board.ts`, and focused application, infrastructure, and CLI tests.
- Tests added/removed: Added aggregate ordering/immutability and failure-isolation tests; scoped filesystem probe cleanup, intentional-symlink, and invalid-root tests; human/JSON/Unicode renderer fixtures; typed runtime/Codex branches; and doctor router grammar/readiness/prototype-key tests. None removed.
- Simplification: Reused the existing Ghostty diagnostic report, Codex process host version port, state path resolver, and shared CLI error formatting; no new process or CLI framework was introduced.
- Discrepancies from design: The command usage line presents the three commands in one stable block and documents the two valid optional operand forms (`session-id|--json`); production composition injects a `doctorDependencies` object so all diagnostic ports remain hermetic in tests.
- Adjacent issues parked: none.

## Verification

- Focused doctor and supporting-boundary verification: 35 passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; `dist/cli/agent-board.js` emitted.
- Uncontended full suite: 147 passed, 0 failed.

## Review (2026-08-14)

**Verdict**: Approve with fixes

**Blockers**: none.

**Important fixes**:

- Ghostty Automation readiness now derives from the AppleScript probe itself;
  an independent version or configuration error no longer fabricates an
  Automation failure.
- Command dispatch rejects inherited object keys instead of treating prototype
  properties as registered commands.
- Codex compatibility now returns typed `unsupported` and `unrecognized`
  reasons, so diagnostic classification never depends on matching error prose.
- The state probe follows the same intentional directory-symlink policy as the
  production store while still rejecting invalid non-directory roots.
- Added the missing regression coverage for typed Codex branches, Ghostty
  failure independence, prototype-key rejection, Unicode rendering, and state
  root behavior.

**Nits adjudicated**: retained sequential checks because four bounded probes do
not justify concurrency in V1; centralized component ordering for renderer and
application consistency; kept state paths out of human output to avoid leaking
operator-specific filesystem details.

**Verification**: standard-weight one-pass review; receiver applied the five
material findings. Focused doctor verification passes at 35/35, and typecheck
and build pass. The combined full suite exposed one intermittent packaged-e2e
failure now owned by that feature's review; doctor tests remain green.
