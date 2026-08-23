---
bump: minor
tipe: konten
dampak: publik
---

# Seorang pembaca akhirnya bisa mencari, dan menyaring apa yang ditemukannya

Mesin pencarian `awcms` sudah lengkap dan matang sejak lama — `tsvector`
berbobot di belakang index GIN, `ts_rank`, snippet yang di-escape di sumbernya,
hitungan facet yang masing-masing dihitung tanpa filternya sendiri, typeahead
trigram, rate limit per-IP, semuanya di dalam batas RLS yang sama dengan
datanya. Yang tidak ada adalah kotaknya, di kedua repo. Itu `awcms` #607 dan
`awcms` #597 butir 3.

Yang mendarat: `/cari/` dan `/en/cari/` — kotak, hasil berperingkat dengan
sorotan, chip facet (jenis konten, kanal, topik, instansi, wilayah), tombol
"muat lebih banyak" ber-cursor, dan autocomplete.

## Panggilan PERTAMA dari repo ini yang terjadi di peramban seorang asing

Setiap panggilan `awcms` yang sudah ada berjalan saat `astro build`, dari mesin
yang memegang kredensial baca-saja. Dua yang ini berjalan di peramban pembaca,
anonim, lintas-origin, terhadap endpoint yang `awcms` ADR-0107 rancang untuknya.
[ADR-0043](../docs/adr/0043-the-readers-browser-calls-awcms-and-nothing-else-changes.md)
menuliskan mengapa itu bukan pelonggaran aturan "peramban tidak pernah memanggil
`awcms` langsung": aturan itu butir 1 dari empat aturan yang mengikat permukaan
TERAUTENTIKASI, dan di sini tidak ada sesi, tidak ada kredensial, dan tidak ada
yang bisa dipegang.

Tiga properti panggilannya masing-masing hanya gagal di tempat yang tidak punya
log dan tidak punya penonton, jadi ketiganya digerbangi dan dibuktikan lewat
mutasi:

- **satu header saja** mengubahnya menjadi permintaan ber-preflight, dan `awcms`
  sengaja tidak menyajikan `OPTIONS`;
- **`credentials: "include"`** membuat responsnya tidak bisa dibaca sama sekali;
- **origin situs harus terdaftar** sebagai domain tenant yang aktif dan
  terverifikasi di sana — kalau tidak, jawabannya payload kosong netral yang
  identik byte demi byte dengan "tidak ada hasil". `.env.example` menyatakan
  konsekuensi ketiga di tempat operator menemuinya, karena ia kesalahan
  konfigurasi dan bukan kesalahan kode.

## Tidak ada satu pun HTML yang dirakit di JavaScript

Snippet dari `awcms` aman — ia meng-escape seluruh keluaran `ts_headline` lebih
dulu, baru menukar sentinel ASCII menjadi `<mark>`. Menyerahkannya ke
`innerHTML` akan bekerja dengan benar hari ini, dan tetap ditolak: aturan
"tidak ada jalur HTML-mentah dari CMS" bukan pernyataan tentang seberapa
hati-hati sisi sana, melainkan yang menjaga field berikutnya dari endpoint
berikutnya tidak tiba lewat jalur yang sudah ada.

Konsekuensinya meluas ke seluruh komponen: setiap bentuk yang bisa muncul di
layar ditulis sebagai `<template>` di berkas `.astro` dan dikloning skripnya.
Alasan keduanya sama pentingnya — sebuah string yang dirangkai di skrip akan
menjadi satu-satunya teks di situs ini yang tidak pernah melewati katalog PO.

## Yang ditemukan dengan MENJALANKANNYA

Jalannya yang pertama di Chrome sungguhan merender chip jenis konten berbunyi
`blog_post` dan `blog_page` — pengenal mesin milik registry modul `awcms`, di
layar, dalam kedua bahasa. Persis bentuk yang aturan repo ini larang, dan tidak
ada gerbang yang bisa melihatnya: nilainya ada, tipenya benar, dan halamannya
terbit. Keduanya kini dirender lewat katalog PO, dan nilai tanpa entri tidak
merender chip sama sekali.

## Kotaknya tidak tampil sebelum bisa dipakai

`/cari/` satu berkas statis; tanpa JavaScript tidak ada yang bisa mengambil
hasil. Form-nya `hidden` di sumber dan skripnya membukanya **sesudah** setiap
simpul yang dibutuhkannya ditemukan, sehingga template yang hilang menghasilkan
tidak ada kotak alih-alih kotak yang menerima ketikan lalu diam. `<noscript>`
mengatakannya.

Itu menuntut `[hidden] { display: none !important }` yang belum dimiliki repo
ini: atribut `hidden` bekerja lewat aturan bawaan peramban yang KALAH dari
aturan `display` penulis mana pun — termasuk `.chip { display: inline-flex }`,
yang dipakai tombol "muat lebih banyak" di halaman yang sama.

## Verifikasi

Terhadap Chrome sungguhan, di atas keluaran build dan penyaji yang sebenarnya:
kotaknya terbuka, sebuah URL `javascript:` pada hasil dibuang alih-alih
ditautkan, snippet tersorot tanpa `innerHTML`, `<bantuan>` yang ter-escape tetap
teks dan bukan elemen, chip menulis bilah alamat dan bisa dibagikan, daftar
saran terisi, dan konsol melaporkan **nol** pelanggaran CSP. Header yang
benar-benar terkirim diperiksa dengan `curl`:
`connect-src 'self' <origin awcms>`.

`tests/kotak-cari.test.mjs` yang menjaga semuanya tidak diam-diam berubah
sesudahnya — termasuk kelas paling remeh dan paling senyap dari semuanya, sebuah
selektor yang salah ketik: `querySelector` mengembalikan `null`, `!`
membungkamnya di typecheck, dan halamannya terbit dengan kotak yang tidak pernah
menjawab.
