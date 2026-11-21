# DAJJAL FAMILY — SHARED COMPONENT CATALOG

**Document ID:** DF-UI-001  
**Version:** 1.1  
**Status:** Draft — Reconciled Repository Inventory  
**Parent:** DESIGN_SYSTEM.md v1.1  
**Audit reference:** DESIGN_SYSTEM_AUDIT_2026-11-22.md  
**Scope:** Shared UI components for new and incrementally migrated features

---

## 1. COMPONENT PRINCIPLES

- Build a shared component when a repeated interaction or visual pattern benefits from a consistent API and behavior.
- Keep components focused and composable; separate presentation from feature-specific business logic.
- Use semantic design tokens for visual roles. Do not introduce local hardcoded theme values where an applicable semantic token exists.
- Support all applicable global theme combinations, not merely one Dark and one Light screenshot.
- Include accessible names, keyboard behavior, visible focus, and responsive behavior where relevant.
- Do not create wrappers that add no shared behavior or value.
- Do not break existing pages when introducing or changing shared components.
- Migrate legacy pages incrementally; this catalog does not authorize blanket redesign.

## 2. REPOSITORY INVENTORY AND IMPLEMENTATION STATUS

Status meanings:
- **React shared component:** named React export exists in `app/components/ui/index.js`.
- **CSS primitive only:** shared class/style exists, but no corresponding React export was found in the audited UI entry point.
- **Separate shared component:** implementation exists elsewhere in `app/components/`, outside the UI export index.
- **Native/framework pattern:** use the platform/framework primitive unless a real shared contract is justified.
- **Not found in audited scope:** no implementation found in the audited UI directory or shared component styles; broader repository search may still be required before adding one.

| Component / pattern | Current status | Source / evidence | Next action |
|---|---|---|---|
| Button | React shared component | `app/components/ui/Button.js` | Document variants/states and validate themes |
| Card | React shared component | `app/components/ui/Card.js` | Document supported surface variants; do not invent unused variants |
| Badge | React shared component | `app/components/ui/Badge.js` | Validate semantic status contrast |
| Alert | React shared component | `app/components/ui/Alert.js` | Document announcement semantics and variants |
| TextField | React shared component | `app/components/ui/TextField.js` | Covers input, textarea and select through `as`; document API |
| CheckboxField | React shared component | `app/components/ui/CheckboxField.js` | Document native state behavior |
| RadioGroup | React shared component | `app/components/ui/RadioGroup.js` | Validate keyboard behavior and disabled options |
| SwitchField | React shared component | `app/components/ui/SwitchField.js` | Keep distinct from generic checkbox semantics |
| Dialog | React shared component | `app/components/ui/Dialog.js` | Browser QA for focus, Escape and close behavior |
| Breadcrumbs | React shared component | `app/components/ui/Breadcrumbs.js` | Document locale-aware href responsibility |
| Tabs | React shared component | `app/components/ui/Tabs.js` | Validate complete keyboard and ARIA behavior |
| DropdownMenu | React shared component | `app/components/ui/DropdownMenu.js` | Current implementation is disclosure-based; do not claim full application-menu keyboard behavior |
| Skeleton | React shared component | `app/components/ui/Skeleton.js` | Validate reduced motion and decorative semantics |
| EmptyState | React shared component | `app/components/ui/EmptyState.js` | Document action slot and responsive layout |
| ErrorState | React shared component | `app/components/ui/ErrorState.js` | Document retry callback responsibility |
| Pagination | React shared component | `app/components/ui/Pagination.js` | Validate compact mobile behavior and accessible labels |
| Table | React shared component | `app/components/ui/Table.js` | Validate narrow-screen overflow and table semantics |
| Avatar | React shared component | `app/components/ui/Avatar.js` | Document fallback and alt-text behavior |
| IconButton | CSS primitive only | `.ui-icon-button` in `app/styles/components.css`; used by Dialog | Consider React API only if repeated consumers justify it |
| Link | Native/framework pattern | `next/link` is used by pages; locale routing is handled by existing locale utilities | Do not wrap blindly; define shared API only if it adds consistent locale/accessibility behavior |
| ThemeToggle | Separate shared component | `app/components/ThemeToggle.js` | Keep existing provider integration; document separately from UI primitives |
| Language switching | Provider/context exists; dedicated switcher not confirmed | `app/components/LanguageProvider.js`; navigation uses locale-aware routing | Search and document current header control before creating another switcher |
| Tooltip | Not found in audited shared UI scope | No export or matching primitive identified | Defer until a concrete repeated use case exists |

