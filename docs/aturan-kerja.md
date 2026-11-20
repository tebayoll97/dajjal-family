# Aturan Kerja

Dokumen ini menjadi acuan operasional untuk aturan kerja dan perubahan proses. Sebelum memulai pekerjaan yang berkaitan dengan proyek, periksa dokumen ini dan terapkan aturan terbaru yang tercatat di dalamnya.

## Standar utama pengembangan

1. Gunakan `/command-master` sebagai perintah kerja utama untuk membangun, melanjutkan, memperbaiki, dan meningkatkan Dajjal Family. Terapkan seluruh mandat, alur kerja, standar kualitas, dan pengamanan yang tercantum dalam `docs/foundation/COMMAND_MASTER.md`.
2. `docs/foundation/MASTER_FOUNDATION.md` adalah landasan utama produk dan arsitektur. Semua keputusan implementasi harus selaras dengannya; jangan mengabaikan atau diam-diam menimpa keputusan yang sudah ditetapkan di sana.
3. Ikuti **Global Theme Preset Engine** sebagai sistem identitas visual global Dajjal Family. Untuk halaman standar yang berada dalam cakupan engine, gunakan preset aktif dan semantic design tokens dari registry; jangan membuat palet preset lokal atau hardcode warna identitas sendiri.
4. Patuhi batas isolasi yang ditetapkan Master Foundation dan Design System. Pengalaman yang memang dikecualikan—seperti halaman Couple, Wedding, dan immersive Games—tetap mempertahankan identitas/tema khususnya dan tidak boleh dipaksa mengikuti preset global.
5. Sebelum pekerjaan proyek, baca dan terapkan `docs/aturan-kerja.md`, `docs/foundation/COMMAND_MASTER.md`, `docs/foundation/MASTER_FOUNDATION.md`, dan `docs/foundation/DESIGN_SYSTEM.md`. Periksa juga implementasi Global Theme Preset Engine yang relevan sebelum mengubah halaman, komponen, token, atau konfigurasi tema.
6. Aturan deployment, branch, persetujuan database, keamanan, dan pelaporan mengikuti keputusan pemilik serta ketentuan dalam Command Master. Tidak ada jeda Vercel khusus yang berlaku; build, QA, preview, dan deployment dapat dilakukan sesuai alur kerja yang diizinkan dan kondisi layanan aktual.

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
