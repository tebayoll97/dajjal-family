# DAJJAL FAMILY
# MASTER WEBSITE FOUNDATION

**Document ID:** DF-MF-001  
**Version:** 1.4  
**Status:** Approved — v1.4  
**Project:** Dajjal Family  
**Primary Domain:** https://dajjalfamily.com  
**Tagline:** One Family. Many Possibilities.

---

# 1. PURPOSE AND VISION

Dajjal Family adalah ekosistem digital terpadu yang menaungi berbagai produk, layanan, konten, dan komunitas dalam satu identitas.

Website dibangun sebagai platform jangka panjang yang dapat berkembang tanpa harus membangun ulang keseluruhan sistem setiap kali kategori atau produk baru ditambahkan.

### Main ecosystem

1. Gaming
2. Knowledge
3. Blog
4. Digital Products
5. Business
6. Community

### Core principles

- One ecosystem, many possibilities.
- Modular architecture.
- Consistent user experience.
- Security by design.
- Performance by design.
- SEO by design.
- Mobile-first development.
- Maintainability and scalability.

# 2. BRAND AND DESIGN SYSTEM

## 2.1 Brand identity

Seluruh halaman harus mempertahankan identitas Dajjal Family.

Brand identity meliputi:
- Logo and brand assets.
- Primary and secondary colors.
- Typography.
- Iconography.
- Visual language.
- Layout conventions.
- Component styling.

Setiap kategori dapat memiliki karakter visual tersendiri selama tetap menjadi bagian dari identitas utama.

## 2.2 Theme system

Website wajib mendukung:
- Dark Mode.
- Light Mode.

Rules:
- Kunjungan pertama mengikuti preferensi sistem perangkat.
- Pengguna dapat mengganti tema secara manual.
- Pilihan manual disimpan dan diprioritaskan.
- Seluruh halaman standar wajib mendukung kedua tema.
- Komponen baru wajib kompatibel dengan kedua tema.
- Kontras teks dan elemen harus tetap layak.
- Halaman imersif seperti gameplay dapat memiliki tampilan khusus sesuai kebutuhan produknya.

### 2.2.1 Global theme preset architecture — owner decision 2026-11-18

Dajjal Family uses two independent global theme dimensions:

1. **Global identity preset** — selected and published by an authorized administrator. It defines the semantic color identity used by standard website pages.
2. **Visitor appearance mode** — selected by each visitor as Light or Dark. On the first visit, the internal default follows the device preference; an explicit Light/Dark choice is persisted and takes priority.

The visitor-facing control exposes only **Light** and **Dark**. The internal first-visit System behavior is not a third visitor-selectable mode.

The initial additive global preset registry contains:
- `tecno`: the established Dajjal Family purple, indigo, and cyan identity, preserving its existing Light/Dark semantic values.
- `dajjal-veylora`: blue/azure/white in Light Mode and crimson/red/black in Dark Mode, derived from the existing Couple page's source identity.

Governance and scope:
- The authorized administrator chooses a draft preset, previews both appearance modes locally, and explicitly confirms publication before the preset becomes visitor-facing.
- The active global preset is stored in the singleton `public.df_global_settings` setting and is read/written only through server-side code. The browser must never receive or use the Supabase service-role credential.
- Global preset identifiers are validated against the application registry. Adding a future preset is additive and requires both Light and Dark token maps.
- The Couple page retains its own page-scoped CSS identity; its source colors may be reused by a separate global preset map but its selectors must not become global.
- Wedding and immersive Games remain isolated experiences protected from global preset recoloring.
- Standard website pages consume shared semantic tokens. Legacy hardcoded styles must be migrated incrementally and scoped; a preset is not considered fully adopted until relevant standard pages use the semantic token contract.
- Admin preview is local and isolated until an explicit successful publish response is returned.
- Initial rendering must apply the server-resolved published preset and the visitor's saved/system-resolved appearance mode before normal page paint where technically practical.

This preset architecture extends the existing Dark/Light theme requirement; it does not replace it or authorize blanket redesign of legacy pages.

## 2.3 Design tokens

Gunakan sistem token terpusat untuk:
- Colors.
- Typography.
- Font weights and sizes.
- Spacing.
- Border radius.
- Shadows.
- Borders.
- Container widths.
- Breakpoints.
- Motion and transitions.
- Z-index layers.

Hindari nilai visual acak dan duplikasi aturan styling.

## 2.4 Responsive design

Dukungan wajib:
- Mobile.
- Tablet.
- Desktop.

Standar:
- Mobile-first.
- Tidak ada horizontal overflow yang tidak disengaja.
- Navigasi menyesuaikan perangkat.
- Konten mudah dibaca.
- Touch targets nyaman digunakan.
- Layout mobile dirancang secara khusus.

## 2.5 Shared components

Komponen dengan fungsi sama harus menggunakan standar visual dan perilaku yang konsisten.

Komponen utama:
- Buttons.
- Cards.
- Forms.
- Inputs.
- Dialogs and modals.
- Navigation.
- Dropdowns.
- Tables.
- Alerts.
- Loading states.
- Empty states.
- Error states.

Prioritaskan penggunaan shared components sebelum membuat komponen duplikat.

# 3. GLOBAL LANGUAGE AND URL ARCHITECTURE

## 3.1 Supported languages
- Bahasa Indonesia (`id`).
- English (`en`).

