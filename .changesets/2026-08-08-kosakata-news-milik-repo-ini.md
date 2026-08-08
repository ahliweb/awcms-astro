---
tipe: dokumen
dampak: internal
---

# `/news/` dinyatakan kosakata repo ini, dan aturannya membawa pemeriksanya

Pertanyaan yang melahirkan [ADR-0033](../docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
sangat spesifik: **apakah template ini siap mengelola situs berita di prefix
`/news/`?** ADR itu memperbaiki modelnya, [ADR-0035](../docs/adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md)
memberinya feed. Satu hal tidak pernah dijawab: **siapa yang berhak memakai
prefiks itu.**

`awcms` [ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md)
mendaratkan keluarga `/news/**`-nya sendiri di sana pada 3 Agustus 2026. Jadi
selama lima hari kedua repo boleh melayani berita publik, di alamat yang sama,
dari sumber konten yang sama. Bukan konflik teknis — keduanya bekerja — melainkan
konflik **kosakata**, yang bentuknya adalah pertanyaan yang harus dijawab ulang
setiap kali sebuah deployment dibangun.

[ADR-0036](../docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)
menjawabnya, berpasangan dengan `awcms` ADR-0071 yang men-supersede ADR-0059 di
sana: **`/news/` milik repo ini, `/blog/` milik `awcms`, satu keluarga rute per
repo dan tidak pernah keduanya di satu repo.**

- **Bentuknya sebuah tab, bukan keluarga rute baru.** Sebuah situs berita
  menamai tabnya `news` dan menyatakan `urutanSeksi: "terbaru"` — lalu mendapat
  `/news`, `/news/{slug}`, dan `/news/feed.xml` beserta padanan ber-locale-nya
  **tanpa satu baris kode baru**. Mesin tab dan feed per-seksi sudah ada.
- **`news` TETAP bukan kata yang dipesan**, dan ini selisih yang disengaja dengan
  bentuk `awcms`, yang menjadikannya kata dipesan pada host mana pun. Di sini ia
  slug tab yang dipilih situs: situs panduan yang tidak punya berita tidak punya
  `/news` dan tidak perlu menjelaskan kenapa. Template ini sendiri mengirimkan
  tiga tab, dan nol di antaranya berita.
- **Yang dibelah URL, bukan kepemilikan konten.** Keduanya dilayani modul
  `blog_content` yang sama di `awcms`; repo ini membacanya lewat
  `GET /api/v1/blog/posts` (ADR-0018, beku). Karena itu aturan cermin `awcms`
  ADR-0070 §4 — tidak ada kemampuan yang hanya ada di sini — terpenuhi tanpa
  pekerjaan tambahan: yang pindah rendering halamannya, bukan kemampuannya.

Yang hanya terasa saat mengembangkan:

- **Aturannya membawa pemeriksanya** ([ADR-0030](../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)).
  Aturan ini bisa dilanggar diam-diam dengan satu kata: menamai tab `news` lalu
  membiarkannya `"manual"`. Hasilnya `/news` yang mengurutkan berita menurut
  nomor yang diketik editor, berkartu tanpa tanggal, dan mengaku `Article`
  alih-alih `NewsArticle` kepada mesin pencari — permukaan yang mengaku berita di
  alamatnya dan membantahnya di setiap detailnya. `tests/kosakata-news.test.mjs`
  menolaknya, dan **tidak** menuntut tab `news` ada.
- **Arsip kategori/tag di `/news/` dinyatakan TERBUKA, bukan ditolak** (§5). Repo
  ini belum punya taksonomi sama sekali — tidak ada model kategori maupun tag di
  `src/lib/content.ts`, dan seksi ditentukan oleh tab, bukan oleh term. Menjanjikan
  paritas dengan empat rute `awcms` berarti memutuskan lebih dulu apa itu kategori
  di sini; itu ADR-nya sendiri.
- **Nol perubahan kode.** Yang mendarat aturannya, gerbangnya, dan satu baris
  backlog di `README.md`.

Sisi `awcms` mendapat pasangannya: ADR-0071, banner pada ADR-0059/0061, dan
gerbang dua arah atas jendela antara aturan itu dan penghapusan rutenya.
