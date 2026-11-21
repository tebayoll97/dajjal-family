# Design System Changelog

## v1.0 — Draft in progress

- Confirmed Purple–Indigo–Cyan as the recommended Dajjal Family brand palette.
- Defined semantic Dark Mode and Light Mode color roles.
- Added semantic design tokens for colors, typography, spacing, shape, elevation, layout, and motion.
- Added Light Mode semantic token overrides.
- Preserved existing legacy token names and styles for gradual migration.
- Added the shared component catalog and interaction-state contracts.
- Kept the Design System document in Draft status pending final review and approval.
- No legacy pages were redesigned as part of this foundation work.

## 2026-11-22 — Component Workbench and Mobile Compact UI contract

- Added a live Component Workbench to the Design System route for all 18 existing shared React exports.
- Added isolated preview selection for TECNO Dark/Light and Dajjal × Veylora Dark/Light without changing the visitor's global theme preference.
- Replaced the hardcoded 13/28 label with an explicit 18/18 shared-component inventory statement; this is inventory coverage, not a QA completion percentage.
- Added mandatory Mobile Compact UI requirements to Design System Foundation Section 16.4 and Component Catalog Section 8.1.
- Future shared components and materially revised components must document mobile density strategy, touch usability, overflow behavior, action hierarchy, retained states, localization, theme scope, and accessibility checks.
- Owner reports testing the Component Workbench. The scope and results of that owner-run test have not been independently recorded here; build, browser automation, contrast, accessibility, and deployment status remain separately verifiable.
- Component Catalog remains Draft pending per-component documentation and formal QA evidence.

## 2026-11-22 — Shared component API documentation

- Added source-derived API documentation for all 18 public React exports in Component Catalog Section 11, including signatures, props, variants/sizes, state behavior, semantics, accessibility notes, consumer responsibilities, and known limitations.
- Added cross-component source findings and targeted QA gates in Section 12, including English-only defaults, touch-size measurements, reduced-motion CSS, focus styling, intentional table overflow, and keyboard limitations.
- Recorded the current hardcoded white/dialog backdrop CSS values as a future token-audit finding rather than changing visual behavior without review.
- Re-fetched the updated catalog from GitHub and confirmed the API section, findings section, Mobile Compact UI contract, and Draft status are present.
- This batch changes documentation only. No component source, CSS, browser behavior, build, deployment, or QA status was changed or certified.