## 3.2 Official localized URL structure

Every user-facing website route must use a language prefix:

**Bahasa Indonesia**
- `/id`
- `/id/games`
- `/id/knowledge`
- `/id/blog`

**English**
- `/en`
- `/en/games`
- `/en/knowledge`
- `/en/blog`

Rules:
- The language prefix is part of the public URL contract and must be used consistently for homepage, feature pages, content pages, account pages, and other UI routes.
- Keep the existing Next.js App Router directory structure unless a separately reviewed architecture change requires moving it. Middleware may rewrite a localized URL internally to the existing route; URL localization does not require duplicating every route directory.
- API endpoints remain unprefixed under `/api/*`. OAuth/auth callback endpoints and static assets must be explicitly excluded from locale redirects/rewrites where their contracts require the original path.
- Legacy unprefixed UI URLs must temporarily redirect with HTTP 307 to the matching localized URL. Do not use permanent redirects until the migration and SEO behavior have been reviewed.
- Query parameters must be preserved through route redirects and language changes. Client-side language switching must also preserve the current page and URL hash when a matching translated route exists.

## 3.3 Default language and preference priority

The official product behavior is:
1. An explicit supported locale in the URL (`/id` or `/en`) is authoritative for that request.
2. When a visitor opens an unprefixed UI URL, use the latest valid explicit language choice stored in the `df-locale` preference cookie.
3. If no valid preference exists, default to Bahasa Indonesia (`id`).

Additional rules:
- Do not use browser language, device language, IP geolocation, or country as an automatic first-visit override. First-time visitors default to Indonesian.
- When a visitor explicitly opens a localized URL or changes language using the language control, persist that choice in the `df-locale` cookie for one year.
- An explicit `/id` or `/en` URL updates the saved preference so subsequent unprefixed entry points follow the latest explicit choice.
- Invalid or unsupported cookie values must safely fall back to `id`.
- The URL locale and server-provided locale context must agree. Do not let a stale client preference override an explicit URL prefix.

## 3.4 Language switching and incomplete translations

- Users may switch between Indonesian and English at any time.
- When the corresponding translated page exists, switching language must keep the user on the equivalent page, preserving query parameters and hash.
- If an equivalent page does not exist, navigate to the closest relevant page in the selected language; do not generate a broken URL.
- Every shared navigation component, route detector, account entry point, and immersive experience must work with both locale prefixes.
- Do not claim a page is translated merely because its URL has a locale prefix. Page content, labels, metadata, forms, validation, and error states must be translated or use a documented fallback.
- Until English copy is ready, use the documented Indonesian fallback or a clear availability message. Never show untranslated mixed-language UI without a deliberate reason.

## 3.5 Translation architecture

- Use translation dictionaries or a centralized content model with stable keys.
- Keep UI copy separate from business logic and page structure.
- Reuse consistent translation keys for shared components.
- Provide a predictable fallback for missing keys; Indonesian is the product's default fallback.
- Keep content translations paired by stable content/page identity rather than assuming every slug is identical across languages.
- Translation changes must be reviewed for meaning, clarity, and consistency, not only literal wording.

## 3.6 Multilingual SEO

- Each published language version must have its own localized canonical URL.
- Add `hreflang` only for language versions that genuinely exist and are accessible; do not advertise missing or untranslated pages as valid alternates.
- Include only valid, indexable, published localized URLs in the sitemap. Do not manufacture a second language URL for a page that does not exist in that language.
- Metadata, Open Graph URLs, structured data, internal links, and breadcrumbs must use the correct localized URL.
- Private, authenticated, admin, and sensitive pages must follow the appropriate noindex policy; robots directives are not access control.
- Keep API routes, callbacks, assets, and non-page resources out of the public page sitemap.
- Avoid duplicate content and redirect chains. Prefer direct locale-aware internal links as pages are migrated.
- Keep redirects temporary during migration and review permanent redirect policy separately.

## 3.7 Incremental migration and compatibility

- Apply localized routing incrementally on a dedicated branch and audit all existing routes before release.
- Preserve existing App Router page files and feature behavior wherever possible; use middleware rewrite rather than mass-moving route directories when that is the safer design.
- Audit homepage, games, mini-games, account/profile, admin, wedding experiences, OAuth callbacks, API routes, and static assets.
- Test first visit, saved ID preference, saved EN preference, explicit locale URLs, deep links, query/hash preservation, language switching, and legacy unprefixed URLs.
- Do not deploy or merge the migration to production until route, security, SEO, responsive, and regression checks pass and the release is explicitly authorized.


# 4. APPLICATION ARCHITECTURE

## 4.1 Architecture decision

Gunakan **Modular Monolith dengan Next.js** sebagai arsitektur utama.

Satu aplikasi utama menaungi seluruh modul, tetapi struktur internal harus dipisahkan secara jelas.

Jangan memecah aplikasi menjadi banyak proyek sebelum terdapat kebutuhan nyata.

## 4.2 Architecture layers

**Global Foundation**
- Root layout.
- Theme provider.
- Language provider.
- Navigation.
- Footer.
- Design system.
- Global styles.
- SEO configuration.
- Error handling.

**Shared Components**
- Reusable UI.
- Forms.
- Cards.
- Dialogs.
- Navigation elements.
- Shared utilities.

