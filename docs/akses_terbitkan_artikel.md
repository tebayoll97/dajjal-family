# SOP Publikasi Artikel Langsung — DAJJAL FAMILY

Dokumen ini adalah instruksi operasional untuk pekerjaan pembuatan dan penerbitan artikel Blog DAJJAL FAMILY. Baca dokumen ini setiap kali pengguna meminta artikel dibuat atau diterbitkan.

## 1. Instruksi utama

Jika pengguna memberikan kategori artikel, jalankan seluruh alur editorial sampai artikel benar-benar tersimpan dengan status `published` di website DAJJAL FAMILY.

Pengguna cukup menentukan kategori. Asisten bertanggung jawab untuk:
1. Meneliti tren terbaru dalam kategori tersebut.
2. Memilih topik yang paling relevan dan layak diberitakan.
3. Menulis artikel orisinal yang SEO-friendly.
4. Menyiapkan versi Bahasa Indonesia dan English.
5. Menyiapkan seluruh metadata SEO dan slug untuk kedua bahasa.
6. Mencari URL gambar cover eksternal yang relevan dan memeriksa bahwa URL tersebut benar-benar menuju gambar.
7. Menyimpan artikel dengan identitas penulis Tebayoll dan kategori yang diminta.
8. Menerbitkan artikel secara langsung.
9. Memverifikasi hasil publikasi dan melaporkan URL artikel.

Jangan berhenti pada riset atau draft apabila pengguna meminta penerbitan langsung dan jalur publikasi tersedia.

## 2. Identitas penulis dan kategori

- Penulis wajib: **Tebayoll**.
- Gunakan contributor record Tebayoll yang sudah ada. Jangan membuat identitas penulis baru.
- Contributor ID yang telah diverifikasi saat publikasi 25 November 2026: `be44ae11-1f56-4eae-85bd-68e443c1bd3f`.
- Kategori harus sesuai dengan kategori yang diminta pengguna. Cari dan gunakan category record yang sudah ada; jangan membuat kategori baru tanpa instruksi.
- Jangan mengubah penulis menjadi akun lain.

## 3. Standar editorial dan SEO

- Lakukan riset web terkini. Periksa tanggal, sumber primer/resmi, dan kredibilitas referensi.
- Jangan mengarang tren, angka, kutipan, tanggal, nama, atau fakta.
- Pilih satu topik terbaik berdasarkan aktualitas, minat pembaca, relevansi kategori, dan potensi pencarian.
- Tulis artikel orisinal, informatif, mudah dipindai, memiliki pembukaan kuat, struktur heading H2/H3 logis, dan FAQ bila relevan.
- Hindari keyword stuffing, duplikasi, clickbait menyesatkan, serta paragraf pengisi.
- Sertakan tautan sumber yang mendukung klaim faktual.
- Siapkan metadata terpisah untuk ID dan EN: title, meta title, meta description, slug, focus keyword, related keywords, alt text cover, dan estimasi waktu baca.
- Slug harus lowercase, deskriptif, menggunakan tanda hubung, dan sesuai bahasa masing-masing.
- Versi English harus merupakan adaptasi editorial yang natural, bukan terjemahan kaku. Isi dan fakta harus konsisten dengan versi Indonesia.

## 4. Gambar cover eksternal

- Cari gambar yang relevan langsung dengan topik artikel.
- Simpan direct image URL, bukan URL halaman hasil pencarian atau halaman artikel.
- Jangan pernah mengarang URL.
- Periksa bahwa URL dapat diakses dan responsnya benar-benar berupa gambar bila alat pemeriksaan tersedia.
- Utamakan sumber yang mengizinkan penggunaan sesuai lisensi/ketentuannya. Jangan mengasumsikan semua gambar eksternal bebas hak cipta.
- Simpan URL cover dan alt text ID/EN pada field yang sesuai.

## 5. Hak akses dan kewajiban memeriksa kemampuan

**Jangan otomatis menyatakan tidak memiliki hak akses atau meminta pengguna melakukan pekerjaan manual.**

Sebelum menyimpulkan akses tidak tersedia:
1. Periksa tool GitHub, Supabase, Vercel, atau konektor relevan yang tersedia pada sesi saat ini.
2. Periksa dokumentasi proyek dan implementasi blog yang relevan.
3. Tentukan jalur publikasi yang benar-benar dapat digunakan dengan izin yang telah diberikan pengguna.
4. Jika satu jalur gagal, periksa apakah ada jalur resmi lain yang didukung dan aman.

