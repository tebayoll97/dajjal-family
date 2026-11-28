# DAJJAL FAMILY — DESIGN SYSTEM FOUNDATION

**Document ID:** DF-DS-001  
**Version:** 1.1  
**Status:** Approved — v1.1  
**Parent Standard:** MASTER FOUNDATION DAJJAL FAMILY v1.4  
**Scope:** Shared visual language and reusable UI standards

---

# 1. DESIGN SYSTEM PURPOSE

The Design System is the shared visual and interaction language of Dajjal Family.

It defines how colors, typography, spacing, layout, components, themes, motion, and responsive behavior are designed and implemented.

Its purpose is to make the ecosystem:
- Visually consistent.
- Recognizable as one brand.
- Accessible and comfortable to use.
- Responsive across devices.
- Easier to maintain and extend.
- Independent from individual page styling.

The Design System is the source of truth for new UI work. Existing pages are migrated gradually; this document does not authorize a blanket redesign of legacy pages.

# 2. VISUAL DIRECTION

## 2.1 Brand character

The recommended visual character is:
- Modern.
- Digital-first.
- Confident.
- Futuristic, but not visually noisy.
- Premium without unnecessary decoration.
- Clear and readable.
- Flexible across gaming, knowledge, publishing, commerce, and community products.

## 2.2 Brand palette

Retain the established purple–indigo–cyan identity.

Core brand colors:
- Brand Purple: `#A855F7`
- Brand Indigo: `#6366F1`
- Brand Cyan: `#22D3EE`
- Brand Gradient: purple → indigo → cyan.

Usage:
- Purple is the primary brand signal and primary action color.
- Indigo supports gradients, selected states, and secondary emphasis.
- Cyan is an accent, not a competing primary action color.
- Gradients should be used selectively for brand emphasis, not for every surface or paragraph.

## 2.3 Dark theme palette

Recommended semantic values:
- Background: `#080711`
- Surface 1: `#151020`
- Surface 2: `#1B1528`
- Surface 3: `#241C34`
- Text primary: `#F7F4FF`
- Text secondary: `#C3B8D2`
- Text muted: `#978DA7`
- Border: translucent lavender/purple.
- Primary action: `#A855F7`

Dark theme should use layered surfaces rather than placing every element on the same black background.

## 2.4 Light theme palette

Recommended semantic values:
- Background: `#F5F6FB`
- Surface 1: `#FFFFFF`
- Surface 2: `#F0EFF8`
- Surface 3: `#E8E6F2`
- Text primary: `#19172A`
- Text secondary: `#55536A`
- Text muted: `#747188`
- Border: soft lavender-gray.
- Primary action: a sufficiently dark purple variant when needed for text contrast.

Light theme must not be a simple inversion of dark theme. Surfaces, shadows, borders, and text contrast must be designed deliberately.

# 3. SEMANTIC COLOR TOKENS

Color tokens must describe purpose, not just hue.

Primary button foreground has its own semantic role: `--df-button-primary-text`. The shared `.ui-button-primary` consumes this token instead of `--df-on-primary`, so button-label contrast can be tuned independently without changing heading or other foreground semantics. All four global theme presets define this token; its value is white in each preset. Existing page-specific and navigation-link button styles are not migrated by this contract.

Required semantic token groups:
- `--df-bg`: page background.
- `--df-surface`: default component surface.
- `--df-surface-raised`: elevated surface.
- `--df-surface-overlay`: popover, modal, and overlay surface.
- `--df-text`: primary text.
- `--df-text-secondary`: supporting text.
- `--df-text-muted`: low-emphasis text.
- `--df-border`: standard border.
- `--df-border-strong`: emphasized border.
- `--df-primary`: primary action.
- `--df-primary-hover`: primary hover state.
- `--df-secondary`: secondary brand color.
- `--df-accent`: accent color.
- `--df-focus`: keyboard focus indicator.

Semantic status colors:
- Success.
- Warning.
- Danger.
- Info.

Status colors must remain distinguishable in both themes and must not be the only way to communicate state.

# 4. TYPOGRAPHY SYSTEM

## 4.1 Font family

Primary recommendation:
- Inter.
- System UI fallback.
- Segoe UI fallback.
- Sans-serif fallback.

