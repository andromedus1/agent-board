---
id: epic-ghostty-project-surface-applescript-adapter
kind: feature
stage: done
tags: [integration]
parent: epic-ghostty-project-surface
depends_on: []
release_binding: null
gate_origin: null
created: 2026-08-14
updated: 2026-08-14
---

# Ghostty AppleScript Adapter

## Brief

Implement the validated macOS/Ghostty boundary for active-context discovery,
full hierarchy enumeration, targeted tab-title set/clear, installed version and
configuration checks, and actionable Automation errors. Scripts remain constant
source files or constants and accept all dynamic values as positional arguments.

The adapter must distinguish protocol/parse errors from missing permissions or
unsupported Ghostty and expose deterministic fixtures so most tests run without
launching the app. It does not register sessions or decide projected status.

## Inherited design decisions

- Ghostty 1.3+ AppleScript is mandatory; no implicit OSC fallback.
- IDs and labels are arguments, never interpolated script.

## Research and foundation references

- `.research/analysis/briefs/ghostty-registration-liveness.md` — installed API and failure contract.
- `docs/ARCHITECTURE.md` — Ghostty adapter and diagnostics boundaries.
- `docs/SPEC.md` — title ownership and safe label transport.

## Design decisions

- Use `/usr/bin/osascript` with constant AppleScript strings and `--`-separated
  positional arguments. Do not invoke a shell.
- Query active context, application hierarchy, and terminal working directory
  through separate bounded scripts. Hierarchy rows contain only stable IDs in a
  strict tab/newline protocol; arbitrary working-directory text is returned by
  its single-value script.
- Expose a process-runner port so fixture tests exercise every parser and error
  mapping without launching Ghostty.
- Diagnose effective config by parsing defaults from
  `ghostty +show-config --default` and overlaying user differences from
  `ghostty +show-config`; this keeps default `bell-features=...title...` visible.
- Minimum version is `1.3.0`. Automation denial, disabled AppleScript, fixed
  global title, title bell decoration, missing target, timeout, and malformed
  output receive distinct stable diagnostic codes/messages.

## Architectural choice

Considered OSC, generated one-off AppleScript, JXA/JSON, and constant
AppleScript with a narrow text protocol. OSC races normal shell integration.
Generated scripts create injection risk. JXA dictionary behavior is less directly
grounded than the verified AppleScript surface. Constant AppleScript plus strict
ID rows is selected; unbounded working-directory text travels alone and never
needs delimiter escaping.

The trickiest unit is distinguishing a registered terminal that remains
application-enumerable outside the current window/tab hierarchy. The adapter
returns raw hierarchy facts; the later reconciliation feature owns that policy.

## Implementation Units

### Unit 1: Process boundary and bounded execution

**File**: `src/integrations/process-runner.ts`

```typescript
export interface ProcessRequest {
  command: string;
  args: readonly string[];
  timeoutMs: number;
  maxOutputBytes: number;
  env?: NodeJS.ProcessEnv;
}
export interface ProcessResult { stdout: string; stderr: string; exitCode: number; }
export interface ProcessRunner { run(request: ProcessRequest): Promise<ProcessResult>; }
export class NodeProcessRunner implements ProcessRunner {
  run(request: ProcessRequest): Promise<ProcessResult>;
}
```

Use `spawn` without shell, bounded stdout/stderr, timeout via abort/kill, and
stable adapter errors that never include environment contents.

**Acceptance Criteria**:

- [ ] Arguments remain distinct bytes and are never shell-evaluated.
- [ ] Timeout/output overflow/nonzero exit are bounded and diagnosable.

### Unit 2: Constant Ghostty scripts

**File**: `src/integrations/ghostty/scripts.ts`

```typescript
export const ACTIVE_CONTEXT_SCRIPT: string;
export const HIERARCHY_SCRIPT: string;
export const WORKING_DIRECTORY_SCRIPT: string;
export const SET_TAB_TITLE_SCRIPT: string;
export const CLEAR_TAB_TITLE_SCRIPT: string;
```

Scripts query Ghostty's stable IDs, current window/tab/terminal relationships,
and targeted terminal actions. Set/clear locate the exact terminal ID and use
`perform action` with `set_tab_title`; clearing passes no title value. A missing
or ambiguous target exits with a recognizable marker.

**Acceptance Criteria**:

- [ ] Dynamic IDs/titles appear only in argv access, never script interpolation.
- [ ] Clear restores normal Ghostty title ownership through the documented action.

### Unit 3: Parsers and Ghostty client

**Files**: `src/integrations/ghostty/protocol.ts`, `src/integrations/ghostty/client.ts`