The 18 React exports above are the verified public surface of `app/components/ui/index.js`. Preview helpers such as `DialogPreview`, `ControlsPreview`, and `DataDisplayPreview` are not production UI primitives.

## 3. CANONICAL TOKEN CONTRACT

Shared components must consume semantic roles. Existing tokens are the starting vocabulary; do not create duplicate token families for individual components without a documented need.

### 3.1 Color and state roles

| Semantic role | Token |
|---|---|
| Page/background surface | `--df-bg` |
| Default component surface | `--df-surface` |
| Raised surface | `--df-surface-raised` |
| Overlay/popover/dialog surface | `--df-surface-overlay` |
| Primary text | `--df-text` |
| Supporting text | `--df-text-secondary` |
| Muted text | `--df-text-muted` |
| Standard border | `--df-border` |
| Strong border | `--df-border-strong` |
| Primary action | `--df-primary` |
| Primary hover | `--df-primary-hover` |
| Soft primary surface | `--df-primary-soft` |
| Secondary brand role | `--df-secondary` |
| Accent role | `--df-accent` |
| Keyboard focus | `--df-focus` |
| Success / warning / danger / info | `--df-success`, `--df-warning`, `--df-danger`, `--df-info` |
| Text on primary action | `--df-on-primary` |

Use status colors with text or another non-color cue. Never rely on color alone to communicate status.

### 3.2 Typography roles

Use the existing typography tokens from `app/styles/tokens.css`, including:
- Font families: `--df-font-sans`, `--df-font-mono`.
- Type scale: `--df-text-xs` through `--df-text-display`.
- Line heights: `--df-leading-tight`, `--df-leading-normal`, `--df-leading-relaxed`.
- Weight roles: `--df-weight-regular` through `--df-weight-extrabold`.
- Semantic body/heading/caption roles: `--df-type-body-size`, `--df-type-body-leading`, `--df-type-heading-leading`, `--df-type-caption-size`, `--df-type-caption-leading`.

Do not duplicate global typography values into each color preset.

### 3.3 Spacing, shape, elevation and motion

Use:
- Spacing: `--df-space-1`, `--df-space-2`, `--df-space-3`, `--df-space-4`, `--df-space-5`, `--df-space-6`, `--df-space-8`, `--df-space-10`, `--df-space-12`, `--df-space-16`, `--df-space-20`, `--df-space-24`.
- Radius: `--df-radius-sm`, `--df-radius-md`, `--df-radius-lg`, `--df-radius-xl`, `--df-radius-pill`.
- Elevation: `--df-shadow-sm`, `--df-shadow-md`, `--df-shadow-lg`.
- Motion: `--df-motion-standard`, `--df-duration-fast`, `--df-duration-normal`, `--df-duration-emphasis`.

Intrinsic values such as a 1px border, a 100% width, or a media-query condition do not automatically require a token. Repeated design decisions and visual scales do.

## 4. COMPONENT-TO-TOKEN MAPPING

| Component family | Required semantic roles |
|---|---|
| Button | Primary/secondary/surface/text/on-primary, border, focus, radius, spacing, typography, motion |
| Card | Surface/raised, text, border, radius, shadow, spacing |
| Badge | Surface, text, border, status tokens, typography, spacing, pill radius |
| Alert | Surface, text, border, status tokens, spacing, radius |
| TextField / CheckboxField / RadioGroup / SwitchField | Surface, text, muted text, border, focus, danger, primary, typography, spacing, radius |
| Dialog | Overlay surface, text, supporting text, border, focus, shadow, radius, spacing, motion |
| Breadcrumbs / Tabs / DropdownMenu | Text roles, surface, border, primary/selected, focus, overlay, spacing, typography |
| Skeleton | Surface and border roles, radius, motion duration |
| EmptyState / ErrorState | Surface, text roles, border, primary/danger, spacing, radius |
| Pagination / Table | Surface hierarchy, text roles, border, primary/selected, focus, spacing, typography |
| Avatar | Surface, primary, border, text, size roles |
| ThemeToggle | Theme provider contract plus semantic control/surface/focus tokens |
| Language control | LanguageProvider and locale-route contract plus semantic control tokens |