Use a limited number of font families. Avoid loading multiple font families without a clear purpose.

## 4.2 Type scale

Recommended responsive scale:

| Token | Recommended size | Usage |
|---|---:|---|
| Display | 40–56 px | Hero/display title |
| H1 | 30–40 px | Page title |
| H2 | 24–30 px | Main section |
| H3 | 20–24 px | Subsection |
| H4 | 16–20 px | Component heading |
| Body large | 18 px | Introductory text |
| Body | 16 px | Default text |
| Body small | 14 px | Supporting text |
| Caption | 12 px | Metadata |
| Micro | 11 px | Dense labels only |

Use fluid sizing with `clamp()` where appropriate.

## 4.3 Typography rules

- Body text should prioritize readability.
- Headings should have a clear hierarchy.
- Avoid excessive letter spacing in paragraphs.
- Use uppercase mainly for short labels and eyebrows.
- Use balanced line lengths.
- Use adequate line-height.
- Do not use tiny text for important information.

# 5. SPACING AND SIZING

Use a 4 px base spacing scale.

Recommended tokens:
- 4 px
- 8 px
- 12 px
- 16 px
- 20 px
- 24 px
- 32 px
- 40 px
- 48 px
- 64 px
- 80 px
- 96 px

Rules:
- Prefer spacing tokens over arbitrary values.
- Use consistent spacing within repeated components.
- Section spacing should be larger than component spacing.
- Mobile layouts may reduce spacing while preserving hierarchy.
- Avoid cramped controls and dense text blocks.

# 6. LAYOUT AND GRID

## 6.1 Content containers

Recommended maximum content width:
- Standard content: 1200–1280 px.
- Reading content: 680–760 px.
- Wide dashboards: up to 1440 px when justified.

Containers should be fluid and include safe horizontal padding.

## 6.2 Grid

- Use CSS Grid for page-level composition.
- Use Flexbox for one-dimensional alignment.
- Avoid fixed widths that break on mobile.
- Prefer minmax(), min-width: 0, and responsive grid patterns.
- Avoid unnecessary nested containers.

## 6.3 Responsive breakpoints

Recommended breakpoints for new components:
- Small mobile: 360 px and below.
- Mobile: 640 px.
- Tablet: 768 px.
- Laptop: 1024 px.
- Desktop: 1280 px.
- Wide desktop: 1440 px and above.

Breakpoints are guidance, not a reason to force every component to change at identical widths. Component behavior should determine its breakpoint.

Existing legacy breakpoints may remain until their pages are migrated and tested.

# 7. SHAPE, BORDER, AND ELEVATION

## 7.1 Border radius

Recommended scale:
- Small: 8 px.
- Medium: 12 px.
- Large: 16 px.
- Extra large: 20 px.
- Pill: 999 px.

Use consistent radius within related component families.

## 7.2 Borders

- Use subtle borders for surface separation.
- Use stronger borders for active or selected states.
- Avoid excessive outlines on every nested element.
- Borders must remain visible in both themes.

## 7.3 Shadows

Use restrained elevation:
- Low: subtle card separation.
- Medium: dropdowns and popovers.
- High: dialogs and overlays.

Do not rely on shadows alone to communicate hierarchy.

# 8. COMPONENT STANDARDS

All shared components must support both themes, keyboard interaction where relevant, and responsive layouts.

## 8.1 Buttons

Variants:
- Primary.
- Secondary.
- Tertiary/Ghost.
- Danger.
- Link.

Sizes:
- Small.
- Medium.
- Large.

Rules:
- Clear action labels.
- Visible hover, focus, active, disabled, and loading states.
- Minimum comfortable touch target; aim for 44 × 44 px on touch interfaces.
- Do not use buttons for navigation when a link is appropriate.

## 8.2 Cards

Card types:
- Standard.
- Interactive.
- Featured.
- Compact.
- Media.

Rules:
- Consistent padding and radius.
- Clear content hierarchy.
- Avoid unnecessary nested card borders.
- Interactive cards must expose clear focus and hover states.

## 8.3 Forms

Rules:
- Every input has an accessible label.
- Required and optional states are clear.
- Validation appears near the relevant field.
- Error messages explain how to fix the problem.
- Disabled and loading states are distinguishable.
- Controls remain usable on small screens.

