# Aturan Kerja

Dokumen ini menjadi acuan operasional untuk aturan kerja dan perubahan proses. Sebelum memulai pekerjaan yang berkaitan dengan proyek, periksa dokumen ini dan terapkan aturan terbaru yang tercatat di dalamnya.

## Standar utama pengembangan

1. Gunakan `/command-master` sebagai perintah kerja utama untuk membangun, melanjutkan, memperbaiki, dan meningkatkan Dajjal Family. Terapkan seluruh mandat, alur kerja, standar kualitas, dan pengamanan yang tercantum dalam `docs/foundation/COMMAND_MASTER.md`.
2. `docs/foundation/MASTER_FOUNDATION.md` adalah landasan utama produk dan arsitektur. Semua keputusan implementasi harus selaras dengannya; jangan mengabaikan atau diam-diam menimpa keputusan yang sudah ditetapkan di sana.
3. Ikuti **Global Theme Preset Engine** sebagai sistem identitas visual global Dajjal Family. Untuk halaman standar yang berada dalam cakupan engine, gunakan preset aktif dan semantic design tokens dari registry; jangan membuat palet preset lokal atau hardcode warna identitas sendiri.
4. Patuhi batas isolasi yang ditetapkan Master Foundation dan Design System. Pengalaman yang memang dikecualikan—seperti halaman Couple, Wedding, dan immersive Games—tetap mempertahankan identitas/tema khususnya dan tidak boleh dipaksa mengikuti preset global.
5. Sebelum pekerjaan proyek, baca dan terapkan `docs/aturan-kerja.md`, `docs/foundation/COMMAND_MASTER.md`, `docs/foundation/MASTER_FOUNDATION.md`, dan `docs/foundation/DESIGN_SYSTEM.md`. Periksa juga implementasi Global Theme Preset Engine yang relevan sebelum mengubah halaman, komponen, token, atau konfigurasi tema.
6. Aturan deployment, branch, persetujuan database, keamanan, dan pelaporan mengikuti keputusan pemilik serta ketentuan dalam Command Master. Tidak ada jeda Vercel khusus yang berlaku; build, QA, preview, dan deployment dapat dilakukan sesuai alur kerja yang diizinkan dan kondisi layanan aktual.

## Standar Reusable dan Semantic Design System — 2026-11-22

- Semua halaman web baru dalam cakupan Global Theme Preset Engine WAJIB menggunakan komponen reusable, layout primitives, typography roles, dan semantic design tokens yang tersedia di halaman Design System.
- Jangan membuat ulang komponen yang sudah tersedia, menyalin markup/styling komponen ke halaman, atau menggunakan warna/spacing/typography lokal untuk menggantikan semantik global.
- Jika pola UI belum tersedia, implementasikan sebagai komponen reusable di `app/components/ui/`, ekspor melalui `index.js`, dokumentasikan API/aksesibilitas/batasannya di Component Catalog, dan tampilkan implementasi yang sama di Design System Workbench sebelum dipakai pada halaman baru.
- Setiap komponen atau semantic role baru wajib diintegrasikan ke empat global foundation CSS: `tokens.css`, `typography.css`, `layout.css`, dan `components.css`. Warna mengikuti Global Theme Preset Engine; jangan membuat palet lokal.
- Semantic token yang sudah ada wajib dipertahankan. Tambahkan token secara aditif dan jangan menghapus atau mengganti nama token tanpa persetujuan pemilik.
- Komponen baru wajib mempertimbangkan empat kombinasi tema, ID/EN, keyboard/focus, reduced motion, responsive behavior, dan Mobile Compact UI.
- Komponen hanya menyediakan pola UI generik; validasi bisnis, data fetching, authorization, dan state halaman tetap tanggung jawab consumer.
- Halaman lama tidak wajib dimigrasikan dan tidak boleh disentuh dalam pekerjaan penambahan Reusable kecuali diminta eksplisit. Couple, Wedding, dan immersive Games tetap mengikuti batas isolasinya.
- Jangan menghapus komponen/token yang ada hanya untuk merapikan inventaris. Penghapusan komponen memerlukan bukti tidak digunakan dan tidak dibutuhkan; token yang sudah ada tetap dipertahankan.

## Penerapan

- Aturan ini berlaku untuk seluruh pekerjaan proyek sampai pengguna mengubah atau mencabutnya.
- Jika ada aturan kerja atau perubahan proses baru, perbarui dokumen ini dan periksa isinya sebelum menjalankan pekerjaan berikutnya.
- Pekerjaan non-deployment tetap dapat dilanjutkan selama tidak melanggar persetujuan, keamanan, atau batasan operasional lain yang berlaku.
- Jangan menyatakan build, preview, deployment, atau QA berhasil apabila langkah tersebut belum benar-benar dijalankan dan diverifikasi.


## Branch dan deployment aktif — keputusan pemilik 2026-11-15