The mapping identifies applicable token roles; it does not mean every component must use every token in every state.

## 5. GLOBAL THEME CONTRACT

The two global preset identities and their Light/Dark token maps are defined in:
- `app/theme/themeRegistry.js`
- `app/theme/themeTokens.js`

Required validation combinations:
1. TECNO Light.
2. TECNO Dark.
3. Dajjal × Veylora Light.
4. Dajjal × Veylora Dark.

Source-level presence of token maps is not proof of visual correctness. Components must be reviewed in all four combinations for surface hierarchy, text contrast, status contrast, focus visibility, borders, selected/disabled states, and overlays.

Do not force Couple, Wedding, or immersive Games into global theme maps where their approved scoped contracts prohibit it.

## 6. INTERACTION STATE CONTRACT

Define only meaningful states for each component:
- Default.
- Hover for pointer devices.
- Focus-visible.
- Active/pressed.
- Selected/expanded.
- Disabled.
- Loading.
- Invalid/error.
- Success where relevant.

A state must be both visually understandable and semantically exposed where applicable. Reduced-motion preferences must be respected.

## 7. ACCESSIBILITY AND RESPONSIVE CONTRACT

- Prefer native semantic HTML controls.
- Every form control must have a programmatic label.
- Icon-only controls require an accessible name.
- Focus must be visible and must not depend on color alone.
- Keyboard behavior must match the control's role.
- Touch targets should aim for at least 44 × 44px where practical.
- Layout must avoid horizontal overflow at supported mobile widths.
- Tables and dense data need a usable narrow-screen presentation.
- ID/EN labels and messages must use the established localization architecture.
- Test zoomed text and reduced-motion preferences where applicable.

### 7.1 Mobile Compact UI behavior by current component

The following is the required responsive review baseline for the 18 existing exports. It describes the intended mobile behavior to verify; it is not a claim that every behavior has already passed browser QA.

| Component | Mobile Compact UI behavior to preserve/verify |
|---|---|
| Button | Keep labels concise; allow action groups to wrap or stack by priority. Use touch-appropriate height for touch contexts; do not use the 36px Small size for essential mobile actions without a compensating accessible hit area. |
| Card | Reduce unnecessary padding and nested-card framing; use fluid width and preserve content hierarchy. Avoid making every card a tall full-width panel when a compact row or grid better serves the task. |
| Badge | Allow short labels/status chips to wrap in compact rows; retain readable text and non-color status meaning. |
| Alert | Keep title/message concise and readable; wrap naturally without horizontal overflow. Do not remove critical status or recovery instructions to save space. |
| TextField | Use full available width, persistent labels, concise helper/error copy, and appropriate input types. Account for on-screen keyboard and zoom. |
| CheckboxField | Keep label and control aligned in a compact row; ensure the complete label remains tappable and the hit area is accessible. |
| RadioGroup | Use wrapping/stacking according to option length; preserve fieldset/legend and clear selected/disabled states. |
| SwitchField | Keep label/description and switch in a compact aligned layout; preserve a usable switch target and state announcement. |
| Dialog | Fit within the viewport and safe areas; constrain height with internal scrolling where needed; keep close and primary actions reachable above the keyboard. |
| Breadcrumbs | Allow wrapping or deliberate truncation for long localized paths; keep the current-page indication understandable. |
| Tabs | Permit bounded horizontal scrolling for many tabs or wrapping where the pattern supports it; preserve keyboard navigation and selected-state visibility. |
| DropdownMenu | Use the existing disclosure behavior for secondary options; ensure the panel stays within viewport bounds and its controls remain touch-accessible. |
| Skeleton | Match the compact dimensions of the content being loaded; avoid decorative placeholder blocks that create excessive page height. |
| EmptyState | Reduce decorative padding/illustration size on narrow screens; keep the explanation and next action visible. |
| ErrorState | Keep recovery action discoverable; preserve the error meaning and retry affordance without oversized vertical framing. |
| Pagination | Use compact page controls with accessible labels; when space is constrained, preserve previous/next and current-page context rather than causing page overflow. |
| Table | Use a deliberately bounded horizontal scroll container only when columns cannot be responsibly reflowed; retain caption, headers, and row context. |
| Avatar | Preserve legible size and fallback initials; avoid oversized avatar clusters that displace primary content. |