**Feature Modules**
- Gaming.
- Knowledge.
- Blog.
- Digital Products.
- Business.
- Community.

**Backend Services**
- Authentication.
- Database.
- API.
- Storage.
- Authorization.
- Logging.

## 4.3 Separation of concerns

- UI dan business logic dipisahkan.
- Data access dipisahkan dari presentasi.
- Shared components tidak bergantung pada halaman tertentu.
- Modul fitur tidak boleh mengubah global state secara sembarangan.
- Hindari circular dependencies.
- Hindari duplikasi kode.

## 4.4 CSS architecture

- globals.css menjadi entry point utama.
- CSS dipisahkan berdasarkan tanggung jawab.
- Design tokens menjadi sumber nilai visual.
- Styling komponen dikontrol secara modular.
- Styling halaman tidak boleh tanpa sengaja memengaruhi halaman lain.
- Hindari selector global terlalu luas.
- Hindari penggunaan !important berlebihan.
- Migrasi legacy CSS dilakukan bertahap dengan regression testing.

# 5. UNIFIED ACCOUNT SYSTEM

## 5.1 Identity architecture

Gunakan Supabase Auth sebagai fondasi identitas pengguna.

Keputusan resmi: **One User Identity Across the Ecosystem.**

Satu pengguna dapat menggunakan identitas yang sama pada berbagai produk Dajjal Family.

## 5.2 User authorization

Bedakan:
- Authentication: identitas pengguna.
- Authorization: hak akses pengguna.

Hak akses dapat berbeda berdasarkan:
- User role.
- Product access.
- Subscription or entitlement.
- Administrative permission.

Role dan permission harus divalidasi di sisi server.

## 5.3 Account security

- Profil utama dikelola secara terpusat.
- Data tambahan produk dipisahkan sesuai kebutuhan.
- Admin permissions dibatasi.
- Data antarproduk hanya dibagikan sesuai izin.
- Jangan mempercayai role dari browser.
- Implementasikan SSO secara bertahap tanpa merusak sistem akun yang sudah ada.

# 6. DATABASE AND DATA MANAGEMENT

Gunakan Supabase sebagai fondasi backend dan database.

Standar:
- Penamaan tabel dan kolom konsisten.
- Relasi dan foreign keys dirancang dengan benar.
- Constraints menjaga integritas data.
- Indexes mengikuti pola query.
- Migrations digunakan untuk perubahan schema.
- Backup and recovery diperhatikan.
- Data pribadi dibatasi sesuai kebutuhan.
- Data retention dan deletion policy dipertimbangkan.

## 6.1 Database security

- Row Level Security diterapkan sesuai kebutuhan.
- Policy diuji sebelum rilis.
- Service role key tidak boleh masuk frontend.
- Validasi data penting dilakukan di server.
- Operasi admin harus dibatasi.
- Menyembunyikan tombol bukan pengganti authorization.

## 6.2 Data integrity

Setiap operasi perubahan data mempertimbangkan:
- Validation.
- Authorization.
- Duplicate prevention.
- Error handling.
- Transaction safety.
- Audit trail untuk operasi penting.

# 7. API AND THIRD-PARTY INTEGRATION

Setiap API harus memiliki kontrak yang jelas.

Standar:
- Request validation.
- Authentication and authorization.
- Consistent response format.
- Informative error responses.
- Rate limiting sesuai risiko.
- Pagination untuk data besar.
- Caching jika sesuai.
- Secret management.
- Dokumentasi endpoint penting.

Integrasi pihak ketiga harus memiliki fallback dan penanganan kegagalan.

# 8. SEO FOUNDATION

SEO menjadi bagian dari fondasi setiap halaman publik.

## 8.1 Technical SEO

- Metadata title and description.
- Canonical URL.
- XML sitemap.
- Robots.txt.
- Open Graph.
- Social sharing metadata.
- Structured data.
- Clean URL and slug.
- Internal linking.
- Image alt text.
- Search Console.
- Analytics.

## 8.2 Content SEO

Setiap halaman publik harus mempertimbangkan:
- Search intent.
- Relevant target keywords.
- Descriptive title.
- Accurate meta description.
- Logical heading hierarchy.
- Original and useful content.
- Relevant internal links.
- Supporting media.

## 8.3 Indexing policy

- Halaman siap publikasi dapat diindeks.
- Placeholder dan halaman belum siap menggunakan noindex.
- Hindari duplicate content.
- Canonical harus benar.
- Hreflang harus sesuai dengan versi bahasa yang tersedia.
- Jangan membuat konten hanya untuk memanipulasi mesin pencari.

Tidak ada jaminan peringkat tertentu.

# 9. PERFORMANCE FOUNDATION

Website harus ringan, cepat, dan efisien.

Standar:
- Image and media optimization.
- Lazy loading sesuai kebutuhan.
- Font optimization.
- Minimalkan JavaScript yang tidak diperlukan.
- Hindari request berulang.
- Caching yang tepat.
- Hindari layout shift.
- Gunakan rendering strategy sesuai kebutuhan.
- Pantau performa perangkat mobile.

Target Core Web Vitals:
- LCP: ≤ 2.5 seconds.
- INP: ≤ 200 milliseconds.
- CLS: ≤ 0.1.

Target dievaluasi berdasarkan pengalaman pengguna nyata.