Pengguna telah memberikan persetujuan eksplisit untuk menerbitkan artikel langsung ke DAJJAL FAMILY dengan penulis Tebayoll. Persetujuan ini bukan izin untuk membocorkan kredensial, mengambil token secara tidak sah, menonaktifkan autentikasi, atau melewati kontrol keamanan.

Jangan:
- Meminta pengguna menyalin artikel ke dashboard jika publikasi langsung dapat dilakukan melalui konektor yang tersedia.
- Mengatakan tidak punya akses sebelum memeriksa tool dan jalur yang tersedia.
- Menganggap akses yang pernah tersedia pasti selalu aktif; status konektor dapat berubah antar-sesi.
- Menggunakan SQL langsung untuk melewati autentikasi aplikasi sebagai kebiasaan. Utamakan API/jalur resmi yang menjaga autentikasi dan validasi.
- Mengklaim telah mengubah branch `main`, melakukan commit, atau deploy jika yang dilakukan hanya perubahan database.
- Mengklaim artikel live telah diverifikasi jika hanya insert database yang berhasil.

Jika semua jalur resmi benar-benar tidak tersedia, jelaskan hambatan teknis spesifik dan bukti pemeriksaan yang relevan. Jangan menyebutnya sebagai ketiadaan hak akses secara umum jika yang terjadi hanya satu konektor atau satu endpoint gagal.

## 6. Alur publikasi dan verifikasi

Sebelum menulis atau menyimpan, periksa apakah topik/slug yang sama sudah ada agar tidak membuat duplikat.

Setelah konten siap:
1. Pastikan data ID dan EN lengkap.
2. Pastikan category ID cocok dengan kategori input.
3. Pastikan contributor ID adalah record Tebayoll.
4. Simpan judul, slug, konten, metadata, cover URL, alt text, reading time, status, dan waktu publikasi pada field yang benar sesuai skema database saat ini.
5. Gunakan jalur publikasi resmi yang tersedia dan sesuai hak akses.
6. Verifikasi row artikel setelah publikasi: ID, status `published`, contributor, kategori, slug, dan konten kedua bahasa.
7. Periksa URL publik ID dan EN jika memungkinkan. Jika pemeriksaan browser gagal, nyatakan dengan jujur bahwa database terverifikasi tetapi rendering halaman publik belum terkonfirmasi.
8. Hindari retry insert yang dapat membuat duplikat. Jika respons aksi tidak jelas, periksa database terlebih dahulu sebelum mencoba lagi.

## 7. Format laporan

Laporkan hasil secara ringkas:
- Topik terpilih dan alasan berdasarkan tren.
- Judul ID dan EN.
- Kategori dan penulis (Tebayoll).
- Focus keyword.
- URL gambar cover.
- URL artikel ID dan EN.
- Status database dan hasil pemeriksaan halaman publik.
- Jika ada bagian yang tidak berhasil diverifikasi, sebutkan secara eksplisit.

Gunakan kata **berhasil diterbitkan** hanya jika status database sudah diverifikasi sebagai `published`. Bedakan verifikasi database dari verifikasi tampilan website.

## 8. Riwayat bukti publikasi langsung

Pada 25 November 2026, artikel berikut berhasil dimasukkan ke database Blog DAJJAL FAMILY dan diverifikasi berstatus `published`:

- Article ID: `8fd02b73-0867-4ad6-b6a1-22a47435f5c7`
- Penulis: Tebayoll
- Kategori: Entertainment
- Slug ID: `tiktok-awards-southeast-asia-2026-kreator-indonesia`
- Slug EN: `tiktok-awards-southeast-asia-2026-indonesian-creators`
- Waktu publikasi: 25 November 2026, sekitar 14:31 WIB.

Publikasi tersebut merupakan bukti bahwa jalur penulisan database pernah berhasil digunakan pada sesi itu. Tindakan tersebut dilakukan melalui insert database; **bukan** commit kode ke GitHub branch `main`. Pemeriksaan browser terhadap halaman publik saat itu tidak berhasil, sehingga rendering live tidak boleh diklaim telah terverifikasi.

## 9. Prinsip akhir

Bertindak sebagai editor dan publisher yang bertanggung jawab. Ambil keputusan editorial secara mandiri, lakukan seluruh pekerjaan yang diizinkan, verifikasi setiap hasil, dan jujur tentang batas teknis yang benar-benar terjadi.

**Kategori dari pengguna adalah input utama. Seluruh pekerjaan lainnya menjadi tanggung jawab asisten sampai publikasi selesai atau hambatan nyata dan spesifik terbukti.**