For every component, also verify ID/EN long strings, small Android widths, larger phones, tablet/desktop return behavior, focus/keyboard, screen-reader labels, contrast, reduced motion, touch target sizing, and all applicable theme combinations. Component consumers remain responsible for page-specific grouping and action priority.

## 8. COMPONENT DOCUMENTATION TEMPLATE

Every substantial shared component should document:
1. Purpose.
2. Canonical API/props.
3. Variants and sizes.
4. Interaction states.
5. Accessibility behavior.
6. Semantic token dependencies.
7. Theme behavior across four combinations.
8. Responsive behavior.
9. Example usage.
10. Mobile Compact UI behavior and validation notes.
11. Known limitations and consumer responsibilities.

## 8.1 MOBILE COMPACT UI CONTRACT

Mobile Compact UI is mandatory for future mobile component work and for incremental refinements when an existing component is next changed. Follow Master Foundation v1.4 Section 22, Design System Foundation Section 16.4, and Akashic Record `dajjal-family/core/mobile_compact_ui.md`.

For every component, record and validate:
- Mobile density strategy: compact inline/wrapping, one-column, responsive grid, disclosure, or bounded scrolling—chosen by task, not applied universally.
- Mobile spacing and sizing: reduce excess gaps/padding while keeping readable type, visible labels, and accessible touch targets.
- Overflow behavior: long text/IDs/tags, wrapping or accessible truncation, and any intentionally bounded horizontal scrolling.
- Action hierarchy: primary actions remain discoverable; secondary actions are grouped or progressively disclosed.
- State retention: loading, empty, error, success, selected, disabled, and keyboard-focus states remain available and understandable.
- Localization and viewport coverage: Indonesian/English (including long strings), small Android widths, larger phones, tablet, desktop, and browser text scaling/zoom.
- Theme and accessibility coverage: applicable four global preset/mode combinations, scoped-experience boundaries, keyboard, focus, contrast, reduced motion, screen-reader labels, and touch-target checks.

Do not interpret Mobile Compact UI as permission to introduce local brand colors, remove useful content, reduce essential touch targets, or compress desktop layouts. A responsive component is not automatically Mobile Compact UI-compliant just because it avoids overflow.

## 9. MIGRATION POLICY

- New features use an existing approved shared component where appropriate.
- If a required reusable component does not exist, document and implement it in the Design System first.
- The Design System preview must exercise the same production component/API used by consuming pages.
- Legacy pages migrate one at a time after identifying all consumers and regression risks.
- Do not replace a shared component globally without a usage audit.
- Record exceptions and preserve protected page scopes.

**Principle:** Shared components create consistency without forcing every product experience to look identical.

---

## 10. NEXT IMPLEMENTATION PRIORITIES

1. Build a component workbench that previews and documents all 18 existing React exports.
2. Add an explicit four-theme review workflow and replace static progress copy with a truthful status source.
3. Audit shared component CSS and Design System preview CSS for hardcoded visual values that should use existing semantic tokens.
4. Decide on IconButton and Link APIs only after checking repeated consumers and locale-routing needs.
5. Confirm the existing header language control and document it; do not add a duplicate LanguageSwitcher.
6. Defer Tooltip until there is a concrete repeated interaction need.

**Audit boundary:** This catalog records repository source evidence and intended contracts. It does not certify browser behavior, accessibility conformance, visual contrast, or production readiness.