## 8.4 Navigation

Rules:
- Navigation hierarchy must be clear.
- Active route must be identifiable.
- Mobile navigation must support keyboard and touch.
- Menus must expose accessible names and states.
- Language and theme controls must be easy to find.

**Floating bottom dock pattern:** Shared bottom navigation uses a centered concave notch with a raised primary action, an icon-led compact presentation, safe-area-aware floating placement, and explicit accessible names. Geometry and behavior are driven by semantic tokens across the four global foundation CSS files. The same production component must be previewed in Design System Workbench. Couple may pass page-scoped semantic surface/accent tokens without being forced into the Global Theme Preset Engine; Wedding remains isolated.

## 8.5 Dialogs and overlays

Rules:
- Clear title and purpose.
- Predictable close behavior.
- Keyboard focus management.
- Escape behavior where appropriate.
- Avoid destructive actions without confirmation.
- Keep dialogs usable on small screens.

## 8.6 Data components

Tables, lists, badges, alerts, and status indicators must:
- Preserve readability.
- Support responsive presentation.
- Use semantic status colors.
- Provide text labels for important states.
- Avoid color-only meaning.

# 9. DARK AND LIGHT THEME BEHAVIOR

- Dark Mode and Light Mode are first-class themes.
- New components must use semantic tokens.
- Do not hardcode theme-specific colors in individual components unless there is a documented exception.
- Theme switching must not alter layout or lose user input.
- Respect system preference when no explicit user choice exists.
- Persist explicit user choice.
- Check contrast and component states in both themes.
- Avoid a flash of the wrong theme where technically practical.
- Keep global identity preset and visitor appearance mode independent. The preset is published centrally; Light/Dark mode is a visitor preference.
- The visitor-facing mode control exposes Light and Dark only. First visit follows the device preference internally until the visitor makes an explicit choice.
- Global preset token maps must define both Light and Dark variants and use the shared semantic token names.
- Admin previews must be isolated from the live visitor theme until explicit publication succeeds.
- Page-scoped and isolated experiences must not be recolored by a global preset.

# 9.1 GLOBAL PRESET ARCHITECTURE

The initial global preset catalog is additive:
- TECNO: existing purple, indigo, and cyan identity.
- Dajjal × Veylora: azure/blue/white in Light Mode and crimson/red/black in Dark Mode, sourced from the existing Couple page identity.

The Couple page remains page-scoped. Its visual source values may be reused in a distinct global token map, but its CSS selectors remain scoped to the Couple page. Wedding and immersive Games remain isolated. Standard pages adopt global presets through semantic tokens; legacy hardcoded colors are migrated incrementally rather than overridden indiscriminately.

An administrator may preview a draft in both modes and publish only after explicit confirmation. Visitor palette selection is not stored locally; only the visitor's appearance mode is persisted.

# 10. INTERACTION AND MOTION

Recommended motion:
- Fast: approximately 150–160 ms.
- Standard: approximately 200–240 ms.
- Emphasis: approximately 280–320 ms.

Rules:
- Motion should clarify state changes.
- Avoid unnecessary animation.
- Avoid motion that delays interaction.
- Respect `prefers-reduced-motion`.
- Hover effects must not be the only indication of interactivity.
- Avoid excessive glow, parallax, and animated gradients.

# 11. ACCESSIBILITY

Target: WCAG 2.2 Level AA, following the Master Foundation.

Required practices:
- Sufficient text and UI contrast.
- Keyboard access.
- Visible focus indicator.
- Semantic HTML.
- Accessible names.
- Accessible forms and error messages.
- Appropriate touch target sizing.
- Reduced motion support.
- Status information not conveyed by color alone.

# 12. ICONOGRAPHY AND IMAGERY

- Use one consistent icon family wherever practical.
- Icons must have consistent stroke weight and visual scale.
- Decorative icons should be hidden from assistive technology.
- Functional icons require accessible labels.
- Use consistent image aspect ratios within repeated content patterns.
- Images must be optimized and have appropriate alternative text.
- Do not stretch or distort brand assets.

# 13. DESIGN TOKEN IMPLEMENTATION

CSS custom properties are the source of truth for shared design values.

Token naming must be semantic and consistent.

