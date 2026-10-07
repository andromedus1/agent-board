---
provenance: agent-synthesis
updated: 2026-08-20
---

# Herdr prior art: terminal-level symmetry, inference-bound provider state

Herdr is a terminal runtime and supervisor: each agent stays in a real terminal pane, while Herdr owns the pane topology, supervises recognized foreground agents, and projects pane state into its UI.[herdr-agents-docs]{1} [herdr-automation-docs]{1} This boundary keeps the agent’s shell, logs, prompts, and processes intact; it is not an in-process Claude Code or Codex lifecycle adapter.[herdr-agents-docs]{1} [herdr-integrations-docs]{2}

Its current Claude Code and Codex offering is symmetric at the **terminal-supervision contract**. Both are automatically recognized, both use a screen manifest to classify `idle`, `working`, and `blocked`, and both have an official integration limited to native session identity for restoration.[herdr-agents-docs]{2} [herdr-agents-docs]{3} [herdr-integrations-docs]{2} The repository matches this published boundary: Claude and Codex are both screen-manifest agents, while the complete-lifecycle authority list excludes them.[herdr-source-repo]{2} [herdr-source-repo]{4}

## Product boundary and terminal ownership

Herdr’s unit of management is a terminal pane, not an agent conversation. Layout commands create workspaces, tabs, and panes; pane commands control raw terminal I/O; agent commands add recognized-agent identity and Herdr’s current lifecycle classification on top of a pane.[herdr-automation-docs]{1} [herdr-automation-docs]{2} This lets one operational vocabulary—list, read, focus, prompt, wait, attach, and logical key delivery—address either a Claude Code or Codex pane once detected.[herdr-cli-reference-docs]{1} {inferred: convergence}

{inferred: absence of a provider-semantic approval surface in the inspected scopes} That common vocabulary is terminal control, not provider-semantic control. `agent send-keys` transmits validated logical keys, and `agent prompt` sends text plus Enter; neither source describes a provider-specific approval decision API for Claude Code or Codex.[herdr-cli-reference-docs]{1} [herdr-agents-docs]{5} `agent prompt` specifically refuses to write if Herdr already classifies the target as blocked, and the source test covers that refusal.[herdr-cli-reference-docs]{2} [herdr-source-repo]{13}

For Agent Board, Herdr therefore supports an attention-router pattern—discover a pane, expose its state and evidence, focus/read it, and offer an intentional terminal-control surface—but it does not license a claim that terminal keys are semantic approval actions. {extends: preserve provider-specific approval semantics above any common key-control layer.} [herdr-cli-reference-docs]{1} [herdr-agents-docs]{5}

## Status authority, manifests, and blocked semantics

Herdr gives each pane one status authority. For Claude Code and Codex, it identifies the foreground process and evaluates the live bottom-buffer snapshot against a provider-specific TOML manifest; session hooks are intentionally not lifecycle authorities because they can miss transitions such as permission results or interrupts.[herdr-agents-docs]{3} [herdr-integrations-docs]{2}

The provider parity is architectural rather than rule-identical. The fetched Claude manifest contains title, bottom-buffer, prompt-box, permission, and transcript-viewer rules; the Codex manifest contains title, trust-directory, strong/weak blocker, working-fallback, and idle rules.[herdr-source-repo]{5} [herdr-source-repo]{6} That divergence is expected from distinct TUI shapes, and it means that a shared `blocked` badge does not attest to equal underlying evidence across providers. {inferred: divergence} [herdr-source-repo]{5} [herdr-source-repo]{6}

Herdr makes blocked detection deliberately strict: it marks a screen-manifest agent blocked only on known live approval, question, or permission UI. If no rule matches a known agent, it falls back to idle with the labelled reason `default_known_agent_idle_fallback`; the docs say this affects visible status and waits rather than authorizing input or destructive action.[herdr-agents-docs]{5} The live `agent explain` surface exposes the final state, matched rule, manifest source/version, visible evidence, and fallback or skip reason, making a classification inspectable rather than opaque.[herdr-agents-docs]{6}

