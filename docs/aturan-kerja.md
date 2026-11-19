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
- Elemen editable meliputi nama, foto cover, dua potret, role, deskripsi, subtitle, intro, anniversary, cerita, dan signature.
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