# 10. SECURITY FOUNDATION

Security by design wajib diterapkan.

Standar:
- HTTPS.
- Secrets hanya di environment variables.
- Tidak ada secret key di frontend.
- Server-side validation.
- Authentication and authorization.
- Row Level Security.
- Rate limiting.
- Endpoint protection.
- Upload validation.
- Secure session management.
- Safe error handling.
- Dependency updates.
- Audit logging untuk operasi penting.

Setiap fitur baru harus dinilai berdasarkan risiko keamanan sebelum dirilis.

# 11. ACCESSIBILITY AND USABILITY

Target: WCAG 2.2 Level AA.

Standar:
- Adequate color contrast.
- Keyboard navigation.
- Visible focus indicators.
- Semantic HTML.
- Accessible form labels.
- Accessible error messages.
- Appropriate alt text.
- Adequate touch targets.
- Reduced motion support.
- Do not rely on color alone.

Accessibility diperhatikan sejak desain komponen.

# 12. CONTENT MANAGEMENT

Konten harus mempunyai struktur dan tanggung jawab yang jelas.

Standar:
- Pisahkan konten dari UI.
- Gunakan format konten konsisten.
- Artikel memiliki metadata yang sesuai.
- Media memiliki alt text.
- Status draft, review, dan published jika diperlukan.
- Konten harus bermanfaat dan relevan.
- Placeholder tidak boleh dipublikasikan sebagai konten final.

Setiap kategori dapat memiliki aturan editorial tersendiri.

# 13. TESTING AND QUALITY ASSURANCE

Build berhasil bukan berarti website bebas masalah.

Testing layers:
1. Build and static checks.
2. Unit tests.
3. Integration tests.
4. Functional tests.
5. Responsive tests.
6. Theme tests.
7. Language tests.
8. Accessibility checks.
9. Security checks.
10. Regression tests.

Shared components harus diuji dengan mempertimbangkan seluruh halaman yang menggunakannya.

# 14. DEVELOPMENT WORKFLOW

Urutan pengembangan:
1. Pahami kebutuhan.
2. Periksa implementasi dan dependensi.
3. Rancang solusi.
4. Identifikasi dampak perubahan.
5. Implementasikan secara modular.
6. Jalankan pemeriksaan kode dan build.
7. Uji fungsi.
8. Uji tema dan bahasa.
9. Uji mobile dan desktop.
10. Periksa SEO dan keamanan.
11. Review preview deployment.
12. Dokumentasikan hasil.

Development rules:
- Jangan menghapus fitur yang masih digunakan tanpa persetujuan.
- Jangan mengubah route tanpa memeriksa dampaknya.
- Jangan membuat duplikasi komponen.
- Jangan mengganti teknologi inti tanpa alasan jelas.
- Gunakan Git untuk version control.
- Perubahan besar harus dapat di-review dan di-rollback.

# 15. DEPLOYMENT GOVERNANCE

Platform:
- GitHub — source control and documentation.
- Vercel — hosting and deployment.
- Supabase — backend and database.

Environments:
- Development.
- Preview.
- Production.

Rules:
- Pengembangan melalui branch yang sesuai.
- Preview digunakan untuk pengujian.
- Production hanya diperbarui setelah persetujuan eksplisit.
- Periksa build dan deployment.
- Periksa environment variables.
- Perhatikan database migrations.
- Siapkan rollback strategy.
- Jangan menganggap preview sama dengan production.

**Preview first. Production only with approval.**

# 16. DOCUMENTATION AND CHANGE MANAGEMENT

Dokumentasi merupakan bagian dari produk.

Dokumen utama:
- Master Foundation.
- Architecture documentation.
- Design System documentation.
- Database schema documentation.
- API documentation.
- Feature documentation.
- Deployment documentation.
- Changelog.

Setiap keputusan arsitektur penting harus dicatat.

Perubahan Master Foundation harus:
1. Memiliki alasan.
2. Menjelaskan dampak.
3. Memiliki versi.
4. Mendapat persetujuan pemilik proyek.
5. Diperbarui pada dokumentasi resmi.

Master Foundation tidak boleh berubah diam-diam.

# 17. SCALABILITY AND MAINTAINABILITY

Arsitektur harus mendukung:
- Penambahan kategori.
- Penambahan halaman.
- Penambahan produk.
- Pertumbuhan pengguna.
- Pertumbuhan data.
- Integrasi eksternal.
- Pengembangan tim.
- Perubahan teknologi di masa depan.

Prioritaskan solusi sederhana yang dapat berkembang.

Hindari overengineering.

# 18. DEFINITION OF DONE

Pekerjaan dinyatakan selesai apabila pemeriksaan yang relevan terpenuhi:

- Build berhasil.
- Tidak ada error kritis.
- Fungsi utama berjalan.
- Tidak merusak fitur terkait.
- Mobile dan desktop layak.
- Dark Mode dan Light Mode berfungsi.
- EN dan ID berfungsi.
- Accessibility diperhatikan.
- SEO sesuai jenis halaman.
- Security diperhatikan jika relevan.
- Preview telah diperiksa.
- Dokumentasi diperbarui jika diperlukan.
- Status deployment dijelaskan dengan jujur.

# 19. DECISION PRIORITY

Prioritas keputusan teknis:

1. Security.
2. Data integrity.
3. Stability.
4. User experience.
5. Maintainability.
6. Accessibility.
7. Performance.
8. Scalability.
9. Cost efficiency.

Popularitas teknologi bukan alasan utama untuk memilih solusi.

# 20. PROJECT GOVERNANCE

Master Foundation merupakan standar induk seluruh pengembangan Dajjal Family.

Aturan:
- Setiap modul wajib mengikuti standar global.
- Pengecualian harus memiliki alasan teknis atau produk.
- Perubahan arsitektur harus didokumentasikan.
- Production deployment memerlukan persetujuan eksplisit.
- Fitur lama harus dilindungi selama proses migrasi.
- Perubahan dilakukan secara bertahap dan dapat diuji.

Dokumen ini menjadi acuan utama ketika terjadi perbedaan interpretasi dalam pengembangan.

# MASTER PRINCIPLE

**BUILD A CONSISTENT ECOSYSTEM, NOT A COLLECTION OF DISCONNECTED PAGES.**

Dajjal Family harus berkembang sebagai satu ekosistem digital dengan identitas, standar, dan arsitektur yang konsisten.

Setiap keputusan desain, teknis, konten, dan operasional harus mendukung tujuan jangka panjang tersebut.

**One Family. Many Possibilities.**


# 21. ACCOUNT-BASED PLATFORM WITH PROGRESSIVE LOGIN

**Status: Officially approved — November 14, 2026**

Dajjal Family adopts an **Account-Based Platform with Progressive Login** as the official account and access model. A central account is the durable identity across the ecosystem, but authentication must be requested only when a feature genuinely needs an account.

## 21.1 Core principles
- Public discovery comes first: visitors can browse public pages, the game catalogue, public invitations, and other explicitly public content without signing in.
- Progressive authentication: request sign-in at the moment a visitor attempts an account-dependent action, and explain the concrete benefit.
- One central identity: Supabase Auth identifies the person across Dajjal Family products. Product permissions and entitlements remain separately scoped.
- Guest continuity: where anonymous/guest play is supported, preserve the same Auth identity and associated progress when the user explicitly links a provider. Never silently merge two identities.
- Data minimization: collect only information required for a feature, explain its purpose, and provide a practical account/data deletion path subject to legal and integrity requirements.
- Secure by default: server-side authorization and ownership checks are mandatory. Client-side UI hiding is never authorization.

## 21.2 Access levels

**Public — no login**
- Homepage, public category and product pages, public game catalogue, public articles/content, public wedding invitations, and public previews.
- Public/demo/mini games that do not persist personal progress, submit authenticated competition results, or modify an account wallet.
- Public information must not expose private account or operational data.

**Account — login required at the point of use**
- Persistent game progress and cross-device synchronization.
- Player profile, personal statistics, achievements, and account history.
- Leaderboards, ranked competition, and authenticated result submission.
- Wallets, coins, rewards, purchases, entitlements, and other account-bound benefits.
- Social features or saved content that require a stable owner identity.

**Administrative — explicit server-verified permission**
- User/account management, moderation, content/game management, analytics with restricted data, financial/reward operations, and audit records.
- Admin permission is independent of ordinary login and must be checked on every privileged server operation.

## 21.3 Identity and data boundaries
- Supabase Auth user ID is the canonical authentication identity.
- The central `players.id` is the universal Player ID for gaming features; resolve it from the verified Auth identity on the server.
- Product/game data remains scoped to its owner and product/game identifier.
- Authentication, authorization, subscription/entitlement, and product-specific roles are separate concepts.
- Never trust client-supplied user IDs, player IDs, roles, scores, wallet balances, or entitlements.
- Preserve existing accounts, Guest identities, Player IDs, game progress, invitation ownership, and wallet balances during migration.

## 21.4 Privacy and lifecycle
- Ask for only the data needed for the selected feature.
- State why required data is collected and how it is used.
- Do not expose email, Auth IDs, tokens, private profile fields, or cross-product data through public APIs.
- Provide account deletion and data export/retention handling appropriate to the product and applicable obligations.
- Keep security, abuse-prevention, and financial-integrity records only as justified and documented.

## 21.5 Rollout and release gates
Implement incrementally: (1) identity and account policy contract, (2) feature access classification and shared authorization, (3) game and product integration, (4) privacy, analytics and lifecycle controls, and (5) security, regression and usability QA.
- Do not impose a global login wall.
- Do not force Google as the only provider unless a specific feature has a documented, approved provider requirement.
- Do not introduce destructive schema changes or alter production data as part of policy adoption.
- Database migrations, production releases, and irreversible account merges require separate review and explicit approval.


## 2.2.2 Global shell and homepage preset adoption — implementation pass 2026-11-18

The first implementation pass applies the published global preset token contract to the public Home experience and shared site chrome:
- Homepage content surfaces, hero, category cards, actions, decorative identity accents, sidebars, and mobile drawer are scoped under `.df-home-app` and consume `--df-*` semantic tokens.
- Shared Header, Footer, mobile navigation pane/backdrop, and standard GlobalSidebar use the same root semantic tokens; visitor Light/Dark mode remains independent from the administrator-published identity preset.
- Legacy homepage Light Mode overrides that forced TECNO-specific values have been removed. The shared body background and theme control now consume active semantic tokens.
- Couple, Wedding, and immersive Games remain page-owned or isolated. Wedding-specific header overrides remain intentionally scoped to the wedding header.

