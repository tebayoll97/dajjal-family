# Agent Dajjal Tools — Public Routing

## Canonical public routes

- Tools directory: `/id/tools` and `/en/tools`
- Image Compressor: `/id/tools/image-compressor` and `/en/tools/image-compressor`
- Background Remover: `/id/tools/background-remover` and `/en/tools/background-remover`

The public URL deliberately does not expose the internal `df/agent-dajjal` namespace. The existing tool implementations remain in their current App Router source directories and are rendered by the concise public routes under `app/tools`.

## Compatibility

The former localized routes remain as temporary HTTP 307 redirects:

- `/id/df/agent-dajjal` → `/id/tools`
- `/id/df/agent-dajjal/tools` → `/id/tools`
- `/id/df/agent-dajjal/tools/image-compressor` → `/id/tools/image-compressor`
- `/id/df/agent-dajjal/tools/background-remover` → `/id/tools/background-remover`

The same redirects apply to `/en`. Query parameters are preserved. Keep these aliases during migration so existing bookmarks and external links continue to work.

## SEO and navigation

- Canonical and hreflang metadata point only to the concise localized URLs.
- Sitemap lists `/tools` and its published tool pages, not legacy redirect aliases.
- The tools directory and each tool's back link use the current explicit locale.
- Tool processing, worker paths, model caching, and local-file privacy behavior are unchanged.
