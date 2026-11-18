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
