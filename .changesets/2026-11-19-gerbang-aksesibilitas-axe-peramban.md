---
bump: patch
tipe: perbaikan
dampak: publik
---

# Aksesibilitas dijaga axe di peramban sungguhan pada setiap perubahan (ADR-0056)

Sebelumnya klaim WCAG 2.2 AA hanya dijaga secara statis, dan axe hanya pernah dijalankan
sekali secara manual. Kini `bun run test:a11y` menjalankan axe-core di Chromium atas build
produksi dan `awcms` tiruan, di CI di dalam `Check`; pelanggaran apa pun menggagalkan, tanpa
pengecualian. Run pertamanya menemukan cacat nyata, yang semuanya diperbaiki di sini.

- Warna tautan dasar kini `--accent-hover` (5,67:1), bukan `--accent-primary` (3,91:1), dan
  tautan di dalam isi artikel bergaris bawah. **Terlihat oleh pembaca di setiap halaman**;
  situs turunan dengan palet sendiri perlu memastikan aksennya masih 4,5:1 terhadap latarnya.
- Pil tab aktif, lencana "Sorotan", dan chip pencarian terpilih mencapai kontras 4,5:1.
- Blok buletin di footer terbaca (sebelumnya 1,87:1 dan 4,08:1); hanya situs yang menyalakan
  buletin yang melihatnya.
- Chip facet pencarian memakai `aria-current`, bukan `aria-pressed` yang tidak sah pada tautan.
- Tabel biaya yang bisa digulir kini bisa difokus papan ketik dan bernama.
- Mode "sorot tautan" tetap terbaca pada tautan yang labelnya ada di elemen anak.
- Untuk pengembang: `@playwright/test` 1.65.0 dan `@axe-core/playwright` 4.14.0 (devDependency,
  dipin), spesifikasi di `e2e/*.axe.mjs` di luar `bun test`; pasang Chromium sekali dengan
  `bunx --bun playwright install chromium`. Situs turunan yang menimpa `BiayaTable.astro`,
  `FormBuletin.astro`, atau `HalamanCari.astro` perlu menerapkan perubahan yang sama.
