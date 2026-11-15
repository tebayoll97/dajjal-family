# Wedding product direction

## Current decision — 2026-11-15
The general-purpose Wedding Invitation Builder is retired as a Dajjal Family product. The only wedding experience to maintain is the public digital invitation for **Anak Dajjal & Malika**.

## Public invitation
- Canonical page: `/df/wedding-anak-dajjal`.
- Legacy invitation alias: `/df/wedding=anak-dajjal-malika` (preserve compatibility and canonical metadata).
- Keep the public invitation renderer, public invitation data endpoint, RSVP endpoint, Guestbook endpoint, and the assets/styles required by the invitation.
- Continue supporting Indonesian and English routes and metadata according to `docs/BILINGUAL_URLS.md`.

## Retired builder surface
- Remove Wedding Builder links from the global sidebar, header navigation, footer, and DF Universe landing page.
- Redirect the old `/df/wedding` entry and its nested builder URLs to the canonical public invitation so old bookmarks do not lead to dead pages.
- Retire builder-only UI and authenticated invitation CRUD/publish APIs.
- Do not drop Supabase tables, columns, policies, functions, invitation records, RSVP rows, Guestbook rows, or media as part of application retirement. Database/data cleanup requires a separate review and explicit authorization.

## Design direction
Use publicly observable invitation design patterns from undangan.io as inspiration for the single Anak Dajjal & Malika invitation. Implement original code, layout, copy, and assets; do not copy proprietary source code or protected assets.

## Verification
Test the canonical public route in Indonesian and English, the legacy alias, all redirects from retired builder paths, public data loading, RSVP, Guestbook, mobile layout, both themes, and sitemap/robots/canonical behavior. Do not claim live verification until a deployment is available and browser QA has been performed.

## Current invitation UX implementation
- The public invitation now includes a compact, sticky section-navigation row after the hero. It only displays links for sections that are available or enabled.
- Navigation targets include event details, Love Story, gallery, digital gifts, RSVP, and Guestbook.
- Keep the experience mobile-first, keyboard-accessible, and respectful of reduced-motion preferences.
- Request the owner's actual photo and audio URLs when the media slots are ready; do not use invented media or treat placeholders as final assets.