This is a source implementation milestone, not a declaration of completed visual QA. Verify both presets in both modes, responsive breakpoints, keyboard focus, contrast, navigation states, and page isolation before marking the Design System fully adopted. Avoid adding page-local color declarations to these migrated areas; extend the registry token maps instead.


### Shared navigation, footer, and contextual settings rules — 2026-11-18
- All visitor-facing navigation labels and badges must be localized for Indonesian and English; do not add a one-language-only menu item.
- The Family Universe navigation may expose the public Anak Dajjal wedding invitation at `/df/wedding-anak-dajjal`, labeled “Pernikahan Anak Dajjal” (ID) and “Anak Dajjal's Wedding” (EN), with a localized “Acara” / “Event” badge.
- The event badge is a shared Global Theme Preset component and must consume semantic badge color tokens from every global preset; honor `prefers-reduced-motion`.
- Admin navigation exposes the existing Theme Preset Manager at `/admin/theme` using localized labels and existing server-verified admin access.
- There is no general-purpose visitor Settings page. Retired `/settings` requests redirect to Profile. Feature settings remain with their owning feature: global theme in Admin, account in Profile, global audio in its controller, gameplay in each game, and wedding-event configuration in Wedding Admin.
- Keep technical settings modules and identifiers that remain in use; retiring the general page is not permission to delete audio, theme, or event configuration logic.

### Game Library localization and display-name rules
The public Game Library must present all visitor-facing copy in the selected locale (`id` or `en`), including each game title, description, category/access label, action, loading state, and dialog. A localized display title does not require changing the stable game slug, route, saved progress identifiers, or database identity. The Indonesian display title for the former Run Jump / Dajjal Family Jump listing is **“Lari! Kebakaran Hutan!”**; its English display title is **“Run! Forest Fire!”**. Keep both names paired to the same existing game route and data identity.


# 12. CENTRAL FILE STORAGE — GOOGLE DRIVE

Google Drive is the approved central binary-file storage provider for Dajjal Family. Application modules must use the shared server-mediated storage integration rather than implementing independent browser-to-Drive credential flows.

## 12.1 Storage architecture
- Users choose files directly from their device/gallery through the relevant feature UI. They must not manually enter Google Drive File IDs.
- The Next.js server authenticates the user, validates the request, checks ownership/authorization for the target resource and upload slot, and performs the Drive upload.
- The connected owner's existing Drive root folder ID is the source of truth. Reuse that root; create/reuse feature-specific subfolders beneath it. Never create a duplicate root folder or silently reconnect/replace the owner's account.
- Keep file binaries in Google Drive. Store the returned Drive File ID and only necessary application metadata in Supabase so the application can resolve, display, replace, and manage the file.
- OAuth credentials and refresh tokens must remain server-side; refresh tokens are encrypted at rest. Never expose tokens, encryption keys, service-role credentials, or privileged storage operations to browser code or public API responses.
- Every upload endpoint must enforce authentication, resource ownership/authorization, allowed slot, file-size limits, allowed MIME types, server-side file-signature validation where applicable, and safe error handling.

## 12.2 Mandatory server-generated filename policy
The original filename supplied by a device is not the final stored filename. Every upload to Google Drive must receive a new, deterministic-format but collision-resistant filename generated by the server.

Canonical pattern:

`<slot>-<YYYYMMDDHHmmss>-<8-hex-random>.<ext>`

Examples:
- `cover-20261119102030-a81f3c92.jpg`
- `male-portrait-20261119102030-b72c4d10.png`
- `female-portrait-20261119102030-c91d5e23.jpg`
- `gallery-01-20261119102030-d42e7a61.webp`

Rules:
1. Use a stable, sanitized slot/purpose label such as `cover`, `male-portrait`, `female-portrait`, or `gallery-01` through `gallery-06`.
2. Generate the timestamp in UTC on the server in `YYYYMMDDHHmmss` format.
3. Generate at least 8 hexadecimal characters of cryptographically secure randomness on the server. Never use Math.random or client-generated identifiers for collision resistance.
4. Derive the extension from the server-verified MIME type/file signature, not from the original filename or an untrusted request field.
5. Never include the original filename, user-controlled path, or unsanitized input in the final Drive filename. The original filename may be kept only as optional metadata if a demonstrated product need exists.
6. Google Drive permits duplicate filenames; therefore, do not treat a filename as a unique identifier. The random suffix reduces accidental collisions, while the Drive File ID remains the canonical file reference.
7. Apply the same policy to every future Dajjal Family feature that uploads to Drive, not only Couple Profile.

## 12.3 Replacement, consistency, and retention
- The Drive File ID is an internal reference, not a value users need to know or enter.
- Persist the new Drive File ID in the correct Supabase resource/slot only after the server confirms upload success.
- A replacement must not delete the previous Drive file by default. Keep it until a reviewed retention/cleanup policy is implemented and authorized.
- If the database reference write fails after upload, attempt to remove the newly uploaded file as compensating cleanup; report any cleanup failure for operational follow-up.
- Do not claim a complete upload until both the Drive upload and Supabase reference persistence have succeeded.
- Avoid unnecessary personal metadata and do not expose private file references through public endpoints unless the feature's access model explicitly requires it.

