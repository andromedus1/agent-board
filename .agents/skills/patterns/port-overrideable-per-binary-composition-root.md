# Port-Overrideable Per-Binary Composition Root

Each CLI binary has a dedicated factory that constructs production adapters by
default while accepting narrow dependency overrides.

## Rationale

The four composition modules correspond to the four installed command surfaces
(`docs/ARCHITECTURE.md:218`). Their factories isolate environment/configuration
wiring from CLI parsing and application behavior, and their override options
provide hermetic seams.

## Examples

### Naming command wiring

**File**: `src/composition/create-agent-name.ts:18`

```ts
export interface AgentNameCompositionOptions {
  store?: RegistrationStore;
  terminal?: RegistrationTerminalPort & FocusedTerminalPort;
  repositories?: RepositoryContextPort;
  prompt?: ProjectRenamePromptPort;
  workingFreshForMs?: number;
}

export function createAgentNameCommand(
  options: AgentNameCompositionOptions = {},
): AgentNameCommand {
  const store = options.store ?? new JsonSessionStore();
  const terminal = options.terminal ?? new GhosttyClient({ command: osascriptCommand });
```

### Board command wiring

**File**: `src/composition/create-agents.ts:12`

```ts
export interface AgentsCompositionOptions {
  readonly store?: SessionStore;
  readonly terminal?: ReconciliationTerminalPort;
  readonly launcher?: LauncherLivenessPort;
  readonly workingFreshForMs?: number;
}

export function createAgentsCommand(options: AgentsCompositionOptions = {}): AgentsCommand {
  const dependencies: ListSessionsDependencies = {
    store: options.store ?? new JsonSessionStore(),
    terminal: options.terminal ?? new GhosttyClient(...),
    launcher: options.launcher ?? new NodeLauncherLiveness(),
```

### Administrative command wiring

**File**: `src/composition/create-agent-board.ts:20`

```ts
export interface AgentBoardCompositionOptions {
  readonly store?: SessionStore;
  readonly terminal?: ReconciliationTerminalPort & FocusedTerminalPort;
  readonly launcher?: LauncherLivenessPort;
  readonly workingFreshForMs?: number;
  readonly doctorDependencies?: DoctorDependencies;
}

export function createAgentBoardCommand(
  options: AgentBoardCompositionOptions = {},
): AgentBoardCommand {
  const store = options.store ?? new JsonSessionStore();
  const terminal = options.terminal ?? new GhosttyClient({ command: osascriptCommand });
```

## When to Use

- Adding or extending an installed binary.
- Wiring platform adapters, configuration, clocks, IDs, and application use
  cases.
- Providing dependency seams for CLI or integration tests.

## When NOT to Use

- Inside domain or application logic.
- For pure helpers with no external dependencies.
- As a global service locator shared implicitly across commands.

## Common Violations

- Instantiating adapters inside use cases or CLI parsers.
- Typing override seams as concrete adapter classes.
- Constructing separate stores or clocks for operations that must share one
  command invocation.
