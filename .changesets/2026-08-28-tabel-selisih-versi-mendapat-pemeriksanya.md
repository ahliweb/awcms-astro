---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Tabel selisih versi mendapat pemeriksanya, lima hari setelah ia berhenti benar

[`standar-teknis.md`](../docs/awcms-astro/standar-teknis.md) §Stack membawa tabel
versi yang dipin repo ini di sebelah yang dipin `awcms`, diperkenalkan sebuah
kalimat yang menyatakan seluruh maksudnya: selisihnya ditulis "supaya tidak
ditemukan ulang sebagai temuan". Pada 23 Agustus 2026 Dependabot
[#60](https://github.com/ahliweb/awcms-astro/pull/60) menaikkan `astro` ke
`^7.2.4` dan `@astrojs/node` ke `^11.1.4`. Pin-nya bergerak; tabelnya tidak.

Selama lima hari berikutnya tiga dokumen mengumumkan ketertinggalan satu minor
yang sudah tidak ada — dan kedua nilai itu kini justru **cocok persis** dengan
`awcms`. Sembilan gerbang hijau sepanjang waktu itu, karena tidak satu pun dari
mereka membaca tabelnya. Paragraf yang menjanjikan selisih ini tidak akan
ditemukan ulang sebagai temuan adalah temuannya sendiri.

Itu bentuk yang [ADR-0030](../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)
sebut namanya, jadi yang mendarat bukan angka yang dikoreksi — angkanya pernah
benar juga.

- **Kolom `repo ini` kini dibuktikan terhadap `package.json` setiap kali
  `bun test` berjalan**, di KEDUA mirror bahasa, lewat
  [`tests/versi-toolchain.test.mjs`](../tests/versi-toolchain.test.mjs).
  Parsernya berjangkar pada sel `` `awcms` `` — satu-satunya sel kepala yang
  dieja sama di kedua bahasa — sehingga satu pemeriksa melayani keduanya dan
  tidak ada mirror yang hanyut ke aturan yang tidak dibagi pasangannya.
- **Baris BARU yang tidak digerbangi ikut merah.** Asersinya kesamaan himpunan,
  bukan subset: menambahkan dependency ke tabel tanpa menambahkannya ke daftar
  yang diperiksa adalah cara berikutnya tabel ini menjadi salah tanpa ada yang
  gagal.
- **Kolom `awcms` sengaja TIDAK digerbangi**, dan dokumennya kini mengatakannya
  dengan kata-kata sebanyak itu. Ia menyebut repo lain, dan membacanya berarti
  menaruh jaringan di dalam gerbang yang wajib jalan luring dan sebelum
  `bun install`. Yang bisa dijaga di sini hanyalah bahwa kedua mirror
  menuliskannya sama.
- **ADR-0037 berhenti membawa salinan kedua angkanya.** Ia paragraf yang basi
  itu; sebuah ADR bertanggal, sebuah versi tidak, dan catatan keputusan adalah
  tempat terburuk untuk menyimpan nilai yang berubah. Pernyataan sejarahnya
  tetap — ketertinggalan itu ada pada hari ADR ditulis, dan ditutup 23 Agustus
  2026 — sementara angkanya kini tinggal di satu tabel yang dibaca pemeriksa.