## 12.4 Verification requirements
For every new or modified Drive upload flow, verify:
- Same original filename uploaded more than once results in distinct server-generated names.
- Names contain only the approved slot label, UTC timestamp, random suffix, and MIME-derived extension.
- Spoofed extensions, mismatched MIME/signatures, unsupported types, oversized files, unauthorized users, and invalid slots are rejected.
- Replacement updates the intended reference without deleting the previous file.
- Failed reference persistence does not leave an untracked new file when compensating deletion succeeds.
- Existing Drive root/account connection is reused and no duplicate root is created.

These rules are mandatory across all Dajjal Family modules and must remain aligned with `COMMAND_MASTER.md` and `docs/aturan-kerja.md`.


# 22. GLOBAL MOBILE PRESENTATION — MOBILE COMPACT UI

**Status: Owner-approved global responsive design standard — 2026-11-20.**

Dajjal Family adopts **Mobile Compact UI** as its default mobile layout-density direction. The owner-provided reference demonstrates a compact catalog surface with a search field, compact status/category chips, and secondary filters grouped to reduce unnecessary vertical scrolling while keeping the information hierarchy clear.

## 22.1 Position in the design architecture
- Master Foundation remains the governing product and architecture foundation.
- Global Theme Preset Engine remains the source of global visual identity, active preset, and semantic color tokens for pages within its scope.
- Design System remains the shared standard for typography, components, accessibility, and interactions.
- Mobile Compact UI is the responsive layout/density layer that determines how those existing foundations are presented on narrow screens.
- This standard does not authorize a new theme engine, local palette, hardcoded brand colors, or replacement of the active global preset.
- Couple, Wedding, and immersive Games retain their approved isolated/page-scoped visual identities. Apply compact principles only when compatible; do not force global theme inheritance onto them.

## 22.2 Mobile layout principles
1. Use screen space efficiently: reduce decorative whitespace, excessive vertical gaps, oversized card padding, and unnecessary repeated panels.
2. Preserve hierarchy: headings, content, metadata, labels, and actions remain distinguishable and readable.
3. Prefer compact controls: inputs, buttons, chips, badges, and list rows should use proportionate dimensions without sacrificing accessibility.
4. Use wrapping chips for short filter choices and progressive disclosure (collapsible groups, filter drawers, or compact expandable sections) for secondary controls.
5. Keep primary actions discoverable; group secondary actions contextually.
6. Prevent unintended horizontal page overflow and handle long text/IDs/tags with wrapping, accessible truncation, or deliberately bounded component scrolling.
7. Retain complete loading, empty, error, success, disabled, selected, and keyboard-focus states.
8. Compact does not mean cramped: do not make text illegible, remove necessary labels/status, or undersize touch targets.
9. Select a layout appropriate to each page's task; do not force a universal card/list template.

## 22.3 Reference application
For catalog-style interfaces, the reference direction includes search near the top, status chips, wrapping genre/category chips, and secondary filters grouped to avoid a long unstructured control stack. This is a layout reference only, not live data or a mandatory filter schema for every feature. Its dark appearance does not override the active Global Theme Preset or Light/Dark mode.

## 22.4 Responsive behavior
- Apply compact density primarily on mobile. Preserve the existing responsive desktop grid, multi-column layout, and navigation patterns where appropriate.
- Reuse established project breakpoints and responsive utilities; do not invent new breakpoint values without inspecting the current implementation and documenting the need.
- Account for safe areas, viewport sizing, on-screen keyboard behavior, and browser text scaling.
- Roll out incrementally as new pages are built or existing pages are meaningfully revised. This is not an instruction to redesign the entire site in one pass.

## 22.5 Validation requirements
Validate applicable global presets, Light/Dark, Indonesian/English (including long translations), small Android/mobile widths, larger phones, tablet, desktop, keyboard navigation, visible focus, contrast, reduced motion, screen-reader labels, WCAG 2.2 AA touch-target expectations, and loading/empty/error/large-data states.

Detailed implementation guidance is maintained in Akashic Record at `dajjal-family/core/mobile_compact_ui.md`. This decision establishes the standard; it does not claim that any page has already been changed, tested, or deployed.


# 23. GLOBAL TYPOGRAPHY SYSTEM

**Status: Owner-approved architecture and design standard — 2026-11-20.**

Dajjal Family establishes a centralized **Global Typography System** as a shared design-token layer, independent from the Global Theme Preset Engine's identity color maps.

## 23.1 Architecture position
- Master Foundation remains the governing foundation for the website.
- Global Theme Preset Engine owns global identity colors and semantic color values. The current TECNO and Dajjal × Veylora presets remain color-identity presets.
- Global Typography System owns shared font families, semantic type roles, font sizes, font weights, and line heights.
- Responsive presentation, including Mobile Compact UI, determines how shared typography tokens are applied at mobile, tablet, and desktop sizes/density.
- Shared components consume the typography contract rather than inventing independent type scales.

## 23.2 Preset independence
- Both global identity presets share the same typography contract by default.
- Switching TECNO and Dajjal × Veylora must not unexpectedly change font size, weight, or reading rhythm.
- Do not duplicate global typography scales or mobile density settings inside THEME_TOKEN_MAPS or per-preset color maps.
- Any future deliberate brand-specific typography variation requires a separate owner-approved product decision and architecture review.
- Existing isolated Couple, Wedding, and immersive Games scopes remain protected where their approved design boundaries require it.