Recommended organization:
1. Brand primitives.
2. Theme semantic colors.
3. Typography.
4. Spacing.
5. Layout.
6. Radius and elevation.
7. Motion.
8. Breakpoints.

Components should consume semantic tokens rather than directly referencing palette primitives.

Existing `--df-*` variables may be migrated incrementally. Avoid breaking current styles by renaming tokens globally without regression testing.

# 14. GOVERNANCE AND MIGRATION

- This document governs new UI work after approval.
- Existing pages are not automatically redesigned.
- Legacy CSS remains in place until each page is migrated and tested.
- Shared token changes require regression checks.
- Component exceptions must be documented.
- Visual changes must be reviewed in Dark Mode, Light Mode, mobile, and desktop.
- Production changes require explicit approval under the Master Foundation.

# 15. DEFINITION OF DONE

A shared component is design-system compliant when:
- It uses semantic design tokens.
- It supports Dark Mode and Light Mode.
- It has responsive behavior.
- It has appropriate interaction states.
- It meets relevant accessibility requirements.
- It uses consistent spacing, typography, and shape.
- It has been tested in the contexts where it is used.
- It does not introduce unintended legacy regressions.

---

**Design principle:** One visual language. Many product experiences.

**Parent standard:** MASTER FOUNDATION DAJJAL FAMILY v1.0.


# 16. IMPLEMENTATION STATUS

The following direction has been selected for the Dajjal Family visual identity:
- Purple `#A855F7`, Indigo `#6366F1`, and Cyan `#22D3EE` as the brand palette.
- Dark and Light semantic theme palettes.
- Inter-first system typography.
- A 4 px spacing base.
- Semantic design tokens as the component styling interface.

Initial semantic tokens have been added to `app/styles/tokens.css`, with Light Mode semantic overrides in `app/styles/theme.css`. Existing legacy token names and page-specific CSS must be preserved during gradual migration.

Shared component inventory and behavior contracts are documented in `COMPONENT_CATALOG.md`.

This document remains **Draft — Pending Approval** until typography, layout, component rules, and implementation review have been completed. Token creation alone does not mean every existing page has adopted the Design System.

# 17. GLOBAL SHELL IMPLEMENTATION NOTE

A first global implementation pass now provides a shared token-driven Header and Footer across standard routes, with immersive game routes intentionally exempt. The homepage retains its discovery sidebars while using the shared global shell; the DF Universe page now consumes the same semantic theme tokens.

The global legacy compatibility layer no longer applies blanket heading or section-frame styles to every `main` element. Named primitives remain available for gradual migration. Broad legacy `!important` overrides have been removed from the global compatibility and theme stylesheets; reduced-motion safeguards remain scoped to accessibility behavior.

This is an implementation milestone, not design-system approval. Existing page-specific utility classes and bespoke components still require incremental token migration. The document remains **Draft — Pending Approval** until visual, mobile, desktop, keyboard, accessibility, and Dark/Light theme QA are complete.


# 18. Follow-up adoption pass — 2026-11-15

A second implementation pass extends semantic theme behavior to the Game Library, Profile, Profile Edit, and Settings routes. Legacy dark-only Tailwind surface utilities and modal panels are mapped to semantic tokens under Light Mode, while the dark palette remains the default. This is a scoped compatibility bridge, not proof that every page-specific utility across the application has been fully migrated. The global navigation pane exposes primary routes and a Tools group with Settings and Wedding. DF Universe event actions have a compact mobile layout.

The Design System remains **Draft — Pending Approval** until live visual checks are completed on mobile and desktop, both themes, keyboard navigation, and relevant dialogs. Continue replacing legacy utility colors with semantic tokens incrementally rather than expanding broad global overrides.


# 19. Navigation and Profile refinement — 2026-11-15

Standard desktop routes now use a shared two-column workspace with a persistent left navigation sidebar; the Home page keeps its established sidebar composition. On mobile, a compact primary navigation row (Beranda, Game, Profil) sits below the header and the sidebar-style navigation is available from the mobile navigation trigger. The desktop header has no navigation trigger beside the DF brand.

The Profile identity area groups the avatar with the page title, player nickname, server, and edit action. Profile page surfaces consume semantic theme tokens, and the duplicate Google-connected panel has been removed while email and last sign-in details remain in Account Security. This is an implementation update, not design-system approval; both themes, desktop/mobile, keyboard behavior, and live route QA remain pending.


