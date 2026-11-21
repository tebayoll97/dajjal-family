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

## 11. CANONICAL API REFERENCE — 18 REACT EXPORTS

This section records the public component signatures found in the source files listed below. Props are source-derived, not a promise that every arbitrary HTML attribute is accepted by every component. Unless noted otherwise, class names are appended to the shared root class through `className`. Examples are illustrative; consumers must still supply page-level composition, localization, and data behavior.

### 11.1 Button

**Source:** `app/components/ui/Button.js`

- Signature: `Button({ children, variant = "primary", size = "md", loading = false, disabled = false, type = "button", className = "", ...props })`
- Variants implemented in CSS: `primary`, `secondary`, `ghost`, `danger`. The component constructs the variant class directly; unsupported values do not receive a defined variant style.
- Sizes: `sm`, `md` (default; no extra size class), `lg`. CSS defines 36px minimum height for `sm`, 44px base, and 48px for `lg`.
- State: `loading` disables the native button, sets `aria-busy`, and renders a spinner plus the children. `disabled` also disables it.
- Semantics: native `button`; default type is `button`. Additional native button props and event handlers are forwarded.
- Consumer responsibility: use a semantic link for navigation; provide concise localized children and a meaningful action label. Avoid `sm` for essential mobile actions unless a separate accessible hit area is provided.
- Limitation: no built-in icon-only API, confirmation behavior, or form submission state management.

### 11.2 Card

**Source:** `app/components/ui/Card.js`

- Signature: `Card({ children, interactive = false, as: Element = "div", className = "", ...props })`
- API: `interactive` adds the `ui-card-interactive` class; `as` selects the rendered element; remaining props are forwarded.
- Variants/sizes: no named variant or size API.
- Semantics: default is a non-interactive `div`. The source explicitly directs interactive behavior to a semantic link or button.
- Consumer responsibility: if the card navigates or triggers an action, put a real link/button inside it or choose an appropriate semantic `as` element and provide the required behavior and accessible name.
- Limitation: `interactive` only adds hover styling; it does not make the card keyboard-operable or clickable.

### 11.3 Badge

**Source:** `app/components/ui/Badge.js`

- Signature: `Badge({ children, variant = "neutral", className = "", ...props })`
- Variants: `neutral` (default), `success`, `warning`, `danger`, `info`. Unknown values safely fall back to `neutral`.
- Sizes: no size prop; visual dimensions are CSS-defined.
- Semantics: rendered as a `span`; remaining span props are forwarded.
- Consumer responsibility: include text or another non-color cue for status; keep labels short enough to wrap cleanly on mobile.
- Limitation: no built-in icon, dot, count, or live announcement behavior.

### 11.4 Alert

**Source:** `app/components/ui/Alert.js`

- Signature: `Alert({ children, variant = "info", title, className = "", ...props })`
- Variants: `info` (default), `success`, `warning`, `danger`. Unknown values fall back to `info`.
- Semantics: `warning` and `danger` render with `role="alert"`; `info` and `success` render with `role="status"`.
- API: optional `title`; body is supplied as children; remaining div props are forwarded.
- Consumer responsibility: use assertive alerts only for messages requiring prompt attention; avoid repeating the same announcement on every render. Keep recovery instructions available.
- Limitation: no dismiss control, action slot, or automatic announcement lifecycle.

### 11.5 TextField

**Source:** `app/components/ui/TextField.js`

- Signature: `TextField({ label, helpText, error, id, className = "", inputClassName = "", as: Element = "input", ...props })`
- Intended element modes: `input` (default), `textarea`, and `select`; the rendered class is selected for those three element names.
- API: `label`, `helpText`, `error`, explicit `id`, wrapper `className`, control `inputClassName`, and native element props such as `type`, `name`, `value`, `onChange`, `required`, `disabled`, and `aria-*`.
- Accessibility: generates an ID with React `useId` when none is supplied; label is associated using `htmlFor`; help and error IDs are merged with caller `aria-describedby`; error sets `aria-invalid` and `aria-errormessage`.
- Consumer responsibility: provide a visible `label` for normal form use, validation rules and messages, controlled/uncontrolled value behavior, and localized copy. Ensure select options or textarea content are supplied correctly.
- Limitation: validation is explicitly owned by the consuming form. An error message is not itself a validation engine.

### 11.6 CheckboxField

**Source:** `app/components/ui/CheckboxField.js`

