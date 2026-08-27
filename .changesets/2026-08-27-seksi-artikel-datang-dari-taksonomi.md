---
bump: minor
tipe: konten
dampak: publik
---

# Artikel yang ditulis editor di awcms akhirnya terbit

Seksi sebuah artikel ditentukan oleh satu ekspresi:

```ts
readBlock(post).kategori === tab
```

`readBlock` membaca `contentJson.awcmsAstro` — **sidecar milik repo ini
sendiri**, yang jalur authoring `awcms` tidak pernah menulisnya. Satu-satunya
penulisnya di seluruh CMS adalah `blog:legacy:import --section-map`, sebuah CLI
migrasi sekali jalan.

Jadi untuk artikel yang ditulis dengan cara biasa — seorang editor, di CMS,
menekan Terbitkan — perbandingannya menjadi `undefined === tab` untuk setiap tab,
dan post itu tersaring keluar. Tidak ada halaman artikel, tidak ada entri indeks
seksi, tidak ada entri arsip, **tidak ada error**. Build hijau, situs kosong.

Untuk template yang seluruh premisnya "awcms adalah backend konten", jalur
authoring bawaannya tidak menghasilkan apa pun.

## Seksi kini datang dari taksonomi

Tiap tab menyatakan `termSlugs` — slug kategori `awcms` yang menempatkan artikel
di dalamnya. Itu klasifikasi yang benar-benar bisa disetel editor, dan repo ini
sudah membacanya untuk arsip kategori/tag sejak `awcms` ADR-0104. Situs ini
membaca klasifikasi nyata dari editor, memakainya membangun arsip, lalu
menentukan seksi artikelnya dari kunci yang tidak bisa dijangkau editor.

Sidecar tetap **menang** bila ada, dan bukan demi kompatibilitas: `awcms`
ADR-0115 §4 MENOLAK mengimpor baris yang tak bisa ditempatkan `--section-map`-nya,
sehingga sidecar adalah instruksi yang disengaja dari satu-satunya alat yang
menulisnya.

## Yang tak tertempatkan tidak lagi senyap

- **Sebagian post** tak tertempatkan → masing-masing disebut namanya, build
  lanjut. Menggagalkan di sini membuat satu kategori salah ketik menghentikan
  seluruh redaksi menerbitkan.
- **SETIAP post** tak tertempatkan dari N > 0 → build **GAGAL**. Itu bukan
  kesalahan tingkat artikel melainkan `termSlugs` yang menyebut kosakata yang
  salah, kredensial tanpa `blog_content.taxonomies.read`, atau tab yang diganti
  nama — ketiganya menerbitkan situs kosong dari build hijau.

Kosakata KOSONG tetap keadaan yang sah: situs yang menempatkan artikelnya lewat
sidecar terbangun persis seperti sebelumnya.

## Kenapa tidak ada gerbang yang bisa melihatnya

`buatPost` menulis sidecar pada **setiap** baris fixture, jadi satu-satunya
bentuk yang gagal di produksi adalah satu-satunya bentuk yang tidak pernah
dihasilkan double-nya. Ia kini punya varian tanpa sidecar, dan dua tes yang
membuktikan perbaikan ini terbukti MERAH tanpa perbaikannya.

Satu perbaikan sampingan: respons `/blog/terms` yang cacat — `200` tanpa larik
`terms` — dulu meledak sebagai `Spread syntax requires ...iterable` dari dalam
adapter, pesan yang tidak menyebut endpoint maupun apa yang harus diperbaiki.

Dicatat sebagai [ADR-0045](../docs/adr/0045-a-section-comes-from-the-cms-vocabulary-not-from-a-sidecar-only-we-write.md).