## 9.2 First global shell and homepage adoption

The Homepage, shared Header, standard GlobalSidebar, and shared Footer are the first migration boundary for the Global Theme Preset Engine. Their color-bearing styles must consume root semantic tokens supplied by the active registry preset. Homepage-specific layout remains scoped to `.df-home-app`, while visual values (surfaces, text, borders, actions, focus, decorative gradients/glows, and overlays) are resolved through tokens. Shared navigation and footer components use the same token contract on desktop and mobile.

Do not add independent Light/Dark color overrides or preset-specific hardcoded values to these migrated areas. New identity presets must be implemented in `themeTokens.js`, not in page CSS. Wedding-only overrides, Couple page identity, and immersive Games are explicit isolation boundaries. Implementation is pending visual, keyboard, responsive, and four-way preset/mode QA.


# 9.3 BROWSER CHROME THEME COLOR

The document publishes a `theme-color` meta value derived from the active global preset's semantic `--df-bg` token. The initial HTML provides the preset's Dark canvas as a safe fallback; the early theme bootstrap replaces it with the visitor's resolved Light/Dark canvas before normal page paint. `ThemeProvider` keeps the meta value synchronized whenever the visitor changes appearance mode or the internal first-visit system preference changes. Do not hardcode per-preset browser colors in page styles or components. Browser chrome adoption is controlled by the browser/operating system; the website can request a matching toolbar/status-bar theme but cannot guarantee that every browser UI element changes identically.


## 9.4 GAME LIBRARY PRESET ADOPTION
The public Game Library (`/id/games` and `/en/games`) is a standard website page and must consume the active Global Theme Preset Engine semantic tokens for its page canvas, cards, artwork surfaces, typography, borders, actions, focus states, and dialogs. Do not add independent TECNO or Dajjal × Veylora color palettes to this page. Responsive behavior must be designed and checked for mobile, tablet, and desktop. The catalog presents only playable games; items in a Coming Soon state are omitted from this visitor-facing library until they are ready to be offered.

Game titles and supporting copy follow the selected locale. The former Run Jump / Dajjal Family Jump card is displayed as “Lari! Kebakaran Hutan!” in Indonesian and “Run! Forest Fire!” in English. This is a localized display-name decision only; preserve the stable `/games/run-jump` route and game data identity.


# 9.5 CONTEXTUAL NAVIGATION AND EVENT BADGE
All shared navigation text must be bilingual (Indonesian and English) through the central navigation label registry. The Family Universe invitation item uses the canonical route `/df/wedding-anak-dajjal` and a localized “Acara” / “Event” badge. The badge class `.df-nav-event-badge` consumes `--df-event-badge-bg` and `--df-event-badge-text` from the active Global Theme Preset token map; never hardcode a preset color in the navigation component. Its blink animation must stop under `prefers-reduced-motion: reduce`.

The Admin group links to the existing Theme Preset Manager at `/admin/theme`. The general `/settings` page is retired and redirects to Profile; settings remain contextual to the feature that owns them. Footer branding uses the official Dajjal Family icon asset rather than a text-only DF substitute.


# 24. BUTTON COLOR TOKEN CONTRACT — 2026-11-21

Buttons reuse the existing shared semantic color tokens. Do not introduce a separate set of global button color tokens for ordinary Primary and Secondary buttons; shared component styles should update centrally so existing buttons adopt the change without page-by-page edits.

Primary button contract:
- `--df-primary`: button background and border.
- `--df-primary-hover`: button hover background and border.
- `--df-on-primary`: foreground (text/icons) displayed on the Primary surface.

Secondary button contract:
- `--df-surface-raised`: default background.
- `--df-surface-overlay`: hover background.
- `--df-text`: foreground.
- `--df-border-strong`: border.

`--df-on-primary` is a shared foreground token, not a button-only token. It is also used by other elements displayed on a Primary-colored surface, including active pagination, accessibility skip links, and selected Library/action elements. Changing it therefore affects every consumer of the token. Before changing its value, inspect all usages and verify foreground/background contrast in each active preset and Light/Dark mode.

