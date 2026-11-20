---
bump: patch
tipe: perbaikan
dampak: publik
---

# Judul SEO dari editor kini menjadi `<title>` artikel

`awcms` sudah lama menawarkan `seoTitle`, tetapi build tidak pernah
membacanya: `<title>` artikel selalu judul, sebuah tanda pipa, dan nama seksi,
sehingga judul SEO yang diisi editor tidak berpengaruh. Pemilik memutuskan
(20 November 2026) bahwa field itu dikonsumsi.

- `seoTitle` yang tidak kosong dari API menjadi `<title>` artikel. Kosong,
  hanya spasi, `null`, atau tidak ada kembali ke judul + seksi seperti
  sebelumnya, jadi `awcms` yang tidak mengirimnya tetap membangun situs yang sama.
- Dibaca dari baris terjemahan, seperti `title`; terjemahan tidak meminjam
  judul SEO bahasa sumber.
- Aturan nama situs tetap berlaku: `BaseLayout` menambahkan ` — Nama Situs`
  kecuali judulnya sudah memuatnya, dan nilai yang sama ikut ke `og:title` dan
  `twitter:title`. JSON-LD `headline` tetap memakai judul artikel.
- Karakter khusus di-escape oleh templat; tidak ada `set:html`.
- Tidak ada perubahan rute, dependency, CSP, atau basis data.