- `main` adalah branch kerja utama. Pekerjaan kode aplikasi rutin dan pengujian langsung dilakukan di `main`; jangan membuat feature branch secara default.
- Perubahan kode aplikasi rutin boleh memicu deployment Production dari `main` untuk pengujian langsung di website, sesuai persetujuan pemilik pada 2026-11-15. Kebijakan ini berlaku sampai pemilik mengubahnya.
- Feature branch hanya digunakan jika diminta pemilik atau jika risiko perubahan secara material membutuhkan isolasi; setelah diverifikasi, gabungkan kembali ke `main`.
- Persetujuan ini tidak mencakup migrasi/perubahan database produksi, operasi data destruktif, rotasi secret, perubahan domain/DNS, billing/plan, atau konfigurasi keamanan produksi. Tindakan tersebut tetap membutuhkan persetujuan eksplisit tersendiri.
- Jika Vercel atau dependensi rilis memblokir deployment, jangan menyatakan website sudah diperbarui. Catat blocker secara tepat dan lanjutkan pekerjaan sumber yang aman di `main`.

## Couple Profile foundation — 2026-11-18

- Owner authorized implementation directly on `main` and CRUD/schema work in Supabase.
- Added `df_couple_profiles`, `df_couple_contents`, and `df_couple_media`. Each player may own one Couple Profile; profile slugs are globally unique; content is stored per locale (ID/EN).
- All Couple tables have RLS enabled, no browser-facing policies, and no privileges for `anon` or `authenticated`; trusted server routes use the service role after resolving the authenticated account to `players.id`.
- Couple media stores Google Drive File IDs for the cover and two portrait slots only. The new template deliberately excludes interactive gallery, photo lightbox/open-photo behavior, and Voice Note. Default Couple music player remains available.
- Added creation, owner lookup, public read, content/media update, and reset endpoints; added localized create/editor/public routes and a Profile entry point.
- Couple pages remain page-scoped and isolated from Global Theme Preset Engine presets. Editor routes are marked noindex; public slug routes generate localized metadata.
- Reset deletes the Couple Profile row and its dependent content/media references through database cascades. It does not delete the player account or original Google Drive files.
- Migration applied to Supabase as version `20261118112952` and mirrored in `supabase/migrations/20261118112952_create_df_couple_profiles.sql`.
- Source changes committed directly to `main`. Build/lint and interactive browser QA have not yet been run; do not mark the feature production-verified until those checks are completed.


## Couple Profile — pembaruan implementasi 2026-11-18

- Halaman referensi `/df/couple` mempertahankan CSS khusus dan identitas visualnya; tidak dipindahkan ke Global Theme Preset Engine.
- Halaman Create Couple Profile, Editor, dan publik Couple Profile menggunakan semantic tokens dari Global Theme Preset Engine.
- Editor menggunakan komponen tampilan yang sama dengan halaman publik, dengan inline edit per elemen.
- Elemen editable meliputi nama, foto cover, dua potret, role, deskripsi, subtitle, intro, Hari Jadi, cerita, dan signature.
- Hari Jadi memakai input tanggal kalender lalu input jam terpisah; keduanya disimpan sebagai satu timestamp UTC `relationship_start_at`. Stopwatch menghitung durasi berlalu sejak timestamp tersebut. Field lama hanya dibaca untuk kompatibilitas data, sedangkan penyimpanan baru memakai field Hari Jadi. Halaman referensi statis `/df/couple` tidak termasuk perubahan ini.
- Galeri mendukung maksimal enam foto Google Drive File ID dan Lightbox. Fitur Whisper/gambar ketujuh tidak digunakan.
- Media disimpan pada slot `gallery_1` sampai `gallery_6`; file Drive asli tidak dihapus saat referensi diganti atau profil di-reset.

## Couple Profile — penerjemahan otomatis bilingual — 2026-11-18

- Saat owner mengedit field konten dalam locale `id` atau `en`, server menerjemahkan nilai field yang dikirim ke locale pasangannya menggunakan Gemini Developer API model `gemini-3.1-flash-lite`.
- Model dipilih karena halaman harga resmi Gemini mencantumkannya sebagai model yang dioptimalkan untuk tugas termasuk translation dan menyediakan free tier untuk input/output teks; free tier memiliki batas penggunaan dan konten dapat digunakan Google untuk meningkatkan produk.
- Pemilik secara eksplisit menyetujui penggunaan Gemini API Free Tier untuk teks Couple Profile dan memahami ketentuan penggunaan datanya pada 2026-11-18.
- Simpan teks asli pada locale sumber dan hasil terjemahan pada locale target; field lain yang tidak dikirim tetap dipertahankan.
- Terjemahan dilakukan server-side. Secret wajib menggunakan Vercel Environment Variable `GEMINI_API_KEY`; jangan pernah menggunakan prefix `NEXT_PUBLIC_` atau memasukkan key ke source control.
- Jika layanan belum dikonfigurasi, respons model gagal, atau hasil tidak valid/tidak lengkap, request konten ditolak sebelum kedua locale ditulis. Pengguna menerima pesan gagal dan dapat mencoba kembali.
- Tidak ada perubahan schema Supabase. Dua row locale disimpan melalui satu upsert.
- Provider memakai Gemini Developer API `generateContent` dengan model `gemini-3.1-flash-lite`, JSON output, bahasa sumber/target eksplisit (`id` ↔ `en`), timeout 20 detik, dan tanpa grounding/tools.
- Free Tier tidak menjamin kapasitas atau ketersediaan tanpa batas. Penggunaan mengikuti rate limits, kuota, dan kebijakan data Google yang berlaku. Jangan menyatakan data Free Tier bersifat privat dari penggunaan peningkatan produk.


