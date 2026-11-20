---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Inventaris UI, data, dan kontrak konsumen situs SSG

Laporan riset isu #187: setiap layar yang dirender situs, operasi `awcms` yang
menyuplainya, izin, dan tes yang menjaganya, diklasifikasi VERIFIED, ASSUMED,
PLANNED, atau DEFERRED dengan bukti pada SHA tertentu.

- Dokumen baru `docs/ui-contract-inventory.md` dan cermin Indonesia, dengan
  baris indeks di `docs/awcms-astro/README.md`.
- Temuan utama: tiga belas operasi dipanggil dan semuanya ada di OpenAPI publik
  `awcms`; tes kontrak tidak membaca spesifikasi itu; admin USER dan BFF
  belum ada kodenya; tiga pernyataan dokumentasi "tepat tiga permukaan" sudah
  basi.
- Tidak ada perubahan kode runtime, rute, dependency, atau basis data, dan tidak
  ada isu implementasi yang dibuka.
