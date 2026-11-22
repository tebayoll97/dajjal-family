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
