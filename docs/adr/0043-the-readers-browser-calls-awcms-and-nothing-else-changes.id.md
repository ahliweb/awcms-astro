🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0043-the-readers-browser-calls-awcms-and-nothing-else-changes.md)

<!-- i18n-source-hash: sha256:04b7c2dba522c5bcf915fa9750ddb3c51d33878dc01b434b5315de83f4265d86 -->

# ADR-0043 — Peramban pembaca memanggil `awcms` langsung, dan hanya itu yang berubah

- **Status:** Diterima
- **Tanggal:** 23 Agustus 2026
- **Menggantikan:** tidak ada. Mengonsumsi `awcms` ADR-0107 dan menambah entri kedelapan serta kesembilan pada daftar permukaan yang dikeraskan.

## Konteks

`awcms` #607 meminta sebuah kotak pencarian pembaca. Mesinnya sudah lengkap dan
matang di sana sejak lama — `tsvector` berbobot, index GIN, `ts_rank`, snippet
yang di-escape di sumbernya, hitungan facet yang masing-masing dihitung tanpa
filternya sendiri, typeahead trigram, rate limit per-IP, semuanya di dalam batas
RLS yang sama dengan datanya. Yang tidak ada adalah kotaknya, di kedua repo.

`awcms` ADR-0107 (23 Agustus 2026) mencabut pemblokir terakhirnya, dan separuh
yang menarik darinya bukan CORS. `withSiteSearchTenant` meresolusi tenant dari
HOST, jadi seorang pembaca di situs statis yang memanggil CMS itu jatuh melalui
rantai terdokumentasi dan mendarat di tenant BAWAAN deployment — situs satu
tenant menampilkan artikel tenant lain sebagai miliknya, dengan 200 dan tanpa apa
pun melaporkan masalah. Sebuah permintaan lintas-origin di sana kini meresolusi
tenant-nya dari `Origin` dan dari tidak ada yang lain.

## Keputusan 1 — peramban pembaca memanggil `awcms` langsung, dan tidak ada yang lain

Ini panggilan pertama di repo ini yang terjadi di luar `astro build`. Setiap
panggilan yang sudah ada berjalan di mesin build yang memegang kredensial mesin
baca-saja; dua yang ini berjalan di peramban seorang asing, secara anonim.

Aturan di `AGENTS.md` yang berbunyi *"peramban tidak pernah memanggil `awcms`
langsung dan tidak pernah memegang kredensialnya"* **tidak dilonggarkan**, karena
ia tidak berlaku: ia butir 1 dari empat aturan yang mengikat permukaan
TERAUTENTIKASI, dan klausa keduanya menyebutkan apa yang dilindunginya. Di sini
tidak ada sesi, tidak ada kredensial, dan tidak ada yang bisa dipegang. `awcms`
menolak `credentials: "include"` menurut konstruksi — grant-nya tidak membawa
`Access-Control-Allow-Credentials` — jadi penulis berikutnya yang meraihnya akan
mendapat respons yang tidak diizinkan peramban untuk dibaca.

Sebuah BFF dipertimbangkan dan ditolak. Ia berarti `export const prerender = false`
pada sebuah rute di repo yang premisnya `output: 'static'` (wilayah ADR-0014,
dengan prasyaratnya sendiri), sebuah runtime yang situs ini tidak butuhkan untuk
hal lain, dan sebuah cache kedua di depan index pencarian — untuk permintaan yang
tidak membawa kredensial dan tidak mengungkap apa pun yang tidak sedang dibaca
pembacanya.

## Keputusan 2 — tiga properti panggilan itu, dan masing-masing hanya gagal di peramban orang asing

1. **Tanpa header tambahan.** Sebuah `GET` yang hanya membawa header
   ber-safelist CORS adalah *permintaan sederhana*. `awcms` sengaja tidak
   menyajikan `OPTIONS`, jadi menambah satu header — `accept`, id tenant, id
   korelasi — tidak menurun mutunya dengan anggun: peramban menolak mengirim
   permintaannya sama sekali.