Page-specific visual exceptions may use narrowly scoped page styles when genuinely required, but ordinary buttons must not require editing each instance. Existing button classes should continue consuming the shared semantic tokens.

Validation remains required for all preset/mode combinations, mobile and desktop, hover/focus/active/disabled states, and WCAG contrast before Design System approval.

# 16. REUSABLE UI COMPONENT LAB CONTRACT

The Design System lab is the practical component library for DAJJAL FAMILY. Its main output is reusable, implemented UI elements that future website pages can consume—not primarily a palette showcase or abstract token gallery.

## 16.1 Component definition

Each approved reusable component must provide:
- A stable semantic name/API and documented usage contract.
- A real shared implementation that can be imported/consumed by website pages.
- Defined variants, sizes, interaction states, and behavior.
- Accessibility and responsive/Mobile Compact UI behavior.
- Compatibility with TECNO Light, TECNO Dark, Dajjal × Veylora Light, and Dajjal × Veylora Dark.
- A live lab preview that exercises the same implementation/API used by website pages.

Illustrative names such as `df-search`, `df-button`, and `df-modal` are proposals only until implemented and listed in the component inventory.

## 16.2 Mandatory consumer rule

- New or modified website UI must use the semantic component contracts and design tokens defined by this Design System.
- Reuse an existing component whenever it meets the need; do not duplicate it with page-local markup/styles.
- If a reusable element is missing, build and document it in the lab first, then consume it on the target page.
- Use semantic tokens for all visual roles they cover. Do not hardcode local visual values when an approved token/component role exists.
- Unique page composition may remain local, but its visual properties must still use the relevant semantic tokens.
- Existing isolated experiences keep their approved theme scope and use the corresponding scoped semantic contracts rather than being forced into global recoloring.
- Existing legacy pages migrate incrementally; this standard does not authorize a blanket redesign.

## 16.3 Inventory and governance

The component inventory, semantic names/APIs, examples, and implementation status must be maintained together. A preview-only mock is not a completed reusable component. If documentation and source disagree, inspect and reconcile them before adding consumers.

The governing rules are in `docs/aturan-kerja.md` and `docs/foundation/MASTER_FOUNDATION.md` (approved v1.4). The project brief and pending inventory work are tracked in Akashic Record at `dajjal-family/backlog/plan-reusable-ui-component-system.md`.


## 16.4 Mobile Compact UI — mandatory responsive component contract

Mobile Compact UI is the owner-approved default mobile presentation and density standard defined by Master Foundation v1.4, Section 22, and the canonical implementation guide in Akashic Record at `dajjal-family/core/mobile_compact_ui.md`.

Every new or materially revised shared component and Design System workbench surface must follow this contract:
- Treat Mobile Compact UI as a responsive layout/density layer over the existing Design System, Global Theme Preset Engine, and semantic tokens—not as a new theme, palette, or component system.
- On narrow screens, reduce unnecessary whitespace, oversized padding, repeated panels, and excessive vertical stacking while preserving hierarchy and readability.
- Use compact but accessible controls, labels, badges, chips, and rows. Keep touch targets aligned with WCAG 2.2 AA expectations and the Master Foundation; compact styling must not shrink essential targets or remove labels.
- Prefer wrapping chips for short options and progressive disclosure for secondary or advanced controls. Keep primary actions discoverable and group secondary actions contextually.
- Prevent unintended horizontal page overflow. Wrap long labels/IDs/tags or use accessible truncation; horizontal scrolling is allowed only inside deliberately bounded components such as data tables.
- Preserve all functionality and loading, empty, error, success, selected, disabled, hover, and keyboard-focus states.
- Choose the layout according to the component's task. Do not force every component into the same card/list pattern or assume one-column stacking is always the most compact solution.
- Preserve the established desktop composition and responsive breakpoints. Inspect existing consumers and breakpoint behavior before introducing new values.
- Apply global theme tokens only within global scope. Couple, Wedding, and immersive Games retain their approved scoped visual boundaries; use compact principles only where compatible.
- Validate applicable four-way theme combinations, ID/EN including long translations, small Android widths, larger phones, tablet, desktop, zoom/text scaling, keyboard/focus, contrast, reduced motion, screen-reader labels, and touch targets.

