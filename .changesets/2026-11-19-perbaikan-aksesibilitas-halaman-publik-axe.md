---
bump: patch
tipe: perbaikan
dampak: publik
---

# Cacat aksesibilitas bawaan halaman publik ditemukan axe diperbaiki (#179)

Saat panel preferensi baca dibangun, axe menemukan lima cacat yang sudah ada
sebelum panel. Panel tetap pelengkap; markup halaman sendiri kini memenuhi WCAG
2.2 AA untuk kelimanya, dan standar minimum dokumen dinaikkan dari 2.1 AA ke 2.2 AA.

- Kontras: `.seksi-tautan` (3,91:1) dan `.prinsip-nomor` (3,56:1 terang, 4,41:1
  gelap) kini memakai `--accent-hover` (5,67:1, 5,17:1, dan di atas 4,5:1 di tema gelap).
- Nama tautan: `.cari-tautan` tidak punya nama di lebar sempit karena labelnya
  `display: none`; kini labelnya disembunyikan secara visual saja.
- Label dalam nama (2.5.3): `aria-label` pengalih bahasa kini memuat kode bahasa yang
  terlihat ("Pilih bahasa: ID").
- Urutan judul: judul kolom footer, termasuk judul formulir buletin, dari `<h4>` menjadi
  `<h2>`; tampilannya tidak berubah.
- Situs turunan: bila menimpa `LangSwitcher.astro`, `BaseLayout.astro`, atau
  `FormBuletin.astro`, terapkan perubahan yang sama.