- Signature: `CheckboxField({ label, helpText, id, className = "", ...props })`
- API: visible `label`, optional `helpText`, optional `id`, wrapper `className`, and remaining native checkbox props (`checked`/`defaultChecked`, `onChange`, `name`, `value`, `disabled`, etc.).
- Semantics/accessibility: native checkbox nested in a label; generated ID is used when none is supplied; help text is connected through `aria-describedby`.
- Consumer responsibility: supply a meaningful label and manage checked state/form submission. Keep the whole label comfortably tappable.
- Limitation: no error prop or built-in validation message slot.

### 11.7 RadioGroup

**Source:** `app/components/ui/RadioGroup.js`

- Signature: `RadioGroup({ label, name, options = [], value, onChange, direction = "column", disabled = false, className = "" })`
- API: `options` is an array of objects with `value`, `label`, and optional `disabled`; `value` is the selected option value; `onChange` receives the selected option value; `direction` is `column` (default) or `row`; `disabled` disables the fieldset.
- Semantics: native `fieldset` and optional `legend`, with native radio inputs sharing `name`; option labels are associated with generated IDs.
- Consumer responsibility: provide a stable unique `name`, a controlled `value`, and an `onChange` handler. Keep option labels concise; row mode wraps through CSS.
- Limitation: no help/error text API. The component does not validate that the supplied value exists in options.

### 11.8 SwitchField

**Source:** `app/components/ui/SwitchField.js`

- Signature: `SwitchField({ label, description, checked, onChange, disabled = false, id, className = "", name })`
- API: controlled boolean `checked`; `onChange` receives the inverted boolean; optional `description`, `disabled`, `id`, `name`, and `className`.
- Semantics/accessibility: native button with `type="button"`, `role="switch"`, `aria-checked`, associated visible label, and optional description via `aria-describedby`.
- Consumer responsibility: always provide a boolean `checked` value and update it in `onChange`; localize label and description.
- Limitation: no uncontrolled/defaultChecked mode and no form serialization beyond the forwarded `name` attribute on the button.

### 11.9 Dialog

**Source:** `app/components/ui/Dialog.js`

- Signature: `Dialog({ open, onClose, title, description, children, actions, closeOnEscape = true, closeOnBackdrop = false, closeLabel = "Close dialog", initialFocusRef, className = "", ...props })`
- API: parent-controlled `open`; `onClose` callback; optional `title`, `description`, `actions`, `closeOnEscape`, `closeOnBackdrop`, localized `closeLabel`, and `initialFocusRef`.
- Semantics: native `<dialog>` opened with `showModal()`; title/description IDs are generated and connected with `aria-labelledby`/`aria-describedby`. When no title is supplied, `closeLabel` is used as `aria-label`. The browser provides native modal focus containment/restoration and Escape cancellation behavior.
- Close behavior: the internal close button calls native `close()`; native close events call `onClose`. The parent should set `open={false}` in response. Escape can be prevented with `closeOnEscape={false}`; backdrop close is opt-in.
- Consumer responsibility: control the open state, localize `closeLabel`, provide a meaningful title or label, manage action buttons, and ensure the dialog content remains usable with the mobile keyboard.
- Limitation: no built-in portal, nested-dialog manager, async action handling, or custom focus-trap implementation. The implementation relies on native browser dialog behavior.

### 11.10 Breadcrumbs

**Source:** `app/components/ui/Breadcrumbs.js`

- Signature: `Breadcrumbs({ items = [], className = "", ariaLabel = "Breadcrumb" })`
- API: `items` is an ordered array of objects with `label` and `href`; `ariaLabel` names the navigation landmark.
- Semantics: `nav` containing an ordered list; all but the final item render as anchors; the final item receives `aria-current="page"`.
- Consumer responsibility: provide localized labels and locale-aware hrefs, with the current page last. Ensure non-current items have valid destinations.
- Limitation: uses native anchors, not the Next.js Link component; no collapse/truncation control is built in.

### 11.11 Tabs

**Source:** `app/components/ui/Tabs.js`

- Signature: `Tabs({ tabs = [], value, onChange, ariaLabel = "Content tabs", className = "" })`
- API: each tab object has `value`, `label`, optional `disabled`, and `content`; `value` is controlled; `onChange` receives the selected value.
- Semantics: `tablist`, `tab` buttons with `aria-selected`, `aria-controls`, roving `tabIndex`, and one `tabpanel`.
- Keyboard behavior implemented: ArrowLeft/ArrowRight wrap and skip disabled tabs; Home/End move to the first/last enabled tab. Focus moves to the target tab and controlled selection is requested through `onChange`. If every tab is disabled, keyboard navigation makes no selection change. Click selects a tab.
- Semantics: tablist explicitly declares horizontal orientation, matching the horizontal scrolling tab strip.
- Consumer responsibility: provide a non-empty stable tab list with unique values and localized labels; update controlled `value` from `onChange`.
- Limitation: no manual activation mode or separate panel-per-tab IDs. Verify focus/selection synchronization with actual consumers before treating it as a complete tabs pattern.

