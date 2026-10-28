---
source_handle: rps-agent-deck-issues
fetched: 2026-10-26
source_url: https://github.com/asheshgoplani/agent-deck/issues/2896
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

Three open agent-deck issues dated October 2026 that document status-authority failure modes (a quiet session stuck as running, Codex turn ends without a transition) and a mobile web usability problem on iPhone over Tailscale.

## Key passages

- [1] #2896 (open, 2026-10-24): a pi conductor session stayed 'running' for 4 days while idle; the cause is described as two gaps: terminal hook events expiring after 2 minutes for pi, and quiet tmux panes never being re-evaluated because capture is skipped when window_activity is flat; 'the lane went unsupervised'.
- [2] #2900 (open, 2026-10-24, v1.16.30): some Codex turn ends produce no running-to-waiting transition record, so a parent session was never woken and the fleet idled about 5 hours; the reporter suspects the Codex notify handler returns early for certain turn classifications but says it is unproven.
- [3] #2680 (open, 2026-10-15, v1.16.28): on iPhone Safari reached over Tailscale, the web terminal canvas ignores taps once a session is open and there is no visible way back to the session list; the reporter has not reproduced it on a device and the cause given is unverified.

## Structural notes

Additional URLs read: https://github.com/asheshgoplani/agent-deck/issues/2900 and /2680.

GitHub issue pages for asheshgoplani/agent-deck read via the gh CLI on 2026-10-26; all three were open at fetch time and the causes are reporter hypotheses, not maintainer-confirmed.
