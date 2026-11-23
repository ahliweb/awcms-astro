---
bump: patch
tipe: dependency
dampak: internal
---

# Dependensi dinaikkan: astro dan @astrojs/sitemap

`astro` ke ^7.4.12 dan `@astrojs/sitemap` ke ^3.7.5, bersama lockfile-nya. `@playwright/test` tetap di 1.65.0: ADR-0056 §8 hanya menerima rilis yang sudah berumur dua minggu, dan 1.65.1 baru memenuhinya pada 27 November. Tabel selisih versi di standar teknis ikut diperbarui; tanpa itu uji "kolom repo ini sama dengan package.json" merah, dan itulah satu-satunya yang membuat pembaruan otomatis sebelumnya gagal di Check.

- Semua kenaikan di dalam rentang yang sama, tanpa major; tidak ada perubahan kode.
