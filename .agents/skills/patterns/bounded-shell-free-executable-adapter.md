# Bounded Shell-Free Executable Adapter

External command adapters use injected `ProcessRunner` instances, positional
argv, explicit time/output bounds, and narrow response parsing.

## Rationale

`NodeProcessRunner` enforces `shell: false`, bounded output, and bounded
execution (`src/integrations/process-runner.ts:23`). Ghostty, macOS prompt, Git,
Codex, and diagnostics adapters reuse that boundary while applying
protocol-specific result semantics.

## Examples

### Ghostty AppleScript transport

**File**: `src/integrations/ghostty/client.ts:75`

```ts
private async execute(script: string, ...args: readonly string[]): Promise<string> {
  const request: ProcessRequest = {
    command: this.command,
    args: ["-e", script, "--", ...args],
    timeoutMs: this.timeoutMs,
    maxOutputBytes: this.maxOutputBytes,
  };
  const result = await this.runner.run(request);
  if (result.exitCode !== 0) throw ghosttyProcessError(result.stderr, result.exitCode);
  return result.stdout;
}
```

### Native rename prompt protocol

**File**: `src/integrations/macos/rename-prompt.ts:37`

```ts
const request: ProcessRequest = {
  command: this.command,
  args: ["-e", PROJECT_RENAME_PROMPT_SCRIPT, "--", currentLabel],
  timeoutMs: this.timeoutMs,
  maxOutputBytes: this.maxOutputBytes,
};
const result = await this.runner.run(request);
if (result.exitCode !== 0) {
  throw new AgentBoardError("ADAPTER_FAILURE", "macOS rename prompt failed");
}

const output = withoutOneTrailingLineBreak(result.stdout);
if (output === CANCELLED) return null;
if (output.startsWith(RENAMED_PREFIX)) return output.slice(RENAMED_PREFIX.length);
throw new AgentBoardError("ADAPTER_FAILURE", "macOS rename prompt returned an invalid response");
```

### Optional Git discovery

**File**: `src/integrations/git/repository-context.ts:46`

```ts
const request: ProcessRequest = {
  command: COMMAND,
  args: ["-C", workingDirectory, ...args],
  timeoutMs: this.timeoutMs,
  maxOutputBytes: this.maxOutputBytes,
};
try {
  const result = await this.runner.run(request);
  if (result.exitCode !== 0) return undefined;
  return oneLine(result.stdout);
} catch {
  return undefined;
}
```

## When to Use

- Invoking bounded, request/response-style local executables.
- User or adapter data must travel as argv rather than shell text.
- Unit tests need to inspect exact requests without launching real programs.

## When NOT to Use

- An in-process library supplies the boundary.
- A long-lived streaming child requires lifecycle ownership; use a dedicated
  process host with equivalent bounds.
- The operation needs inherited terminal stdio.

## Common Violations

- Enabling a shell or interpolating dynamic data into scripts.
- Omitting timeout or output bounds.
- Trusting successful exit output without parsing its exact protocol.
- Mocking global child-process APIs instead of injecting the runner.
