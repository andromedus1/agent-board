---
id: idea-provider-observation-docs
created: 2026-09-12
updated: 2026-09-12
tags: [prose]
---

Align two pre-existing provider-observation assertions found by the documentation
review during the Codex 0.154 compatibility fix (`doc-review-report.md`):

- `docs/research-plan.md` calls ordinary Codex a degraded-confidence fallback.
  Current SPEC, architecture, README, and projection behavior make ordinary
  registration diagnostic-only until managed observation attaches.
- `docs/SPEC.md` and `docs/ARCHITECTURE.md` describe launcher liveness bypassing
  working-evidence freshness generically. `AGENT_ADAPTER_CAPABILITIES` in
  `src/domain/registries.ts` enables this only for Codex. Claude deliberately
  retains the freshness window, as the README already explains.

These assertions could mislead later adapter work but do not affect the narrow
0.154.x acceptance repair. Preserve the current implementation behavior and
provider asymmetry when correcting the docs.