## Couple Profile — direct upload Google Drive — 2026-11-19

- Editor Couple Profile menggunakan pemilih foto perangkat; pengguna tidak memasukkan Google Drive File ID secara manual.
- Upload diproses melalui endpoint server khusus yang memverifikasi sesi Supabase dan kepemilikan slug Couple Profile sebelum menerima file.
- File gambar yang diizinkan: JPEG, PNG, WEBP, GIF; ukuran maksimal 12 MB; signature file diperiksa server-side.
- Server mengunggah ke folder Drive yang sudah terhubung, di bawah `Couple Profile/[profile-slug]`. Folder dibuat hanya jika belum ada; jangan membuat ulang folder root atau mengubah koneksi Drive yang sudah aktif.
- File ID tetap disimpan di `df_couple_media` sebagai referensi internal untuk slot cover, portrait, dan gallery. ID tidak ditampilkan atau dimasukkan oleh pengguna.
- Penggantian slot memperbarui referensi Supabase, tetapi tidak menghapus file lama di Drive. Jika penyimpanan referensi gagal setelah upload, server mencoba menghapus file baru agar tidak meninggalkan orphan.
- Tidak ada perubahan schema Supabase untuk alur ini.


## Kebijakan nama file Google Drive — 2026-11-19

- Semua upload ke Google Drive wajib memakai nama file yang dibuat server, bukan nama asli dari perangkat.
- Format wajib: `<slot>-<YYYYMMDDHHmmss>-<8-hex-random>.<ext>`; timestamp UTC dan suffix acak harus dibuat secara kriptografis di server.
- Slot memakai label stabil seperti `cover`, `male-portrait`, `female-portrait`, atau `gallery-01` sampai `gallery-06`. Ekstensi ditentukan dari MIME/signature file yang sudah diverifikasi server.
- Nama asli tidak boleh menjadi nama akhir file atau memengaruhi path/nama Drive. Google Drive mengizinkan nama duplikat; Drive File ID tetap menjadi referensi unik.
- Gunakan koneksi dan root folder Drive yang sudah aktif. Simpan File ID sebagai referensi internal di Supabase; pengguna tidak perlu memasukkan ID.
- Saat mengganti file, jangan hapus file lama secara otomatis. Jika penyimpanan referensi baru gagal setelah upload, upayakan penghapusan file baru sebagai compensating cleanup.
- Detail teknis dan checklist wajib mengikuti `docs/foundation/COMMAND_MASTER.md` dan `docs/foundation/MASTER_FOUNDATION.md`.


## Google Drive — penerapan nama file otomatis — 2026-11-19

- Implementasi penamaan server-side kini diterapkan secara terpusat di `lib/googleDriveStorage.js` melalui `createDriveStoredFileName()` dan `uploadDriveFile()`.
- Semua pemanggil `uploadDriveFile()` wajib memberikan label slot/purpose yang stabil; fungsi storage membuat nama akhir sendiri dan tidak menggunakan `file.name` dari perangkat.
- Couple Profile memetakan slot ke `cover`, `male-portrait`, `female-portrait`, dan `gallery-01` sampai `gallery-06`.
- Admin Central Storage memakai label `image` atau `audio`; endpoint memeriksa signature file untuk tipe yang didukung sebelum upload.
- Ekstensi ditentukan dari allowlist MIME di server. Timestamp UTC dan 4 byte random kriptografis (8 karakter hex) dibuat server-side.
- Perubahan ini hanya mengubah metadata nama file Drive; tidak mengubah root folder, OAuth connection, File ID, skema database, atau kebijakan retensi file lama.
- Deployment otomatis dari `main` harus mencapai READY dan build perlu diverifikasi sebelum pengujian upload langsung. Upload nyata tetap perlu diuji di Couple Profile dan halaman Admin Storage.


## Couple Profile — staged photo upload and editor guidance — 2026-11-19

