---
tipe: dokumentasi
dampak: internal
---

# Empat dokumen pintu depan menjadi Inggris, dan dua gerbang berhenti hijau karena kebetulan

Terjemahan pertama di bawah
[ADR-0039](../docs/adr/0039-english-is-the-source-language.md): `README.md`,
`AGENTS.md`, [`docs/adr/README.md`](../docs/adr/README.md), dan
[`docs/awcms-astro/README.md`](../docs/awcms-astro/README.md) kini berbahasa
Inggris di jalur telanjangnya, dengan cermin Indonesianya di `<nama>.id.md`.
Buku besar tunggu menyusut 52 → 48, dan ia hanya boleh bergerak ke arah itu.

- **Dua gerbang memeriksa AGENTS.md dan keduanya rusak oleh terjemahan** —
  satu dengan berbunyi, satu dengan diam. `tests/tanpa-backend.test.mjs`
  mencari frasa "kebutuhan backend … modul" dan langsung MERAH. Yang kedua
  lebih buruk: `tests/peran-situs.test.mjs` mencari `/publik/i` dan tetap
  hijau — bukan karena prosanya menyatakan bawaan publik, melainkan karena
  nama berkas `0034-publik-secara-bawaan-...md` muncul di sebuah tautan.
  Keduanya kini memeriksa KEDUA berkas, masing-masing dalam bahasanya sendiri,
  dan yang kedua membuang tautan lebih dulu supaya yang dinilai adalah
  kalimatnya. Ini kelas cacat yang akan berulang di tiap fase: gerbang
  terjemahan menjaga cermin tetap SEUSIA sumbernya, bukan tetap MEMUAT apa
  yang sumbernya muat.
- **Klaim "lima gerbang" diperbaiki di empat tempat** yang masih hidup
  (deskripsi skill gerbang, checklist go-live skill performa-keamanan, dan dua
  baris kepatuhan di
  [`standar-performa-dan-keamanan.md`](../docs/awcms-astro/standar-performa-dan-keamanan.md)).
  Gerbangnya enam sejak `audit:translation` mendarat. Sebutan "kelima gerbang"
  di ADR dan CHANGELOG sengaja DIBIARKAN: keduanya catatan bertanggal, dan
  benar saat ditulis.
- **Satu tautan ber-anchor diperbaiki di kedua README** — menerjemahkan sebuah
  heading memindahkan anchor-nya, dan `audit:dokumen` sengaja tidak memeriksa
  anchor.
