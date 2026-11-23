# Foundation Changelog

## v1.0 — Approved

- Established Dajjal Family as a unified digital ecosystem.
- Approved Dark Mode and Light Mode as global theme options.
- Approved English and Bahasa Indonesia with URL prefixes: /en/ and /id/.
- Approved browser-language detection, country fallback, and persistent manual language selection.
- Approved a modular monolith architecture using Next.js.
- Approved a unified account identity using Supabase Auth, with product-specific authorization.
- Established shared design tokens and reusable component standards.
- Established SEO, performance, security, accessibility, content, testing, and deployment standards.
- Established GitHub documentation as the authoritative project reference.
- Established preview-first development and explicit approval before production changes.
- Required gradual migration and protection of existing routes, accounts, games, invitations, and data.



## Homepage foundation integration — Preview

- Connected the homepage shell to semantic design tokens for background, surfaces, borders, typography, and theme values without changing legacy routes.
- Added a keyboard skip link, visible focus indicators, current-page navigation semantics, and accessible labeling for the mobile navigation disclosure.
- Kept the existing homepage content, destinations, and information architecture intact.
- Status: preview implementation; visual and keyboard QA in both themes and mobile/desktop remains required before approval.

## Homepage Foundation Compliance — Preview

- Added a dedicated, homepage-scoped compliance layer consuming Master Foundation semantic tokens for the desktop sidebar, mobile header and navigation disclosure, content header, hero, category cards, feature section, latest section, and footer.
- Unified theme-aware surfaces, text hierarchy, borders, actions, focus indicators, and reduced-motion behavior through shared semantic tokens.
- Kept existing page destinations, categories, bilingual copy, and legacy route styling intact.
- The approved Master Foundation remains the governing standard; the visual Design System remains Draft pending owner review.
- Status: implementation committed to the preview branch; build and manual visual/keyboard QA remain required.

## Command Master v1.1 — Autonomous product discovery

- Added a mandate to independently research category leaders, competitor patterns, user expectations, technical standards, and market trends before major product builds.
- Added end-to-end feature mapping and journey checklists so important menus, settings, management flows, and user-facing states are not omitted.
- Established sensible-default execution: do not ask the owner to specify routine product/design details; ask only for genuinely blocking owner-only decisions or high-impact irreversible trade-offs.
- Added a wedding-builder example covering templates, customization, event information, schedule, venue/maps, media, RSVP, guestbook, gifts, preview, drafts, publishing, sharing, management, privacy, accessibility, mobile, localization, and future analytics/monetization.
- Added /command-master as the owner's shorthand to load and execute the current Command Master and related foundation documents, subject to security and production release safeguards.
- Research claims must distinguish verified findings, common patterns, and recommendations; no claim of exhaustive web crawling or certainty beyond available evidence.


## Account experience and profile security — Preview implementation

- Added a shared account entry that reflects Supabase Auth state, displays the player's avatar or nickname when available, and routes signed-out visitors to Google login with a return path.
- Added the account entry to the standard site header and both desktop and mobile homepage headers; the existing footer profile link remains available.
- Preserved immersive game and public wedding invitation layouts without injecting account chrome into those focused experiences.
- Hardened the player profile API: it now requires a valid bearer session, verifies that the requested player belongs to that authenticated user, omits the internal auth user ID from the response, and disables response caching.
- Updated the profile page to send its session token and the edit page to return unauthenticated visitors to login.
- Status: committed to the feature branch; build, interactive auth-flow, responsive, and visual QA remain pending. No production changes.


## Command Master v2.0 — incremental releases and command registry

- Established `/command-master` as the development command and added dedicated `/command-master-migration`, `/command-master-audit`, and `/command-master-status` operating modes.
- Defined a gated release-readiness workflow covering branch scope/divergence, build and tests, exact-commit preview QA, database compatibility, recovery planning, explicit release approval, and post-release verification.
- Clarified that Git merge, Supabase database migration, and Vercel production promotion are separate operations.
- Adopted incremental, independently usable releases with versioning, release notes, migration-state tracking, and safe synchronization of the development branch after each release.
- Production and destructive operations remain blocked until explicit, release-specific owner approval.
- Status: documentation committed to `redesign/dajjalfamily-home` only. No merge to `main`, production deployment, or Supabase database change.


## Command Master v2.1 — inherited execution mandate and quick command directory

- Added a quick-reference subcommand directory at the top of COMMAND_MASTER.md, including usage examples and the purpose of each command.
- Made the global master mandate explicitly binding on every current and future subcommand: expert-level ownership, proactive decision-making, concise and efficient communication, and maximum practical results.
- Clarified that confidence must remain evidence-based and cannot override security, verification, or production approval safeguards.
- Status: documentation committed to `redesign/dajjalfamily-home` only. No merge to `main`, production deployment, or Supabase database change.