**Consumer rule:** A component is not considered responsive-ready merely because it fits the viewport. Its Mobile Compact UI behavior, content density, overflow handling, touch usability, and retained functionality must be documented and reviewed in the Design System lab before it becomes the recommended shared pattern for new consumers.


# 15. REUSABLE COMPONENT AND SEMANTIC IMPLEMENTATION CONTRACT

New standard web pages must use the Design System as their source of reusable UI and semantic roles.

- Reuse exported components from `app/components/ui` and layout/typography primitives from the four global foundation stylesheets.
- When a needed pattern is missing, create a reusable component, document its API and limitations in the Component Catalog, and add a live instance to the Design System Workbench before using it in a new page.
- Integrate every new semantic role into the appropriate shared foundation files: `tokens.css`, `typography.css`, `layout.css`, and `components.css`. New components must not ship with page-local duplicate styles.
- Add tokens; do not remove or rename existing semantic tokens during routine component work.
- Verify all four global preset/mode combinations, ID/EN, Mobile Compact UI, keyboard/focus, reduced motion and responsive behavior.
- This contract applies to new standard pages. Existing pages are not part of a blanket migration. Couple, Wedding and immersive Games retain their approved isolation boundaries.


# 16. SESSION VERIFICATION EXPERIENCE

The shared `VerificationState` component provides a consistent bilingual presentation for Admin and User session checks.

Required variants and states:
- Admin: identity and administrator access verification.
- User: account session verification.
- Checking, verified, error/denied, and expired states.
- Full composition for page gates and compact composition for account/navigation affordances.

Semantic token roles:
- `--df-verification-surface`
- `--df-verification-raised`
- `--df-verification-border`
- `--df-verification-accent`
- `--df-verification-progress`
- `--df-verification-success`
- `--df-verification-error`
- `--df-verification-motion`

These roles are aliases to the active global semantic theme tokens. They must not create a separate Admin/User palette. The component uses the four global foundation stylesheets and is demonstrated through the live Design System Workbench.

The Admin workspace uses a persistent shared auth provider to avoid repeating the administrator verification request during client-side submenu navigation. This UI optimization never replaces server-side authorization: protected API routes must continue to verify every bearer token and administrator permission independently. User-facing verification remains tied to the existing Supabase Auth session and must not infer access from client profile metadata.


## Floating bottom dock — compact edge-flush pattern

The shared BottomNavigation is a viewport-edge dock: full width, flush to the bottom, square lower corners, rounded upper corners, and a centered concave notch aligned to the raised circular action. Five equal grid columns preserve the exact center axis. Item and center-action labels are visible below their icons; consumers provide translated labels using the existing ID/EN language source. The dock uses semantic geometry/spacing tokens, compact typography roles, safe-area padding, keyboard focus, and reduced-motion behavior. The live Workbench preview must use the same production component. Wedding remains isolated.


# 17. EDITORIAL ENGINE COMPONENT CONTRACT

The Blog Editorial Engine uses one versioned structured-content model for both authoring modes.

- Rich Text mode is the default block authoring experience.
- Full HTML mode accepts a restricted HTML fragment and parses it into the same editorial block model.
- Both modes share one validation, storage, translation, rendering, and publishing pipeline.
- Supported blocks: paragraph, heading, quote, code, list, image, link, CTA button, table, YouTube embed, and divider.
- Legacy plain-text article content remains readable; newly saved content uses versioned JSON in the existing text columns.
- Code blocks are excluded from Gemini requests entirely. Translate only text fields selected by the server, then validate the resulting block document and preserve block IDs/order/types.
- Never render author-supplied HTML with `dangerouslySetInnerHTML`. The public renderer maps validated block types to React elements.
- Full HTML rejects scripts, styles, event handlers, arbitrary attributes, arbitrary iframe markup, unsafe URL schemes, and unsupported elements. YouTube embeds are rendered by the trusted renderer from a validated video ID.
- Use the same reusable editor/renderer components in author pages and Design System Workbench.
- Keep Mobile Compact UI, responsive code scrolling, accessible controls, semantic tokens, and four global theme combinations.
- No database migration is required for versioned JSON content in existing `content_id` and `content_en` text columns.


# 18. CONTRIBUTOR PROFILE COMPONENT PATTERN

