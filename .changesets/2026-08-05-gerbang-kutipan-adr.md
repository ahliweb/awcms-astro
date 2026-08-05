---
tipe: struktur
dampak: internal
---

# Kutipan `ADR-NNNN` berhenti bisa menunjuk keputusan yang tidak ada

Aturan 2 `awcms` ADR-0062 — yang sejak ADR-0028 §E tercatat sebagai pekerjaan —
kini berjalan: `bun run audit:dokumen` memeriksa setiap kutipan `ADR-NNNN` di
seluruh markdown repo ini.

- Kutipan yang resolve ke `docs/adr/NNNN-*.md` lolos; kutipan milik repo lain
  lolos bila paragrafnya membawa penanda (`awcms`, "repo rujukan", atau tautan
  github); sisanya pelanggaran — rujukan ke keputusan yang tidak ada adalah
  tautan mati dalam bentuk yang tidak pernah menjadi tautan.
- Jalan pertamanya menemukan **sebelas kutipan** yang pembacanya tidak bisa
  tahu milik siapa — semuanya kutipan ADR `awcms` tanpa penanda, termasuk di
  empat ADR dan satu changeset. Bentuk penulisannya yang diperbaiki, bukan
  gerbangnya yang dilonggarkan.
- Dibuktikan dua arah di `tests/audit-dokumen.test.mjs` atas pohon fixture:
  MERAH saat kutipan tak ber-berkas dan tak bertanda, saat penandanya di
  paragraf lain, dan saat penandanya hanya `awcms-astro` (nama repo ini
  sendiri); HIJAU untuk ketiga bentuk penanda yang sah.
- Label tujuh komunitas graf yang tergeser rebuild inkremental ikut
  dikurasi ulang — termasuk komunitas baru generator SBOM dan ADR-0031.