Herdr’s manifests are versioned and can be bundled, remotely updated, or locally overridden. A local override wins, remote updates only patch agents already recognized by the binary, and new agent process recognition still requires a binary update.[herdr-agents-docs]{6} This is a concrete operational lesson: an inferred adapter needs provenance, versioning, and an operator-facing explanation path, not merely a state label. {extends: retain evidence and manifest-version provenance in Agent Board’s provider status model.} [herdr-agents-docs]{6}

## Lifecycle plugins, direct integrations, and custom reporting

Herdr reserves lifecycle authority for integrations whose hooks or plugins report the full state stream; the documented group is Pi, OMP, Kimi Code CLI, OpenCode, Kilo Code CLI, and MastraCode.[herdr-integrations-docs]{2} Its custom integration protocol likewise permits an agent’s own lifecycle hooks to report semantic `working`, `idle`, and `blocked` state, with a stable source, optional ordered sequence number, release on exit, and separately reported session identity.[herdr-integrations-docs]{3}

Claude Code and Codex differ from that group. Their official installers write provider configuration hooks to report session identity and support resume, but their published lifecycle state remains screen detection.[herdr-integrations-docs]{5} [herdr-integrations-docs]{6} The current source and tests corroborate the narrow contract: each shipped hook emits `pane.report_agent_session` without a state; Claude ignores subagent and subagent-completion reports, while Codex requires a persisted transcript-backed root session and ignores missing or mismatched nested sessions.[herdr-source-repo]{7} [herdr-source-repo]{8} [herdr-source-repo]{9} [herdr-source-repo]{10}

This disconfirms reading Herdr’s integration badge as a native lifecycle adapter for either provider. It does show a useful product separation: a platform can use native provider hooks for session continuity while visibly treating runtime status as independent, screen-derived evidence.[herdr-integrations-docs]{2} [herdr-source-repo]{7} [herdr-source-repo]{8} {inferred: convergence}

## Rollups, reporting API, control, and waits

Semantic state—not titles or metadata—drives Herdr’s waits, notifications, and workspace rollups; metadata fields and state labels change presentation only.[herdr-agents-docs]{9} [herdr-integrations-docs]{7} The source makes the rollup policy precise: a workspace aggregates panes by attention priority, with blocked above unseen idle, working, seen idle, and unknown.[herdr-source-repo]{12} This is a status projection policy, not a claim that an underlying provider emitted a workspace-level lifecycle event. {inferred: convergence} [herdr-agents-docs]{7} [herdr-source-repo]{12}

The public integration and CLI surfaces expose reporting for custom semantic state and a separate route for session identity. Reported state influences waits, notifications, and rollups; session-only official reports do not.[herdr-integrations-docs]{3} [herdr-cli-reference-docs]{1} A caller that requires a narrow state definition can also wait specifically for `blocked`, inspect the agent output, and send a named key; a caller that only needs raw process monitoring uses pane commands and output waits instead.[herdr-automation-docs]{3}

That split is relevant to a provider-neutral supervision contract: status reporting, display metadata, raw terminal control, and provider-native lifecycle observations should remain distinguishable. {extends: expose the evidence authority and capability behind a shared Agent Board state instead of conflating state projection with provider truth.} [herdr-agents-docs]{9} [herdr-integrations-docs]{3}

## Session persistence and resumption

Herdr’s strongest persistence path is detach/reattach while its server remains alive; original processes and conversations continue because the original processes never stop.[herdr-session-docs]{1} [herdr-session-docs]{2} After a server restart, it restores session shape and cwd but not arbitrary process execution; only an eligible agent that had reported a current official native session reference can resume its conversation.[herdr-session-docs]{1} [herdr-session-docs]{3} [herdr-session-docs]{4}

For the two providers, resume is provider-specific: Claude Code is relaunched as `claude --resume <id>` and Codex as `codex resume <id>`.[herdr-session-docs]{4} The fetched implementation maps the official `herdr:claude` and `herdr:codex` session records to those argv forms, validating the session reference before planning a resume.[herdr-source-repo]{11} Herdr can therefore promise best-effort native conversation resumption once its own current integration captured an eligible session reference; it cannot promise that a generic terminal process, or an uncaptured agent session, survives a cold restart.[herdr-session-docs]{3} [herdr-session-docs]{4}