- Public contributor directories use the shared `ContributorCard` React component and `.ui-contributor-grid` layout primitive.
- `ContributorCard` composes shared `Card`, `Avatar`, typography, and link primitives; feature consumers supply only approved public contributor data.
- Contributor identity surfaces consume `--df-contributor-*` semantic geometry tokens and `.ui-author-card__role` responsive typography. Token values are coordinated through `tokens.css`, `typography.css`, `layout.css`, and `components.css`.
- The responsive directory uses three columns on wide desktop, two on tablet, and one compact column on mobile. Interactive links retain visible focus and touch-sized targets.
- The production ContributorCard is previewed in Design System Workbench section 17. Do not create a page-local card variant for contributor listings.


## Contributor Platform visual contract — 2026-11-25

- Public invitation page /contributors and public profiles /contributors/profile/[slug] use shared PageHeader, Card, Badge, Link, Avatar, BlogArticleCard, and ContributorCard primitives.
- Private Contributor Shell routes are noindex and use shared session-verification and feedback components. Do not expose email, Auth IDs, permissions, tasks, or draft content on public profile surfaces.
- ContributorCard semantic roles are defined by --df-contributor-* tokens and .ui-contributor-card, .ui-contributor-grid, and .ui-contributor-card__role in the four global foundation CSS files.
- Contributor typography uses responsive ui-text-display-wide and ui-text-mobile-small roles. Mobile Compact UI applies without reducing accessible touch targets or desktop readability.
- Contributor components are demonstrated in Design System Workbench section 17/18; shared exports are used by consumers.

# 10. CONTACT CHANNEL COMPONENT CONTRACT

The standard public Contact page uses the reusable `ContactChannelCard` component from `app/components/ui/ContactChannelCard.js`.

- WhatsApp displays a telephone number; Telegram displays a username. Never swap or duplicate the identities.
- The destination URL is provided by the page consumer; display values do not generate or mutate destinations.
- Use the shared Card primitive, semantic surface/text/focus tokens, shared spacing and radius tokens, and Global Typography roles.
- Official platform colors are limited to their icon marks and are represented by semantic tokens; they must not recolor the global card surface or primary action palette.
- Small mobile uses a compact single-column layout; wider screens use a two-column layout. Preserve touch target, readable metadata, visible focus, and reduced-motion behavior.
- The production component must remain visible in Design System Component Workbench section 14 and documented in Component Catalog.


## Global Button Styling — shared action contract

- The reusable `Button` primitive and navigation links styled with `.ui-button` share the global component CSS in `app/styles/components.css`.
- Primary, secondary, ghost, and danger variants inherit the shared shadow treatment (`--df-shadow-sm`, increasing to `--df-shadow-md` on hover); active and disabled states remain restrained.
- Primary foreground uses `--df-button-primary-text`, keeping readable white text in DAJJAL VEYLORA Light without changing the separate `--df-on-primary` semantic.
- Home hero actions and `/df` hero actions use the same global `.ui-button` primary/secondary variants. Page CSS controls placement and responsive sizing only, not button colors, surfaces, borders, or shadows.


## Reusable SVG Icon contract

The shared `SvgIcon` is the canonical line-icon API. New interface icons and icon-bearing labels must use a semantically relevant icon from the central library, inherit `currentColor`, and follow the 24 × 24 outline geometry with 1.8 stroke, round caps and joins. The real component is previewed in section 09 and Component Workbench. New names must be added centrally and documented in Component Catalog; avoid Unicode glyph substitutes and page-local duplicate SVGs. Icon dimensions must be applied as CSS styles (not CSS custom-property values in SVG width/height presentation attributes), with a fixed flex basis so icons cannot stretch inside labels, buttons, badges, or grid cells. The Workbench size scale is the visual regression reference.


## 16.5 Local image workspace components — 2026-11-28

The shared UI inventory includes two production components for local image workflows:
- `ImageDropzone`: accessible image file selection with keyboard activation, drag-and-drop, accept filtering, and disabled state.
- `ImagePreview`: consistent original/result surface with semantic transparent checkerboard and empty state.

Their spacing, preview geometry, surface colors, borders, focus behavior, and responsive layout are defined through semantic tokens and the four global CSS foundations. Both production components are previewed in Component Workbench section 14. Use these components rather than building page-local file-picker or preview markup.