2. **Tanpa kredensial.**
3. **Tenant datang dari `Origin`.** Sebuah situs yang domain publiknya bukan
   domain terdaftar, terverifikasi, dan aktif di sana dijawab dengan payload
   kosong netral tanpa grant — identik byte demi byte dengan "tidak ada hasil".
   Kotak pencariannya lalu tidak menemukan apa pun, untuk setiap kueri, dan
   satu-satunya yang tahu sebabnya adalah sebuah counter di server.

Ketiganya tidak terlihat di log build mana pun, jadi ketiganya digerbangi di
[`tests/kotak-cari.test.mjs`](../../tests/kotak-cari.test.mjs), dibuktikan lewat
mutasi. `.env.example` menyatakan konsekuensi ketiga di tempat seorang operator
menemuinya, karena ia kesalahan konfigurasi dan bukan kesalahan kode.

## Keputusan 3 — snippet tidak pernah menjadi HTML, meski ia aman

`awcms` mengembalikan snippet yang satu-satunya markup di dalamnya adalah
`<mark>`, dan ia mendapatkan klaim itu dengan jujur: ia meng-escape SELURUH
keluaran `ts_headline` LEBIH DULU, baru menukar sentinel ASCII biasa menjadi
tag-nya. Menyerahkan string itu ke `innerHTML` akan bekerja dengan benar hari ini.

Ia tetap ditolak. *"Tidak ada jalur HTML-mentah dari CMS"* di `AGENTS.md`
§Keamanan bukan pernyataan tentang seberapa hati-hati sisi sana — ia yang menjaga
field BERIKUTNYA, dari endpoint BERIKUTNYA, tidak tiba lewat jalur yang sudah
ada. `potongSnippet` mengubah string itu menjadi segmen teks; komponennya menulis
setiap segmen dengan `textContent` ke dalam simpul teks atau sebuah `<mark>`.

Itu menggeneralisasi menjadi bentuk seluruh komponennya: **tidak ada satu pun
HTML yang dirakit di JavaScript.** Setiap bentuk yang bisa diambil halaman ini
ditulis sebagai `<template>` di berkas `.astro` dan dikloning skripnya. Alasan
keduanya sama memikul beban dengan yang pertama — sebuah string yang dirangkai di
skrip akan menjadi satu-satunya potongan teks di situs ini yang tidak pernah
melewati katalog PO, yaitu persis cacat yang pernah dibayar bilah tab.

## Keputusan 4 — nilai yang tidak punya label yang bisa dibaca tidak dirender

Dua daftar di sini adalah allow-list, bukan penerusan, dan yang kedua ditemukan
dengan MENJALANKANNYA alih-alih membacanya:

- **PARAMETER facet.** Hanya `channel`, `topic`, `institution`, `region`, dan
  `type` yang pernah dipasang pada sebuah permintaan. Meneruskan apa pun yang ada
  di bilah alamat akan mendorong parameter pelacak milik pembaca situs INI
  (`utm_source`, `fbclid`) ke dalam permintaan ke origin lain — dan `awcms`
  mengabaikan kunci yang tidak dikenalnya, jadi tidak ada yang akan gagal.
- **NILAI jenis konten.** Facet term membawa `label` yang ditulis redaksi; facet
  jenis konten tidak — nilainya adalah `resource_type` apa adanya (`blog_post`,
  `blog_page`), pengenal mesin milik registry modul repo itu. Jalannya yang
  pertama di peramban merender keduanya sebagai chip berbunyi `blog_post`, dalam
  kedua bahasa: kunci mesin di layar, bentuk yang persis dilarang aturan repo
  ini. Keduanya kini dirender lewat katalog PO, dan nilai tanpa entri tidak
  merender chip.

Keduanya berbiaya sama: sebuah facet baru atau tipe konten baru di `awcms` inert
di sini sampai repo ini menyebutnya. Itu arah yang benar — yang hilang adalah
satu chip, tidak pernah sebuah hasil.