## 23.3 Token contract
The existing typography primitives in app/styles/tokens.css are the starting point, including --df-font-sans, --df-font-mono, --df-text-*, and --df-leading-*. Extend and normalize them incrementally into semantic roles for body/reading text, page and section headings, navigation labels/submenus, form labels/controls, captions/metadata, and numeric/code content where appropriate.

Use centralized semantic tokens for font family, size, weight, and line height. Shared Global Navigation and other shared components must not hardcode independent font-size scales. Preserve existing token compatibility during migration; inspect consumers and CSS cascade before changing or renaming tokens.

## 23.4 Mobile Compact UI relationship
Mobile Compact UI is the responsive density/layout layer, not a second typography system. It applies shared typography tokens responsively to achieve compact but readable mobile presentation. It must preserve hierarchy, localization fit, browser zoom/text scaling, accessible touch targets, and desktop behavior.

## 23.5 Migration and validation
- Implement incrementally; do not initiate a blanket redesign or broad CSS override.
- Audit token consumers and shared shell styles before implementation.
- Migrate shared components first, then standard pages as they are next revised.
- Validate TECNO and Dajjal × Veylora, Light/Dark, Indonesian/English, mobile/tablet/desktop, long labels/translations, browser zoom/text scaling, keyboard/focus, contrast, and accessibility.
- Record source implementation, build, browser QA, and deployment separately. This standard establishes architecture and does not imply code has been changed or verified.

Canonical detailed specification: Akashic Record, dajjal-family/core/global_typography.md.


## 23.6 First implementation checkpoint — 2026-11-20
The first focused source migration is committed on application main at `603fa92e0b39c962283a65410a8fa9dcf23907ac`. It adds centralized semantic typography/weight roles, reusable semantic type utilities, and applies token roles to the Global Navigation Drawer and desktop workspace sidebar. Existing legacy/page-specific literal typography remains for incremental migration after audits. This checkpoint does not claim production release: Vercel deployment creation was blocked by HTTP 402 `api-deployments-free-per-day`; build and live visual QA remain unverified.

# 24. REUSABLE UI COMPONENT SYSTEM AND SEMANTIC DESIGN CONTRACT

## 24.1 Design System as the implementation reference

The Design System lab at `/id/design-system`, governed by `docs/foundation/DESIGN_SYSTEM.md`, is the canonical practical reference for reusable DAJJAL FAMILY UI components and semantic usage contracts. Its primary deliverable is a library of real reusable interface elements—not a color-palette gallery or abstract token showcase.

The lab inventory/documentation and the shared source implementation must remain aligned. A component is not complete merely because a visual example exists; the lab preview must exercise the same implementation/API that actual website pages consume.

## 24.2 Mandatory usage for all website work

- Every new or modified website UI element MUST use the applicable semantic design tokens and reusable component contracts defined by the Design System.
- Before implementing a page or feature, inspect the current component inventory and reuse an existing shared component/API whenever it satisfies the requirement.
- Do not duplicate an existing shared component through page-local markup/CSS or create an alternate naming/API for the same role.
- If a reusable component is missing, define and implement it in the Design System lab first, document its semantic name/API, usage, variants, sizes, interaction states, accessibility, and responsive behavior, then use it on the target page.
- Semantic names such as `df-search` are examples of the intended component contract. They are not considered available until actually implemented and documented in the lab.
- Every applicable visual role must consume the established semantic tokens: theme colors, surfaces, text, borders, focus, typography, spacing, sizing, radii, shadows, motion, and layering. Do not hardcode a visual value or create a local override when an approved semantic token or component role exists.
- Unique page composition and layout may remain page-specific where it is genuinely not reusable, but must still use the relevant semantic tokens for its visual properties. Technical values without a suitable design-token role may remain local only when justified and consistent with this foundation.
- The lab must not become a source of demo-only components; previews and production consumers must share the same component implementation/API.

## 24.3 Theme and scope compatibility

Every reusable component must be validated against all four supported Global Theme Preset combinations:
1. TECNO Light.
2. TECNO Dark.
3. Dajjal × Veylora Light.
4. Dajjal × Veylora Dark.

Also validate Indonesian/English content, Mobile Compact UI, responsive layouts, keyboard/focus, contrast, reduced motion, and relevant loading/empty/error/disabled states.

Approved isolated experiences—including Couple, Wedding, and immersive Games—must retain their approved theme boundaries. They must still follow the semantic component/token discipline using their approved scoped contracts; do not force global recoloring where isolation is required.

## 24.4 Migration and enforcement

- Apply this rule to all new website pages/features and whenever existing pages are modified.
- Existing legacy pages are migrated incrementally; this rule alone does not authorize a blanket redesign.
- Before marking work complete, identify which Design System components/tokens were reused or added and report any justified exception.
- If the live implementation and Design System documentation disagree, inspect and reconcile them before extending or consuming the disputed contract.
- Do not invent missing token/component names or claim four-theme support without validation.

**Canonical implementation reference:** `/id/design-system` and `docs/foundation/DESIGN_SYSTEM.md`.  
**Related operating rule:** `docs/aturan-kerja.md`.  
**Detailed project plan:** Akashic Record `dajjal-family/backlog/plan-reusable-ui-component-system.md`.