- Image selection in the Couple Profile editor only stages a local file; it must not upload automatically.
- The owner explicitly presses Upload to start the request. Disable Upload, file selection, and editor dismissal while the request is in progress; guard the upload handler against repeated invocation. Re-enable controls after either success or failure. Keep the selected file available after failure so the owner can retry.
- Show a local preview and selected filename before upload. Revoke temporary object URLs when the selection changes or the editor unmounts.
- Show recommended source-image ratios: cover/hero 3:4, each gallery image 3:4, and the two character portraits below the music player 1:1. These are recommendations, not server-side crop enforcement.
- The editor's cover image uses `object-position: center top`, matching the public Dajjal × Veylora page.
- The editor guidance explains the explicit Upload step and displays the current public Couple URL while retaining Copy Link and Preview actions.


## Couple Profile — modal photo uploader and editor copy — 2026-11-19

- All Couple Profile image editing opens one shared responsive modal rendered at the document root, not an absolutely positioned panel inside the portrait/card layout.
- The modal provides a focused backdrop, accessible dialog semantics, keyboard focus containment, Escape handling, focus restoration, and body scroll locking. Closing is disabled during upload.
- Image selection remains staged locally with preview; upload starts only on explicit Upload action. Prevent repeated submissions. Keep the modal and selected file open on failure; close after success.
- Remove the introductory photo-upload instruction paragraph in both Indonesian and English from the editor. Retain the following paragraph with the dynamic public Couple URL, as well as Copy Link and Preview actions.


## Couple Profile — mobile modal alignment and editable gallery titles — 2026-11-19

- The shared image-upload modal is centered both vertically and horizontally on mobile and desktop. Mobile must not use bottom-sheet alignment. Keep the dialog within the viewport safe area; allow the dialog content itself to scroll when needed.
- Each of the six gallery slots has its own editable title stored in the bilingual Couple content JSON as `gallery_1_title` through `gallery_6_title`.
- Gallery titles use the existing `EditableText` interaction and existing server-side Gemini translation flow. Editing in Indonesian updates English; editing in English updates Indonesian. Do not create a separate table or migration for these fields.
- Public and editor gallery captions display the title matching the active locale. Empty/legacy values fall back to the localized “Kenangan N” / “Memory N” label.

## Couple Profile — gallery title pencil interaction fix — 2026-11-19

- Gallery caption overlay remains click-through so it does not block image interactions; the nested editable title explicitly restores pointer events so its pencil button and inline editor remain interactive.
- Gallery title pencil controls inherit the same shared `.df-couple-pencil` visual treatment as other edit pencils. Do not add a separate gallery-only color treatment.

## Couple Profile Editor — koreksi UX — 2026-11-19

Status: **diimplementasikan pada `main`; menunggu build, deployment, dan verifikasi live**.

1. Saat penyimpanan inline untuk field teks berlangsung, tombol **Simpan** dan **Batal** sama-sama nonaktif sampai request selesai. Input juga dikunci agar draft tidak berubah selama request berjalan. Setelah berhasil, editor menutup seperti perilaku sebelumnya; jika gagal, editor tetap terbuka, draft dipertahankan, pesan error tampil, dan kedua tombol aktif kembali untuk retry atau batal.
2. Saat pertama kali membuka halaman Edit Couple Profile, teks sederhana `Memuat...` / `Loading...` diganti dengan skeleton yang mengikuti struktur hero, identitas pasangan, dan galeri. Status loading tetap diumumkan melalui `role="status"`; animasi shimmer menghormati `prefers-reduced-motion`. Skeleton tidak ditampilkan saat pemuatan ulang data setelah penyimpanan berhasil.
3. Halaman pembuatan Couple Profile menampilkan skeleton selama pemeriksaan sesi akun dan kepemilikan Couple Profile sebelum form nickname ditampilkan. Status pemeriksaan tersedia dalam Bahasa Indonesia dan Inggris.
4. Menggunakan shared `Skeleton` dari `app/components/ui/Skeleton.js` dan semantic theme tokens. Identitas visual Couple tetap page-scoped; tidak ada perubahan pada Global Theme Preset Engine.
5. Tidak ada perubahan API, database, schema, atau alur penyimpanan data.

## Couple Profile — shared image optimization and CDN cache — 2026-11-19