### 11.12 DropdownMenu

**Source:** `app/components/ui/DropdownMenu.js`

- Signature: `DropdownMenu({ label, children, className = "" })`
- API: `label` is the disclosure summary; `children` is the panel content.
- Semantics: native `details` and `summary`, so the browser supplies disclosure behavior; panel content is ordinary children.
- Consumer responsibility: use links/buttons with their own accessible names inside the panel; ensure the panel is not clipped by surrounding layout and remains within the viewport.
- Limitation: this is not an ARIA application menu. It has no item model, controlled open state, outside-click manager, Escape handling contract, or menu-arrow-key navigation. Do not describe or use it as a full application-menu widget.

### 11.13 Skeleton

**Source:** `app/components/ui/Skeleton.js`

- Signature: `Skeleton({ variant = "text", width, height, className = "", count = 1, ...props })`
- Variants: `text` (default), `rect`, `circle`; unknown values fall back to `text`.
- API: optional CSS width/height values, repeated `count`, `className`, and span props.
- Semantics: root is `aria-hidden="true"`; it is decorative and does not announce loading.
- Consumer responsibility: announce loading at the surrounding region when needed (for example, `role="status"` and localized text); size skeletons to match the actual content layout.
- Limitation: no built-in loading state, label, or reduced-motion prop. Reduced motion is handled in shared CSS.

### 11.14 EmptyState

**Source:** `app/components/ui/EmptyState.js`

- Signature: `EmptyState({ title = "Nothing here yet", description, action, icon = "—", className = "" })`
- API: title, optional description, optional action node, optional decorative icon text, and className.
- Semantics: root uses `role="status"`; icon is hidden from assistive technology.
- Consumer responsibility: localize all copy, supply a relevant action node when recovery/creation is possible, and keep action labels explicit.
- Limitation: no dedicated illustration component, layout variant, or heading-level prop; title is always an `h3`.

### 11.15 ErrorState

**Source:** `app/components/ui/ErrorState.js`

- Signature: `ErrorState({ title = "Something went wrong", description = "Please try again.", onRetry, retryLabel = "Try again", className = "" })`
- API: title, description, optional `onRetry`, localized `retryLabel`, and className.
- Semantics: root uses `role="alert"`; retry is a native button rendered only when `onRetry` exists.
- Consumer responsibility: provide a safe retry callback, localized text, and any additional support/contact path required by the failure.
- Limitation: retry is synchronous from the component's perspective; no built-in pending/disabled state or error-code display.

### 11.16 Pagination

**Source:** `app/components/ui/Pagination.js`

- Signature: `Pagination({ page, totalPages, onPageChange, ariaLabel = "Pagination", previousLabel = "Previous", nextLabel = "Next", pageLabel = (number) => \`Page \${number}\`, className = "" })`
- API: integer `page`, integer `totalPages`, callback `onPageChange` (receives target page), optional localized `ariaLabel`, `previousLabel`, `nextLabel`, `pageLabel(number)`, and className.
- Behavior: returns `null` if page/totalPages are not integers or totalPages is below 1. Displayed current page is clamped to 1…totalPages. Renders Previous/Next, current page, adjacent pages, first/last pages, and ellipses as needed.
- Semantics: labeled `nav`; current page has `aria-current="page"`; Previous/Next and numbered buttons have accessible labels.
- Consumer responsibility: own data fetching/page state, localize the visible Previous/Next text and aria labels (the current implementation uses English strings), and keep page changes in range.
- Limitation: no page-size selector, total-record count, or localized label props.

### 11.17 Table

**Source:** `app/components/ui/Table.js`

- Signature: `Table({ columns = [], rows = [], rowKey = "id", caption, loading = false, loadingRows = 4, emptyState, className = "" })`
- API: `columns` array with `key`, `header`, optional `align` (`center`/`right` CSS classes), optional `render(row, rowIndex)`; `rows` array; `rowKey` property name or function; optional `caption`, `loading`, `loadingRows`, custom `emptyState`, and className.
- Behavior: loading renders skeleton rows; non-empty rows render cell values or render callbacks; empty rows render the supplied emptyState or a default EmptyState.
- Semantics: native table, thead/tbody, column headers with `scope="col"`, optional caption. The wrapper is horizontally scrollable.
- Consumer responsibility: provide stable row keys, meaningful column headers/caption, localized empty state, and a deliberate small-screen data strategy. For complex tables, consider whether a responsive card/list representation is more usable than horizontal scrolling.
- Limitation: no sorting, selection, pagination integration, row-header API, sticky columns, or built-in responsive column hiding.

