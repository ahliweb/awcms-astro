---
bump: patch
tipe: perbaikan
dampak: internal
---

# Stamp dan pemeriksa terjemahan menangani marker yang tidak valid

`docs:i18n:stamp` hanya membuang marker `sha256:<64 hex>`, sehingga baris tulisan
tangan seperti `<!-- i18n-source-hash: sha256:placeholder -->` bertahan dan
menjadi marker ganda, sementara `audit:translation` hanya melihat marker valid
pertama dan tidak melaporkannya.

- Stamp membuang SETIAP baris marker `i18n-source-hash`, apa pun nilainya, lalu
  menulis satu marker valid.
- `audit:translation` gagal bila cermin punya lebih dari satu marker atau satu
  marker yang bukan `sha256:<64 hex>`, menyebut berkasnya dan menunjuk
  `bun run docs:i18n:stamp`.
- Tes unit untuk marker placeholder, marker ganda, dan marker tidak valid.
- Hanya perkakas pengembangan; tidak ada perubahan keluaran situs.
