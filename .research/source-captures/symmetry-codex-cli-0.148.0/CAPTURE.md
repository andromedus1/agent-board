# Codex CLI 0.148.0 capture

Captured on 2026-08-20 from the installed `/opt/homebrew/bin/codex` executable.

- `local-cli-probe.md` records the read-only version and help-command outputs
  used by the corresponding attestation.
- `schema/` contains only the generated JSON Schema files cited by
  `symmetry-codex-local-schema-0-148-0`; they were selected unchanged from the
  output of `codex app-server generate-json-schema --experimental`.

The full 381-file generated schema was excluded from the repository because the
attested claims depend only on the retained definitions. During this engagement
the complete output remains recoverable at
`/tmp/agent-board-codex-schema.jEp8NT/full-schema`.