### 11.18 Avatar

**Source:** `app/components/ui/Avatar.js`

- Signature: `Avatar({ src, name = "User", alt, size = "md", className = "" })`
- Sizes: `sm` (28px), `md` (40px), `lg` (56px), `xl` (80px); unknown values fall back to `md`.
- Behavior: image failure falls back to initials generated from up to the first two words of `name`; absent/empty initials fall back to `?`.
- Semantics: root uses `role="img"` and accessible label `alt ?? name`; the inner image has empty alt text to avoid duplicate announcement.
- Consumer responsibility: provide a useful non-sensitive display name and meaningful `alt` when the image conveys information beyond the name; choose size appropriate to the context.
- Limitation: no group/stack, status indicator, presence state, or image loading placeholder.

## 12. CROSS-COMPONENT SOURCE FINDINGS AND QA GATES

The following are implementation observations, not claims of completed visual or browser QA:

1. **Token exceptions requiring a later CSS audit:** the current shared stylesheet contains literal white values for the danger button text and switch thumb, and literal RGBA backdrop colors for the native dialog. Review whether these should map to existing semantic roles or documented fixed contrast values before changing them. Do not silently recolor scoped experiences.
2. **Reduced motion:** shared CSS explicitly disables button/card transitions, button spinner animation, and Skeleton shimmer under `prefers-reduced-motion`. Verify actual behavior in browser.
3. **Focus styling:** explicit focus-visible rules exist for buttons, text controls, icon buttons, dropdown summary/items, tabs, choice inputs, switch, pagination, and dialog. Confirm all actual interactive descendants and consumer-supplied controls remain visibly focusable.
4. **Mobile sizing:** base Button and form controls use 44px minimum height; Button Small is 36px, pagination controls now use 44px minimum width and height at all breakpoints, dropdown items are 40px, tabs are 44px, and switch is 48×28px. These are source measurements, not a WCAG conformance result.
5. **Localization gaps in component defaults:** Pagination now accepts localized previous/next/page/landmark labels, but its defaults remain English. EmptyState, ErrorState, Dialog close label, Breadcrumbs aria label, and Tabs aria label also default to English. Consumers must pass localized copy where rendered in Indonesian.
6. **Keyboard behavior needs targeted QA:** Tabs now skips disabled tabs and supports Home/End among enabled tabs, but still needs browser QA. DropdownMenu is disclosure-based rather than a full application menu. Dialog relies on native browser dialog behavior. These limitations must remain visible in consumer decisions.
7. **Table overflow is deliberate and bounded:** `.ui-table-wrap` provides horizontal scrolling. Test at narrow Android widths with long localized values and confirm the surrounding page does not overflow.
8. **Four-theme verification remains required:** source-level token usage does not prove contrast or visual quality across TECNO Light/Dark and Dajjal × Veylora Light/Dark.
9. **Mobile Compact UI remains a review requirement:** this API reference records current CSS and expected consumer behavior; it does not certify each component or consumer as Mobile Compact UI compliant.

### 12.1 Component source inventory used

- `app/components/ui/index.js`
- `app/components/ui/Button.js`
- `app/components/ui/Card.js`
- `app/components/ui/Badge.js`
- `app/components/ui/Alert.js`
- `app/components/ui/TextField.js`
- `app/components/ui/CheckboxField.js`
- `app/components/ui/RadioGroup.js`
- `app/components/ui/SwitchField.js`
- `app/components/ui/Dialog.js`
- `app/components/ui/Breadcrumbs.js`
- `app/components/ui/Tabs.js`
- `app/components/ui/DropdownMenu.js`
- `app/components/ui/Skeleton.js`
- `app/components/ui/EmptyState.js`
- `app/components/ui/ErrorState.js`
- `app/components/ui/Pagination.js`
- `app/components/ui/Table.js`
- `app/components/ui/Avatar.js`
- `app/styles/components.css`
- `app/styles/tokens.css`

**Documentation status:** source API inventory is documented. This does not change the catalog's Draft status; browser, accessibility, four-theme, bilingual, and mobile QA evidence is still required.
