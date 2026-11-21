# UI Components

Reusable React UI primitives live here. Components should be accessible, responsive, theme-aware, and styled through the shared design tokens and component classes. Avoid duplicating page-specific business logic here.


## SearchField

Use `SearchField` for reusable native search inputs. Provide a visible `label` or `aria-label`; pass form attributes and handlers directly as props. The semantic root is `.df-search`, with shared component CSS and semantic tokens. Use it in the Design System workbench and production pages instead of rebuilding search markup.
