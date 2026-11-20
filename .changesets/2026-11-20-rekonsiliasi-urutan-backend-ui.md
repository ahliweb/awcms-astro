---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Urutan backend dan UI direkonsiliasi: tiga gerbang, mock tidak menggantikan rilis

"`awcms` first, always" (ADR-0034 §4) dan alur v2 (frontend, lalu backend, lalu
integrasi, per irisan) bisa dibaca saling berlawanan: yang pertama memblokir
frontend sampai handler ada, yang kedua merilis layar tanpa backend. Keduanya
kompatibel dalam kepemilikan dan hanya ambigu dalam urutan.

- ADR-0057 (Proposed, bukan Accepted): "first" mengurutkan kepemilikan dan
  kontrak, bukan kode. Tiga gerbang: A kesiapan desain, B build terhadap mock
  yang dihasilkan dari kontrak, C integrasi dan rilis terhadap backend nyata.
  Tidak ada norma ADR-0034 atau ADR-0038 yang diubah.
- `AGENTS.md` (dan cermin), `docs/awcms-astro/permukaan-admin-user.md` §7, dan
  `docs/awcms-astro/checklist-repo-baru.md` memuat tiga gerbang itu.
- `tests/tanpa-backend.test.mjs` mendapat pemeriksaan bahwa kontrak kerja tetap
  menyatakan mock tidak pernah menggantikan gerbang C.
- Tidak ada perubahan kode runtime, rute, dependency, atau basis data.
