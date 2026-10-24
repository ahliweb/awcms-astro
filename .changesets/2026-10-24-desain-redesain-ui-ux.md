---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Proposal desain halaman publik di `design/`

Menambahkan `design/redesain-ui-ux-2026-10/`: beranda berbasis tugas (kotak cari
di hero, topik populer, kanal, sorotan, prinsip) dan halaman layanan (ringkasan
sekilas, daftar isi, checklist syarat, langkah bernomor, tabel biaya dengan dasar
hukum, FAQ), beserta analisis keluarga AWCMS. Tujuannya agar arah tipografi dan
susunan halaman bisa dibahas sebelum komponen apa pun diubah.

- Halaman memakai `public/favicon.svg` repo ini dan salinan font Public Sans /
  JetBrains Mono di `design/redesain-ui-ux-2026-10/assets/fonts/` (OFL); build
  situs tidak membaca folder ini.
- `design/` masuk `.graphifyignore` dan `STALENESS_OUT_OF_SCOPE_PREFIXES` di
  `scripts/audit-graf.mjs`: proposal desain bukan pengetahuan tentang kode situs,
  dan tanpa itu lima berkas barunya mendorong `audit:graf` dari 38 ke 43 berkas
  yang berubah, melewati batas 40. Batasnya sendiri tidak diubah; graf tetap perlu
  dibangun ulang (`bun run knowledge:graph:update` lalu penamaan komunitas) sebelum
  PR berikutnya yang menambah tiga berkas terindeks.
