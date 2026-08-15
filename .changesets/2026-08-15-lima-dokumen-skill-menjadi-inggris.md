---
tipe: dokumentasi
dampak: internal
---

# Lima dokumen skill menjadi Inggris, dan sebuah tabel yang digerbangi ternyata hanya digerbangi separuh

Fase kedua [ADR-0039](../docs/adr/0039-english-is-the-source-language.md), dan ia
mengambil alasan yang paling kuat di ADR itu lebih dulu: `.claude/skills/**`
adalah instruksi operasional yang **DIIKUTI** agen, bukan sekadar dibaca. Kelima
dokumennya — [`README.md`](../.claude/skills/README.md) beserta keempat
`SKILL.md` — kini berbahasa Inggris di jalur telanjangnya, dengan cermin
Indonesianya di `<nama>.id.md`. Buku besar tunggu menyusut 48 → 43.

Blok frontmatter tetap byte pertama tiap `SKILL.md` dan bannernya duduk di
bawahnya, seperti yang sudah diantisipasi `docs-i18n-stamp.mjs`; `SKILL.id.md`
tidak dimuat sebagai skill kedua.

- **Tabel permukaan yang "tidak bisa salah" ternyata bisa salah di separuh
  pembacanya.** `tests/kontrak-awcms.test.mjs` menggerbangi tabel bertanda di
  skill integrasi dua arah terhadap `src/` — tetapi hanya di SATU berkas. Begitu
  cerminnya ada, sebuah baris yang hilang dari cermin lolos seluruh gerbang:
  `audit:translation` menjaga cermin tetap **SEUSIA** sumbernya, bukan tetap
  **MEMUAT** yang sumbernya muat, jadi hash yang cocok tidak membuktikan
  tabelnya utuh. Tesnya kini memeriksa kedua berkas, dan dibuktikan bukan hiasan
  dengan cara yang diminta skill gerbang sendiri: satu baris dihapus dari cermin
  → tepat satu tes merah, yang Inggrisnya tetap hijau. Ini kelanjutan langsung
  dari kelas cacat yang ditemukan fase sebelumnya, dan ia akan berulang di tiap
  fase berikutnya yang cerminnya dibaca sebuah gerbang.
- **Skill gerbang menyatakan LIMA gerbang di badannya** sementara deskripsinya
  sudah berbunyi enam sejak fase sebelumnya — `audit:translation` tidak ada di
  blok perintahnya maupun di tabel "yang ditangkap masing-masing". Keduanya kini
  lengkap, berikut satu butir baru di "yang TIDAK ditangkap": apa yang **dimuat**
  sebuah cermin, dan aturan bahwa gerbang yang membaca prosa wajib menyebut
  berkas yang mana, dalam bahasa berkas itu.
- **Dua angka yang menua diperbaiki di skill yang sama**: `bun test` disebut 20
  berkas padahal 21, dan sebuah tabel berjudul "empat aturan tanpa pemeriksa,
  ditemukan 4 Agustus" sudah punya baris kelima sejak ADR-0038 mendarat
  14 Agustus. Judulnya kini menyebut lima beserta kedua tanggalnya.
- **Perilis TIDAK menjalankan `audit:translation`, dan itu kini tertulis.** CI
  menjalankannya pada tiap push; `scripts/rilis.mjs` tidak. Skill
  performa-keamanan karena itu berbunyi "enam dari ketujuhnya", bukan
  "keenamnya", dan menyebut di mana yang ketujuh berjalan — cermin basi
  tertangkap sebelum merge, bukan saat rilis. Selisihnya dinyatakan alih-alih
  ditutup diam-diam: menambahkannya ke perilis adalah perubahan perilaku, dan
  tempatnya bukan sebuah commit terjemahan.
