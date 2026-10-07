---
id: idea-ack-committed-reconciliation-message
created: 2026-08-14
updated: 2026-08-14
tags: [cli, state]
---

Make `agent-board ack` explicitly report when acknowledgement committed but the
subsequent Ghostty snapshot failed. V1 intentionally preserves the durable
acknowledgement and returns a visible reconciliation error, yet the current
stderr does not say that state changed. Revisit a structured partial-success
result such as “Acknowledged <id>, but title reconciliation failed” once the
doctor/output conventions are established; keep retries idempotent and never
roll durable attention state back to match a failed title repair.