## Keputusan 5 — kotaknya disembunyikan sampai skripnya jalan, dan `[hidden]` dibuat menang

`/cari/` adalah satu berkas statis; tanpa JavaScript tidak ada yang bisa
mengambil hasil. Form yang tetap tampil adalah kontrol yang tidak melakukan apa
pun saat dipakai, yang `AGENTS.md` §Antarmuka sebut lebih buruk daripada kontrol
yang tidak ada. Jadi form-nya `hidden` di sumber dan skripnya yang membukanya —
**sesudah** setiap simpul yang dibutuhkannya ditemukan, sehingga template yang
hilang menghasilkan tidak ada kotak alih-alih kotak yang tidak pernah menjawab.
`<noscript>` mengatakannya dengan jujur.

Itu menuntut satu aturan yang belum dimiliki repo ini:
`[hidden] { display: none !important }` di `global.css`. Atribut `hidden` bekerja
lewat aturan bawaan peramban yang KALAH dari aturan `display` penulis mana pun
pada elemen yang sama — termasuk `.chip { display: inline-flex }`, yang dipakai
tombol "muat lebih banyak" di halaman ini juga. Tanpanya kedua kontrol itu
terlihat dan bisa diklik sebelum skripnya jalan.

## Keputusan 6 — `connect-src` menempuh jalan yang sama dengan `img-src`

`server/penyaji.mjs` tetap satu-satunya tempat kebijakan dirakit (ADR-0019).
`scripts/asal-pencarian.mjs` menulis `dist/server/asal-pencarian.json` dari
`AWCMS_API_URL` sesudah build, dan satu pembaca — dipakai bersama origin media,
bukan disalin darinya — mengurai keduanya. Kedua direktif diturunkan dari nilai
yang ditulis build, jadi kebijakan dan halamannya tidak bisa berselisih: situs
yang menerbitkan kotak tanpa direktifnya adalah kotak yang setiap permintaannya
diblokir peramban, tanpa apa pun di sisi server melaporkannya.

Berbeda dari origin media, yang ini TIDAK ditanyakan ke `awcms`. Tidak ada yang
perlu ditanyakan: origin media diturunkan di sana dari konfigurasi R2-nya sendiri
dan tidak bisa ditebak dari sini, sementara origin pencarian ADALAH alamat API
yang build ini sudah panggil tujuh kali.

## Konsekuensi

- Daftar permukaan yang dikeraskan naik dari tujuh menjadi sembilan
  ([`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs)), dan
  tabel bertanda di skill integrasi ikut, dalam kedua bahasa. **Dua dari
  sembilan itu berbeda kelas** — dipanggil peramban pembaca, bukan build — dan
  gerbangnya tidak bisa melihat bedanya, jadi itu ditulis di komentar gerbang itu
  sendiri dan di prosa skill-nya.
- `cari` bergabung dengan `kategori`, `tag`, dan `halaman` sebagai segmen jalur
  yang dipesan; sebuah tab ber-slug `cari` kini melempar di tempat
  konfigurasinya ditulis.
- `AWCMS_API_URL` menjadi terlihat pembaca. Ia tetap tidak berprefiks `PUBLIC_`
  dan tidak ada yang di-inline Vite: origin-nya berjalan sebagai atribut yang
  dirender saat build.
- Diverifikasi terhadap Chrome sungguhan di luar repo ini sebelum mendarat:
  kotaknya terbuka, URL `javascript:` pada sebuah hasil dibuang alih-alih
  ditautkan, snippet tersorot tanpa `innerHTML`, `<bantuan>` yang ter-escape
  tetap teks, chip menulis bilah alamat dan bisa dibagikan, daftar saran terisi,
  dan konsol melaporkan nol pelanggaran CSP. `tests/kotak-cari.test.mjs` yang
  menjaga masing-masing dari itu tidak diam-diam berubah sesudahnya.