## Profile and User Management — Development implementation

- Added login email, authentication provider, and last sign-in details to the player's Account Security area.
- Upgraded the existing admin Player Management module into User Management without changing its route, preserving compatibility.
- Added linked account email and last sign-in information, active/banned filters, clearer profile-only deletion messaging, and success feedback for ban/unban/delete actions.
- Removed the internal Supabase Auth user ID from the admin player-list API response and distinguished missing Auth links from failed Auth lookups.
- Scope: directory currently lists player profiles and their linked login accounts; standalone Auth users without player profiles remain outside this directory.
- Status: committed to `redesign/dajjalfamily-home`; preview build and interactive QA remain blocked by Vercel build-rate limiting. No production release or database schema change.


## Master Foundation v1.1 — Account-Based Platform with Progressive Login

- Owner-approved the Account-Based Platform with Progressive Login as the official account/access standard.
- Public discovery, public invitations/content, catalogue browsing, and supported non-persistent demo/mini games do not require login.
- Request authentication progressively when users access persistent progress, cross-device sync, profile/statistics, achievements, leaderboards, wallet/rewards, or other account-bound capabilities.
- Administrative permissions remain separate and server-verified.
- Established Supabase Auth as canonical identity and `players.id` as the universal gaming Player ID, with product/game data boundaries and preservation of existing Guest/account progress.
- Added privacy, data-minimization, account-lifecycle, and phased rollout requirements.
- Status: policy documentation committed to the development branch only. Application migration, database changes, production deployment, and release approval remain separate steps.


## Progressive Login — Phase 2 access inventory

- Audited current public, account-required, and admin-only routes and documented their observed behavior in `docs/MASTER_ACCOUNT_INTEGRATION.md`.
- Confirmed public Game Library browsing, public mini-game play, public wedding invitations, protected profile, and separate admin authorization.
- Identified the Daily Riddle guest-flow gap and recorded the safe prerequisite: provision/resolve guest player context and verify non-persistent attempts before relaxing the login prompt.
- Retained MAMAH NGAMUK account requirement for persistent wallet, best distance, and leaderboard.
- Status: access classification complete on the development branch; application-level guest-flow migration remains pending. No database or production changes.


## Command Master v2.2 — Admin and Account Management subcommand

- Added `/command-master-admin` to the official subcommand registry.
- Defined end-to-end scope across authentication, Progressive Login, user profiles, account lifecycle, Admin Dashboard, User Management, roles/permissions, moderation, privacy, and audit logs.
- Explicitly inherited the complete parent Command Master mandate, security controls, data-preservation requirements, QA standards, and production approval gates.
- Added safeguards for Guest/provider identity linking, least privilege, destructive account actions, last-admin protection, and server-side authorization.
- Status: command charter committed to the development branch; no application, database, or production changes were made by this documentation update.

## 2026-11-14 — Expanded Player Profile and Multi-Identifier Login

- Started `/command-master-admin` implementation for richer player profiles and login by email, username, or verified phone, with Google OAuth retained.
- Added Profile to the primary navigation immediately before Home.
- Created a draft additive migration for username, gender, phone number, and birth date. It has not been applied.
- Documented password handling through Supabase Auth only, username/phone privacy, and public/private profile field boundaries.
- Remaining: implement profile form and completion task, secure identifier-login flow, Auth password setup, API field allowlists, uniqueness/error handling, and end-to-end QA.
- No Supabase schema changes, Auth configuration changes, production changes, or deployment were made.


## Game route consolidation — 2026-11-15

- Consolidated the public game catalogue under the single library route `/games`.
- Moved Dajjal Family Jump implementation from `app/mini-game/run-jump` to `app/games/run-jump`.
- Moved shared arcade styling to `app/games/arcade-master.css`.
- Added Dajjal Family Jump to the main Game Library; removed the secondary Mini Games catalogue.
- Kept legacy `/mini-game` and `/mini-game/run-jump` URLs as redirects to canonical routes.
- Kept MAMAH NGAMUK static assets under `public/mini-game`; they are still referenced and were not deleted.
- Daily Riddle files and features were intentionally left untouched pending a separate explicit removal instruction.
- Runtime/build verification is pending; no deployment was attempted while the Vercel deployment quota restriction remains in effect.


## Wedding product scope reduction — 2026-11-15

