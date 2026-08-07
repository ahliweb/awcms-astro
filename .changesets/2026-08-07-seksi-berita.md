---
tipe: struktur
dampak: publik
---

# Sebuah tab boleh menyatakan dirinya seksi berita

Template ini bisa dipakai untuk situs berita, dan sampai sekarang tidak bisa —
bukan karena prefiksnya (`/news/` lahir sendiri dari rute `[tab]` yang sudah
generik) melainkan karena apa yang terjadi sesudahnya. Seksi berita akan
terurut menurut ABJAD, karena urutan dibaca dari `urutan` yang bawaannya 99 dan
pemecah serinya judul. Dan tidak ada satu halaman pun yang bisa melaporkan
koreksi: `datePublished` dan `dateModified` dipasang dari satu nilai yang sama,
sehingga setiap artikel menyatakan dirinya tidak pernah disentuh sejak terbit.

Alasan lengkapnya di
[ADR-0033](../docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md).

- Setiap tab menyatakan `urutanSeksi: "manual" | "terbaru"`. Satu deklarasi,
  tiga akibat, karena ketiganya satu keputusan: urutan seksi, isi lencana
  kartunya, dan tipe schema.org artikelnya.
- Seksi `"terbaru"` terurut dari `publishedAt` menurun — paritas dengan
  `ORDER BY published_at DESC` pada rute publik `awcms` sendiri — dan kartunya
  menampilkan tanggal alih-alih "Artikel 99".
- Halaman artikel kini punya dua baris tanggal: **Terbit** selalu, dan
  **Diperbarui** hanya bila artikelnya memang diubah setelah terbit. Yang dulu
  berlabel "Diperbarui" sebenarnya tanggal terbit, di setiap tab.
- Artikel di seksi berita memancarkan `NewsArticle`, dan setiap artikel kini
  memancarkan `author` tingkat organisasi. Byline seorang editor tetap tidak
  ada — `awcms` menolaknya lebih dulu sebagai permukaan PII.
- Post `published` tanpa `publishedAt` berhenti diterbitkan. `awcms` menjawab
  404 untuk post itu di rutenya sendiri, jadi menerbitkannya di sini membuat dua
  permukaan tidak sepakat tentang apa yang sudah tayang.
- Ketiga tab yang dibawa template ini tetap `"manual"` dan tidak berubah
  perilakunya. Template TIDAK menambahkan tab `news`: yang mendarat adalah
  kemampuannya, dan cara menyalakannya ada di `checklist-repo-baru.md`.

Yang hanya terasa saat mengembangkan:

- `urutkanArtikel` adalah fungsi murni yang diekspor, bukan comparator inline.
  Cabang `"terbaru"` tidak akan pernah dieksekusi di repo template — setiap tab
  di sini `"manual"`, dan tidak ada instans `awcms` untuk membangun apa pun —
  jadi inline ia akan pertama kali berjalan di build produksi sebuah situs
  turunan.
- `ArticleSchemaInput.updatedDate` DIGANTI NAMANYA menjadi
  `publishedDate` + `modifiedDate`. Menambah field opsional di sebelahnya akan
  membiarkan setiap pemanggil lama tetap hijau sambil terus memancarkan klaim
  yang salah; penggantian nama yang memaksa `astro check` menemukan ketiganya.
- Dua keluarga gerbang baru di `audit:konten`. Yang pertama membaca setiap
  simpul `Article`/`NewsArticle` di keluaran — sedalam apa pun di dalam
  `@graph` — dan menuntut kedua tanggal ada, bisa diurai, tidak terbalik
  urutannya, serta `author.name` terbaca. Yang kedua menuntut hal yang sama dari
  pasangan `article:published_time`/`article:modified_time`, yang pemasangannya
  hidup di `.astro` dan karena itu tidak dijangkau typecheck maupun tes.
- Dua keputusan diangkat keluar dari `.astro` supaya bisa diuji:
  `tipeArtikelSeksi` (memilih `Article`/`NewsArticle`) dan
  `pernahDiubahSetelahTerbit` (memutuskan baris "Diperbarui" tampil atau tidak).
  Keduanya sebelumnya ekspresi terner di dalam layout — keputusan yang bisa
  dibalik tanpa satu gerbang pun berubah warna.
- Seksi yang diurutkan tanggal mengurutkan dari tanggal terbit artikel yang
  DITAMPILKAN, bukan post sumbernya. Keduanya berbeda pada halaman berbahasa
  lain, dan mengurutkan dari kolom yang tidak ditampilkan kartu menghasilkan
  daftar yang tanggalnya naik-turun tanpa sebab yang terlihat.
- Gerbang urutan menemukan satu cacat yang sudah ada: cabang manual memecah seri
  hanya dengan judul, sehingga dua artikel ber-`urutan` DAN judul sama jatuh ke
  urutan yang kebetulan dikembalikan API. Kedua cabang kini berakhir pada slug
  sumber.

**Yang belum ada, dan sengaja:** feed RSS/Atom dan paginasi indeks seksi.
Keduanya butuh ADR-nya sendiri, dan alasannya ditulis di §"Yang TIDAK dibangun"
ADR-0033 — yang menentukan bukan biayanya, melainkan bahwa tidak satu pun
gerbang di repo ini membaca keluaran `.xml`, dan bahwa paginasi mengubah bentuk
rute. Sampai keduanya mendarat, indeks seksi berita merender seluruh artikelnya
dalam satu halaman.