```typescript
export interface GhosttyContext extends TerminalIdentity { workingDirectory?: string; }
export interface GhosttyHierarchyEntry extends TerminalIdentity {}
export interface GhosttyClientOptions { runner?: ProcessRunner; timeoutMs?: number; }
export class GhosttyClient {
  current(): Promise<GhosttyContext>;
  hierarchy(): Promise<readonly GhosttyHierarchyEntry[]>;
  workingDirectory(terminalId: string): Promise<string | undefined>;
  setTitle(identity: TerminalIdentity, title: string): Promise<void>;
  clearTitle(identity: TerminalIdentity): Promise<void>;
}
export function parseActiveContext(stdout: string): GhosttyContext;
export function parseHierarchy(stdout: string): readonly GhosttyHierarchyEntry[];
```

Validate nonempty control-free IDs, exact field counts, duplicate terminal IDs,
bounded output, and target echoes. `current()` optionally enriches working dir
after identity succeeds.

**Acceptance Criteria**:

- [ ] Malformed/duplicate output fails rather than partially succeeding.
- [ ] Title methods pass hostile labels unchanged as one positional argument.

### Unit 4: Version and configuration diagnostics

**File**: `src/integrations/ghostty/diagnostics.ts`

```typescript
export type DiagnosticSeverity = "error" | "warning" | "info";
export interface IntegrationDiagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  remediation?: string;
}
export interface GhosttyDiagnosticReport {
  version?: string;
  automationReady: boolean;
  diagnostics: readonly IntegrationDiagnostic[];
}
export async function diagnoseGhostty(runner?: ProcessRunner): Promise<GhosttyDiagnosticReport>;
```

Run `ghostty --version`, default/user config reads, and a bounded active-context
probe. Merge config key/value lines last-wins. Error on <1.3, disabled
`macos-applescript`, nonempty fixed `title`, or Automation failure; warn when
`bell-features` contains `title` and explain `no-title` configuration.

**Acceptance Criteria**:

- [ ] Every known incompatibility has one actionable diagnostic.
- [ ] Unknown config lines and additive version output do not fail diagnostics.

### Unit 5: Adapter fixture tests

**Files**: `tests/integrations/process-runner.test.ts`, `tests/integrations/ghostty/protocol.test.ts`, `tests/integrations/ghostty/client.test.ts`, `tests/integrations/ghostty/diagnostics.test.ts`

Use fake runners for scripts/config and harmless local Node subprocesses for
runner timeout/output/argv behavior. Cover success, malformed rows, duplicate
IDs, missing target, permission denial, version boundary, config overlay, bell
warning, fixed title, disabled AppleScript, hostile title arguments, and clear.

**Acceptance Criteria**:

- [ ] Default test suite never opens or mutates Ghostty.
- [ ] Tests assert exact command/argument arrays for every external call.

## Implementation Order

1. Bounded process port.
2. Script constants and strict protocol parsers.
3. Client composition.
4. Diagnostics and complete fixture matrix.

## Testing

No default test invokes `osascript` or the installed Ghostty. Keep live
integration opt-in for the operational-readiness epic and use only a temporary
Ghostty window there.

## Risks

- **AppleScript output delimiters**: stable IDs are expected UUID-like strings,
  but parsers still reject tabs/newlines/controls. Working directory uses a
  separate single-value call.
- **Config semantics drift**: `show-config` output is documented as valid config,
  not ordered input prose. Parse only exact load-bearing keys and tolerate the
  rest.
- **Timeout cleanup**: platform process termination may race exit. The runner
  settles once and bounds both output and timers; later launcher supervision has
  stronger process-group cleanup.

## Child stories

None. These units share one external-boundary protocol and fit one isolated
implementation/review stride.

## Implementation notes

- Execution capability: high — bounded external-boundary feature with strict parser and fixture coverage; implementation remained within the settled design.
- Review weight: standard (caller-directed).
- Files changed: `src/integrations/process-runner.ts`, `src/integrations/ghostty/scripts.ts`, `src/integrations/ghostty/protocol.ts`, `src/integrations/ghostty/client.ts`, `src/integrations/ghostty/diagnostics.ts`, and the four adapter test files under `tests/integrations/`.
- Tests added/removed: process argv/timeout/output tests; strict protocol, duplicate/unsafe row, client argv/error mapping, title action, version/config overlay, and diagnostic fixture tests.
- Simplification: one shell-free process boundary and one constant-script client are shared by all Ghostty calls; no live integration path or OSC fallback was introduced.
- Discrepancies from design: diagnostics treats `null`/`none` title values from default config as unset, while any other nonempty fixed title remains an error; optional working-directory enrichment leaves a valid active identity usable if that secondary query fails.
- Adjacent issues parked: none.

## Review (2026-08-14)

Standard-weight review used one fresh-context cross-model pass with Claude
Sonnet. It found no blockers and proposed two important corrections: explicit
tests for disabled AppleScript/fixed-title diagnostics, and recognition of the
straight-apostrophe macOS “application isn't running” message. Both were
accepted and fixed. Receiver cleanup also removed an unused export and
unreachable process-runner branches, made the working-directory missing-value
sentinel reachable, and aligned the architecture's label-validation ownership.

Post-fix verification passed `npm run typecheck`, `npm run build`, and the full
test suite. Per standard review policy, the feature closes after this one pass,
receiver adjudication, fixes, and verification without re-review.