- Retired the general-purpose Wedding Invitation Builder from Dajjal Family following the owner's product decision.
- Removed Builder navigation, dashboard/editor/preview/detail pages, Builder-only account controls, and authenticated invitation CRUD/publish APIs.
- Redirected legacy Builder URLs to the single public Anak Dajjal & Malika invitation.
- Preserved the public invitation renderer, public read API, RSVP, Guestbook, invitation alias, required media/styles, and all existing database records/schema.
- Expanded the public invitation allowlist and rendering for family details, event countdown, address/map, Love Story, and digital-gift information when available; added localized metadata and hreflang.
- Source changes are on `main`. Build and browser QA remain pending; no Supabase schema/data operation was performed.

## Single invitation experience refinement — 2026-11-15

- Added a compact section-navigation bar to the public Anak Dajjal & Malika invitation, with links shown only for sections that have content or are enabled.
- Added stable anchor targets for event details, gallery, RSVP, and Guestbook; existing Love Story and gift anchors remain.
- Improved mobile horizontal scrolling, sticky positioning, keyboard focus visibility, and reduced-motion behavior for the navigation.
- Removed an unrelated legacy subtitle and replaced the photo placeholder's instructional sentence with a neutral couple label; no photo or audio assets were fabricated.
- Improved gallery image fallback text and localized previous/next accessible labels.
- Source implementation is on `main`; build, deployment, and browser QA remain pending. No database or invitation records were changed.


## Unified invitation navigation and wishes form — 2026-11-15

- Replaced the public invitation's horizontal section links with a fixed five-item bottom navigation: Mempelai, Acara, Hadiah, Ucapan, and Lain-lain (English labels localized).
- Combined RSVP and Guestbook into one Ucapan & Doa form with player name, attendance choices (Hadir / Belum Pasti / Tidak Hadir), and message/prayer; approved guestbook messages remain visible below the form.
- Kept the existing RSVP and Guestbook API endpoints and database tables; the form submits to the existing endpoints and reports partial success if RSVP is stored but Guestbook submission fails.
- Extended RSVP API validation to accept the pending maybe attendance value. No database schema, records, or policies were changed; database compatibility for this value still requires runtime verification.
- Added responsive bottom-navigation styling, safe-area spacing, keyboard focus, and reduced-motion handling.
- Source is committed on main. Build, browser QA, and deployment were not run while the Vercel quota pause remains in effect.


## 2026-11-15 — Anak Dajjal & Malika invitation decisions
- Removed the invitation opening gate so the public route opens directly on the invitation page.
- Removed the map action from the event section; event address and schedule details remain. No Join Live action was present in the current page source.
- Replaced the Digital Gift section with a Darkwar Survival Dawn Badge-styled Player ID section. The current emblem is an original CSS placeholder, not the official game badge asset; the actual player ID and official logo asset have not yet been supplied.
- Guestbook submissions are marked approved by the server and appear in the existing approved-message list without admin moderation. No database schema, records, policies, or production settings were changed.
- Source implementation only; deployment and live QA remain pending while Vercel release quota is paused.


## 2026-11-18 — Global Theme Preset: first shell migration

- Removed the legacy Light Mode homepage overrides that forced TECNO colors regardless of the published preset.
- Bound the shared body canvas and shared theme control to active semantic tokens.
- Added a preset-token enforcement layer for homepage sidebars, hero, cards, actions, feature strip, internal footer, mobile topbar, drawer, and decorative orbit.
- Kept shared Header, Footer, and GlobalSidebar on the semantic token contract; tokenized the mobile navigation backdrop and profile-avatar foreground.
- Preserved scoped Wedding header overrides and the Couple/Wedding/Games isolation rules.
- Source changes committed on `main`; visual/build/browser QA and production deployment remain pending.


## 2026-11-18 — Browser chrome follows Global Theme Preset Engine

- Added the document `theme-color` metadata using the active preset's semantic `--df-bg` token.
- The early theme bootstrap switches the browser theme color to the resolved visitor appearance mode before normal page paint.
- ThemeProvider keeps the browser theme color synchronized on manual Light/Dark changes and first-visit system preference changes.
- No per-preset hardcoded browser colors or page-specific CSS were introduced. Actual toolbar/status-bar rendering remains subject to browser and operating-system support.


## 2026-11-18 — Game Library Global Theme Preset migration