- All persisted Couple images on the shared Edit Couple Profile, Public Couple Profile, and /df/couple experiences use the shared app/components/CoupleImage.js renderer.
- Initial Next.js Image Optimization via Vercel Image CDN caused Google Drive thumbnail images not to load on the Edit and Public Couple Profile routes. The immediate production recovery sets unoptimized on the shared Next Image component so it emits direct Google Drive image URLs again. This bypasses Next/Vercel image optimization and its image CDN cache.
- Keep images.remotePatterns restricted to HTTPS, host drive.google.com, and path /thumbnail in next.config.mjs while the shared component uses next/image. The approved source remains the public Google Drive thumbnail endpoint https://drive.google.com/thumbnail.
- The configured minimumCacheTTL (604800 seconds) and WebP format are currently inactive for Couple images while unoptimized is enabled. Do not claim that Couple images are served from Vercel Image CDN until a tested proxy/loader implementation is deployed.
- Couple image replacement uploads create a new Google Drive File ID. Keep the File ID in the image URL/cache key so a replacement naturally receives a new optimized-image cache entry. Do not overwrite the binary behind an existing File ID as the normal replacement workflow.
- Preserve lazy loading for below-the-fold images and eager/high-priority loading only for the primary hero. Keep explicit sizes, intrinsic dimensions, alt text, and existing CSS object-fit behavior.
- Local object-URL previews selected in the editor must remain direct local img previews and must never pass through the optimizer. Profile JSON/API responses remain no-store; do not cache private or mutable profile data as part of image optimization.
- Keep lightbox images optimized as well. Do not add an independent image proxy, Supabase binary storage, custom cache table, or second CDN layer without a separate architecture review.
- After implementation, verify direct image loading on the Edit and Public Couple Profile routes first, then /df/couple, upload-and-replace cache busting, and mobile/desktop layout. Any future CDN/proxy implementation must be tested against actual Google Drive redirects and image responses before enabling optimization again. A successful build alone is not proof that upstream image fetch works.



## Global responsive presentation — Mobile Compact UI (2026-11-20)

- Owner-approved direction: use **Mobile Compact UI** as the default mobile presentation/density standard for future Dajjal Family website work and incremental refinements of existing pages.
- Mobile Compact UI is a responsive layout layer, not a replacement for Master Foundation, Design System, or Global Theme Preset Engine. The active global preset and semantic design tokens remain the source of global visual identity.
- Do not introduce a parallel theme, page-local brand palette, or hardcoded identity colors. Preserve approved isolated scopes for Couple, Wedding, and immersive Games; apply compact principles only where compatible with their approved experience.
- On mobile, reduce unnecessary whitespace, oversized padding/cards, and excessive vertical stacking. Keep typography readable, controls clearly labeled, touch targets accessible, and all existing functionality available.
- Prefer compact wrapping chips for short filters and progressive disclosure (collapsible groups/filter surfaces) for secondary controls. Prevent unintended horizontal overflow.
- Preserve desktop layouts; use established responsive breakpoints and migrate incrementally. This rule does not authorize a whole-site redesign or automatic modification of every existing page.
- Validate applicable Global Theme Presets, Light/Dark, ID/EN, small Android/mobile widths, tablet/desktop, keyboard/focus, contrast, reduced motion, long translations, and loading/empty/error states.
- Detailed standard is maintained in Akashic Record at `dajjal-family/core/mobile_compact_ui.md`. Keep this rule synchronized with `docs/foundation/COMMAND_MASTER.md` and `docs/foundation/MASTER_FOUNDATION.md`.
- This is a design-system decision; it does not itself claim that any page has been implemented or visually QA-verified.


## Global Typography System — working rules (2026-11-20)

- Use the owner-approved Global Typography System as the shared source for font families, semantic type roles, font sizes, weights, and line heights.
- Keep typography independent from TECNO and Dajjal × Veylora Global Theme Preset color maps. Preset switching must not unexpectedly change typography.
- Shared Global Navigation and shared components must use central semantic typography tokens, not independent hardcoded font-size scales.
- Existing typography primitives in app/styles/tokens.css are the starting point. Audit consumers and CSS cascade before changes; preserve compatibility during incremental migration.
- Mobile Compact UI applies shared typography tokens responsively and is not a separate typography system. Preserve readability, localization, text scaling, accessible touch targets, and desktop behavior.
- Preserve approved isolated Couple, Wedding, and immersive Games scopes.
- Implement incrementally; no blanket redesign or broad CSS override. Validate both presets, Light/Dark, ID/EN, mobile/tablet/desktop, long labels, zoom, keyboard/focus, contrast, and accessibility.
- Canonical specification: Akashic Record dajjal-family/core/global_typography.md. Keep synchronized with docs/foundation/MASTER_FOUNDATION.md, docs/foundation/COMMAND_MASTER.md, and Akashic operating rules.


## Typography migration checkpoint — 2026-11-20
- First focused migration is committed to main at `603fa92e0b39c962283a65410a8fa9dcf23907ac`: semantic typography/weight tokens, reusable utilities, Global Navigation Drawer roles, and desktop workspace sidebar roles.
- Do not treat all legacy/page-specific font sizes as migrated; audit and convert incrementally.
- Vercel deployment for this commit was blocked by HTTP 402 `api-deployments-free-per-day`. Build, production release, and live visual QA are unverified until a matching deployment is READY and inspected.

## Reusable UI Component System and mandatory semantic design contract — 2026-11-21

