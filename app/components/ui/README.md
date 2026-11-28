# UI Components

Reusable React UI primitives live here. Components should be accessible, responsive, theme-aware, and styled through the shared design tokens and component classes. Avoid duplicating page-specific business logic here.


## SearchField

Use `SearchField` for reusable native search inputs. Provide a visible `label` or `aria-label`; pass form attributes and handlers directly as props. The semantic root is `.df-search`, with shared component CSS and semantic tokens. Use it in the Design System workbench and production pages instead of rebuilding search markup.


## New shared components

- `Link`: semantic Next.js navigation; external link behavior is opt-in.
- `IconButton`: icon-only action with required accessible label and shared touch target.
- `Tooltip`: focus/hover helper; not a replacement for essential labels.
- `Accordion`: keyboard-operable disclosure list.
- `ProgressBar`: determinate and indeterminate progress semantics.
- `StatCard`: compact dashboard metric surface.
- `PageHeader` and `SectionHeader`: shared page/section composition.
- `ConfirmDialog`: shared confirmation layout built on Dialog and Button.


### BottomNavigation
Use `BottomNavigation` for compact fixed or inline navigation with up to four destinations and one centered primary action. Provide localized accessible labels and consumer-owned callbacks. When `fixed` is enabled, reserve bottom space in the page content and verify device safe areas.


## AdminPanel
Use `AdminPanel` for a semantic administrative content surface. It only provides the shared surface contract; data fetching, authorization, validation, and interaction state remain in the page. Supports an alternate semantic root through `as` and forwards native props.


### ImageDropzone
Use `ImageDropzone` for local image selection. Provide localized `label`, `actionLabel`, optional `description`, accepted MIME types, and an `onFiles` callback. The callback receives a one-item array by default or an array when `multiple` is enabled. The component does not upload or persist files.

### ImagePreview
Use `ImagePreview` for original and processed image previews. Pass a blob/object URL through `src`, a localized `label` and `alt`, and an optional localized `emptyLabel`. The component only renders the preview; lifecycle and URL revocation remain with the consumer.