- Rebuilt only the public Game Library page (`app/games/page.js`) and its page-scoped visual rules in `app/styles/theme.css`.
- Replaced hardcoded palette colors and legacy dark-only card styling with semantic `--df-*` tokens, including page background, surfaces, text, borders, actions, focus states, and dialogs. Both TECNO and Dajjal × Veylora presets therefore supply the page identity in Light and Dark modes.
- Removed the Coming Soon section and its catalog-loading query from the visitor-facing Game Library. This does not delete or alter game records in Supabase.
- Reconstructed the two playable game cards for MAMAH NGAMUK and Run Jump. Localized the latter's display title as “Lari! Kebakaran Hutan!” (ID) and “Run! Forest Fire!” (EN), while preserving the existing `/games/run-jump` route and underlying game identity.
- Localized the visible page labels and dialogs; preserved MAMAH NGAMUK's Google-account gate and the public no-login launch for Run Jump.
- Added mobile single-column and tablet/desktop two-column responsive layouts, touch-sized actions, keyboard focus, and reduced-motion handling. Styling is scoped to `.df-games-page`; other game routes and immersive gameplay styles are not changed.
- Status: source committed on `main`; Vercel build and four-way preset/mode visual QA at mobile, tablet, and desktop remain to be verified.


## 2026-11-18 — Navigation, contextual settings, and footer refinement
- Removed the general Settings link from the Tools navigation and shared footer; the retired `/settings` route now redirects to Profile without deleting audio, theme, gameplay, account, or wedding-event settings modules.
- Added the existing Theme Preset Manager (`/admin/theme`) to the Admin navigation with Indonesian and English labels; visibility continues to use the existing admin-access gate.
- Added the public Anak Dajjal & Malika invitation to Family Universe using its canonical route, localized as “Pernikahan Anak Dajjal” / “Anak Dajjal's Wedding” with the “Acara” / “Event” badge.
- Added a looping event-badge class driven by Global Theme Preset semantic color tokens and disabled its animation for reduced-motion preferences.
- Replaced the footer's text-only DF mark with the official Dajjal Family icon and kept footer copy/navigation localized.
- Source update only; build, responsive/browser QA, and production deployment remain to be verified.


## Unified Admin Dashboard redesign — 2026-11-23

- Added a dedicated bilingual Admin Shell for the dashboard and all existing admin child routes, including a desktop grouped sidebar and compact mobile navigation.
- Reused shared Design System primitives and added compact admin typography roles with a live Design System preview.
- Added route-aware localized admin metadata, private noindex policy, localized canonical URLs, and the Dajjal Family Open Graph fallback image.
- Migrated Wedding Event, Wedding Gallery, Guestbook, Central Storage, and Admin Login to the shared LanguageProvider; existing admin CRUD and authorization flows remain in their page/API modules.
- Added semantic-token compatibility styling for legacy admin utilities and made private admin layouts dynamic/non-revalidated.
- No Supabase schema, RLS policy, production data, or game logic changes.
- Status: source committed on `main` at `35ea911`. `npm run build` passes with non-production placeholder Supabase environment values. Production deployment is blocked by Vercel HTTP 402 `api-deployments-free-per-day` (24-hour retry); live visual and interactive QA remain pending.


## 2026-11-23 — Shared verification experience and Theme Manager semantic migration

- Added reusable bilingual `VerificationState` for Admin and User session verification, including checking, verified, error, denied, and expired states.
- Added verification semantic token aliases and responsive typography roles to the global token foundation; added layout and component styles across the four global foundation CSS files.
- Added the live VerificationState instance to the Design System Workbench and updated the component inventory progress to 31/31.
- Added a persistent AdminAuthProvider to the Admin Shell. The dashboard, user management, music catalog, Couple Profile manager, Theme Manager, Central Storage, Wedding Event, Wedding Gallery, and Wedding Guestbook consume the shared verified admin session.
- Kept each protected API's server-side bearer-token and administrator authorization checks intact. Fixed stale in-flight admin session cache invalidation for sign-in, sign-out, user update, and token refresh.
- Rebuilt Theme Manager surfaces with shared Card, Button, Badge, Alert, ConfirmDialog, PageHeader, and Link primitives; replaced legacy hardcoded panel colors with semantic theme tokens.
- Added full and compact User VerificationState usage to the login page, AccountEntry, and navigation profile.
- No Supabase schema, RLS, policy, production data, or secret changes.
- Build verification: `npm run build` passed on source commit `54d887e` in a Vercel sandbox using non-production placeholder Supabase environment values; compilation, lint/type validation, and all 36 static page generations succeeded. Existing non-blocking `<img>` and hook-dependency warnings remain elsewhere in the admin area.
- Production deployment: blocked by Vercel API HTTP 402 `api-deployments-free-per-day` (24-hour retry window). The latest Production deployment remains on commit `3812ee5`; this batch is not yet live. Browser QA on the deployed build remains pending.
