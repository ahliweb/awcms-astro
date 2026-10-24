---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Inventaris dependensi frontend dicatat (issue #126)

Menambah bagian inventaris dependensi di [`docs/awcms-astro/standar-teknis.md`](../docs/awcms-astro/standar-teknis.md) (dengan cerminan Indonesia): paket, rentang yang dinyatakan, versi terkunci sebelum/sesudah, versi terbaru, tindakan, hasil `bun audit`, dan catatan rollback. **Tidak ada dependensi yang berubah** — `bun outdated` menunjukkan semua paket langsung sudah di versi terbaru dalam rentangnya, dan `bun audit --audit-level=low` bersih.

Alasannya: baseline di issue sudah basi (Bun 1.4.2), dan satu-satunya selisih dari "terbaru" — `typescript` 7.0.2 — memang ditahan: `@astrojs/check@0.9.12` belum menerima TypeScript 7, jadi menaikkannya mematikan gerbang `astro check` (ADR-0037). Mencatat alasannya mencegah selisih itu ditemukan ulang sebagai temuan.

- Pembaca situs tidak melihat perubahan apa pun.
- Pengembang mendapat satu tempat untuk melihat status dependensi dan alasan penahanan major.