- The Design System lab at `/id/design-system` is the canonical practical reference for reusable UI components and their semantic usage contracts. It is not merely a visual showcase.
- **Every new or modified website UI element must use the applicable semantic design tokens and reusable component contracts defined/documented by the Design System.** Do not recreate a component that already exists in the shared library.
- Before implementing a page or feature, inspect the Design System inventory and use the existing shared component/API (including its approved semantic class/name, such as a future `df-search`) rather than writing a parallel page-local version.
- If a required reusable component or semantic role is missing, define and implement it in the Design System lab first, document its usage contract, variants, sizes, states, accessibility and responsive behavior, then consume it on the target page. Do not invent component names or assume illustrative examples are already implemented.
- Component previews in the lab must use the same real implementation/API that website pages consume; demo-only markup is not sufficient for a completed reusable component.
- Use the centralized semantic tokens for every visual role they cover (theme colors/surfaces/text/borders/focus, typography, spacing, sizing, radii, shadows, motion, layers, etc.). Do not use hardcoded visual values or local CSS overrides when an approved semantic token/component role exists.
- Page-specific layout/composition may remain local where it is genuinely unique and not a reusable UI element, but its visual values must still consume the relevant semantic tokens. Technical values with no design-token role (for example a necessary media-query breakpoint or algorithmic measurement) may remain local only when justified and consistent with the foundation.
- Validate reusable components against all four supported global theme combinations: TECNO Light, TECNO Dark, Dajjal × Veylora Light, and Dajjal × Veylora Dark; also validate ID/EN, Mobile Compact UI, accessibility, and responsive behavior as applicable.
- Preserve approved isolated scopes (Couple, Wedding, immersive Games, and other explicitly scoped experiences). They must use their approved scoped semantic component/token contracts; do not force them into the global preset where prohibited, and do not use isolation as a reason to bypass semantic design-system discipline.
- The Design System inventory and actual source implementation are authoritative together. If documentation and code differ, inspect and reconcile before using or extending a component.
- This requirement applies to all future website work and to existing pages whenever they are next modified; it does not authorize a blanket redesign of legacy pages by itself.
- Governing architecture: `docs/foundation/MASTER_FOUNDATION.md` (current approved version) and `docs/foundation/DESIGN_SYSTEM.md`. Detailed component-system plan is maintained in Akashic Record: `dajjal-family/backlog/plan-reusable-ui-component-system.md`.


## Music Public — player, library, and navigation refinement — 2026-11-22

- Public Music page uses a compact five-bar waveform pill on the album cover; it must not obscure artwork and must respect `prefers-reduced-motion`.
- The public track list is paginated at 10 tracks per page. Search applies to the full published catalog; changing search/favorites resets pagination to the first page.
- Favorite IDs are persisted locally in the visitor's browser only. This does not create account synchronization or database state.
- The fixed Music bottom navigation is a consumer of the reusable `BottomNavigation` component, supports Indonesian and English labels, reserves page space, spans the viewport edge-to-edge, and accounts for device safe areas.
- `BottomNavigation` is part of the shared UI export and Design System Workbench. Its semantic tokens and styling live additively in all four global CSS foundation files.
- `/id/music` and `/en/music` have localized metadata, canonical/hreflang declarations, and sitemap entries. Public Music remains indexable; no API, database, authentication, or existing page migration is included in this scope.
\n\n## DF Music Karaoke — implementation contract — 2026-11-23\n\n- Lyrics belong to the existing `df_music_library` track and are stored as a JSONB array of ordered `{ order, text, start_ms }` line records. `start_ms` uses integer milliseconds and must be strictly increasing and within the audio duration.\n- `lyrics_status` is independent of track publication status. Draft lyrics are admin-only; public reads require both track `published` and lyrics `published`.\n- Admin routes use `verifyAdmin`; public reads use a server-side allowlist. No browser-side service-role access or public table policy is added.\n- Lyrics Studio records timestamps from the existing preview audio element's `currentTime`; admins can pause, select a missed line, re-record, and undo the latest timestamp.\n- Public Karaoke reuses the existing Music page audio element; it must not create a second audio stream. It supports line tracking, auto-scroll, font sizing, and close without resetting playback.\n- Cache policy: admin endpoints are private/no-store; public lyrics may be cached briefly with stale-while-revalidate.\n- Migration `20261123120000_add_df_music_lyrics.sql` is additive. Production application is separately gated by explicit database approval.\n- QA gate: test audio play/pause/seek/replay, missed-line correction, empty/draft/published lyrics, ID/EN, responsive portrait/landscape, reduced motion, and authorization.\n\n\n## Persetujuan eksplisit database produksi — pembaruan pemilik 2026-11-23\n\n- Pemilik memberikan persetujuan eksplisit dan berkelanjutan kepada pelaksana untuk menjalankan migrasi schema database Supabase Production yang diperlukan oleh fitur Dajjal Family yang sedang dikerjakan, tanpa meminta persetujuan ulang untuk setiap migrasi rutin yang non-destruktif dan sesuai Master Foundation.\n- Persetujuan ini mencakup pembuatan/perubahan kolom, constraint, index, tabel, view, fungsi, trigger, dan kebijakan RLS yang diperlukan, selama perubahan telah diperiksa terhadap schema/arsitektur aktif, least privilege, keamanan, dan kompatibilitas aplikasi.\n- Operasi destruktif atau berisiko kehilangan data, rotasi/revokasi secret, perubahan autentikasi/authorization produksi yang dapat mengunci akses, pengubahan billing/plan, dan perubahan domain/DNS tetap memerlukan persetujuan khusus sebelum dijalankan.\n- Sebelum migrasi produksi: periksa status proyek, schema dan migration history; review SQL; utamakan perubahan aditif/idempotent; catat file migrasi di repository; jalankan migration melalui mekanisme Supabase yang sesuai; verifikasi schema dan perilaku dengan query; jalankan Security dan Performance Advisors; dokumentasikan versi migrasi dan hasil.\n- Kode yang membutuhkan schema baru harus memiliki penanganan error yang aman dan tidak membuka akses database langsung dari browser. Service role hanya boleh digunakan server-side; endpoint admin tetap memverifikasi sesi dan otorisasi admin.\n- Persetujuan ini menggantikan ketentuan lama yang meminta persetujuan ulang untuk setiap migrasi produksi rutin. Persetujuan ini tidak membatalkan guardrail operasi destruktif di atas.\n

