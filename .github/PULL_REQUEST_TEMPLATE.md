## Ringkasan

<!-- Apa yang berubah dan KENAPA. Bagian "kenapa" yang paling bernilai; "apa" bisa dibaca dari diff. -->

Closes #

## Jenis perubahan

- [ ] Fitur atau perbaikan kode
- [ ] Terjemahan katalog antarmuka
- [ ] Deployment, runtime, atau penyajian
- [ ] Dokumentasi / ADR / skill
- [ ] Dependency atau perkakas

## Yang tidak gagal sendiri

<!-- Isi yang relevan. Daftar ini memuat kelas cacat yang lolos dari build hijau
     dan ikut ke setiap situs yang lahir dari template ini. -->

- [ ] Tidak ada identitas satu situs (nama, lambang, wilayah, daftar tab) yang masuk kode
- [ ] String antarmuka baru ada di SELURUH katalog locale; key dinamis dipanggil dengan fallback yang layak dibaca
- [ ] Locale default dan locale berprefiks menghasilkan jumlah halaman yang sama
- [ ] Tidak ada tag gambar/`ImageObject` yang menunjuk aset yang tidak diterbitkan build ini
- [ ] Variabel env baru ada di `.env.example` beserta konsekuensi salah isi
- [ ] Perubahan pada penyajian (header, `Cache-Control`, kompresi, port) dibuktikan `tests/penyaji.test.mjs`

## Definition of Done

- [ ] `bun run build` sukses tanpa error `astro check`
- [ ] `bun test` hijau
- [ ] `bun run audit:konten` hijau — **setelah** build, agar enam gerbang keluarannya benar-benar berjalan
- [ ] `bun run audit:dokumen` hijau — tautan mati, indeks ADR dua arah, jalur berkas yang disebut dokumen (termasuk di `.claude/skills/`)
- [ ] `bun run audit:graf` hijau — artefak `graphify-out/` yang terlacak, dan nama komunitas yang benar-benar dipilih (bukan nama berkas warisan penamaan otomatis)
- [ ] `bun audit` melaporkan 0 kerentanan
- [ ] Halaman baru bekerja dengan JavaScript dimatikan
- [ ] Tampilan layak pakai dari 360px sampai desktop, di kedua tema
- [ ] Dokumentasi yang menjelaskan perilaku yang berubah ikut diperbarui
- [ ] Changeset ditulis di `.changesets/`
- [ ] ADR ditulis bila menyentuh standar dasar

## Catatan untuk reviewer

<!-- Bagian yang perlu perhatian khusus, atau keputusan yang masih terbuka. -->