## What Herdr actually guarantees for Claude Code and Codex

| Surface | Honest common guarantee | Provider-specific constraint |
| --- | --- | --- |
| Terminal supervision | Both can be recognized in an owned real terminal pane and addressed through the common agent/pane control surfaces.[herdr-agents-docs]{1} [herdr-automation-docs]{1} | Recognition and classification depend on foreground-process visibility; wrappers require an explicit host-visible hint, and child-group inference is best effort.[herdr-agents-docs]{4} |
| Lifecycle status | Both are classified from agent-specific screen manifests and can be explained with the active rule/evidence/fallback.[herdr-agents-docs]{2} [herdr-agents-docs]{6} | The manifests and visible UI evidence differ by provider; unmatched known UI falls back to labelled idle rather than a native state.[herdr-source-repo]{5} [herdr-source-repo]{6} [herdr-agents-docs]{5} |
| Blocked | Both can be marked blocked only on known live visible approval/question/permission UI, and a blocked `agent prompt` is refused.[herdr-agents-docs]{5} [herdr-source-repo]{13} | This is a deliberately strict inference boundary; it is not a complete provider lifecycle signal.[herdr-agents-docs]{3} |
| Session continuity | Both official integrations can report native session identity for restore, and both have a documented resume command after a server restart.[herdr-integrations-docs]{4} [herdr-session-docs]{4} | Restore requires a current official integration and an eligible captured reference; cold restore does not retain arbitrary process state.[herdr-session-docs]{3} [herdr-session-docs]{4} |
| Native lifecycle authority | Neither official integration is presented as the lifecycle authority; each remains screen-manifest state.[herdr-integrations-docs]{2} [herdr-integrations-docs]{5} [herdr-integrations-docs]{6} | A custom lifecycle integration is possible where an agent exposes complete hooks, but that is not the shipped Claude/Codex contract.[herdr-integrations-docs]{3} |

{inferred: convergence} Herdr’s honest symmetry is therefore **same supervision and restoration shape, with explicit provider-specific detection manifests and resume argv**—not identical native semantics or equal lifecycle fidelity.[herdr-agents-docs]{2} [herdr-source-repo]{5} [herdr-source-repo]{6} [herdr-source-repo]{11}

## Implications for Agent Board’s symmetric-support promise

Herdr disconfirms the premise that a shared product experience requires identical provider topology or signals: it delivers a common terminal-management, read, prompt, wait, blocked-attention, and session-resume shape while its actual sources of evidence differ per provider.[herdr-automation-docs]{1} [herdr-cli-reference-docs]{1} [herdr-source-repo]{5} [herdr-source-repo]{6} {inferred: convergence}

It does **not** disconfirm an Agent Board native-adapter direction when a provider offers a trustworthy native lifecycle surface. Herdr itself excludes Claude and Codex from full lifecycle authority and retains screen manifests precisely because their shipped hooks are session-only.[herdr-integrations-docs]{2} [herdr-source-repo]{4} [herdr-source-repo]{7} [herdr-source-repo]{8} {inferred: convergence}

Agent Board can honestly promise provider-neutral supervision only at the level of attention routing and clearly qualified state projection: identity, focus/read/control availability, lifecycle label, evidence authority, confidence, capability, and acknowledgement must remain distinct. {extends: require each provider topology to pass live validation of process discovery, state transitions, evidence exposure, blocked handling, raw-control safeguards, and restart/resume before it is advertised as equivalent support.} [herdr-agents-docs]{3} [herdr-agents-docs]{5} [herdr-agents-docs]{6} [herdr-session-docs]{4}

## Disconfirming analysis

