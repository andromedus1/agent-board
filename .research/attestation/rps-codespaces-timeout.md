---
source_handle: rps-codespaces-timeout
fetched: 2026-10-26
source_url: https://docs.github.com/en/codespaces/setting-your-user-preferences/setting-your-timeout-period-for-github-codespaces
source_path: .research/source-captures/rps-codespaces-timeout/capture.html
provenance: source-direct
substrate_confidence: source-direct
---

## Summary

GitHub Docs page on the Codespaces idle timeout, with the companion "What are GitHub Codespaces" page (https://docs.github.com/en/codespaces/about-codespaces/what-are-codespaces, capture at .research/source-captures/rps-codespaces-docs/). A codespace stops running after inactivity; terminal input or output counts as activity.

## Key passages

- [1] "A codespace will stop running after a period of inactivity. By default this period is 30 minutes"; configurable between 5 and 240 minutes (4 hours); organization policy can cap it.
- [2] Inactivity: typing or mouse use resets the timeout, and "Terminal activity, either input or output, also resets the idle timeout period."
- [3] About page: a codespace is a development environment hosted in the cloud in a Docker container on a VM; it can be reached from the browser, Visual Studio Code, or GitHub CLI; users have limited access to the outer VM host; the environment is Linux.

## Structural notes

- The pages read do not state whether processes inside a stopped codespace (for example a tmux server) survive a stop; that is not documented in the passages read.