## Unified Admin Dashboard redesign — 2026-11-23

- Scope: `/admin` and every existing admin child route, including Music Library detail/Lyrics Studio, User Management, Contact Center, Manage Couple, Wedding Gallery, Wedding Event, Guestbook, Central Storage, Theme Manager, and Admin Login.
- The application-level `AdminShell` is composed in `app/admin/AdminShell.js` and routed through `RouteChrome`. Admin routes do not inherit the public site Header, GlobalSidebar, or Footer. Login keeps a focused standalone frame.
- Preserve every existing route and backend contract. The shell owns navigation, locale control, page context, and sign-out UX; page modules continue to own data operations and server authorization.
- Use shared `PageHeader`, `Button`, and `Badge` from `app/components/ui`. Keep the shared UI catalog and Design System as the source of reusable primitives; do not duplicate common controls in admin-only components.
- Admin typography roles are `--df-type-admin-body-size`, `--df-type-admin-small-size`, `--df-type-admin-meta-size`, and utilities `.admin-small` / `.admin-meta`. Preview these roles in `/design-system`.
- Admin styling consumes the active Global Theme Preset semantic tokens. Legacy status utility classes are normalized by `app/admin/admin.css`; new code must use semantic tokens directly.
- Mobile Compact UI: desktop grouped sidebar, compact horizontal mobile navigation, responsive page containers, touch-sized actions, reduced-motion support, and keyboard-visible focus states.
- Locale source is `app/components/LanguageProvider.js`. Use the shared provider for both `/id` and `/en`; do not create page-local language state or infer locale only from `document.documentElement.lang`.
- Admin metadata is route-aware and localized in `app/admin/layout.js`. All admin pages are `noindex`, use canonical localized URLs, and receive the Dajjal Family fallback Open Graph image `/dajjalfamily_icon_192.png`. Private pages remain excluded from the public sitemap.
- The admin layout is dynamic with `revalidate = 0`; admin data requests must use `cache: "no-store"` and private API responses must not be shared-cached. Static public assets retain their normal cache policy.
- Never weaken `verifyAdmin`, RLS, least privilege, or server-side validation to simplify the UI. No database schema, policy, or production data changes are included in this redesign.
- Verification gate: build must be READY; then test all routes in ID/EN, all four global theme combinations, mobile/tablet/desktop, navigation/active states, sign-out/session expiry, all CRUD confirmations, empty/loading/error/success states, and protected API responses. Do not mark the redesign complete until these checks pass.
- Current source implementation is committed to `main` at `35ea91164d1d9ec6201200fcbc5f45fe61884de4`. The production build (`npm run build`) passes in the Vercel sandbox when supplied non-production placeholder Supabase environment values; this verifies compilation, lint/type checks, and route generation, but does not verify production credentials or live data flows. Vercel deployment creation returned HTTP 402 `api-deployments-free-per-day` with a 24-hour retry window. No CLI fallback was available in the sandbox because no Vercel CLI or VERCEL_TOKEN was present. Production deployment and live visual/interactive QA remain pending; do not claim the site is updated.


## Blog Owner permanen — keputusan pemilik 2026-11-24