I looked for a Claude Code or Codex official Herdr hook that reports `working`, `idle`, or `blocked` as the source of truth. The integration table puts both in the session-identity class, the agent page says their state is screen-manifest detection, and the shipped hook tests assert that their session messages omit `state`.[herdr-integrations-docs]{2} [herdr-agents-docs]{2} [herdr-source-repo]{9} [herdr-source-repo]{10} This disconfirms an advertised reading of “integrated” as native lifecycle symmetry.

I looked for evidence that Herdr’s shared blocked status performs semantic approval. The sources instead describe a strict visible-UI match, a known-agent idle fallback when no rule matches, raw logical key delivery, and a refusal to send a normal prompt only when Herdr has already classified the target as blocked.[herdr-agents-docs]{5} [herdr-cli-reference-docs]{1} [herdr-source-repo]{13} This disconfirms treating a common terminal control plane as provider-specific approval authority.

I also looked for identical Claude and Codex detection logic. The fetched repository contains different manifest rule sets and versions for the two providers, including different blocker and working evidence.[herdr-source-repo]{5} [herdr-source-repo]{6} This disconfirms any claim that Herdr’s provider symmetry means equal detection coverage, while supporting its narrower common state vocabulary. {inferred: divergence}

Finally, I looked for a cold-restart guarantee that preserves all terminal work. The session documentation says the server restart removes original pane processes and only resumes eligible native sessions that were reported through a current official integration.[herdr-session-docs]{1} [herdr-session-docs]{3} [herdr-session-docs]{4} This disconfirms a general “sessions always come back” promise beyond the live detach/handoff path.

## Contradictions

No fetched official-doc or source-code pair directly contradicts another on the Claude/Codex support boundary. The apparent asymmetry is structural rather than contradictory: the generic custom-integration API permits full lifecycle reporting, while the shipped Claude and Codex integrations report session identity only.[herdr-integrations-docs]{3} [herdr-integrations-docs]{5} [herdr-integrations-docs]{6} This is a `qualifies` relationship: the generic capability is broader than either provider’s official integration.

The control surface also separates two scopes rather than offering incompatible guidance: raw agent key delivery exists, while the higher-level prompt command refuses an already-blocked target.[herdr-cli-reference-docs]{1} [herdr-source-repo]{13} This is a `qualifies` relationship between low-level terminal control and an explicit blocked-state safeguard, not semantic approval support.

## Revisit if

- Herdr changes either Claude or Codex from screen-manifest detection to complete lifecycle-hook authority, or changes the status-authority rule.[herdr-agents-docs]{3} [herdr-integrations-docs]{2}
- Herdr revises either manifest’s visible prompt/blocker rules, manifest precedence, or `agent explain` evidence output.[herdr-agents-docs]{6} [herdr-source-repo]{5} [herdr-source-repo]{6}
- Claude Code or Codex changes the session hook payloads, resume commands, or reliability of session identity capture.[herdr-integrations-docs]{5} [herdr-integrations-docs]{6} [herdr-source-repo]{7} [herdr-source-repo]{8} [herdr-source-repo]{11}
- Agent Board elects to claim semantic provider actions rather than terminal-control availability, because that would require provider-specific source evidence beyond Herdr’s model. {extends: commission a provider-owned control-surface verification before making that claim.} [herdr-cli-reference-docs]{1} [herdr-agents-docs]{5}

## Acquisition candidates

None surfaced. The primary official documentation and public source repository were fetched directly for this facet.

## Sources

1. `herdr-agents-docs` — Herdr Agents documentation (`https://herdr.dev/docs/agents/`).
2. `herdr-integrations-docs` — Herdr Integrations documentation (`https://herdr.dev/docs/integrations/`).
3. `herdr-session-docs` — Herdr Session state and restore documentation (`https://herdr.dev/docs/session-state/`).
4. `herdr-automation-docs` — Herdr Agent automation documentation (`https://herdr.dev/docs/agent-automation/`).
5. `herdr-cli-reference-docs` — Herdr CLI reference documentation (`https://herdr.dev/docs/cli-reference/`).
6. `herdr-source-repo` — Herdr public repository, fetched local source capture at commit `2c042bb2ce845ca4c7fbe03df3e7eb041abd0252` (`https://github.com/herdrdev/herdr`).
