---
source_handle: rps-tmux-continuum
fetched: 2026-10-26
source_url: https://raw.githubusercontent.com/tmux-plugins/tmux-continuum/master/README.md
source_path: .research/source-captures/rps-tmux-continuum/capture.txt
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

README of tmux-continuum, which layers automatic periodic saving, optional automatic tmux start at machine boot, and optional automatic restore on tmux server start on top of tmux-resurrect.

## Key passages

- [1] Features: continuous saving of the tmux environment, automatic tmux start when the computer/server is turned on, automatic restore when tmux is started.
- [2] Continuous saving: saved at an interval of 15 minutes, in the background; requires the status line to be on because it uses a hook in `status-right`.
- [3] Automatic restore: enabled with `set -g @continuum-restore 'on'`; happens exclusively on tmux server start.
- [4] Dependencies: tmux 1.9 or higher, bash, and the tmux-resurrect plugin.
- [5] Known Issues: the plugin updates the `status-right` variable to run periodically; if another plugin (usually themes) overwrites `status-right`, autosave stops working; fix is to place the plugin last in the TPM list.

## Structural notes

- README only; the automatic-start instructions and FAQ docs were not fetched.
