Selaraskan renderer blok konten dengan kontrak `ContentBlock` awcms yang
sebenarnya, dan pasang test pertama repo ini.

Versi pertama `src/lib/content-blocks.ts` ditulis terhadap tebakan, bukan
terhadap tipe `ContentBlock` di
`blog-content/domain/content-block-rendering.ts`. Ia berbeda dalam tiga hal,
dan **ketiganya gagal senyap**:

1. Ia menangani tipe `ordered_list`. awcms tidak punya tipe itu — ia
   memancarkan `{ type: "list", ordered: true }`. Jadi setiap daftar bernomor
   yang ditulis editor keluar sebagai daftar berbutir. Tanpa error, tanpa
   peringatan, sekadar salah.
2. `gallery` dan `video_news` jatuh ke cabang paragraf, yang mengembalikan `""`
   bila blok tak punya field `text` — dan keduanya memang tidak punya. **Dua
   tipe blok yang membawa media adalah dua yang hilang total dari halaman.**
3. Header berkasnya mengklaim tipe tak dikenal dirender "sebagai paragraf
   ter-escape … alih-alih dijatuhkan diam-diam". Karena (2), klaim itu justru
   tidak berlaku untuk blok yang paling membutuhkannya.

Yang berubah:

- `list` membaca `ordered` sebagai FIELD; `ordered_list` tidak lagi dikenali
  (awcms tak pernah memancarkannya, dan menerimanya menyiratkan kontrak yang
  tidak ada).
- `gallery` dirender: item ber-`url` menjadi `<img>`; item ber-`mediaObjectId`
  — yang situs ini belum bisa resolve — menjadi placeholder bertanda, bukan
  kekosongan. Gambar hilang jadi temuan review halaman, bukan penemuan pembaca.
- `video_news` dirender sebagai **tautan, bukan embed**. Ini keputusan, bukan
  keterbatasan: pemutar ter-embed adalah permukaan pihak ketiga yang melihat
  pembaca sebelum pembaca memilih menonton apa pun — persis yang dicegah aturan
  tanpa-pihak-ketiga di `AGENTS.md`. awcms meng-embed karena ia melayani produk
  dengan postur berbeda.
- URL dari CMS disaring skemanya (`http`/`https` saja) sebelum masuk `src`/
  `href`. Escaping melindungi sintaks atribut, bukan skemanya — `javascript:`
  yang ter-escape tetap dieksekusi.
- `videoId` divalidasi terhadap pola yang sama dengan awcms sebelum masuk URL.

**Test pertama repo ini** (`npm test`, Node test runner, nol dependensi baru),
20 test. Diuji dengan mengembalikan keempat cacat aslinya: cacat #2 memerahkan
4 test, #1 memerahkan 1, penghapusan filter skema memerahkan 2, penghapusan
validasi `videoId` memerahkan 1.

Kosakata blok sekarang dipatok ke daftar awcms oleh test, sehingga penambahan
tipe di sisi sana memerahkan build di sini alih-alih tayang senyap sebagai
placeholder.