- Identitas Blog Owner tunggal dan permanen: **Tebayoll**, akun DAJJAL FAMILY `nurkholis.ixh@gmail.com`.
- Blog Owner memiliki hak editorial tertinggi: mengelola seluruh artikel (draft, edit, publish, unpublish, delete), kategori, dan pengelolaan kontributor melalui area administrasi Blog.
- Peran Blog Owner terpisah dari Blog Admin dan Kontributor biasa. Blog Owner juga berfungsi sebagai penulis utama dengan nama publikasi **Tebayoll**.
- Peran ini tidak dapat diberikan, dipindahkan, diturunkan, atau ditangguhkan melalui UI maupun endpoint pengelolaan kontributor. Tidak boleh ada mekanisme promosi Owner dari panel admin biasa.
- Otorisasi harus diverifikasi server-side menggunakan identitas Auth UUID tetap dan status keanggotaan admin yang tersimpan di database; jangan mengandalkan email dari browser, `user_metadata`, atau klaim yang dapat diedit pengguna.
- Blog Owner menggunakan akun admin yang sudah ada dan sesi admin yang terpisah. Jangan mengubah tabel akun/player atau membuat akun duplikat.


## Blog — penerjemahan otomatis saat publikasi — PR1, 2026-11-24

- Penulis hanya mengisi satu bahasa. Locale aktif dari LanguageProvider/header (`/id` atau `/en`) menjadi bahasa sumber ketika menyimpan atau menerbitkan; API memvalidasi `source_locale` terhadap allowlist `id`/`en`.
- Saat Publish, backend memakai Gemini Developer API model `gemini-3.1-flash-lite` dan `GEMINI_API_KEY` server-side untuk menerjemahkan judul, ringkasan, isi, alt text cover, dan metadata SEO. Kedua versi disimpan pada kolom bilingual yang sudah ada; tidak ada perubahan schema database.
- Draft hanya menyimpan teks sumber. Karena schema lama mewajibkan `title_id` dan `slug_id`, draft berbahasa Inggris memakai placeholder sumber pada kolom ID sampai dipublikasikan; artikel draft tidak tampil ke publik.
- Kegagalan Gemini atau hasil tidak lengkap membatalkan publikasi; penulis menerima pesan dan dapat mencoba kembali. Key tidak pernah dikirim ke browser.
- Ketika mengedit artikel, bahasa header menentukan versi yang diedit dan menjadi sumber pada publikasi ulang. Pengguna harus membuka editor melalui locale bahasa yang ingin dijadikan sumber.
- Timeout provider 45 detik, JSON output, validasi tipe/panjang, dan error publik generik diterapkan. Tidak ada migration atau operasi database produksi pada implementasi kode ini.


## Editorial Engine — 2026-11-24

- Blog authoring uses a shared versioned Editorial Block document for Rich Text and restricted Full HTML modes.
- New content is stored as versioned JSON in the existing `content_id` and `content_en` text columns; legacy plain text remains readable.
- Gemini receives only server-selected human-readable fields and text segments. Code block contents, programming-language identifiers, URLs, provider IDs, and structural block metadata are not sent for translation.
- Translation failure or validation failure blocks publication; both locale versions are written together by the article API.
- Full HTML is an authoring input format, not executable website source. Scripts, event handlers, arbitrary styles, arbitrary iframe markup, unsafe URL schemes, and unsupported HTML elements are rejected. The renderer uses validated React blocks and never renders author HTML through `dangerouslySetInnerHTML`.
- Shared `EditorialEditor` and `EditorialContentRenderer` are documented and previewed in Design System Workbench section 16. No production database migration is needed for the content format.

## Blog Author Directory & Contributor Workspace — 2026-11-25

- Public directory routes: localized `/id/blog/author` and `/en/blog/author`; show only approved contributors who have at least one published article.
- Public profile routes: localized `/id/blog/author/[slug]` and `/en/blog/author/[slug]`; the slug is derived from the contributor display name and articles are scoped to that contributor ID.
- Private workspace route: localized `/id/author/me` and `/en/author/me`; it reuses the existing verified contributor dashboard and resolves identity from the bearer session. Never accept a contributor ID or slug from the browser as proof of ownership.
- Contributor profile fields are `bio_id`, `bio_en`, and `avatar_url`, alongside the existing `display_name`. The profile update API must verify the session, approved status, and matching `account_user_id` before writing.
- Public profile data is limited to display name, public bio, avatar URL, and published article metadata. Email, Auth IDs, application notes, and private drafts must never be exposed publicly.
- Directory/profile queries are server-side and cached briefly with the existing Blog public cache tag. Private workspace/API responses remain `private, no-store`.
- New reusable `AuthorCard` is exported from the shared UI index, uses semantic author tokens in all four foundation CSS files, and is previewed in Design System Workbench section 17.
- Sitemap includes the directory and profiles with published content. Public metadata uses localized canonical/hreflang and contributor avatar when available, otherwise the DAJJAL FAMILY fallback image.
- Migration `20261125120000_add_df_blog_contributor_profiles.sql` adds nullable bilingual bio and HTTPS avatar fields with length/URL constraints. It is additive and preserves existing contributor records.
