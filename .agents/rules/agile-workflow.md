<!-- agile-workflow:rules:start -->
## Agile-Workflow Rules

### Tag semantics

A few tags carry load-bearing routing semantics — get these right:

- **`[refactor]`** — behavior-preserving structural change ONLY. Apply the
  black-box test: would any observable behavior change for a caller of the
  public surface? If yes, this is NOT a refactor — drop the tag and let the
  item route through `feature-design`.
  - Counts as refactor: extract a helper to dedupe, split a god file, rename
    for clarity, remove dead code, inline a one-call abstraction.
  - Does NOT count as refactor (even if it feels "structural"): change an API
    signature, swap a storage backend with different consistency guarantees,
    replace a silent failure with an explicit error, split a function in a
    way that changes call-site contracts, "major rework of X."
- **`[perf]`** — performance work. Routes to `perf-design`.
- **`[research]`** — a grounded research engagement: an *input* that grounds
  other work (a decision, a design, an adoption call), not a shippable
  deliverable. Routes **cross-plugin** to `agentic-research:research-orchestrator`,
  not a design-family skill. The work item carries the **commissioning subset**
  of the engagement registration in a `research_dials:` block (the four scoping
  fields: `scope_authority`, `verification_rigor`, `intent`, `output_kind`) —
  **scoping the item IS the dispatch act**; the orchestrator reads those dials at
  kickoff and settles the rest at dispatch. A `[research]` item **does not bind
  to a release** (it is an input, not a bundle member) and its verification
  **gates run inline** in the orchestrator (it never reaches `release-deploy`).
  Routes through `feature-design` only as the inert-tag fallback.

All other tags are project-specific (see `.work/CONVENTIONS.md`) and do not
affect skill routing.

### Engineering posture

Prefer short, clear code and context-appropriate rigor over speculative
generality. Not every project needs exhaustive invariants, edge handling, firm
determinism, or universal coverage. Test important interfaces, complex units,
and regressions learned from bugs—not every line. When touching an area,
eliminate unnecessary code, tests, checks, abstractions, and compatibility
paths; leave it simpler. Ask before removing meaningful behavior, guarantees,
validation, compatibility, or safety.

Compatibility is earned, not assumed. Absent a project declaration of external
consumers, only two things create compatibility obligations: dependencies
outside the repository that are not owned by the author, and substantial real
data that must be preserved or transformed. Agent tooling, MCP servers,
internal services, and unpublished libraries have no external consumers by
default—never version project-owned schemas (v1/v2/v3) or keep compat shims for
surfaces the project owns; change them in place. Real-data migrations are
planned by the agent but approved and executed by the user for production data;
do not run production transforms autonomously.

Release-bound items define a gate's focus, not a hard scan boundary. Gates may
follow concrete evidence into adjacent dependencies, shared infrastructure, or
system-wide mechanisms. Bind release-relevant findings; route merely ambient
discoveries to the unbound backlog so a scan does not silently expand a release.

### Test integrity

When running, writing, or modifying tests:

- **File real production bugs as backlog items.** When a test failure
  surfaces an actual product bug (not a stale fixture, drifted assertion,
  or broken mock), park it via `/agile-workflow:park` instead of silently
  fixing it inline mid-test-pass. The backlog item is the audit trail.
- **Fix bad tests in-session.** Stale fixtures, drifted assertions, broken
  mocks, and outdated snapshots are test debt, not product bugs. Repair
  them as you go so the suite stays meaningful.
- **Then drain small backlog bugs with a full pass.** Once tests are
  green again, if a parked production bug is small enough for a single
  stride, pick it up immediately as `/agile-workflow:scope` → design →
  implement. Larger bugs stay in backlog for prioritization.
- **Tests must earn their upkeep.** Prefer tests at stable interfaces,
  regression tests for real bugs, and unit tests for genuinely complex
  units. Do not add tests merely to cover every line or surface; remove
  duplicate, tautological, implementation-bound, or obsolete tests when
  they add less confidence than maintenance cost.
- **NEVER game a test to make it pass.** A failing test that documents
  *why* it fails — an inline comment naming the bug, a `skip` linked to a
  backlog id, an `xfail` with a reason — is more honest than a green test
  that lies. No `expect(true).toBe(true)`, no asserting on whatever the
  code happens to return, no deleting a test as "flaky" without
  root-causing first.

Implementation orchestration defaults to one worker per feature. Bundle related
features into one sequential worker when shared context reduces handoffs; split
an unusually large feature only by coherent write ownership. Child stories are
design and acceptance checkpoints, not default worker units.

Review is non-blocking for dependency-ordered implementation: an item at
`review` satisfies downstream implementation dependencies while its review
runs. Child stories advance directly to `done` after green verification and
never receive review. Standalone stories receive bounded inline review but
never an independent, fresh-context, or cross-model reviewer. Features are the
normal implementation-review boundary; epics receive their own deeper
aggregate review after child features are done. Broader scope gets deeper
review because integration and capability gaps emerge there; child-story
review is avoided because it tends toward pedantry and over-engineering.
Independent feature and epic reviews may run in parallel and must not
serialize the next implementation wave. Review weight defaults to
`standard`: one independent pass, then receiver adjudication, fixes for
material blockers, verification, and `done` without re-review. Epic review
is broader than feature review, but it does not add passes to `standard`.
Only `thorough` and `maximum` use multi-pass review; they repeat until a pass
yields no receiver-confirmed material current-cycle blockers. Smaller
findings are parked unbound, kept as nits, or rejected by judgment and do not
keep the loop open.

Cross-model advisory review: explicit user/project review instructions override
agile-workflow defaults. When peeragent is available with a different model
class, large/risky feature, epic, or final-completion reviews may use it;
standalone stories never do. Reviewer findings are proposals: the receiving
orchestrator verifies them against repository context and actual risk. Only
credible material current-cycle risks block; park valid lower-priority findings
in the unbound backlog and continue. Same-model peers fall back to local
sub-agents instead. Claude Opus peeragent calls can take 10 to 30 minutes on
large reviews; no return after a few minutes is not evidence that the call has
hung.

Broad entry points:
`/agile-workflow:ideate`, `/agile-workflow:epicize`, autopilot goals such as
"Use agile-workflow autopilot to drain --all", and
`/agile-workflow:release-deploy`.
<!-- agile-workflow:rules:end -->
