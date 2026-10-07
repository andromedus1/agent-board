---
source_handle: ghostty-config-title
fetched: 2026-08-14
source_url: https://ghostty.org/docs/config/reference
provenance: source-direct
substrate_confidence: source-direct
source_class: official-reference
---

# Ghostty title-related configuration

## Summary

Several independent Ghostty features can alter or suppress terminal titles:
the global fixed-title setting, shell integration, terminal title reporting,
and the visual-bell title decoration. AppleScript access is separately
configurable and enabled by default.

## Key passages

1. Setting the global `title` option forces that title at all times and causes
   Ghostty to ignore title escape sequences from programs. Unsetting it does
   not retroactively restore the title a program previously emitted; another
   title update may be required. (Section `title`; lines 856–860 and the
   continuation in the option description.)
2. `shell-integration-features` accepts feature and `no-feature` entries. Its
   `title` feature sets the window title through shell integration, and
   `no-title` disables that feature without disabling the rest of shell
   integration. (Section `shell-integration-features`; lines 1618–1635.)
3. Terminal title reporting with CSI 21 t is disabled by default because the
   documentation identifies title disclosure and maliciously crafted titles
   as security risks. (Section `title-report`; lines 1347–1355.)
4. The `title` bell feature is enabled by default and prepends a bell emoji to
   the title until the surface is focused or receives input. The option format
   permits disabling an individual feature with a `no-` prefix. (Section
   `bell-features`; lines 1763–1799.)
5. `macos-applescript` controls both commands and object lookup for windows,
   tabs, and terminals; its default is true. (Section `macos-applescript`;
   lines 1946–1952.)

## Structural metadata

Official generated Ghostty configuration reference, fetched 2026-08-14.
