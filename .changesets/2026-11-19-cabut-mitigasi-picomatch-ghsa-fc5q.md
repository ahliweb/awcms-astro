---
bump: patch
tipe: dependency
dampak: internal
---

# Mencabut mitigasi picomatch GHSA-fc5q-39xc-vjpf

GitHub dan OSV menarik advisory GHSA-fc5q-39xc-vjpf pada 2026-11-18 (pengelola
`picomatch` menyatakan itu bukan kerentanan pustaka; PR perbaikan
micromatch/picomatch#235 ditutup tanpa merge, dan tidak ada rilis baru). Karena
`bun audit` kini bersih, mitigasinya menjadi beban mati dan dibuang atas
keputusan pemilik (2026-11-19).

- Tambalan lokal `picomatch@4.0.7` dan `picomatch@2.3.2`, entri
  `patchedDependencies`, serta tesnya dihapus;
  versi `picomatch` yang terpasang tidak berubah.
- Langkah audit dependensi CI tidak lagi memakai `--ignore`; tanpa pengecualian.
- Dokumen standar performa-keamanan diperbarui ke keadaan nyata. NVD masih
  mencatat CVE-2026-112366 "Awaiting Analysis"; keterpaparan rendah karena pola
  hanya berasal dari konfigurasi.
- Tidak mengubah keluaran situs.
